import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { sale_apply_type } from '@prisma/client';
import { EmailService } from 'src/email/email.service';

interface Recipient {
  email: string;
  name: string;
}

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) { }

  private assertDateRange(startsAt: Date, endsAt: Date) {
    if (endsAt <= startsAt) {
      throw new BadRequestException('end_date phải sau start_date');
    }
  }

  async create(dto: CreateSaleDto) {
    this.assertDateRange(dto.start_date, dto.end_date);

    const sale = await this.prisma.sales.create({
      data: {
        name: dto.name,
        discount_percent: dto.discount_percent,
        apply_type: dto.apply_type,
        target_id: dto.target_id,
        start_date: dto.start_date,
        end_date: dto.end_date,
        status: dto.status ?? true,
      },
    });

    // Gửi email async nếu send_email flag = true (không block response)
    if (dto.send_email !== false) {
      this.sendSaleNotifications(sale).catch((err) =>
        console.error('[SalesService] Bulk email failed:', err.message),
      );
    }

    return sale;
  }

  async findAll() {
    return this.prisma.sales.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const sale = await this.prisma.sales.findUnique({
      where: { id },
    });
    if (!sale) {
      throw new NotFoundException(`Không tìm thấy sale ${id}`);
    }
    return sale;
  }

  async update(id: number, dto: UpdateSaleDto) {
    const existing = await this.findOne(id);

    const nextStarts = dto.start_date ?? existing.start_date;
    const nextEnds = dto.end_date ?? existing.end_date;
    this.assertDateRange(nextStarts, nextEnds);

    let target_id = dto.target_id !== undefined ? dto.target_id : existing.target_id;
    if (dto.apply_type && dto.apply_type === sale_apply_type.ALL) {
      target_id = null;
    }

    return this.prisma.sales.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.discount_percent !== undefined && { discount_percent: dto.discount_percent }),
        ...(dto.apply_type !== undefined && { apply_type: dto.apply_type }),
        target_id: target_id,
        ...(dto.start_date !== undefined && { start_date: dto.start_date }),
        ...(dto.end_date !== undefined && { end_date: dto.end_date }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.sales.delete({ where: { id } });
    return { message: 'Đã xóa sale', id };
  }

  /**
   * Gửi email thông báo sale cho các khách hàng
   * Tìm recipients dựa trên apply_type và gửi bulk emails
   */
  private async sendSaleNotifications(sale: any) {
    try {
      console.log(
        `[SalesService] Bắt đầu gửi email cho sale: "${sale.name}", apply_type: ${sale.apply_type}, target_id: ${sale.target_id}`,
      );

      const recipients = await this.getRecipients(sale);

      console.log(
        `[SalesService] Tìm được ${recipients.length} khách hàng cho sale "${sale.name}"`,
      );

      if (recipients.length === 0) {
        console.log(
          `[SalesService] Không tìm thấy khách hàng nào cho sale "${sale.name}" (apply_type: ${sale.apply_type})`,
        );
        return;
      }

      console.log(
        `[SalesService] Recipients: ${recipients.map((r) => r.email).join(', ')}`,
      );

      await this.email.sendBulkSaleEmails(recipients, {
        name: sale.name,
        discountPercent: sale.discount_percent,
        applyType: sale.apply_type,
        startsAt: sale.start_date,
        endsAt: sale.end_date,
      });
    } catch (err) {
      console.error(
        `[SalesService] Lỗi khi gửi email sale "${sale.name}":`,
        err,
      );
    }
  }

  /**
   * Lấy danh sách khách hàng để gửi email dựa trên apply_type
   * - ALL: Tất cả active users
   * - CATEGORY: Users có mua sản phẩm trong category
   * - PRODUCT: Users có mua sản phẩm cụ thể
   */
  private async getRecipients(sale: any): Promise<Recipient[]> {
    try {
      if (sale.apply_type === 'ALL') {
        console.log('[SalesService] Lấy tất cả active users');
        return this.getRecipientsByAllUsers();
      }

      if (sale.apply_type === 'CATEGORY') {
        console.log(
          `[SalesService] Lấy users có mua sản phẩm trong category ${sale.target_id}`,
        );
        return this.getRecipientsByCategory(sale.target_id);
      }

      if (sale.apply_type === 'PRODUCT') {
        console.log(
          `[SalesService] Lấy users có mua sản phẩm ${sale.target_id}`,
        );
        return this.getRecipientsByProduct(sale.target_id);
      }

      console.warn(
        `[SalesService] Unknown apply_type: ${sale.apply_type}`,
      );
      return [];
    } catch (err) {
      console.error('[SalesService] Lỗi khi lấy recipients:', err);
      return [];
    }
  }

  /**
   * Lấy tất cả active users
   */
  private async getRecipientsByAllUsers(): Promise<Recipient[]> {
    const users = await this.prisma.users.findMany({
      where: { is_active: true },
      select: { email: true, full_name: true },
    });

    console.log(`[SalesService] getRecipientsByAllUsers: Tìm được ${users.length} users`);

    return users.map((u) => ({
      email: u.email,
      name: u.full_name || u.email,
    }));
  }

  /**
   * Lấy users có mua sản phẩm trong category cụ thể
   */
  private async getRecipientsByCategory(categoryId: number): Promise<Recipient[]> {
    console.log(
      `[SalesService] Querying users for category ${categoryId}...`,
    );

    const users = await this.prisma.$queryRaw`
      SELECT DISTINCT u.id, u.email, u.full_name
      FROM users u
      INNER JOIN orders o ON u.id = o.user_id
      INNER JOIN order_items oi ON o.id = oi.order_id
      INNER JOIN products p ON oi.product_id = p.id
      WHERE p.category_id = ${categoryId}
      AND u.is_active = true
    `;

    console.log(
      `[SalesService] getRecipientsByCategory(${categoryId}): Tìm được ${(users as any[]).length} users`,
    );

    return (users as any[]).map((u) => ({
      email: u.email,
      name: u.full_name || u.email,
    }));
  }

  /**
   * Lấy users có mua sản phẩm cụ thể
   */
  private async getRecipientsByProduct(productId: number): Promise<Recipient[]> {
    console.log(
      `[SalesService] Querying users for product ${productId}...`,
    );

    const users = await this.prisma.$queryRaw`
      SELECT DISTINCT u.id, u.email, u.full_name
      FROM users u
      INNER JOIN orders o ON u.id = o.user_id
      INNER JOIN order_items oi ON o.id = oi.order_id
      WHERE oi.product_id = ${productId}
      AND u.is_active = true
    `;

    console.log(
      `[SalesService] getRecipientsByProduct(${productId}): Tìm được ${(users as any[]).length} users`,
    );

    return (users as any[]).map((u) => ({
      email: u.email,
      name: u.full_name || u.email,
    }));
  }
}
