import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PaymentProvider,
  OrderForPayment,
  CheckoutFormResult,
  NormalizedCallbackResult,
} from '../payment-provider.interface';

@Injectable()
export class LiqpayProvider implements PaymentProvider {
  readonly name = 'liqpay';

  constructor(private prisma: PrismaService) {}

  private async getKeys(): Promise<{ publicKey: string; privateKey: string }> {
    const [pub, priv] = await Promise.all([
      this.prisma.setting.findUnique({ where: { key: 'liqpay_public_key' } }),
      this.prisma.setting.findUnique({ where: { key: 'liqpay_private_key' } }),
    ]);
    return {
      publicKey: pub?.value || process.env.LIQPAY_PUBLIC_KEY || '',
      privateKey: priv?.value || process.env.LIQPAY_PRIVATE_KEY || '',
    };
  }

  async isConfigured(): Promise<boolean> {
    const { publicKey, privateKey } = await this.getKeys();
    return !!(publicKey && privateKey);
  }

  private sign(privateKey: string, data: string): string {
    const str = privateKey + data + privateKey;
    return crypto.createHash('sha1').update(str).digest('base64');
  }

  async createCheckout(order: OrderForPayment): Promise<CheckoutFormResult> {
    const { publicKey, privateKey } = await this.getKeys();
    if (!publicKey || !privateKey) {
      throw new BadRequestException('LiqPay не налаштовано. Вкажіть ключі у налаштуваннях.');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;

    const payload = {
      version: 3,
      public_key: publicKey,
      action: 'pay',
      amount: Number(order.total),
      currency: 'UAH',
      description: `Замовлення ${order.orderNumber}`,
      order_id: order.id,
      result_url: `${frontendUrl}/checkout/success?order=${order.orderNumber}`,
      server_url: `${backendUrl}/api/payments/callback/liqpay`,
      language: 'uk',
    };

    const data = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = this.sign(privateKey, data);

    return {
      provider: this.name,
      action: 'https://www.liqpay.ua/api/3/checkout',
      method: 'POST',
      fields: { data, signature },
    };
  }

  async handleCallback(payload: any): Promise<NormalizedCallbackResult> {
    const { privateKey } = await this.getKeys();
    const { data, signature } = payload;
    const expected = this.sign(privateKey, data);

    if (expected !== signature) {
      throw new BadRequestException('Невалідний підпис LiqPay');
    }

    const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    const { order_id, status, payment_id } = decoded;

    let paymentStatus: PaymentStatus = PaymentStatus.PENDING;
    if (['success', 'sandbox'].includes(status)) {
      paymentStatus = PaymentStatus.PAID;
    } else if (['error', 'failure'].includes(status)) {
      paymentStatus = PaymentStatus.FAILED;
    } else if (['reversed', 'refund_in_process'].includes(status)) {
      paymentStatus = PaymentStatus.REFUNDED;
    }

    return {
      orderId: order_id,
      status: paymentStatus,
      providerPaymentId: payment_id?.toString(),
    };
  }
}
