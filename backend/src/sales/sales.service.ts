import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async getActiveCampaigns(now: Date) {
    const [campaigns] = await Promise.all([
      this.prisma.sale_campaigns.findMany({
        where: {
          start_at: { lte: now },
          end_at: { gte: now },
          is_active: true,
        },
        include: {
          sale_rules: true,
        },
      }),
    ]);
    return { campaigns };
  }
}
