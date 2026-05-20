import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { PromotionsModule } from 'src/promotions/promotions.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [PromotionsModule, ProductsModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
