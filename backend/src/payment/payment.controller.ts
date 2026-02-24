import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Permissions } from 'src/auth/decorators/permissions.decorater';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { CreatePaymentDto } from './dto/payment.dto';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('payment.create')
  createPayment(@Body() dto: CreatePaymentDto) {
    return this.paymentService.createPayment(dto);
  }
}
