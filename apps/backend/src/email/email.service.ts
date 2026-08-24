import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

@Injectable()
export class EmailService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  /**
   * Читає SMTP-конфіг з БД, з fallback на .env
   */
  private async getSmtpConfig(): Promise<SmtpConfig> {
    const keys = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from'];
    const rows = await this.prisma.setting.findMany({ where: { key: { in: keys } } });
    const db: Record<string, string> = {};
    for (const row of rows) db[row.key] = row.value;

    return {
      host: db['smtp_host'] || this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port: Number(db['smtp_port'] || this.configService.get<string>('SMTP_PORT') || '587'),
      user: db['smtp_user'] || this.configService.get<string>('SMTP_USER') || '',
      pass: db['smtp_pass'] || this.configService.get<string>('SMTP_PASS') || '',
      from: db['smtp_from'] || this.configService.get<string>('SMTP_FROM') || db['smtp_user'] || '',
    };
  }

  private isConfiguredCheck(cfg: SmtpConfig): boolean {
    return (
      cfg.user.length > 0 &&
      !cfg.user.includes('your-email') &&
      cfg.pass.length > 0 &&
      !cfg.pass.includes('your-app-password')
    );
  }

  private createTransporter(cfg: SmtpConfig): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465,
      auth: { user: cfg.user, pass: cfg.pass },
    });
  }

  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
    const cfg = await this.getSmtpConfig();
    if (!this.isConfiguredCheck(cfg)) {
      console.warn('[Email] SMTP не налаштований, пропускаємо sendVerificationEmail');
      return;
    }
    const verificationLink = `${this.configService.get<string>('FRONTEND_URL')}/auth/verify-email?token=${token}`;

    await this.createTransporter(cfg).sendMail({
      from: cfg.from,
      to: email,
      subject: '✉️ Підтвердження email адреси',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🐟 Вітаємо, ${firstName}!</h2>
          <p>Дякуємо за реєстрацію на рибному магазині <strong>ФОП Валігура</strong>.</p>
          <p>Для активації вашого акаунту натисніть на посилання нижче:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #00B4D8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Підтвердити email
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Посилання дійсне 24 години.</p>
          <p style="color: #666; font-size: 14px;">Якщо ви не реєструвалися, проігноруйте цей лист.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">ФОП Валігура Б.В. | noreply@fish-shop.ua</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    const cfg = await this.getSmtpConfig();
    if (!this.isConfiguredCheck(cfg)) {
      console.warn('[Email] SMTP не налаштований, пропускаємо sendPasswordResetEmail');
      return;
    }
    const resetLink = `${this.configService.get<string>('FRONTEND_URL')}/auth/reset-password?token=${token}`;

    await this.createTransporter(cfg).sendMail({
      from: cfg.from,
      to: email,
      subject: '🔐 Скидання пароля',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🔐 Скидання пароля</h2>
          <p>Привіт, ${firstName}!</p>
          <p>Ми отримали запит на скидання пароля для вашого акаунту.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #F4A261; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Скинути пароль
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Посилання дійсне 1 годину.</p>
          <p style="color: #666; font-size: 14px;">Якщо ви не робили цей запит, проігноруйте цей лист.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">ФОП Валігура Б.В. | noreply@fish-shop.ua</p>
        </div>
      `,
    });
  }

  async sendOrderConfirmation(order: any): Promise<void> {
    const cfg = await this.getSmtpConfig();
    if (!this.isConfiguredCheck(cfg)) {
      console.warn('[Email] SMTP не налаштований, пропускаємо sendOrderConfirmation');
      return;
    }
    const orderUrl = `${this.configService.get<string>('FRONTEND_URL')}/account/orders/${order.id}`;

    const deliveryMethodName = this.getDeliveryMethodName(order.deliveryMethod);
    const paymentMethodName = this.getPaymentMethodName(order.paymentMethod);

    // Адреса доставки
    let deliveryAddressHtml = '';
    if (order.deliveryMethod === 'NOVA_POSHTA_BRANCH' && (order.npCityName || order.npBranchName)) {
      const parts = [order.npCityName, order.npBranchName].filter(Boolean);
      deliveryAddressHtml = `<p style="margin:4px 0;"><strong>Адреса:</strong> ${parts.join(', ')}</p>`;
    } else if (order.deliveryMethod === 'NOVA_POSHTA_COURIER' && order.deliveryAddress) {
      deliveryAddressHtml = `<p style="margin:4px 0;"><strong>Адреса кур'єра:</strong> ${order.deliveryAddress}</p>`;
    }

    const deliveryCostText = await this.getDeliveryCostText(order);

    const itemsHtml = order.items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.productName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${Number(item.price).toFixed(2)} ₴</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${Number(item.total).toFixed(2)} ₴</td>
      </tr>
    `).join('');

    await this.createTransporter(cfg).sendMail({
      from: cfg.from,
      to: order.contactEmail,
      subject: `Замовлення #${order.orderNumber} прийнято — ФОП Валігура`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
          <div style="background-color: #16181C; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <p style="margin: 0; color: #fff; font-size: 20px; font-weight: bold;">ФОП Валігура Б.В.</p>
            <p style="margin: 6px 0 0; color: #aaa; font-size: 13px;">Рибна продукція та морепродукти</p>
          </div>

          <div style="padding: 32px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="margin: 0 0 8px; font-size: 22px;">Дякуємо за замовлення!</h2>
            <p style="margin: 0 0 24px; color: #555;">Привіт, ${order.contactFirstName}! Ваше замовлення <strong>#${order.orderNumber}</strong> успішно прийнято.</p>

            <!-- Товари -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 10px 12px; text-align: left; font-size: 13px; border-bottom: 2px solid #ddd;">Товар</th>
                  <th style="padding: 10px 12px; text-align: center; font-size: 13px; border-bottom: 2px solid #ddd;">К-сть</th>
                  <th style="padding: 10px 12px; text-align: right; font-size: 13px; border-bottom: 2px solid #ddd;">Ціна</th>
                  <th style="padding: 10px 12px; text-align: right; font-size: 13px; border-bottom: 2px solid #ddd;">Сума</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <!-- Розбивка суми -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 6px 0; color: #555;">Підсумок за товари:</td>
                <td style="padding: 6px 0; text-align: right;">${Number(order.subtotal).toFixed(2)} ₴</td>
              </tr>
              ${Number(order.discountAmount) > 0 ? `
              <tr>
                <td style="padding: 6px 0; color: #555;">Знижка${order.discountCode ? ` (${order.discountCode})` : ''}:</td>
                <td style="padding: 6px 0; text-align: right; color: #2d7a4f;">−${Number(order.discountAmount).toFixed(2)} ₴</td>
              </tr>` : ''}
              ${order.loyaltyPointsUsed > 0 ? `
              <tr>
                <td style="padding: 6px 0; color: #555;">Бонусні бали (${order.loyaltyPointsUsed} балів):</td>
                <td style="padding: 6px 0; text-align: right; color: #2d7a4f;">−${order.loyaltyPointsUsed} ₴</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 6px 0; color: #555;">Доставка:</td>
                <td style="padding: 6px 0; text-align: right;">${deliveryCostText}</td>
              </tr>
              <tr style="border-top: 2px solid #1a1a1a;">
                <td style="padding: 12px 0 6px; font-weight: bold; font-size: 16px;">До сплати:</td>
                <td style="padding: 12px 0 6px; text-align: right; font-weight: bold; font-size: 16px;">${Number(order.total).toFixed(2)} ₴</td>
              </tr>
            </table>

            <!-- Доставка та оплата -->
            <div style="background-color: #f8f8f8; border-radius: 6px; padding: 16px 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 12px; font-weight: bold; font-size: 14px;">Деталі доставки та оплати</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Спосіб доставки:</strong> ${deliveryMethodName}</p>
              ${deliveryAddressHtml}
              <p style="margin: 4px 0; font-size: 14px;"><strong>Вартість доставки:</strong> ${deliveryCostText}</p>
              <p style="margin: 12px 0 4px; font-size: 14px;"><strong>Спосіб оплати:</strong> ${paymentMethodName}</p>
              ${order.paymentMethod === 'CASH_ON_DELIVERY' ? `<p style="margin: 4px 0; font-size: 13px; color: #c0392b;">⚠️ Оплата готівкою при отриманні замовлення у відділенні Нової Пошти.</p>` : ''}
              ${order.paymentMethod === 'CARD_ONLINE' || order.paymentMethod === 'LIQPAY' || order.paymentMethod === 'FONDY' ? `<p style="margin: 4px 0; font-size: 13px; color: #555;">Оплата буде підтверджена після проведення транзакції.</p>` : ''}
            </div>

            ${order.comment ? `<p style="font-size: 14px; color: #555;"><strong>Ваш коментар:</strong> ${order.comment}</p>` : ''}

            <div style="text-align: center; margin: 28px 0;">
              <a href="${orderUrl}" style="background-color: #16181C; color: white; padding: 13px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 14px; font-weight: 600;">
                Переглянути замовлення
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="color: #999; font-size: 12px; margin: 0;">ФОП Валігура Б.В. &nbsp;|&nbsp; Хмільник, Вінницька обл.</p>
          </div>
        </div>
      `,
    });
  }

  async sendOrderStatusUpdate(order: any): Promise<void> {
    const cfg = await this.getSmtpConfig();
    if (!this.isConfiguredCheck(cfg)) {
      console.warn('[Email] SMTP не налаштований, пропускаємо sendOrderStatusUpdate');
      return;
    }
    const orderUrl = `${this.configService.get<string>('FRONTEND_URL')}/account/orders/${order.id}`;
    const statusName = this.getOrderStatusName(order.status);

    let statusMessage = '';
    let statusColor = '#666';
    switch (order.status) {
      case 'CONFIRMED':  statusMessage = 'Ваше замовлення підтверджено та готується до відправки.'; statusColor = '#28a745'; break;
      case 'PROCESSING': statusMessage = 'Ваше замовлення обробляється.'; statusColor = '#007bff'; break;
      case 'SHIPPED':    statusMessage = `Ваше замовлення відправлено!${order.npTrackingNumber ? ` ТТН: ${order.npTrackingNumber}` : ''}`; statusColor = '#17a2b8'; break;
      case 'DELIVERED':  statusMessage = 'Ваше замовлення доставлено. Дякуємо за покупку!'; statusColor = '#28a745'; break;
      case 'CANCELLED':  statusMessage = 'Ваше замовлення було скасовано.'; statusColor = '#dc3545'; break;
      default:           statusMessage = `Статус вашого замовлення змінено на: ${statusName}`;
    }

    await this.createTransporter(cfg).sendMail({
      from: cfg.from,
      to: order.contactEmail,
      subject: `📦 Статус замовлення #${order.orderNumber} змінено`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${statusColor};">📦 Оновлення статусу замовлення</h2>
          <p>Привіт, ${order.contactFirstName}!</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor};">
            <h3 style="margin-top: 0; color: ${statusColor};">Замовлення #${order.orderNumber}</h3>
            <p style="font-size: 16px; margin: 10px 0;"><strong>Новий статус:</strong> ${statusName}</p>
            <p style="margin: 10px 0;">${statusMessage}</p>
            ${order.adminNote ? `<p style="margin: 10px 0;"><strong>Примітка:</strong> ${order.adminNote}</p>` : ''}
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${orderUrl}" style="background-color: #00B4D8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Переглянути замовлення
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">ФОП Валігура Б.В.</p>
        </div>
      `,
    });
  }

  /**
   * Надіслати тестовий email — для перевірки SMTP з адмінки
   */
  /**
   * Сповістити адміністратора про нове замовлення
   */
  async sendAdminOrderNotification(order: any): Promise<void> {
    const cfg = await this.getSmtpConfig();
    if (!this.isConfiguredCheck(cfg)) return;

    const adminEmailRow = await this.prisma.setting.findUnique({ where: { key: 'admin_email' } });
    const adminEmail = adminEmailRow?.value || this.configService.get<string>('ADMIN_EMAIL') || '';
    if (!adminEmail) return;

    const adminUrl = `${this.configService.get<string>('FRONTEND_URL')}/admin/orders/${order.id}`;

    // Адреса доставки для адміна
    let deliveryAddressText = '';
    if (order.deliveryMethod === 'NOVA_POSHTA_BRANCH') {
      const parts = [order.npCityName, order.npBranchName].filter(Boolean);
      deliveryAddressText = parts.join(', ') || '—';
    } else if (order.deliveryMethod === 'NOVA_POSHTA_COURIER') {
      deliveryAddressText = order.deliveryAddress || '—';
    } else if (order.deliveryMethod === 'PICKUP') {
      deliveryAddressText = 'Самовивіз';
    }

    const deliveryMethodName = this.getDeliveryMethodName(order.deliveryMethod);
    const paymentMethodName = this.getPaymentMethodName(order.paymentMethod);
    const adminDeliveryCostText = await this.getDeliveryCostText(order);

    const itemsHtml = order.items.map((item: any) => `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid #eee;">${item.productName}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right;">${Number(item.price).toFixed(2)} ₴</td>
        <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right;font-weight:bold;">${Number(item.total).toFixed(2)} ₴</td>
      </tr>`).join('');

    await this.createTransporter(cfg).sendMail({
      from: cfg.from,
      to: adminEmail,
      subject: `Нове замовлення #${order.orderNumber} — ${Number(order.total).toFixed(2)} ₴`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#1a1a1a;">
          <div style="background:#16181C;padding:20px 28px;border-radius:8px 8px 0 0;">
            <p style="margin:0;color:#fff;font-size:18px;font-weight:bold;">Нове замовлення #${order.orderNumber}</p>
            <p style="margin:4px 0 0;color:#aaa;font-size:13px;">${new Date().toLocaleString('uk-UA')}</p>
          </div>
          <div style="padding:28px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 8px 8px;">

            <!-- Клієнт -->
            <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:#888;">Клієнт</h3>
            <p style="margin:3px 0;"><strong>${order.contactFirstName} ${order.contactLastName}</strong></p>
            <p style="margin:3px 0;">📞 ${order.contactPhone}</p>
            <p style="margin:3px 0;">✉️ ${order.contactEmail}</p>

            <!-- Доставка -->
            <h3 style="margin:20px 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:#888;">Доставка та оплата</h3>
            <p style="margin:3px 0;"><strong>Спосіб доставки:</strong> ${deliveryMethodName}</p>
            <p style="margin:3px 0;"><strong>Адреса:</strong> ${deliveryAddressText}</p>
            <p style="margin:3px 0;"><strong>Вартість доставки:</strong> ${adminDeliveryCostText}</p>
            <p style="margin:3px 0;"><strong>Спосіб оплати:</strong> ${paymentMethodName}</p>
            <p style="margin:3px 0;"><strong>Статус оплати:</strong> ${this.getPaymentStatusName(order.paymentStatus)}</p>

            <!-- Товари -->
            <h3 style="margin:20px 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:#888;">Склад замовлення</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
              <thead><tr style="background:#f5f5f5;">
                <th style="padding:8px 10px;text-align:left;font-size:13px;border-bottom:2px solid #ddd;">Товар</th>
                <th style="padding:8px 10px;text-align:center;font-size:13px;border-bottom:2px solid #ddd;">К-сть</th>
                <th style="padding:8px 10px;text-align:right;font-size:13px;border-bottom:2px solid #ddd;">Ціна</th>
                <th style="padding:8px 10px;text-align:right;font-size:13px;border-bottom:2px solid #ddd;">Сума</th>
              </tr></thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <!-- Фінансова розбивка -->
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              <tr>
                <td style="padding:5px 0;color:#555;">Підсумок за товари:</td>
                <td style="padding:5px 0;text-align:right;">${Number(order.subtotal).toFixed(2)} ₴</td>
              </tr>
              ${Number(order.discountAmount) > 0 ? `
              <tr>
                <td style="padding:5px 0;color:#555;">Знижка${order.discountCode ? ` (${order.discountCode})` : ''}:</td>
                <td style="padding:5px 0;text-align:right;color:#2d7a4f;">−${Number(order.discountAmount).toFixed(2)} ₴</td>
              </tr>` : ''}
              ${order.loyaltyPointsUsed > 0 ? `
              <tr>
                <td style="padding:5px 0;color:#555;">Бонусні бали (${order.loyaltyPointsUsed}):</td>
                <td style="padding:5px 0;text-align:right;color:#2d7a4f;">−${order.loyaltyPointsUsed} ₴</td>
              </tr>` : ''}
              <tr>
                <td style="padding:5px 0;color:#555;">Доставка:</td>
                <td style="padding:5px 0;text-align:right;">${adminDeliveryCostText}</td>
              </tr>
              <tr style="border-top:2px solid #1a1a1a;">
                <td style="padding:10px 0 4px;font-weight:bold;font-size:16px;">ЗАГАЛОМ:</td>
                <td style="padding:10px 0 4px;text-align:right;font-weight:bold;font-size:16px;">${Number(order.total).toFixed(2)} ₴</td>
              </tr>
            </table>

            ${order.comment ? `<p style="font-size:13px;color:#555;background:#fffbeb;border-left:3px solid #f59e0b;padding:8px 12px;border-radius:0 4px 4px 0;"><strong>Коментар клієнта:</strong> ${order.comment}</p>` : ''}

            <div style="text-align:center;margin:24px 0;">
              <a href="${adminUrl}" style="background:#16181C;color:white;padding:13px 32px;text-decoration:none;border-radius:6px;display:inline-block;font-size:14px;font-weight:600;">
                Відкрити в адмінці →
              </a>
            </div>
            <hr style="border:none;border-top:1px solid #eee;">
            <p style="color:#999;font-size:12px;margin:12px 0 0;">ФОП Валігура Б.В.</p>
          </div>
        </div>`,
    });
  }

  /**
   * Надіслати повідомлення з контактної форми адміністратору
   */
  async sendContactMessage(data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): Promise<void> {
    const cfg = await this.getSmtpConfig();
    if (!this.isConfiguredCheck(cfg)) {
      console.warn('[Email] SMTP не налаштований, пропускаємо sendContactMessage');
      return;
    }

    const adminEmailRow = await this.prisma.setting.findUnique({ where: { key: 'admin_email' } });
    const adminEmail = adminEmailRow?.value || this.configService.get<string>('ADMIN_EMAIL') || '';
    if (!adminEmail) return;

    const subjectLabels: Record<string, string> = {
      order: 'Замовлення товару',
      wholesale: 'Оптові поставки',
      delivery: 'Доставка',
      quality: 'Якість продукції',
      other: 'Інше',
    };
    const subjectLabel = subjectLabels[data.subject] ?? data.subject;

    await this.createTransporter(cfg).sendMail({
      from: cfg.from,
      to: adminEmail,
      replyTo: data.email,
      subject: `Контактна форма: ${subjectLabel} — від ${data.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
          <div style="background:#16181C;padding:20px 28px;border-radius:8px 8px 0 0;">
            <p style="margin:0;color:#fff;font-size:17px;font-weight:bold;">Нове повідомлення з сайту</p>
            <p style="margin:4px 0 0;color:#aaa;font-size:12px;">${new Date().toLocaleString('uk-UA')}</p>
          </div>
          <div style="padding:24px 28px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 8px 8px;">
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              <tr>
                <td style="padding:8px 0;color:#666;width:120px;vertical-align:top;">Ім'я:</td>
                <td style="padding:8px 0;font-weight:bold;">${data.name}</td>
              </tr>
              <tr style="border-top:1px solid #f0f0f0;">
                <td style="padding:8px 0;color:#666;vertical-align:top;">Email:</td>
                <td style="padding:8px 0;"><a href="mailto:${data.email}" style="color:#1a1a1a;">${data.email}</a></td>
              </tr>
              ${data.phone ? `
              <tr style="border-top:1px solid #f0f0f0;">
                <td style="padding:8px 0;color:#666;vertical-align:top;">Телефон:</td>
                <td style="padding:8px 0;">${data.phone}</td>
              </tr>` : ''}
              <tr style="border-top:1px solid #f0f0f0;">
                <td style="padding:8px 0;color:#666;vertical-align:top;">Тема:</td>
                <td style="padding:8px 0;">${subjectLabel}</td>
              </tr>
            </table>
            <div style="background:#f8f8f8;border-radius:6px;padding:16px 20px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:.05em;color:#888;">Повідомлення</p>
              <p style="margin:0;white-space:pre-wrap;line-height:1.6;">${data.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            </div>
            <p style="margin:20px 0 0;font-size:12px;color:#999;">
              Щоб відповісти — просто натисніть «Відповісти» у вашому поштовому клієнті.
            </p>
          </div>
        </div>`,
    });
  }

  async sendTestEmail(toEmail: string): Promise<{ success: boolean; message: string }> {
    const cfg = await this.getSmtpConfig();
    if (!this.isConfiguredCheck(cfg)) {
      return { success: false, message: 'SMTP не налаштований. Заповніть smtp_user та smtp_pass.' };
    }
    try {
      await this.createTransporter(cfg).sendMail({
        from: cfg.from,
        to: toEmail,
        subject: '✅ Тестовий лист від ФОП Валігура',
        html: '<p>Якщо ви бачите цей лист — SMTP налаштований правильно! 🎉</p>',
      });
      return { success: true, message: `Тестовий лист надіслано на ${toEmail}` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Помилка відправки' };
    }
  }

  private getOrderStatusName(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Очікує підтвердження', CONFIRMED: 'Підтверджено',
      PROCESSING: 'Обробляється', SHIPPED: 'Відправлено',
      DELIVERED: 'Доставлено', CANCELLED: 'Скасовано', REFUNDED: 'Повернено',
    };
    return map[status] ?? status;
  }

  private getDeliveryMethodName(method: string): string {
    const map: Record<string, string> = {
      NOVA_POSHTA_BRANCH: 'Нова Пошта (відділення)',
      NOVA_POSHTA_COURIER: 'Нова Пошта (кур\'єр)',
      PICKUP: 'Самовивіз',
    };
    return map[method] ?? method;
  }

  private getPaymentMethodName(method: string): string {
    const map: Record<string, string> = {
      CARD_ONLINE: 'Оплата карткою онлайн',
      CASH_ON_DELIVERY: 'Накладний платіж (при отриманні)',
      LIQPAY: 'Оплата через LiqPay',
      FONDY: 'Оплата через Fondy',
    };
    return map[method] ?? method;
  }

  private getPaymentStatusName(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Очікує оплати',
      PAID: 'Оплачено',
      FAILED: 'Помилка оплати',
      REFUNDED: 'Повернено',
    };
    return map[status] ?? status;
  }

  /** Повертає текст вартості доставки для email */
  private async getDeliveryCostText(order: any): Promise<string> {
    if (order.deliveryMethod === 'PICKUP') {
      return 'Безкоштовно';
    }
    if (order.deliveryMethod === 'NOVA_POSHTA_BRANCH') {
      // Покупець оплачує тариф НП при отриманні посилки
      return 'За тарифами Нової Пошти (при отриманні)';
    }
    // NOVA_POSHTA_COURIER
    if (Number(order.deliveryCost) === 0) {
      const row = await this.prisma.setting.findUnique({ where: { key: 'free_shipping_threshold' } });
      const threshold = Number(row?.value) || 1000;
      return `Безкоштовно (при замовленні від ${threshold.toLocaleString('uk-UA')} грн)`;
    }
    return `${Number(order.deliveryCost).toFixed(2)} ₴`;
  }
}
