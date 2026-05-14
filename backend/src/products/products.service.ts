import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductSort, QueryProductDto } from './dto/query-product.dto';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import * as fs from 'fs/promises';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  private getSortOrder(sort?: ProductSort) {
    const selected = sort ?? 'newest';
    if (selected === 'price_asc') {
      return {
        prismaOrderBy: { price: 'asc' as const },
        sqlOrderBy: Prisma.sql`p.price ASC`,
      };
    }
    if (selected === 'price_desc') {
      return {
        prismaOrderBy: { price: 'desc' as const },
        sqlOrderBy: Prisma.sql`p.price DESC`,
      };
    }
    return {
      prismaOrderBy: { created_at: 'desc' as const },
      sqlOrderBy: Prisma.sql`p.created_at DESC`,
    };
  }

  private ensureProductUploadDir() {
    const dir = join(process.cwd(), 'uploads', 'products');
    mkdirSync(dir, { recursive: true });
    return dir;
  }

  private createFilename(originalname: string) {
    const ext = extname(originalname || '').toLowerCase();
    const safeExt = ext && ext.length <= 10 ? ext : '';
    return `${randomUUID()}${safeExt}`;
  }

  private toPublicImageUrl(filename: string) {
    return `/uploads/products/${filename}`;
  }

  private toDiskPathFromPublicUrl(imageUrl: string) {
    // Expect image_url like "/uploads/products/<file>"
    return join(process.cwd(), imageUrl.replace(/^\//, ''));
  }

  // Lấy danh sách sản phẩm nổi bật
  async getFeaturedProducts(limit: number) {
    const featuredReviews = await this.prisma.product_reviews.groupBy({
      by: ['product_id'],
      _avg: {
        rating: true,
      },
      orderBy: {
        _avg: {
          rating: 'desc',
        },
      },
      take: limit,
    });

    const productIds = featuredReviews.map((item) => item.product_id);

    // Nếu không đủ limit sản phẩm, lấy thêm các sản phẩm Mới (NewArrivals)
    if (productIds.length < limit) {
      const remainingCount = limit - productIds.length;
      const newestProducts = await this.prisma.products.findMany({
        where: {
          id: { notIn: productIds.length > 0 ? productIds : [-1] },
          is_active: true,
        },
        orderBy: { created_at: 'desc' },
        take: remainingCount,
        select: { id: true },
      });
      productIds.push(...newestProducts.map((p) => p.id));
    }

    if (productIds.length === 0) {
      return {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit,
          total_page: 0,
        },
      };
    }

    const dataUnsorted = await this.prisma.products.findMany({
      where: {
        id: { in: productIds },
        is_active: true,
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

    const orderIndex = new Map(productIds.map((id, idx) => [id, idx]));
    const data = dataUnsorted.sort(
      (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
    );

    return {
      data,
      meta: {
        total: data.length,
        page: 1,
        limit,
        total_page: 1,
      },
    };
  }

  // Lấy danh sách sản phẩm bán chạy nhất
  async getBestSellers(limit: number) {
    const bestSellers = await this.prisma.order_items.groupBy({
      by: ['product_id'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    const productIds = bestSellers.map((item) => item.product_id);

    // Nếu không đủ 18 (hoặc limit) sản phẩm, lấy thêm các sản phẩm Mới (NewArrivals)
    if (productIds.length < limit) {
      const remainingCount = limit - productIds.length;
      const newestProducts = await this.prisma.products.findMany({
        where: {
          id: { notIn: productIds.length > 0 ? productIds : [-1] },
          is_active: true,
        },
        orderBy: { created_at: 'desc' },
        take: remainingCount,
        select: { id: true },
      });
      productIds.push(...newestProducts.map((p) => p.id));
    }

    if (productIds.length === 0) {
      return {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit,
          total_page: 0,
        },
      };
    }

    const dataUnsorted = await this.prisma.products.findMany({
      where: {
        id: { in: productIds },
        is_active: true,
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

    const orderIndex = new Map(productIds.map((id, idx) => [id, idx]));
    const data = dataUnsorted.sort(
      (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
    );

    return {
      data,
      meta: {
        total: data.length,
        page: 1,
        limit,
        total_page: 1,
      },
    };
  }

  // Search sản phẩm
  async findAll(query: QueryProductDto) {
    const {
      search,
      category_id,
      min_price,
      max_price,
      page = 1,
      limit = 10,
      sort = 'newest',
    } = query;
    const { prismaOrderBy, sqlOrderBy } = this.getSortOrder(sort);
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
          orderBy: prismaOrderBy,
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
                 ORDER BY ${sqlOrderBy}
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

  async addImages(
    productId: number,
    files: Express.Multer.File[],
    mainIndex?: number,
  ) {
    const product = await this.prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, is_active: true },
    });
    if (!product || !product.is_active) {
      throw new NotFoundException(`Không tìm thấy sản phẩm ${productId}`);
    }

    if (!files || files.length === 0) {
      throw new NotFoundException('Thiếu file ảnh');
    }

    const filenames = files.map((f) => f.filename);

    const existingMain = await this.prisma.product_images.findFirst({
      where: { product_id: productId, is_main: true },
      select: { id: true },
    });

    const resolvedMainIndex =
      mainIndex !== undefined ? mainIndex : existingMain ? -1 : 0;

    await this.prisma.product_images.createMany({
      data: filenames.map((filename, idx) => ({
        product_id: productId,
        image_url: this.toPublicImageUrl(filename),
        is_main: idx === resolvedMainIndex,
      })),
    });

    // return updated product images
    return this.prisma.product_images.findMany({
      where: { product_id: productId },
      select: { id: true, image_url: true, is_main: true, created_at: true },
      orderBy: { is_main: 'desc' },
    });
  }

  async setMainImage(productId: number, imageId: number) {
    const image = await this.prisma.product_images.findFirst({
      where: { id: imageId, product_id: productId },
      select: { id: true },
    });
    if (!image) {
      throw new NotFoundException('Không tìm thấy ảnh sản phẩm');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.product_images.updateMany({
        where: { product_id: productId, is_main: true },
        data: { is_main: false },
      });
      await tx.product_images.update({
        where: { id: imageId },
        data: { is_main: true },
      });
    });

    return this.prisma.product_images.findMany({
      where: { product_id: productId },
      select: { id: true, image_url: true, is_main: true, created_at: true },
      orderBy: { is_main: 'desc' },
    });
  }

  async removeImage(productId: number, imageId: number) {
    const image = await this.prisma.product_images.findFirst({
      where: { id: imageId, product_id: productId },
      select: { id: true, image_url: true, is_main: true },
    });
    if (!image) {
      throw new NotFoundException('Không tìm thấy ảnh sản phẩm');
    }

    await this.prisma.product_images.delete({ where: { id: imageId } });

    // If removed main image, pick another image as main (oldest first).
    if (image.is_main) {
      const next = await this.prisma.product_images.findFirst({
        where: { product_id: productId },
        orderBy: { created_at: 'asc' },
        select: { id: true },
      });
      if (next) {
        await this.prisma.product_images.update({
          where: { id: next.id },
          data: { is_main: true },
        });
      }
    }

    if (image.image_url?.startsWith('/uploads/')) {
      const diskPath = this.toDiskPathFromPublicUrl(image.image_url);
      await fs.unlink(diskPath).catch(() => undefined);
    }

    return {
      message: 'Đã xóa ảnh',
    };
  }
}
