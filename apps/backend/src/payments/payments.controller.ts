import { Controller, Get, Post, Query, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Отримати форму оплати для замовлення. За замовчуванням використовується
   * активний провайдер з налаштувань (Адмінка → Платежі), але можна вказати явно
   * (?provider=liqpay) — наприклад, для повторної спроби іншим способом оплати.
   */
  @Get('checkout')
  @ApiOperation({ summary: 'Отримати форму оплати для замовлення' })
  async getCheckoutForm(@Query('orderId') orderId: string, @Query('provider') provider?: string) {
    return this.paymentsService.createCheckout(orderId, provider);
  }

  /**
   * Вебхук від платіжного провайдера. Шлях містить назву провайдера
   * (/payments/callback/wayforpay, /payments/callback/liqpay) — кожен
   * провайдер сам перевіряє підпис свого запиту.
   */
  @Post('callback/:provider')
  @ApiOperation({ summary: 'Callback від платіжного провайдера' })
  async callback(@Param('provider') provider: string, @Body() body: any) {
    return this.paymentsService.handleCallback(provider, body);
  }
}
