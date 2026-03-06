import {
  Body,
  Controller,
  Get,
  UseGuards,
  Post,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UpdateCartDto } from './dto/update-cart.dto';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Post()
  addToCart(@CurrentUser() user, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(user.id as number, dto);
  }

  @Get()
  getMyCart(@CurrentUser() user) {
    return this.cartService.getMyCart(user.id as number);
  }

  @Patch(':itemId')
  updateItem(
    @CurrentUser() user,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartDto,
  ) {
    return this.cartService.updateItem(user.id as number, +itemId, dto);
  }

  @Delete()
  clearCart(@CurrentUser() user) {
    return this.cartService.clearCart(user.id as number);
  }

  @Delete(':itemId')
  removeItem(@CurrentUser() user, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(user.id as number, +itemId);
  }
}
