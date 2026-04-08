import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import {
  promo_discount_type,
  promo_product_scope,
  promotions,
  promotion_products,
} from '@prisma/client';

/** Promotion + product allowlist for PRODUCT scope (order/checkout pricing). */
export type PromotionResolvedForOrder = promotions & {
  promotion_products: Pick<promotion_products, 'product_id'>[];
};

const PROMOTION_INCLUDE = {
  categories: { select: { id: true, name: true, slug: true } },
  promotion_products: {
    select: {
      product_id: true,
      products: {
        select: { id: true, name: true, slug: true, is_active: true },
      },
    },
  },
} as const;

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  private normalizeCode(code: string) {
    return code.trim().toUpperCase();
  }

  /**
   * Load promotion and validate it can be used at checkout now. Throws BadRequestException if not.
   */
  async resolveApplicablePromotion(
    rawCode: string,
  ): Promise<PromotionResolvedForOrder> {
    const code = this.normalizeCode(rawCode);
    const promo = await this.prisma.promotions.findUnique({
      where: { code },
      include: {
        promotion_products: { select: { product_id: true } },
      },
    });

    if (!promo) {
      throw new BadRequestException('Mã khuyến mại không tồn tại');
    }

    const now = new Date();
    if (!promo.is_active) {
      throw new BadRequestException('Mã khuyến mại đã bị vô hiệu');
    }
    if (now < promo.starts_at) {
      throw new BadRequestException('Mã chưa đến thời gian áp dụng');
    }
    if (now > promo.ends_at) {
      throw new BadRequestException('Mã đã hết hạn');
    }

    return promo;
  }

  /**
   * MVP: CATEGORY scope matches exact product.category_id only (not parent/child tree).
   */
  isLineEligible(
    promo: PromotionResolvedForOrder,
    line: { product_id: number; category_id: number },
  ): boolean {
    if (promo.product_scope === promo_product_scope.ALL) {
      return true;
    }
    if (promo.product_scope === promo_product_scope.CATEGORY) {
      return (
        promo.category_id != null && line.category_id === promo.category_id
      );
    }
    const allowed = new Set(promo.promotion_products.map((r) => r.product_id));
    return allowed.has(line.product_id);
  }

  /**
   * Discount applies only to eligible lines; PERCENT rounds to integer VND.
   */
  computeDiscountForCart(
    promo: PromotionResolvedForOrder,
    lines: Array<{
      unitPrice: number;
      quantity: number;
      product_id: number;
      category_id: number;
    }>,
  ): {
    subtotal: number;
    eligibleSubtotal: number;
    discountAmount: number;
    totalAmount: number;
    promotionId: number;
  } {
    let eligibleSubtotal = 0;
    let subtotal = 0;
    for (const line of lines) {
      const lineGross = line.unitPrice * line.quantity;
      subtotal += lineGross;
      if (this.isLineEligible(promo, line)) {
        eligibleSubtotal += lineGross;
      }
    }

    if (eligibleSubtotal <= 0) {
      throw new BadRequestException(
        'Mã không áp dụng cho sản phẩm trong giỏ hàng',
      );
    }

    let discountAmount = 0;
    if (promo.discount_type === promo_discount_type.PERCENT) {
      discountAmount = Math.round(
        (eligibleSubtotal * Number(promo.discount_value)) / 100,
      );
    } else {
      discountAmount = Math.min(Number(promo.discount_value), eligibleSubtotal);
    }

    discountAmount = Math.min(discountAmount, eligibleSubtotal);
    const totalAmount = Math.max(0, subtotal - discountAmount);

    return {
      subtotal,
      eligibleSubtotal,
      discountAmount,
      totalAmount,
      promotionId: promo.id,
    };
  }

  private assertDateRange(startsAt: Date, endsAt: Date) {
    if (endsAt <= startsAt) {
      throw new BadRequestException('ends_at phải sau starts_at');
    }
  }

  private async assertScope(params: {
    product_scope: promo_product_scope;
    category_id: number | null | undefined;
    product_ids: number[];
  }) {
    const { product_scope, category_id, product_ids } = params;

    if (product_scope === promo_product_scope.ALL) {
      return;
    }

    if (product_scope === promo_product_scope.CATEGORY) {
      if (category_id == null) {
        throw new BadRequestException('Cần category_id khi scope là CATEGORY');
      }
      const cat = await this.prisma.categories.findUnique({
        where: { id: category_id },
      });
      if (!cat) {
        throw new NotFoundException('Danh mục không tồn tại');
      }
      return;
    }

    if (product_scope === promo_product_scope.PRODUCT) {
      const ids = [...new Set(product_ids)].filter(
        (id) => Number.isInteger(id) && id > 0,
      );
      if (ids.length === 0) {
        throw new BadRequestException(
          'Cần ít nhất một product_id khi scope là PRODUCT',
        );
      }
      const products = await this.prisma.products.findMany({
        where: { id: { in: ids }, is_active: true },
        select: { id: true },
      });
      if (products.length !== ids.length) {
        throw new BadRequestException(
          'Một số sản phẩm không tồn tại hoặc không còn đang bán',
        );
      }
    }
  }

  async create(dto: CreatePromotionDto) {
    const code = this.normalizeCode(dto.code);

    const dup = await this.prisma.promotions.findUnique({ where: { code } });
    if (dup) {
      throw new ConflictException('Mã khuyến mại đã tồn tại');
    }

    this.assertDateRange(dto.starts_at, dto.ends_at);

    const categoryId =
      dto.product_scope === promo_product_scope.CATEGORY
        ? dto.category_id
        : null;
    const productIds =
      dto.product_scope === promo_product_scope.PRODUCT
        ? [...new Set(dto.product_ids ?? [])]
        : [];

    await this.assertScope({
      product_scope: dto.product_scope,
      category_id: categoryId,
      product_ids: productIds,
    });

    return this.prisma.$transaction(async (tx) => {
      const promo = await tx.promotions.create({
        data: {
          code,
          discount_type: dto.discount_type,
          discount_value: dto.discount_value,
          product_scope: dto.product_scope,
          category_id: categoryId,
          starts_at: dto.starts_at,
          ends_at: dto.ends_at,
          is_active: dto.is_active ?? true,
        },
      });

      if (
        dto.product_scope === promo_product_scope.PRODUCT &&
        productIds.length > 0
      ) {
        await tx.promotion_products.createMany({
          data: productIds.map((product_id) => ({
            promotion_id: promo.id,
            product_id,
          })),
        });
      }

      return promo;
    });
  }

  async findAll() {
    return this.prisma.promotions.findMany({
      include: PROMOTION_INCLUDE,
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const promo = await this.prisma.promotions.findUnique({
      where: { id },
      include: PROMOTION_INCLUDE,
    });
    if (!promo) {
      throw new NotFoundException(`Không tìm thấy khuyến mại ${id}`);
    }
    return promo;
  }

  async update(id: number, dto: UpdatePromotionDto) {
    const existing = await this.prisma.promotions.findUnique({
      where: { id },
      include: { promotion_products: true },
    });
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy khuyến mại ${id}`);
    }

    const nextCode =
      dto.code !== undefined ? this.normalizeCode(dto.code) : existing.code;

    if (dto.code !== undefined) {
      const dup = await this.prisma.promotions.findUnique({
        where: { code: nextCode },
      });
      if (dup && dup.id !== id) {
        throw new ConflictException('Mã khuyến mại đã tồn tại');
      }
    }

    const nextScope = dto.product_scope ?? existing.product_scope;

    const existingProductIds = existing.promotion_products.map(
      (r) => r.product_id,
    );

    let nextCategoryId: number | null = existing.category_id;
    let nextProductIds = [...existingProductIds];

    if (nextScope === promo_product_scope.ALL) {
      nextCategoryId = null;
      nextProductIds = [];
    } else if (nextScope === promo_product_scope.CATEGORY) {
      nextCategoryId =
        dto.category_id !== undefined ? dto.category_id : existing.category_id;
      nextProductIds = [];
    } else {
      nextCategoryId = null;
      if (dto.product_ids !== undefined) {
        nextProductIds = [...new Set(dto.product_ids)];
      } else {
        nextProductIds = [...existingProductIds];
      }
    }

    const nextStarts = dto.starts_at ?? existing.starts_at;
    const nextEnds = dto.ends_at ?? existing.ends_at;
    this.assertDateRange(nextStarts, nextEnds);

    await this.assertScope({
      product_scope: nextScope,
      category_id: nextCategoryId,
      product_ids: nextProductIds,
    });

    return this.prisma.$transaction(async (tx) => {
      await tx.promotion_products.deleteMany({ where: { promotion_id: id } });

      if (
        nextScope === promo_product_scope.PRODUCT &&
        nextProductIds.length > 0
      ) {
        await tx.promotion_products.createMany({
          data: nextProductIds.map((product_id) => ({
            promotion_id: id,
            product_id,
          })),
        });
      }

      await tx.promotions.update({
        where: { id },
        data: {
          ...(dto.code !== undefined ? { code: nextCode } : {}),
          ...(dto.discount_type !== undefined
            ? { discount_type: dto.discount_type }
            : {}),
          ...(dto.discount_value !== undefined
            ? { discount_value: dto.discount_value }
            : {}),
          product_scope: nextScope,
          category_id: nextCategoryId,
          ...(dto.starts_at !== undefined ? { starts_at: dto.starts_at } : {}),
          ...(dto.ends_at !== undefined ? { ends_at: dto.ends_at } : {}),
          ...(dto.is_active !== undefined ? { is_active: dto.is_active } : {}),
        },
      });

      return this.findOne(id);
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.promotions.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy khuyến mại ${id}`);
    }
    await this.prisma.promotions.delete({ where: { id } });
    return { message: 'Đã xóa khuyến mại', id };
  }

  async previewByCode(rawCode: string) {
    const code = this.normalizeCode(rawCode);
    const promo = await this.prisma.promotions.findUnique({
      where: { code },
      include: PROMOTION_INCLUDE,
    });

    if (!promo) {
      return {
        valid: false,
        message: 'Mã không tồn tại',
      };
    }

    const now = new Date();
    if (!promo.is_active) {
      return {
        valid: false,
        message: 'Mã đã bị vô hiệu',
        code: promo.code,
      };
    }
    if (now < promo.starts_at) {
      return {
        valid: false,
        message: 'Mã chưa đến thời gian áp dụng',
        code: promo.code,
      };
    }
    if (now > promo.ends_at) {
      return {
        valid: false,
        message: 'Mã đã hết hạn',
        code: promo.code,
      };
    }

    return {
      valid: true,
      message: 'Mã hợp lệ',
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: Number(promo.discount_value),
      product_scope: promo.product_scope,
      category_id: promo.category_id,
      product_ids: promo.promotion_products.map((r) => r.product_id),
      starts_at: promo.starts_at,
      ends_at: promo.ends_at,
    };
  }
}
