import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { AdminService } from './admin.service';
import { Permissions } from 'src/common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('orders')
  @Permissions('order.manage')
  getAllOrders() {
    return this.adminService.getAllOrders();
  }

  @Get('dashboard')
  @Permissions('order.read')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }
}
