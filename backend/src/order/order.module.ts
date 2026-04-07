import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { PromotionsModule } from 'src/promotions/promotions.module';

@Module({
  imports: [PromotionsModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
