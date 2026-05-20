import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { sale_apply_type } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  private assertDateRange(startsAt: Date, endsAt: Date) {
    if (endsAt <= startsAt) {
      throw new BadRequestException('end_date phải sau start_date');
    }
  }

  async create(dto: CreateSaleDto) {
    this.assertDateRange(dto.start_date, dto.end_date);

    return this.prisma.sales.create({
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
}
