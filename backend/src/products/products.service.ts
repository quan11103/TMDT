import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // Search sản phẩm
  async findAll(query: QueryProductDto) {
    const {
      search,
      category_id,
      min_price,
      max_price,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    const tokens = String(search ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const where: any = {
      is_active: true,
    };

    if (min_price !== undefined || max_price !== undefined) {
      where.price = {
        ...(min_price !== undefined && { gte: min_price }),
        ...(max_price !== undefined && { lte: max_price }),
      };
    }

    if (category_id) {
      const parsedCategoryIds = String(category_id)
        .split(',')
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));

      if (parsedCategoryIds.length > 0) {
        const childCategories = await this.prisma.categories.findMany({
          where: { parent_id: { in: parsedCategoryIds } },
          select: { id: true },
        });

        const allCategoryIds = [
          ...parsedCategoryIds,
          ...childCategories.map((item) => item.id),
        ];

        where.category_id = { in: allCategoryIds };
      }
    }

    // If no search, keep Prisma query (fast + typed).
    if (tokens.length === 0) {
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

    // Accent-insensitive token AND search using PostgreSQL unaccent.
    const categoryIds = Array.isArray(where.category_id?.in)
      ? (where.category_id.in as number[])
      : null;
    const minPrice = min_price ?? null;
    const maxPrice = max_price ?? null;
    const tokenCondsSafe = tokens.map(
      (t) =>
        Prisma.sql`unaccent(lower(p.name)) LIKE '%' || unaccent(lower(${t})) || '%'`,
    );

    const baseWhereSqlParts: Prisma.Sql[] = [Prisma.sql`p.is_active = true`];
    if (categoryIds && categoryIds.length > 0) {
      baseWhereSqlParts.push(Prisma.sql`p.category_id = ANY(${categoryIds})`);
    }
    if (minPrice !== null) {
      baseWhereSqlParts.push(Prisma.sql`p.price >= ${minPrice}`);
    }
    if (maxPrice !== null) {
      baseWhereSqlParts.push(Prisma.sql`p.price <= ${maxPrice}`);
    }
    baseWhereSqlParts.push(...tokenCondsSafe);

    const whereSql = Prisma.join(baseWhereSqlParts, ' AND ');

    const [{ count }] = await this.prisma.$queryRaw<Array<{ count: bigint }>>(
      Prisma.sql`SELECT COUNT(*)::bigint AS count FROM products p WHERE ${whereSql}`,
    );

    const idRows = await this.prisma.$queryRaw<Array<{ id: number }>>(
      Prisma.sql`SELECT p.id
                 FROM products p
                 WHERE ${whereSql}
                 ORDER BY p.created_at DESC
                 LIMIT ${limit} OFFSET ${skip}`,
    );

    const ids = idRows.map((r) => r.id);
    const total = Number(count);

    const dataUnsorted = await this.prisma.products.findMany({
      where: {
        ...where,
        id: { in: ids.length ? ids : [-1] },
      },
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
    });

    const orderIndex = new Map(ids.map((id, idx) => [id, idx]));
    const data = dataUnsorted.sort(
      (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
    );

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
          include: { categories: true },
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
      throw new NotFoundException('Category này không tồn tại');

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
