import { Body, Controller, Get, UseGuards, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Post()
  @Permissions('cart.update')
  addToCart(@CurrentUser() user, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(user.id as number, dto);
  }

  @Get()
  @Permissions('cart.read')
  getMyCart(@CurrentUser() user) {
    return this.cartService.getMyCart(user.id as number);
  }
}
