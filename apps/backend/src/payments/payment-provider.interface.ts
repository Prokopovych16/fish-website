import { PaymentStatus } from '@prisma/client';

/**
 * Мінімальні дані замовлення, потрібні будь-якому платіжному провайдеру
 * для побудови форми оплати. Жоден провайдер не повинен звертатись до Prisma напряму.
 */
export interface OrderForPayment {
  id: string;
  orderNumber: string;
  total: number;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

/**
 * Уніфікований результат генерації форми оплати — фронтенд просто
 * рендерить <form action method> з цими полями, не знаючи деталей провайдера.
 */
export interface CheckoutFormResult {
  provider: string;
  action: string;
  method: 'GET' | 'POST';
  /** Значення може бути масивом — тоді фронтенд створить кілька <input> з однаковим ім'ям */
  fields: Record<string, string | string[]>;
}

/**
 * Нормалізований результат вебхука — однаковий для всіх провайдерів.
 * Бізнес-логіка (склад, статус замовлення) працює лише з цим типом,
 * не знаючи специфіки конкретного платіжного шлюзу.
 */
export interface NormalizedCallbackResult {
  orderId: string;
  status: PaymentStatus;
  providerPaymentId?: string;
}

/**
 * Контракт платіжного провайдера. Щоб додати новий шлюз (Fondy, Stripe тощо) —
 * достатньо реалізувати цей інтерфейс і зареєструвати провайдера в PaymentsService,
 * без жодних змін у бізнес-логіці замовлень.
 */
export interface PaymentProvider {
  /** Унікальний ключ провайдера, напр. 'wayforpay' | 'liqpay' */
  readonly name: string;

  /** Чи налаштовані ключі (з БД або .env) — інакше показуємо чітку помилку замість мовчазного збою */
  isConfigured(): Promise<boolean>;

  /** Побудувати форму для перенаправлення клієнта на сторінку оплати */
  createCheckout(order: OrderForPayment): Promise<CheckoutFormResult>;

  /** Перевірити підпис і розпарсити вебхук-сповіщення від провайдера */
  handleCallback(payload: any): Promise<NormalizedCallbackResult>;

  /**
   * Деякі провайдери (напр. WayForPay) вимагають специфічну відповідь на вебхук
   * (підписане підтвердження прийому), інакше будуть повторювати запит.
   */
  buildCallbackResponse?(payload: any): Promise<any> | any;
}
