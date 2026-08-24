import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminEmail = 'admin@fish-shop.ua';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'SUPER_ADMIN',
        isEmailVerified: true,
      },
    });
    console.log('✅ Admin user created:', adminEmail);
  } else {
    console.log('⚠️  Admin user already exists:', adminEmail);
  }

  // Create default categories
  const categories = [
    { name: 'Свіжа риба', slug: 'fresh-fish', icon: '🐟' },
    { name: 'Заморожена риба', slug: 'frozen-fish', icon: '❄️' },
    { name: 'Консерви', slug: 'canned', icon: '🥫' },
    { name: 'Морепродукти', slug: 'seafood', icon: '🦐' },
    { name: 'Делікатеси', slug: 'delicacies', icon: '✨' },
    { name: 'Ікра', slug: 'caviar', icon: '🥿', },
  ];

  for (const cat of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: cat.slug },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          description: `Категорія: ${cat.name}`,
          isActive: true,
        },
      });
      console.log(`✅ Category created: ${cat.name}`);
    }
  }

  // Create default settings
  const defaultSettings: Record<string, { value: string; label: string; group: string }> = {
    'site_name':               { value: 'Fish Shop - ФОП Валігура', label: 'Назва сайту', group: 'general' },
    'site_description':        { value: 'E-commerce для рибної продукції та морепродуктів', label: 'Опис сайту', group: 'general' },
    'site_url':                { value: 'http://localhost:3000', label: 'URL сайту', group: 'general' },
    'phone':                   { value: '+38 (095) XXX-XX-XX', label: 'Телефон', group: 'general' },
    'address':                 { value: 'м. Хмільник, Вінницька область', label: 'Адреса', group: 'general' },
    'free_shipping_threshold': { value: '1500', label: 'Поріг безкоштовної доставки (грн)', group: 'delivery' },
    'nova_poshta_api_key':     { value: '', label: 'Нова Пошта API ключ', group: 'delivery' },
    'fb_pixel_id':             { value: '', label: 'Facebook Pixel ID', group: 'pixels' },
    'ga4_measurement_id':      { value: '', label: 'Google Analytics 4 ID', group: 'pixels' },
    'gtm_id':                  { value: '', label: 'Google Tag Manager ID', group: 'pixels' },
    'payment_provider':            { value: 'wayforpay', label: 'Активний платіжний провайдер (wayforpay/liqpay)', group: 'payments' },
    'wayforpay_merchant_account':   { value: '', label: 'WayForPay Merchant Account', group: 'payments' },
    'wayforpay_merchant_secret_key': { value: '', label: 'WayForPay Merchant Secret Key', group: 'payments' },
    'wayforpay_merchant_domain':    { value: '', label: 'WayForPay Merchant Domain Name', group: 'payments' },
    'liqpay_public_key':       { value: '', label: 'LiqPay Public Key', group: 'payments' },
    'liqpay_private_key':      { value: '', label: 'LiqPay Private Key', group: 'payments' },
    // SMTP — читаються EmailService з цієї таблиці
    'smtp_host':               { value: 'smtp.gmail.com', label: 'SMTP Хост', group: 'notifications' },
    'smtp_port':               { value: '587', label: 'SMTP Порт', group: 'notifications' },
    'smtp_user':               { value: '', label: 'SMTP Логін (email)', group: 'notifications' },
    'smtp_pass':               { value: '', label: 'SMTP Пароль (App Password)', group: 'notifications' },
    'smtp_from':               { value: '', label: 'Відправник (From)', group: 'notifications' },
    'admin_email':             { value: 'admin@fish-shop.ua', label: 'Email адміністратора (для нотифікацій)', group: 'notifications' },
    // Loyalty / бонусна програма
    'loyalty_points_rate':          { value: '10', label: 'Скільки грн за 1 бал (наприклад: 10 = 1 бал з кожних 10 грн)', group: 'loyalty' },
    'loyalty_welcome_bonus':        { value: '50', label: 'Вітальний бонус при реєстрації (балів)', group: 'loyalty' },
    'loyalty_review_bonus':         { value: '25', label: 'Бонус за відгук (балів)', group: 'loyalty' },
    'loyalty_tier_silver_min':      { value: '500', label: 'Рівень Срібний — мінімум балів', group: 'loyalty' },
    'loyalty_tier_gold_min':        { value: '1500', label: 'Рівень Золотий — мінімум балів', group: 'loyalty' },
    'loyalty_tier_platinum_min':    { value: '3000', label: 'Рівень Платиновий — мінімум балів', group: 'loyalty' },
    'loyalty_tier_silver_discount': { value: '5', label: 'Знижка рівня Срібний (%)', group: 'loyalty' },
    'loyalty_tier_gold_discount':   { value: '10', label: 'Знижка рівня Золотий (%)', group: 'loyalty' },
    'loyalty_tier_platinum_discount': { value: '15', label: 'Знижка рівня Платиновий (%)', group: 'loyalty' },
  };

  for (const [key, config] of Object.entries(defaultSettings)) {
    const existing = await prisma.setting.findUnique({ where: { key } });
    if (!existing) {
      await prisma.setting.create({
        data: { key, value: config.value, label: config.label, group: config.group },
      });
      console.log(`✅ Setting created: ${key}`);
    }
  }

  console.log('✅ Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
