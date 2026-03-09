import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createOrderDto(@CurrentUser() user, @Body() dto: CreateOrderDto) {
    return this.orderService.createOrderDto(user.id as number, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyOrders(@CurrentUser() user) {
    return this.orderService.getMyOrders(user.id as number);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my/:id')
  getMyOrderDetail(@CurrentUser() user, @Param('id') orderId: string) {
    return this.orderService.getMyOrderDetail(user.id as number, +orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('my/:id/cancel')
  cancelOrder(@CurrentUser() user, @Param('id') orderId: string) {
    return this.orderService.cancelOrder(user.id as number, +orderId);
  }

  //admin
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('order.read')
  @Get()
  getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('order.read')
  @Get(':id')
  findOrderById(@Param('id') orderId: string) {
    return this.orderService.findOrderById(+orderId);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('order.update')
  @Patch(':id/status')
  updateOrderStatus(
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(+orderId, dto);
  }
}
