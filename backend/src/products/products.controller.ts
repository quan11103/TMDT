import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadProductImagesDto } from './dto/upload-product-images.dto';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  //---PUBLIC ROUTES-------------------------

  @Get()
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @Get('bestsellers')
  getBestSellers(@Query('limit') limitStr?: string) {
    const limit = parseInt(limitStr) || 18;
    return this.productsService.getBestSellers(limit);
  }

  @Get('featured')
  getFeatured(@Query('limit') limitStr?: string) {
    const limit = parseInt(limitStr) || 18;
    return this.productsService.getFeaturedProducts(limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  //---ADMIN ROUTES-------------------------

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('product.create')
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('product.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(+id, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('product.update')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dir = join(process.cwd(), 'uploads', 'products');
          mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          const filename = `${randomUUID()}${ext}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit per file
      },
    }),
  )
  @Post(':id/images')
  uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadProductImagesDto,
  ) {
    return this.productsService.addImages(+id, files, dto.main_index);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('product.update')
  @Patch(':id/images/:imageId/main')
  setMainImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.productsService.setMainImage(+id, +imageId);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('product.update')
  @Delete(':id/images/:imageId')
  removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.productsService.removeImage(+id, +imageId);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('product.delete')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.productsService.softRemove(+id);
  }
}
