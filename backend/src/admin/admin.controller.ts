import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { AdminService } from './admin.service';
import { Permissions } from 'src/auth/decorators/permissions.decorater';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('orders')
  @Permissions('order.manage')
  getAllOrders() {
    return this.adminService.getAllOrders();
  }
}
