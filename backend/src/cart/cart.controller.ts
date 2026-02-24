import { Body, Controller, Get, UseGuards, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/auth/decorators/permissions.decorater';

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
