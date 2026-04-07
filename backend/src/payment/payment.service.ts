import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment-dto';
import { order_status, payment_method, payment_status } from '@prisma/client';
import moment from 'moment';
import QueryString from 'qs';
import { createHmac } from 'crypto';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async createPayment(userId: number, dto: CreatePaymentDto) {
    const order = await this.prisma.orders.findFirst({
      where: { user_id: userId, id: dto.order_id },
      select: { id: true, user_id: true, status: true, total_amount: true },
    });

    if (!order) {
      throw new NotFoundException('Order không tồn tại');
    }

    // fix !order_status.PENDING.includes(order.status as any)
    if (order.status !== order_status.PENDING) {
      throw new BadRequestException(
        'Order không ở trạng thái có thể thanh toán',
      );
    }

    switch (dto.method) {
      case payment_method.COD:
        return this.createCodPayment(order.id);

      case payment_method.VNPAY:
        return this.createVnPayPayment(order);

      // case payment_method.MOMO:
      //   return this.createMomoPayment(order);

      default:
        throw new BadRequestException('Phương thức thanh toán không hợp lệ');
    }
  }

  private async createCodPayment(orderId: number) {
    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.orders.findUnique({
        where: { id: orderId },
        select: { total_amount: true },
      });

      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn hàng');
      }

      const payment = await tx.payments.create({
        data: {
          order_id: orderId,
          status: payment_status.PENDING,
          method: payment_method.COD,
          transaction_code: 'COD',
          amount: order.total_amount,
          paid_at: now,
        },
      });

      await tx.orders.update({
        where: { id: orderId },
        data: {
          status: order_status.CONFIRMED,
        },
      });

      return {
        payment_id: payment.id,
        message: 'Đặt hành COD thành công, thanh toán khi nhận hàng',
      };
    });
  }

  private async createVnPayPayment(order: { id: number; total_amount: any }) {
    const payment = await this.prisma.payments.create({
      data: {
        order_id: order.id,
        amount: order.total_amount,
        status: payment_status.PENDING,
        method: payment_method.VNPAY,
        paid_at: null,
      },
    });

    const tmnCode = this.config.getOrThrow('VNPAY_TMN_CODE');
    const hashSecret = this.config.getOrThrow('VNPAY_HASH_SECRET');
    const baseUrl = this.config.getOrThrow('VNPAY_PAYMENT_URL');
    const returnUrl = this.config.getOrThrow('VNPAY_RETURN_URL');

    const amountVnd = Math.round(Number(order.total_amount));
    const vnpAmount = String(amountVnd * 100);
    const txnRef = String(payment.id);
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');

    let vnpParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Amount: vnpAmount,
      vnp_CreateDate: createDate,
      vnp_CurrCode: 'VND',
      vnp_IpAddr: '127.0.0.1',
      vnp_Locale: 'vn',
      vnp_OrderType: 'other',
      vnp_OrderInfo: `${order.id}`,
      vnp_ReturnUrl: returnUrl,
      vnp_TxnRef: txnRef,
    };

    vnpParams = Object.fromEntries(
      Object.entries(vnpParams).sort(([a], [b]) => a.localeCompare(b)),
    );
    const signData = QueryString.stringify(vnpParams, { encode: true });
    const hmac = createHmac('sha512', hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnpParams['vnp_SecureHash'] = signed;
    const paymentUrl = `${baseUrl}?${QueryString.stringify(vnpParams, { encode: true })}`;

    await this.prisma.payments.update({
      where: { id: payment.id },
      data: { payment_url: paymentUrl },
    });

    return {
      message: 'Vui lòng thanh toán qua VNPay',
      payment_id: payment.id,
      payment_url: paymentUrl,
    };
  }

  private verifyVnPaySignature(query: Record<string, string>) {
    const receivedHash = query.vnp_SecureHash;
    if (!receivedHash) {
      throw new BadRequestException('Thiếu chữ ký VNPay');
    }

    const hashSecret = this.config.getOrThrow('VNPAY_HASH_SECRET');

    const paramsForSign: Record<string, string> = {};
    for (const [key, value] of Object.entries(query)) {
      if (!key.startsWith('vnp_')) continue;
      if (key === 'vnp_SecureHash' || key === 'vnp_SecureHashType') continue;
      if (value === undefined || value === null || value === '') continue;
      paramsForSign[key] = value;
    }

    const sortedParams = Object.fromEntries(
      Object.entries(paramsForSign).sort(([a], [b]) => a.localeCompare(b)),
    );

    const signData = QueryString.stringify(sortedParams, { encode: true });
    const caculatedHash = createHmac('sha512', hashSecret)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    if (caculatedHash.toLowerCase() !== receivedHash) {
      throw new BadRequestException('Chữ ký VNPay không hợp lệ');
    }
  }

  async handleVnPayCallback(query: Record<string, string>) {
    const txnRef = query.vnp_TxnRef;
    const responseCode = query.vnp_ResponseCode;
    const callbackAmount = Number(query.vnp_Amount);
    const transactionCode = query.vnp_TransactionNo;

    if (!txnRef || !responseCode || !query.vnp_SecureHash) {
      throw new BadRequestException('Thiếu tham số callback VNPay');
    }

    const paymentId = Number(txnRef);
    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      throw new BadRequestException('vnp_TxnRef không hợp lệ');
    }

    if (!Number.isFinite(callbackAmount) || callbackAmount <= 0) {
      throw new BadRequestException('vnp_Amount không hợp lệ');
    }

    this.verifyVnPaySignature(query);
    const isSuccess = responseCode === '00';

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payments.findUnique({
        where: { id: paymentId },
        include: {
          orders: {
            select: { id: true, status: true },
          },
        },
      });

      if (!payment) {
        throw new NotFoundException('Không tìm thấy payment');
      }

      if (payment.method !== payment_method.VNPAY) {
        throw new BadRequestException('Payment không thuộc VNPay');
      }

      const expectedAmount = Math.round(Number(payment.amount)) * 100;
      if (callbackAmount !== expectedAmount) {
        throw new BadRequestException('Số tiền callback không khớp');
      }

      if (payment.status !== payment_status.PENDING) {
        return {
          success: payment.status === payment_status.SUCCESS,
          message: 'Giao dịch đã được xử lý trước đó',
          payment_id: payment.id,
          payment_status: payment.status,
          order_id: payment.orders.id,
          order_status: payment.orders.status,
        };
      }

      const updatePayment = await tx.payments.update({
        where: { id: payment.id },
        data: {
          status: isSuccess ? payment_status.SUCCESS : payment_status.FAILED,
          paid_at: isSuccess ? new Date() : null,
          transaction_code: transactionCode,
        },
        select: { id: true, order_id: true, status: true },
      });

      let orderStatus = payment.orders.status;
      if (isSuccess) {
        const updateOrder = await tx.orders.update({
          where: { id: payment.order_id },
          data: { status: order_status.CONFIRMED },
          select: { status: true },
        });
        orderStatus = updateOrder.status;
      }

      return {
        success: isSuccess,
        message: isSuccess
          ? 'Thanh toán VNPay thành công'
          : 'Thanh toán VNPay thất bại',
        payment_id: updatePayment.id,
        payment_status: updatePayment.status,
        order_id: updatePayment.order_id,
        order_status: orderStatus,
      };
    });
  }
}
