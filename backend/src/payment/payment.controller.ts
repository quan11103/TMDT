import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment-dto';
import { PaymentService } from './payment.service';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('payment.create')
  createPayment(@CurrentUser() user, @Body() dto: CreatePaymentDto) {
    return this.paymentService.createPayment(user.id as number, dto);
  }
}
