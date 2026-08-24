import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { WayForPayProvider } from './providers/wayforpay.provider';
import { LiqpayProvider } from './providers/liqpay.provider';
import { PaymentProvider, OrderForPayment, CheckoutFormResult } from './payment-provider.interface';

const DEFAULT_PROVIDER = 'wayforpay';

@Injectable()
export class PaymentsService {
  private readonly providers: Map<string, PaymentProvider>;

  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService,
    wayForPayProvider: WayForPayProvider,
    liqpayProvider: LiqpayProvider,
  ) {
    // Додати нового провайдера (Fondy тощo) — достатньо зареєструвати його тут
    this.providers = new Map<string, PaymentProvider>([
      [wayForPayProvider.name, wayForPayProvider],
      [liqpayProvider.name, liqpayProvider],
    ]);
  }

  getProvider(name: string): PaymentProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new BadRequestException(`Платіжний провайдер "${name}" не підтримується`);
    }
    return provider;
  }

  /** Активний провайдер за замовчуванням — вибирається в адмінці (Налаштування → Платежі) */
  async getActiveProviderName(): Promise<string> {
    const setting = await this.prisma.setting.findUnique({ where: { key: 'payment_provider' } });
    const name = setting?.value || process.env.DEFAULT_PAYMENT_PROVIDER || DEFAULT_PROVIDER;
    return this.providers.has(name) ? name : DEFAULT_PROVIDER;
  }

  private async loadOrderForPayment(orderId: string): Promise<OrderForPayment> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Замовлення не знайдено');

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      total: Number(order.total),
      contactFirstName: order.contactFirstName,
      contactLastName: order.contactLastName,
      contactEmail: order.contactEmail,
      contactPhone: order.contactPhone,
      items: order.items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        price: Number(i.price),
      })),
    };
  }

  async createCheckout(orderId: string, providerName?: string): Promise<CheckoutFormResult> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Замовлення не знайдено');
    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Це замовлення вже оплачено');
    }

    const name = providerName || (await this.getActiveProviderName());
    const provider = this.getProvider(name);

    if (!(await provider.isConfigured())) {
      throw new BadRequestException(
        `Платіжний провайдер "${name}" не налаштовано. Вкажіть ключі у налаштуваннях (Адмінка → Налаштування → Платежі).`,
      );
    }

    const orderForPayment = await this.loadOrderForPayment(orderId);
    return provider.createCheckout(orderForPayment);
  }

  async handleCallback(providerName: string, payload: any): Promise<any> {
    const provider = this.getProvider(providerName);
    const result = await provider.handleCallback(payload);

    await this.ordersService.applyPaymentResult(result.orderId, result.status, result.providerPaymentId);

    return provider.buildCallbackResponse ? provider.buildCallbackResponse(payload) : { ok: true };
  }
}
