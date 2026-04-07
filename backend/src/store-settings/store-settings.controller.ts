import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { UpdateStoreSettingsDto } from './dto/update-store-settings.dto';
import { StoreSettingsService } from './store-settings.service';

@Controller('store-settings')
export class StoreSettingsController {
  constructor(private readonly storeSettingsService: StoreSettingsService) {}

  @Get()
  get() {
    return this.storeSettingsService.get();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('store_settings.update')
  @Patch()
  update(@Body() dto: UpdateStoreSettingsDto) {
    return this.storeSettingsService.update(dto);
  }
}

