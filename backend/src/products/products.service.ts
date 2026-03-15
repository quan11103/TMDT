import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  // Search sản phẩm
  async findAll(query: QueryProductDto) {
    const { search, category_id, min_price, max_price, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const where: any = {
      is_active: true,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    if (min_price !== undefined || max_price !== undefined) {
      where.price = {
        ...(min_price !== undefined && { gte: min_price }),
        ...(max_price !== undefined && { lte: max_price }),
      };
    }

    if (category_id) {
      // Chuyển chuỗi "1,2" thành mảng số [1, 2]
      const parsedCategoryIds = String(category_id)
        .split(',')
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));

      if (parsedCategoryIds.length > 0) {
        // Tìm tất cả danh mục con của các danh mục đã chọn
        const childCategories = await this.prisma.categories.findMany({
          where: { parent_id: { in: parsedCategoryIds } },
          select: { id: true },
        });

        const allCategoryIds = [
          ...parsedCategoryIds,
          ...childCategories.map((cat) => cat.id),
        ];

        // Sử dụng toán tử 'in' để tìm sản phẩm thuộc bất kỳ ID nào trong mảng
        where.category_id = { in: allCategoryIds };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.products.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          price: true,
          slug: true,
          description: true,
          stock: true,
          categories: {
            select: { id: true, name: true },
          },
          product_images: {
            where: { is_main: true },
            select: { image_url: true },
            take: 1,
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.products.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        total_page: Math.ceil(total / limit),
      },
    };
  }

  // Tìm sản phẩm theo id
  async findOne(id: number) {
    const productInfo = await this.prisma.products.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            categories: true, // Lấy thông tin danh mục cha (nếu có)
          },
        },
        product_images: {
          select: {
            id: true,
            image_url: true,
            is_main: true,
          },
          orderBy: { is_main: 'desc' },
        },
      },
    });

    if (!productInfo || !productInfo.is_active)
      throw new NotFoundException(`Không tìm thấy sản phẩm ${id}`);

    return productInfo;
  }

  // CREATE: Admin tạo sản phẩm
  async create(dto: CreateProductDto) {
    const exsitingProduct = await this.prisma.products.findUnique({
      where: { slug: dto.slug },
    });

    if (exsitingProduct) throw new ConflictException('slug này đã tồn tại');

    const exsitingCategory = await this.prisma.categories.findUnique({
      where: { id: dto.category_id },
    });

    if (!exsitingCategory)
      throw new ConflictException('Category này không tồn tại');

    const newProduct = await this.prisma.products.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        price: dto.price,
        category_id: dto.category_id,
        description: dto.description,
        stock: dto.stock ?? 0,
      },
      include: { categories: { select: { id: true, name: true, slug: true } } },
    });

    return newProduct;
  }

  // DELETE soft delete để những sản phẩm cũ còn trong giỏ hàng
  async softRemove(id: number) {
    await this.findOne(id);

    await this.prisma.products.update({
      where: { id },
      data: { is_active: false },
    });

    return { message: `Đã ẩn sản phẩm ${id}` };
  }

  // UPDATE cập nhật thông tin sản phẩm
  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);

    // check slug
    if (dto.slug) {
      const exsitingSlug = await this.prisma.products.findFirst({
        where: {
          slug: dto.slug,
          NOT: { id },
        },
      });

      if (exsitingSlug) throw new ConflictException('Slug đã tồn tại');
    }

    if (dto.category_id) {
      const exsitingCategory = await this.prisma.categories.findUnique({
        where: { id: dto.category_id },
      });

      if (!exsitingCategory)
        throw new ConflictException('Không tồn tại category này');
    }

    return this.prisma.products.update({
      where: { id },
      data: dto,
      include: {
        categories: {
          select: { id: true, name: true },
        },
        product_images: {
          select: { id: true, image_url: true, is_main: true },
          orderBy: { is_main: 'desc' },
        },
      },
    });
  }
}
