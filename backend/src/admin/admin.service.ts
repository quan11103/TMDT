import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllOrders() {
    return await this.prisma.orders.findMany({
      include: {
        users: true,
        order_items: {
          include: {
            products: true,
          },
        },
        payments: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getDashboardStats() {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const notCancelled = { status: { not: 'CANCELLED' as const } };

    const [
      revenueAgg,
      discountAgg,
      orderStatusGroups,
      todayRevenueAgg,
      monthRevenueAgg,
      paymentStatusGroups,
      recentOrders,
      ordersLast7Days,
      topProductGroups,
    ] = await Promise.all([
      this.prisma.orders.aggregate({
        _sum: { total_amount: true },
        where: notCancelled,
      }),
      this.prisma.orders.aggregate({
        _sum: { discount_amount: true },
        where: notCancelled,
      }),
      this.prisma.orders.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.orders.aggregate({
        _sum: { total_amount: true },
        where: { ...notCancelled, created_at: { gte: startOfToday } },
      }),
      this.prisma.orders.aggregate({
        _sum: { total_amount: true },
        where: { ...notCancelled, created_at: { gte: startOfMonth } },
      }),
      this.prisma.payments.groupBy({
        by: ['status'],
        _count: { _all: true },
        _sum: { amount: true },
      }),
      this.prisma.orders.findMany({
        take: 8,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          total_amount: true,
          status: true,
          created_at: true,
          users: { select: { full_name: true, email: true } },
        },
      }),
      this.prisma.orders.findMany({
        where: {
          created_at: { gte: sevenDaysAgo },
          ...notCancelled,
        },
        select: { created_at: true, total_amount: true },
      }),
      this.prisma.order_items.groupBy({
        by: ['product_id'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    const productIds = topProductGroups.map((g) => g.product_id);
    const topProductDetails =
      productIds.length > 0
        ? await this.prisma.products.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, stock: true },
          })
        : [];
    const productMap = new Map(topProductDetails.map((p) => [p.id, p]));

    const topProducts = topProductGroups.map((g) => ({
      product_id: g.product_id,
      name: productMap.get(g.product_id)?.name ?? '—',
      stock: productMap.get(g.product_id)?.stock ?? 0,
      quantity_sold: g._sum.quantity ?? 0,
    }));

    const revenueByDay: { date: string; revenue: number; orders: number }[] =
      [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayOrders = ordersLast7Days.filter(
        (o) => o.created_at && o.created_at.toISOString().slice(0, 10) === key,
      );
      revenueByDay.push({
        date: key,
        revenue: dayOrders.reduce((s, o) => s + Number(o.total_amount), 0),
        orders: dayOrders.length,
      });
    }

    return {
      revenue: {
        total: Number(revenueAgg._sum.total_amount ?? 0),
        total_discount: Number(discountAgg._sum.discount_amount ?? 0),
        today: Number(todayRevenueAgg._sum.total_amount ?? 0),
        this_month: Number(monthRevenueAgg._sum.total_amount ?? 0),
        by_day: revenueByDay,
      },
      orders: {
        by_status: Object.fromEntries(
          orderStatusGroups.map((g) => [g.status, g._count._all]),
        ) as Record<string, number>,
      },
      payments: paymentStatusGroups.map((g) => ({
        status: g.status,
        count: g._count._all,
        amount: Number(g._sum.amount ?? 0),
      })),
      recent_orders: recentOrders.map((o) => ({
        id: o.id,
        total_amount: Number(o.total_amount),
        status: o.status,
        created_at: o.created_at,
        customer_name: o.users.full_name || o.users.email,
      })),
      top_products: topProducts,
    };
  }
}
