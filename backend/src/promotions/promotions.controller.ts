import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PreviewPromotionDto } from './dto/preview-promotion.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post('preview')
  preview(@Body() dto: PreviewPromotionDto) {
    return this.promotionsService.previewByCode(dto.code);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('promotion.read')
  @Get()
  findAll() {
    return this.promotionsService.findAll();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('promotion.create')
  @Post()
  create(@Body() dto: CreatePromotionDto) {
    return this.promotionsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('promotion.read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('promotion.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
    return this.promotionsService.update(+id, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('promotion.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(+id);
  }
}
