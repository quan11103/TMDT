import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/auth/decorators/permissions.decorater';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  getProductList() {
    return this.productsService.findAll();
  }

  @Get(':id')
  getProduct(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('product.create')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }
}
