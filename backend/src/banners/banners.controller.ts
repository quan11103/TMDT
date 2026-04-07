import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ReorderBannersDto } from './dto/reorder-banners.dto';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get('public')
  findPublic() {
    return this.bannersService.findPublic();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('banner.read')
  @Get()
  findAllAdmin() {
    return this.bannersService.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('banner.create')
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  create(
    @Body() dto: CreateBannerDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.bannersService.create(dto, file);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('banner.update')
  @Patch('reorder')
  reorder(@Body() dto: ReorderBannersDto) {
    return this.bannersService.reorder(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('banner.update')
  @UseInterceptors(FileInterceptor('file'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBannerDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.bannersService.update(+id, dto, file);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('banner.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bannersService.remove(+id);
  }
}
