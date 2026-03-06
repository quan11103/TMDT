import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('order.create')
  createOrder(@CurrentUser() user, @Body() dto: CreateOrderDto) {
    // Implementation will go here
    return this.orderService.createOrder(user.id as number, dto);
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  getMyOrders(@CurrentUser() user) {
    return this.orderService.getMyOrders(user.id as number);
  }
}
