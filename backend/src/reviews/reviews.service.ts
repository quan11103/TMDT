import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewsDto } from './dto/query-reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  private async assertActiveProduct(productId: number) {
    const product = await this.prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, is_active: true },
    });
    if (!product || !product.is_active) {
      throw new NotFoundException(`Không tìm thấy sản phẩm ${productId}`);
    }
  }

  async upsertMyReview(
    userId: number,
    productId: number,
    dto: CreateReviewDto,
  ) {
    await this.assertActiveProduct(productId);

    return this.prisma.product_reviews.upsert({
      where: {
        product_id_user_id: { product_id: productId, user_id: userId },
      },
      update: {
        rating: dto.rating,
        comment: dto.comment ?? null,
      },
      create: {
        product_id: productId,
        user_id: userId,
        rating: dto.rating,
        comment: dto.comment ?? null,
      },
      select: {
        id: true,
        product_id: true,
        user_id: true,
        rating: true,
        comment: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async listByProduct(productId: number, query: QueryReviewsDto) {
    await this.assertActiveProduct(productId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = { product_id: productId };

    const [data, total] = await Promise.all([
      this.prisma.product_reviews.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          rating: true,
          comment: true,
          created_at: true,
          users: {
            select: { id: true, full_name: true },
          },
        },
      }),
      this.prisma.product_reviews.count({ where }),
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

  async summary(productId: number) {
    await this.assertActiveProduct(productId);

    const agg = await this.prisma.product_reviews.aggregate({
      where: { product_id: productId },
      _count: { _all: true },
      _avg: { rating: true },
    });

    return {
      product_id: productId,
      count: agg._count._all,
      avg_rating: agg._avg.rating ? Number(agg._avg.rating) : 0,
    };
  }

  async updateMyReview(
    userId: number,
    productId: number,
    dto: UpdateReviewDto,
  ) {
    await this.assertActiveProduct(productId);

    const existing = await this.prisma.product_reviews.findUnique({
      where: {
        product_id_user_id: { product_id: productId, user_id: userId },
      },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Bạn chưa đánh giá sản phẩm này');
    }

    if (dto.rating === undefined && dto.comment === undefined) {
      throw new BadRequestException('Không có dữ liệu cập nhật');
    }

    return this.prisma.product_reviews.update({
      where: { id: existing.id },
      data: {
        ...(dto.rating !== undefined ? { rating: dto.rating } : {}),
        ...(dto.comment !== undefined ? { comment: dto.comment } : {}),
      },
      select: {
        id: true,
        product_id: true,
        user_id: true,
        rating: true,
        comment: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async deleteMyReview(userId: number, productId: number) {
    await this.assertActiveProduct(productId);

    const existing = await this.prisma.product_reviews.findUnique({
      where: {
        product_id_user_id: { product_id: productId, user_id: userId },
      },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Bạn chưa đánh giá sản phẩm này');
    }

    await this.prisma.product_reviews.delete({ where: { id: existing.id } });
    return { message: 'Đã xóa đánh giá' };
  }
}
