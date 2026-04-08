import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateStoreSettingsDto } from './dto/update-store-settings.dto';

const SINGLETON_ID = 1;

@Injectable()
export class StoreSettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    // Always return a row (singleton)
    return this.prisma.store_settings.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: {
        id: SINGLETON_ID,
        products_per_page: 12,
        products_per_row: 4,
      },
    });
  }

  async update(dto: UpdateStoreSettingsDto) {
    return this.prisma.store_settings.upsert({
      where: { id: SINGLETON_ID },
      update: {
        ...(dto.products_per_page !== undefined
          ? { products_per_page: dto.products_per_page }
          : {}),
        ...(dto.products_per_row !== undefined
          ? { products_per_row: dto.products_per_row }
          : {}),
      },
      create: {
        id: SINGLETON_ID,
        products_per_page: dto.products_per_page ?? 12,
        products_per_row: dto.products_per_row ?? 4,
      },
    });
  }
}
