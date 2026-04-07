import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { promo_discount_type, promo_product_scope } from '@prisma/client';

describe('PromotionsService', () => {
  let service: PromotionsService;
  const mockPrisma = {
    promotions: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    categories: {
      findUnique: jest.fn(),
    },
    products: {
      findMany: jest.fn(),
    },
    promotion_products: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PromotionsService>(PromotionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create throws Conflict when code exists', async () => {
    mockPrisma.promotions.findUnique.mockResolvedValue({
      id: 1,
      code: 'EXIST',
    });

    await expect(
      service.create({
        code: 'exist',
        discount_type: promo_discount_type.PERCENT,
        discount_value: 10,
        product_scope: promo_product_scope.ALL,
        starts_at: new Date('2026-01-01'),
        ends_at: new Date('2026-12-31'),
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('create ALL runs transaction and returns findOne result', async () => {
    mockPrisma.promotions.findUnique.mockResolvedValueOnce(null);
    mockPrisma.$transaction.mockImplementation(async (cb: any) => {
      const tx = {
        promotions: {
          create: jest.fn().mockResolvedValue({ id: 7 }),
        },
        promotion_products: {
          createMany: jest.fn(),
        },
      };
      return cb(tx);
    });

    const expected = { id: 7, code: 'SUMMER' };
    jest.spyOn(service, 'findOne').mockResolvedValue(expected as never);

    const result = await service.create({
      code: ' summer ',
      discount_type: promo_discount_type.PERCENT,
      discount_value: 10,
      product_scope: promo_product_scope.ALL,
      starts_at: new Date('2026-01-01'),
      ends_at: new Date('2026-12-31'),
    });

    expect(result).toEqual(expected);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('previewByCode returns valid false when missing', async () => {
    mockPrisma.promotions.findUnique.mockResolvedValue(null);

    const out = await service.previewByCode('nope');
    expect(out.valid).toBe(false);
    expect(out.message).toMatch(/không tồn tại/i);
  });

  it('remove throws NotFound when id missing', async () => {
    mockPrisma.promotions.findUnique.mockResolvedValue(null);

    await expect(service.remove(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  describe('computeDiscountForCart', () => {
    const basePromo = {
      id: 1,
      discount_type: promo_discount_type.PERCENT,
      discount_value: 10,
      category_id: null,
      promotion_products: [],
    };

    it('PERCENT ALL on subtotal', () => {
      const promo = {
        ...basePromo,
        product_scope: promo_product_scope.ALL,
      } as never;
      const r = service.computeDiscountForCart(promo, [
        { unitPrice: 100, qty: 2, product_id: 1, category_id: 5 },
      ]);
      expect(r.subtotal).toBe(200);
      expect(r.discountAmount).toBe(20);
      expect(r.totalAmount).toBe(180);
      expect(r.promotionId).toBe(1);
    });

    it('FIXED_AMOUNT capped by eligible subtotal', () => {
      const promo = {
        ...basePromo,
        product_scope: promo_product_scope.ALL,
        discount_type: promo_discount_type.FIXED_AMOUNT,
        discount_value: 50000,
      } as never;
      const r = service.computeDiscountForCart(promo, [
        { unitPrice: 100, qty: 1, product_id: 1, category_id: 1 },
      ]);
      expect(r.discountAmount).toBe(100);
      expect(r.totalAmount).toBe(0);
    });

    it('throws when no line matches PRODUCT scope', () => {
      const promo = {
        ...basePromo,
        product_scope: promo_product_scope.PRODUCT,
        promotion_products: [{ product_id: 99 }],
      } as never;
      expect(() =>
        service.computeDiscountForCart(promo, [
          { unitPrice: 50, qty: 1, product_id: 1, category_id: 1 },
        ]),
      ).toThrow(BadRequestException);
    });

    it('CATEGORY only eligible lines count toward discount base', () => {
      const promo = {
        ...basePromo,
        product_scope: promo_product_scope.CATEGORY,
        category_id: 2,
        discount_value: 50,
      } as never;
      const r = service.computeDiscountForCart(promo, [
        { unitPrice: 100, qty: 1, product_id: 1, category_id: 2 },
        { unitPrice: 200, qty: 1, product_id: 2, category_id: 9 },
      ]);
      expect(r.eligibleSubtotal).toBe(100);
      expect(r.discountAmount).toBe(50);
      expect(r.subtotal).toBe(300);
      expect(r.totalAmount).toBe(250);
    });
  });
});
