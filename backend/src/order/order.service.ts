import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PromotionsService } from 'src/promotions/promotions.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  OrderStatus,
  UpdateOrderStatusDto,
} from './dto/update-order-status.dto';
import { PreviewCheckoutDto } from './dto/preview-checkout.dto';
import { cart_items, products } from '@prisma/client';

type CartItemWithProduct = cart_items & {
  products: products;
};

const ORDER_SELECT = {
  id: true,
  status: true,
  total_amount: true,
  discount_amount: true,
  promotion_id: true,
  address: true,
  phone: true,
  note: true,
  created_at: true,
  updated_at: true,
  promotions: {
    select: {
      id: true,
      code: true,
      discount_type: true,
      discount_value: true,
      product_scope: true,
    },
  },
  order_items: {
    select: {
      id: true,
      quantity: true,
      price_at_time: true,
      products: {
        select: {
          id: true,
          name: true,
          product_images: {
            where: { is_main: true },
            select: { image_url: true },
            take: 1,
          },
        },
      },
    },
  },
  payments: {
    select: {
      id: true,
      method: true,
      status: true,
      paid_at: true,
    },
  },
} as const;

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private promotionsService: PromotionsService,
  ) {}

  private async loadAndValidateCartItemsForOrder(
    userId: number,
    cartItemIds: number[],
  ): Promise<CartItemWithProduct[]> {
    const cartItems = await this.prisma.cart_items.findMany({
      where: { user_id: userId, id: { in: cartItemIds } },
      include: { products: true },
    });

    if (cartItemIds.length !== cartItems.length) {
      throw new BadRequestException(
        'Mot so san pham trong gio hang khong hop le',
      );
    }
    if (cartItems.length === 0) {
      throw new BadRequestException('Gio hang trong');
    }
    for (const item of cartItems) {
      if (!item.products.is_active) {
        throw new BadRequestException(
          `San pham ${item.products.name} khong con ton tai`,
        );
      }
      if (item.quantity > item.products.stock) {
        throw new BadRequestException(
          `${item.products.name} chi con lai ${item.products.stock} san pham`,
        );
      }
    }
    return cartItems as CartItemWithProduct[];
  }

  private async computePricingFromCart(
    cartItems: CartItemWithProduct[],
    promotionCode?: string,
  ) {
    const lines = cartItems.map((item) => ({
      unitPrice: Number(item.products.price),
      quantity: item.quantity,
      product_id: item.products.id,
      category_id: item.products.category_id,
    }));

    const subtotal = lines.reduce(
      (sum, line) => sum + line.unitPrice * line.quantity,
      0,
    );

    if (!promotionCode?.trim()) {
      return {
        subtotal,
        discountAmount: 0,
        totalAmount: subtotal,
        promotionId: null as number | null,
      };
    }

    const promo =
      await this.promotionsService.resolveApplicablePromotion(promotionCode);
    const r = this.promotionsService.computeDiscountForCart(promo, lines);

    return {
      subtotal: r.subtotal,
      discountAmount: r.discountAmount,
      totalAmount: r.totalAmount,
      promotionId: r.promotionId,
    };
  }

  async previewCheckout(userId: number, dto: PreviewCheckoutDto) {
    const cartItems = await this.loadAndValidateCartItemsForOrder(
      userId,
      dto.cart_item_ids,
    );
    const pricing = await this.computePricingFromCart(
      cartItems,
      dto.promotion_code,
    );

    return {
      subtotal: pricing.subtotal,
      discount_amount: pricing.discountAmount,
      total_amount: pricing.totalAmount,
      promotion_id: pricing.promotionId,
    };
  }

  async createOrderDto(userId: number, dto: CreateOrderDto) {
    const cartItems = await this.loadAndValidateCartItemsForOrder(
      userId,
      dto.cart_item_ids,
    );

    const { discountAmount, totalAmount, promotionId } =
      await this.computePricingFromCart(cartItems, dto.promotion_code);

    const newOrder = await this.prisma.$transaction(async (tx) => {
      const order = await tx.orders.create({
        data: {
          user_id: userId,
          total_amount: totalAmount,
          discount_amount: discountAmount,
          promotion_id: promotionId,
          address: dto.address,
          phone: dto.phone,
          note: dto.note,
        },
      });

      await tx.order_items.createMany({
        data: cartItems.map((item) => ({
          order_id: order.id,
          product_id: item.products.id,
          price_at_time: item.products.price,
          quantity: item.quantity,
        })),
      });

      for (const item of cartItems) {
        await tx.products.update({
          where: { id: item.products.id },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      await tx.cart_items.deleteMany({
        where: { id: { in: dto.cart_item_ids } },
      });

      return order;
    });

    return this.findOrderById(newOrder.id);
  }

  async getMyOrders(userId: number) {
    return await this.prisma.orders.findMany({
      where: { user_id: userId },
      select: ORDER_SELECT,
      orderBy: { created_at: 'desc' },
    });
  }

  async getMyOrderDetail(userId: number, orderId: number) {
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
      select: { ...ORDER_SELECT, user_id: true },
    });

    if (!order)
      throw new NotFoundException(`Khong tim thay don hang ${orderId}`);

    if (userId !== order.user_id)
      throw new ForbiddenException('Ban khong co quyen truy cap don hang nay');

    return order;
  }

  async cancelOrder(userId: number, orderId: number) {
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
      include: { order_items: true },
    });

    if (!order) throw new NotFoundException('Khong tim thay don hang');

    if (order.user_id != userId)
      throw new ForbiddenException('Ban khong co quyen huy don hang');

    if (order.status !== 'PENDING')
      throw new BadRequestException(
        'Khong duoc huy khi tran thai khong phai la PENDING',
      );

    return await this.prisma.$transaction(async (tx) => {
      for (const item of order.order_items) {
        await tx.products.update({
          where: { id: item.product_id },
          data: { stock: { increment: item.quantity } },
        });
      }

      return tx.orders.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });
    });
  }

  async getAllOrders() {
    return this.prisma.orders.findMany({
      select: {
        ...ORDER_SELECT,
        users: { select: { id: true, full_name: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOrderById(orderId: number) {
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
      select: {
        ...ORDER_SELECT,
        users: { select: { id: true, full_name: true, email: true } },
      },
    });

    if (!order)
      throw new NotFoundException(`Khong tim thay don hang ${orderId}`);

    return order;
  }

  async updateOrderStatus(orderId: number, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
      include: { order_items: true },
    });

    if (!order)
      throw new NotFoundException(`Khong tim thay don hang ${orderId}`);

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPING, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPING]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    const allowed = validTransitions[order.status] ?? [];

    if (!allowed.includes(dto.status))
      throw new BadRequestException(
        `khong the chuyen tu ${order.status} sang ${dto.status}`,
      );

    if (dto.status === OrderStatus.CANCELLED) {
      return await this.prisma.$transaction(async (tx) => {
        for (const item of order.order_items) {
          await tx.products.update({
            where: { id: item.product_id },
            data: { stock: { increment: item.quantity } },
          });
        }

        return await tx.orders.update({
          where: { id: orderId },
          data: { status: dto.status },
          select: ORDER_SELECT,
        });
      });
    }

    return await this.prisma.orders.update({
      where: { id: orderId },
      data: { status: dto.status },
      select: ORDER_SELECT,
    });
  }
}
