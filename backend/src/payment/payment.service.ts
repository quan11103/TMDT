import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment-dto';
import { order_status, payment_method, payment_status } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async createPayment(userId: number, dto: CreatePaymentDto) {
    // 1. tim don hang
    const order = await this.prisma.orders.findFirst({
      where: { user_id: userId, id: dto.order_id },
    });

    if (!order) throw new NotFoundException('Don hang khong ton tai');

    // 2. Chi duoc thanh toan neu status la Pending va Confirmed
    const payalbeStatus: string[] = [
      order_status.PENDING,
      order_status.CONFIRMED,
    ];

    if (!payalbeStatus.includes(order.status))
      throw new BadRequestException('Khong the thanh toan don hang');

    // 3. Khong the thanh toan don hang da thanh cong SUCCESS
    const exsitingSuccess = await this.prisma.payments.findFirst({
      where: { order_id: dto.order_id, status: payment_status.SUCCESS },
    });

    if (exsitingSuccess)
      throw new BadRequestException(
        'Don hang nay da duoc thanh toan thanh cong',
      );

    // 4. Chon cac phuong thuc thanh toan
    if (dto.method === payment_method.COD)
      return this.handleCOD(order, dto.method);
    if (dto.method === payment_method.VNPAY)
      return this.handleVNPay(order, dto.method);
    if (dto.method === payment_method.MOMO)
      return this.handleMoMo(order, dto.method);
  }
  // ─── RETRY PAYMENT ────────────────────────────────────────
  // Dùng khi payment trước đó FAILED — thử lại với method mới hoặc cũ
  async retryPayment(userId: number, dto: CreatePaymentDto) {
    // 1 tim order can retry va kiem tra xem co du dieu kien retry khong
    const order = await this.prisma.orders.findFirst({
      where: { user_id: userId, id: dto.order_id },
    });

    if (!order) throw new NotFoundException('Don hang khong ton tai');

    if (['CANCELLED', 'DELIVERED'].includes(order.status))
      throw new BadRequestException('Don hang nay khong the retry');

    const lastPayment = await this.prisma.payments.findFirst({
      where: { order_id: dto.order_id },
      orderBy: { created_at: 'desc' },
    });

    if (lastPayment?.status === payment_status.SUCCESS)
      throw new BadRequestException('Don hang da duoc thanh toan thanh cong');

    if (lastPayment?.status === payment_status.PENDING)
      throw new BadRequestException('Don hang nay dang trong thoi gian xu ly');

    // 2 neu payment undefined thi tao moi khong thi cap nhat lai method
    if (dto.method === payment_method.COD)
      return this.handleCOD(order, dto.method);
    if (dto.method === payment_method.VNPAY)
      return this.handleVNPay(order, dto.method);
    if (dto.method === payment_method.MOMO)
      return this.handleMoMo(order, dto.method);
  }

  // ─── COD(Thanh toan khi nhan hang) ──────────────────────────────────────────────────
  // flow: tao pending payment -> giao hang -> admmin confirm -> pending success
  private async handleCOD(order: any, method: payment_method) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payments.create({
        data: {
          order_id: order.id,
          method,
          amount: order.total_amount,
          status: payment_status.PENDING,
          paid_at: null,
        },
      });

      await tx.orders.update({
        where: { id: order.id },
        data: { status: order_status.CONFIRMED },
      });

      return {
        payment,
        message: 'Dat hang thanh cong! Thanh toan khi nhan hang',
      };
    });
  }

  // ─── CONFIRM COD ──────────────────────────────────────────
  // Admin xac nhan don hang da thanh toan
  async confirmCOD(paymentId: number) {
    const payment = await this.prisma.payments.findUnique({
      where: { id: paymentId },
    });

    if (!payment) throw new NotFoundException('Khong tim thay payment nay');

    if (payment.method !== payment_method.COD)
      throw new BadRequestException('Chi ap dung thanh toan COD');

    if (payment.status !== payment_status.PENDING)
      throw new BadRequestException(
        `Don hang khong the xac nhan o trang thai ${payment.status}`,
      );

    return this.prisma.$transaction(async (tx) => {
      const updatePayment = await tx.payments.update({
        where: { id: payment.id },
        data: { status: payment_status.SUCCESS, paid_at: new Date() },
      });

      await tx.orders.update({
        where: { id: payment.order_id },
        data: { status: order_status.DELIVERED },
      });

      return {
        updatePayment,
        message: 'Don hang da duoc giao thanh cong, da nhan tien COD',
      };
    });
  }

  // ─── VNPAY ────────────────────────────────────────────────
  private async handleVNPay(order: any, method: payment_method) {
    const paymentUrl = this.createVNPayUrl(order);

    const payment = await this.prisma.payments.create({
      data: {
        order_id: order.id,
        status: payment_status.PENDING,
        amount: order.total_amount,
        method,
        paid_at: null,
        // payment_url: paymentUrl,
      },
    });

    return {
      payment_id: payment.id,
      payment_url: paymentUrl,
      message: 'Vui long thanh toan qua VNPay',
    };
  }

  private createVNPayUrl(order: any) {}

  // ─── MOMO ─────────────────────────────────────────────────
  private async handleMoMo(order: any, method: payment_method) {
    const payment = await this.prisma.payments.create({
      data: {
        order_id: order.id,
        method,
        amount: order.total_amount,
        status: 'PENDING',
        paid_at: null,
      },
    });

    // TODO: Tích hợp MoMo SDK thực tế
    return {
      payment,
      payment_url: `https://test-payment.momo.vn/...?orderId=${order.id}`,
      message: 'Vui lòng thanh toán qua MoMo',
    };
  }

  // ─── VNPAY CALLBACK ───────────────────────────────────────
  async handleVNPayReturn(query: Record<string, string>) {
    const orderId = parseInt(query['vnp_TxnRef']);
    const responseCode = query['vnp_ResponseCode'];
    const transactionCode = query['vnp_TransactionNo'];
    const isSuccess = responseCode === '00';

    return this.prisma.$transaction(async (tx) => {
      await tx.payments.updateMany({
        where: { order_id: orderId, status: 'PENDING' },
        data: {
          status: isSuccess ? 'SUCCESS' : 'FAILED',
          transaction_code: transactionCode,
          paid_at: isSuccess ? new Date() : null,
        },
      });

      if (isSuccess) {
        await tx.orders.update({
          where: { id: orderId },
          data: { status: 'CONFIRMED' },
        });
      }

      return {
        success: isSuccess,
        message: isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại',
      };
    });
  }

  // ─── MOMO CALLBACK ────────────────────────────────────────
  async handleMoMoCallback(body: Record<string, any>) {
    const { orderId, resultCode, transId } = body;
    const isSuccess = resultCode === 0;

    return this.prisma.$transaction(async (tx) => {
      await tx.payments.updateMany({
        where: { order_id: orderId, status: 'PENDING' },
        data: {
          status: isSuccess ? 'SUCCESS' : 'FAILED',
          transaction_code: String(transId),
          paid_at: isSuccess ? new Date() : null,
        },
      });

      if (isSuccess) {
        await tx.orders.update({
          where: { id: orderId },
          data: { status: 'CONFIRMED' },
        });
      }

      return { success: isSuccess };
    });
  }

  // ─── GET PAYMENT BY ORDER ─────────────────────────────────
  async getPaymentByOrder(userId: number, orderId: number) {
    const order = await this.prisma.orders.findFirst({
      where: { id: orderId, user_id: userId },
    });

    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    const payment = await this.prisma.payments.findFirst({
      where: { order_id: orderId },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        method: true,
        amount: true,
        status: true,
        paid_at: true,
        created_at: true,
        // Không trả về transaction_code — thông tin nội bộ
      },
    });

    if (!payment) throw new NotFoundException('Chưa có thông tin thanh toán');

    return payment;
  }

  // ─── ADMIN: GET ALL PAYMENTS ──────────────────────────────
  async getAllPayments() {
    return this.prisma.payments.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        method: true,
        amount: true,
        status: true,
        transaction_code: true,
        paid_at: true,
        created_at: true,
        orders: {
          select: {
            id: true,
            status: true,
            users: {
              select: { id: true, email: true, full_name: true },
            },
          },
        },
      },
    });
  }

  // ─── ADMIN: THỐNG KÊ DOANH THU ────────────────────────────
  async getStats() {
    // Chạy song song tất cả queries để tối ưu performance
    const [totalRevenue, totalOrders, revenueByMethod, revenueByMonth] =
      await Promise.all([
        // Tổng doanh thu (chỉ tính payment SUCCESS)
        this.prisma.payments.aggregate({
          where: { status: 'SUCCESS' },
          _sum: { amount: true },
          _count: { id: true },
        }),

        // Thống kê đơn hàng theo status
        this.prisma.orders.groupBy({
          by: ['status'],
          _count: { id: true },
        }),

        // Doanh thu theo phương thức thanh toán
        this.prisma.payments.groupBy({
          by: ['method'],
          where: { status: 'SUCCESS' },
          _sum: { amount: true },
          _count: { id: true },
        }),

        // Doanh thu theo tháng (12 tháng gần nhất)
        // Dùng raw query vì Prisma không hỗ trợ group by tháng trực tiếp
        this.prisma.$queryRaw`
          SELECT
            TO_CHAR(paid_at, 'YYYY-MM') as month,
            SUM(amount)::float as revenue,
            COUNT(id)::int as total_orders
          FROM payments
          WHERE status = 'SUCCESS'
            AND paid_at >= NOW() - INTERVAL '12 months'
          GROUP BY TO_CHAR(paid_at, 'YYYY-MM')
          ORDER BY month ASC
        `,
      ]);

    return {
      // Tổng quan
      summary: {
        total_revenue: totalRevenue._sum.amount ?? 0,
        total_paid_orders: totalRevenue._count.id,
      },

      // Đơn hàng theo trạng thái
      // reduce để chuyển array → object cho dễ đọc
      // [{ status: 'PENDING', _count: 5 }] → { PENDING: 5 }
      orders_by_status: totalOrders.reduce(
        (acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        },
        {} as Record<string, number>,
      ),

      // Doanh thu theo phương thức thanh toán
      revenue_by_method: revenueByMethod.map((item) => ({
        method: item.method,
        revenue: item._sum.amount ?? 0,
        count: item._count.id,
      })),

      // Doanh thu theo tháng
      revenue_by_month: revenueByMonth,
    };
  }
}
