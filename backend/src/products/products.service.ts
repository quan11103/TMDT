import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.products.findMany({
      where: { is_active: true },
    });
  }

  // Tìm sản phẩm theo id
  async findOne(id: number) {
    const productInfo = await this.prisma.products.findUnique({
      where: { id },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
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
