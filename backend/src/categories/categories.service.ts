import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const exsitingCategory = await this.prisma.categories.findUnique({
      where: { slug: dto.slug },
    });
    if (exsitingCategory) throw new ConflictException('Slug nay da ton tai');

    if (dto.parent_id) {
      const parent = await this.prisma.categories.findUnique({
        where: { id: dto.parent_id },
      });
      if (!parent) throw new NotFoundException('Danh muc cha khong ton tai');
    }

    return this.prisma.categories.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        is_active: dto.is_active ?? true,
        parent_id: dto.parent_id ?? null,
      },
    });
  }

  async findAll(search?: string) {
    const productFilter = {
      is_active: true,
      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }),
    };

    return this.prisma.categories.findMany({
      where: {
        is_active: true,
        parent_id: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            products: {
              where: productFilter,
            },
          },
        },
        other_categories: {
          where: { is_active: true },
          select: {
            id: true,
            name: true,
            slug: true,
            _count: {
              select: {
                products: { where: productFilter },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(categoryId: number) {
    const category = await this.prisma.categories.findUnique({
      where: { id: categoryId, is_active: true },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { products: true } },
        other_categories: {
          where: { is_active: true },
          select: {
            id: true,
            name: true,
            slug: true,
            _count: { select: { products: true } },
          },
        },
      },
    });

    if (!category) throw new NotFoundException('Khong ton tai category nay');
    return category;
  }

  async update(categoryId: number, dto: UpdateCategoryDto) {
    await this.findOne(categoryId);

    if (dto.slug) {
      const exsitingSlug = await this.prisma.categories.findFirst({
        where: { slug: dto.slug, NOT: { id: categoryId } },
      });
      if (exsitingSlug)
        throw new ConflictException('Trung slug voi danh muc khac');
    }
    if (dto.parent_id === categoryId)
      throw new ConflictException('Danh muc khong the lam cha cua chinh no');

    return this.prisma.categories.update({
      where: { id: categoryId },
      data: dto,
    });
  }

  async remove(categoryId: number) {
    await this.findOne(categoryId);

    const productCount = await this.prisma.products.count({
      where: { category_id: categoryId, is_active: true },
    });

    if (productCount > 0) {
      throw new ConflictException('Khong the xoa danh muc vi con san pham');
    }

    return this.prisma.categories.update({
      where: { id: categoryId },
      data: { is_active: false },
    });
  }
}
