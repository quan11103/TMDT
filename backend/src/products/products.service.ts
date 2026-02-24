import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.products.findMany({
      where: { is_active: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.products.findUnique({
      where: { id },
    });
  }

  async create(dto: CreateProductDto) {
    return this.prisma.products.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        price: dto.price,
        category_id: dto.category_id,
        description: dto.description,
        stock: dto.stock ?? 0,
      },
    });
  }
}
