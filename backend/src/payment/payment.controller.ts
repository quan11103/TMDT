import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment-dto';
import { PaymentService } from './payment.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createPayment(@CurrentUser() user, @Body() dto: CreatePaymentDto) {
    return this.paymentService.createPayment(user.id as number, dto);
  }

  @Get('vnpay/callback')
  vnPayCallback(@Query() query: Record<string, string>) {
    return this.paymentService.handleVnPayCallback(query);
  }
}
