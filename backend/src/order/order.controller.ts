import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Permissions } from 'src/auth/decorators/permissions.decorater';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

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
