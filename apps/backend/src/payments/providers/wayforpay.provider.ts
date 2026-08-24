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

interface WayForPayConfig {
  merchantAccount: string;
  merchantSecretKey: string;
  merchantDomainName: string;
}

/**
 * Інтеграція з WayForPay (https://wayforpay.com).
 * Базується на офіційному протоколі "Purchase" (форма з підписом HMAC_MD5).
 *
 * ⚠️ Перед запуском у продакшн обов'язково звірте порядок полів підпису
 * та формат вебхука в особистому кабінеті WayForPay — деталі протоколу
 * можуть відрізнятись залежно від версії API мерчанта.
 */
@Injectable()
export class WayForPayProvider implements PaymentProvider {
  readonly name = 'wayforpay';

  constructor(private prisma: PrismaService) {}

  private async getConfig(): Promise<WayForPayConfig> {
    const keys = ['wayforpay_merchant_account', 'wayforpay_merchant_secret_key', 'wayforpay_merchant_domain'];
    const rows = await this.prisma.setting.findMany({ where: { key: { in: keys } } });
    const db: Record<string, string> = {};
    for (const row of rows) db[row.key] = row.value;

    return {
      merchantAccount: db['wayforpay_merchant_account'] || process.env.WAYFORPAY_MERCHANT_ACCOUNT || '',
      merchantSecretKey: db['wayforpay_merchant_secret_key'] || process.env.WAYFORPAY_MERCHANT_SECRET_KEY || '',
      merchantDomainName: db['wayforpay_merchant_domain'] || process.env.WAYFORPAY_MERCHANT_DOMAIN || '',
    };
  }

  async isConfigured(): Promise<boolean> {
    const cfg = await this.getConfig();
    return !!(cfg.merchantAccount && cfg.merchantSecretKey && cfg.merchantDomainName);
  }

  private hmacMd5(secret: string, str: string): string {
    return crypto.createHmac('md5', secret).update(str, 'utf-8').digest('hex');
  }

  async createCheckout(order: OrderForPayment): Promise<CheckoutFormResult> {
    const cfg = await this.getConfig();
    if (!cfg.merchantAccount || !cfg.merchantSecretKey || !cfg.merchantDomainName) {
      throw new BadRequestException('WayForPay не налаштовано. Вкажіть ключі у налаштуваннях.');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;

    const orderReference = order.id;
    const orderDate = Math.floor(Date.now() / 1000);
    const amount = Number(order.total).toFixed(2);
    const currency = 'UAH';

    const productName = order.items.map((i) => i.productName);
    const productCount = order.items.map((i) => String(i.quantity));
    const productPrice = order.items.map((i) => Number(i.price).toFixed(2));

    const signatureString = [
      cfg.merchantAccount,
      cfg.merchantDomainName,
      orderReference,
      String(orderDate),
      amount,
      currency,
      ...productName,
      ...productCount,
      ...productPrice,
    ].join(';');

    const merchantSignature = this.hmacMd5(cfg.merchantSecretKey, signatureString);

    const fields: Record<string, string | string[]> = {
      merchantAccount: cfg.merchantAccount,
      merchantDomainName: cfg.merchantDomainName,
      merchantSignature,
      orderReference,
      orderDate: String(orderDate),
      amount,
      currency,
      productName,
      productCount,
      productPrice,
      clientFirstName: order.contactFirstName,
      clientLastName: order.contactLastName,
      clientEmail: order.contactEmail,
      clientPhone: order.contactPhone,
      language: 'UA',
      returnUrl: `${frontendUrl}/checkout/success?order=${order.orderNumber}`,
      serviceUrl: `${backendUrl}/api/payments/callback/wayforpay`,
    };

    return {
      provider: this.name,
      action: 'https://secure.wayforpay.com/pay',
      method: 'POST',
      fields,
    };
  }

  async handleCallback(payload: any): Promise<NormalizedCallbackResult> {
    const cfg = await this.getConfig();

    const {
      merchantAccount,
      orderReference,
      amount,
      currency,
      authCode,
      cardPan,
      transactionStatus,
      reasonCode,
      merchantSignature,
    } = payload;

    const signatureString = [
      merchantAccount,
      orderReference,
      amount,
      currency,
      authCode,
      cardPan,
      transactionStatus,
      reasonCode,
    ].join(';');

    const expected = this.hmacMd5(cfg.merchantSecretKey, signatureString);
    if (expected !== merchantSignature) {
      throw new BadRequestException('Невалідний підпис WayForPay');
    }

    let status: PaymentStatus = PaymentStatus.PENDING;
    if (transactionStatus === 'Approved') {
      status = PaymentStatus.PAID;
    } else if (['Declined', 'Expired', 'RefundDeclined'].includes(transactionStatus)) {
      status = PaymentStatus.FAILED;
    } else if (['Refunded', 'Voided', 'RefundInProcessing'].includes(transactionStatus)) {
      status = PaymentStatus.REFUNDED;
    }

    return {
      orderId: orderReference,
      status,
      providerPaymentId: authCode ? String(authCode) : undefined,
    };
  }

  /**
   * WayForPay вимагає підписану відповідь на вебхук, інакше повторюватиме запит.
   */
  async buildCallbackResponse(payload: any): Promise<any> {
    const cfg = await this.getConfig();
    const orderReference = payload?.orderReference;
    const time = Math.floor(Date.now() / 1000);
    const signature = this.hmacMd5(cfg.merchantSecretKey, [orderReference, 'accept', time].join(';'));

    return {
      orderReference,
      status: 'accept',
      time,
      signature,
    };
  }
}
