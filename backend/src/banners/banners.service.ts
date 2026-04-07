import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ReorderBannersDto } from './dto/reorder-banners.dto';
import { extname, join, resolve } from 'path';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import * as fs from 'fs/promises';
import 'multer';

const BANNER_UPLOAD_DIR = join(process.cwd(), 'uploads', 'banners');

function toPublicImageUrl(filename: string) {
  return `/uploads/banners/${filename}`;
}

function toDiskPathFromPublicUrl(imageUrl: string) {
  // Expect image_url like "/uploads/banners/<file>"
  return resolve(process.cwd(), `.${imageUrl}`);
}

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  ensureUploadDir() {
    mkdirSync(BANNER_UPLOAD_DIR, { recursive: true });
    return BANNER_UPLOAD_DIR;
  }

  createFilename(originalname: string) {
    const ext = extname(originalname || '').toLowerCase();
    const safeExt = ext && ext.length <= 10 ? ext : '';
    return `${randomUUID()}${safeExt}`;
  }

  async create(dto: CreateBannerDto, imageFile: Express.Multer.File) {
    if (!imageFile) {
      throw new BadRequestException('Thiếu file ảnh');
    }

    const filename = this.createFilename(imageFile.originalname);
    this.ensureUploadDir();
    await fs.writeFile(join(BANNER_UPLOAD_DIR, filename), imageFile.buffer);

    return this.prisma.banners.create({
      data: {
        title: dto.title,
        link_url: dto.link_url,
        image_url: toPublicImageUrl(filename),
        sort_order: dto.sort_order ?? 0,
        is_active: dto.is_active ?? true,
      },
    });
  }

  async findAllAdmin() {
    return this.prisma.banners.findMany({
      orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }],
    });
  }

  async findPublic() {
    return this.prisma.banners.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }],
    });
  }

  async findOne(id: number) {
    const banner = await this.prisma.banners.findUnique({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Không tìm thấy banner ${id}`);
    }
    return banner;
  }

  async update(
    id: number,
    dto: UpdateBannerDto,
    imageFile?: Express.Multer.File,
  ) {
    const existing = await this.findOne(id);

    let nextImageUrl = existing.image_url;
    let oldDiskPathToDelete: string | null = null;

    if (imageFile) {
      const filename = this.createFilename(imageFile.originalname);
      this.ensureUploadDir();
      await fs.writeFile(join(BANNER_UPLOAD_DIR, filename), imageFile.buffer);
      nextImageUrl = toPublicImageUrl(filename);

      if (existing.image_url?.startsWith('/uploads/')) {
        oldDiskPathToDelete = toDiskPathFromPublicUrl(existing.image_url);
      }
    }

    const updated = await this.prisma.banners.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.link_url !== undefined ? { link_url: dto.link_url } : {}),
        ...(dto.sort_order !== undefined ? { sort_order: dto.sort_order } : {}),
        ...(dto.is_active !== undefined ? { is_active: dto.is_active } : {}),
        image_url: nextImageUrl,
      },
    });

    if (oldDiskPathToDelete) {
      await fs.unlink(oldDiskPathToDelete).catch(() => undefined);
    }

    return updated;
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    const diskPath = existing.image_url?.startsWith('/uploads/')
      ? toDiskPathFromPublicUrl(existing.image_url)
      : null;

    await this.prisma.banners.delete({ where: { id } });

    if (diskPath) {
      await fs.unlink(diskPath).catch(() => undefined);
    }

    return { message: 'Đã xóa banner', id };
  }

  async reorder(dto: ReorderBannersDto) {
    // Update one-by-one inside transaction (small lists from UI drag/drop).
    return this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        await tx.banners.update({
          where: { id: item.id },
          data: { sort_order: item.sort_order },
        });
      }
      return tx.banners.findMany({
        orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }],
      });
    });
  }
}
