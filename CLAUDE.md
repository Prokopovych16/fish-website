# 🐟 CLAUDE.md — Fish E-Commerce Platform (ФОП Валігура Б.В.)

Цей файл є головним джерелом правди для Claude Code. Читай його ПОВНІСТЮ перед будь-якою роботою над проєктом.

---

## 📋 Загальний опис проєкту

Повноцінний e-commerce сайт для продажу рибної продукції та морепродуктів.
Компанія: **ФОП Валігура Б.В.**, Хмільник, Вінницька область, Україна.
HACCP-сертифіковане виробництво. Міжрегіональні клієнти по всій Україні.

**Мета сайту:** онлайн-продаж продукції кінцевим споживачам (B2C) та оптовим клієнтам (B2B).
Сайт заточений під таргетовану рекламу (Facebook Ads, Google Ads) та SEO.

---

## 🏗️ Технічний стек

### Frontend
- **Next.js 14** (App Router, SSR/SSG для SEO)
- **TypeScript** — строга типізація скрізь
- **Tailwind CSS** — стилізація
- **shadcn/ui** — UI-компоненти
- **Framer Motion** — анімації
- **React Hook Form + Zod** — форми та валідація
- **Zustand** — глобальний стан (кошик, юзер)
- **TanStack Query** — серверний стан, кешування
- **next-intl** — інтернаціоналізація (UA основна мова)

---

## 🎨 ДИЗАЙН — ГОЛОВНИЙ ПРІОРИТЕТ

> ⚠️ **На дизайн витрачати максимум часу та уваги. Це комерційний сайт заточений під таргетовану рекламу — перше враження вирішує все. Кожен компонент має виглядати як з Awwwards або Dribbble.**

### Палітра кольорів
```css
/* Основна палітра — морська, преміальна */
--color-primary:       #0A3D62   /* глибокий океанський синій */
--color-primary-light: #1A6FA8
--color-accent:        #00B4D8   /* яскравий блакитний акцент */
--color-accent-warm:   #F4A261   /* тепло-помаранчевий для CTA кнопок */
--color-dark:          #0D1B2A   /* майже чорний фон */
--color-surface:       #F8FAFC   /* світлий фон секцій */
--color-text:          #1E293B
--color-text-muted:    #64748B
--color-success:       #10B981
--color-white:         #FFFFFF
```

### Типографіка
- **Заголовки:** `Playfair Display` (Google Fonts) — елегантний serif для преміальності
- **Основний текст:** `Inter` — чистий, читабельний sans-serif
- **Акценти/ціни:** `Space Grotesk` — сучасний, технічний

### Загальні принципи дизайну
- **Glassmorphism** — картки з `backdrop-blur`, напівпрозорі панелі
- **Gradient overlays** — плавні градієнти на банерах та hero-секціях
- **Мікроанімації** — кожна кнопка, картка, іконка реагує на hover/focus
- **Тіні** — багаторівневі box-shadow для глибини
- **Rounded corners** — `rounded-2xl` / `rounded-3xl` скрізь, ніяких гострих кутів
- **Spacing** — щедрі відступи, "повітря" між елементами
- **Ефект паралаксу** — на hero-секції головної
- **Плавний scroll** — анімація появи секцій через Intersection Observer

### Компоненти — як мають виглядати

**Картка товару:**
- Фото займає 70% картки, з легким zoom при hover
- Бейдж "Новинка" / "Хіт" — яскравий, з тінню
- Ціна — велика, акцентна; стара ціна перекреслена
- Кнопка "В кошик" — з'являється знизу при hover з анімацією slide-up
- При hover — картка піднімається (`translateY(-8px)`) з тінню
- HACCP бейдж — маленький, в кутку, із зеленою іконкою

**Hero банер:**
- Повна висота екрану (`min-h-screen`)
- Якісне фото з темним overlay або відеофон
- Заголовок — великий, білий, з анімацією появи (fade + slide)
- Підзаголовок та CTA кнопка — з затримкою анімації
- Скролл-індикатор внизу (bounce анімація)
- Хвилястий SVG-роздільник знизу

**Кнопки:**
- Primary: градієнт помаранчевий (`--color-accent-warm`), shine-ефект при hover
- Secondary: outlined з `--color-primary`, заповнюється при hover
- Усі кнопки — `transition-all duration-300`, легкий scale при натисканні

**Навігація (Header):**
- Прозора на hero, білий `backdrop-blur` при скролі
- Логотип з іконкою риби або хвилі
- Плавна поява тіні при скролі
- Мобільне меню — slide-in анімація, повноекранне

**Footer:**
- Темний фон (`--color-dark`)
- Хвиляста SVG-лінія вгорі (роздільник)
- Іконки соцмереж з hover-анімацією

**Адмінка:**
- Темна sidebar (`--color-dark`) з кольоровими акцентами
- Дашборд — glassmorphism картки зі статистикою
- Графіки — кастомні кольори під палітру проєкту
- Таблиці — зебра-рядки, hover підсвічування
- Статус-бейджі — кольорові pill badges

### Мобільний дизайн (КРИТИЧНО)
- **Mobile-first** — спочатку мобільна версія, потім десктоп
- Bottom navigation bar — Home / Каталог / Кошик / Кабінет
- Картки товарів — 2 колонки на мобільному
- Великі touch-targets — мінімум 44×44px для всіх кнопок
- Swipe-галерея на картці товару (Embla Carousel)
- Full-screen фільтри — bottom sheet з анімацією
- Sticky кнопка "В кошик" при скролі вниз на сторінці товару
- Floating кнопка Telegram/WhatsApp

### Анімації (Framer Motion)
```javascript
// Стандартні варіанти — виносити в /lib/animations.ts
fadeInUp:   { hidden: { opacity: 0, y: 30 },      visible: { opacity: 1, y: 0 } }
fadeIn:     { hidden: { opacity: 0 },              visible: { opacity: 1 } }
scaleIn:    { hidden: { scale: 0.9, opacity: 0 },  visible: { scale: 1, opacity: 1 } }
stagger:    { visible: { transition: { staggerChildren: 0.1 } } }
```
- Секції з'являються при скролі (Intersection Observer + Framer Motion)
- Page transitions між сторінками
- Skeleton loading замість спінерів
- Toast нотифікації (додано в кошик, замовлення оформлено)

### Іконки та графіка
- **Lucide React** — основні іконки (чисті, лінійні)
- **Кастомні SVG** — риба, хвиля, краплі — для брендингу
- Хвиляста SVG-лінія як роздільник між секціями (не пряма лінія!)
- Фонові декоративні SVG — напівпрозорі кола, хвилі

### Заборонено (антипатерни)
- ❌ Білі прямокутники без тіні/градієнту
- ❌ Bootstrap-вигляд, стандартні кнопки без стилю
- ❌ Дрібний текст на мобільному
- ❌ Відсутність hover-станів на інтерактивних елементах
- ❌ Стандартний синій колір для посилань
- ❌ Таблиці без стилізації в адмінці
- ❌ Однакові прямі роздільники між секціями

### Backend
- **NestJS** (модульна архітектура)
- **TypeScript** — строга типізація скрізь
- **Prisma ORM** + **PostgreSQL**
- **JWT** (access token 15хв + refresh token 30 днів)
- **Passport.js** — стратегії авторизації
- **Multer + Sharp** — завантаження та оптимізація зображень
- **Nodemailer / Resend** — email-розсилки та нотифікації
- **class-validator + class-transformer** — DTO валідація
- **Swagger** — документація API
- **Bull + Redis** — черги завдань (email, нотифікації)

### Infrastructure
- **Локальне зберігання файлів** — папка `/uploads` на сервері, роздається через NestJS static assets. Зображення оптимізуються через Sharp (WebP + resize) перед збереженням.
- **Redis** — кешування, черги, сесії refresh-токенів
- **npm workspaces** — monorepo, запуск через npm
- **GitHub Actions** — CI/CD
- **PM2** — production process manager на VPS

---

## 📁 Структура проєкту (Monorepo)

```
/
├── apps/
│   ├── frontend/          # Next.js 14 App Router
│   │   ├── app/
│   │   │   ├── (shop)/           # Публічна частина магазину
│   │   │   │   ├── page.tsx      # Головна сторінка
│   │   │   │   ├── catalog/      # Каталог товарів
│   │   │   │   ├── product/[slug]/ # Сторінка товару
│   │   │   │   ├── cart/         # Кошик
│   │   │   │   ├── checkout/     # Оформлення замовлення
│   │   │   │   ├── blog/         # Блог / рецепти
│   │   │   │   └── about/        # Про компанію
│   │   │   ├── (auth)/           # Авторизація
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── forgot-password/
│   │   │   │   └── reset-password/
│   │   │   ├── (account)/        # Особистий кабінет
│   │   │   │   ├── profile/
│   │   │   │   ├── orders/
│   │   │   │   ├── wishlist/
│   │   │   │   └── loyalty/      # Бонусна програма
│   │   │   ├── admin/            # Адмінка (захищена роллю ADMIN)
│   │   │   │   ├── dashboard/
│   │   │   │   ├── products/
│   │   │   │   ├── categories/
│   │   │   │   ├── orders/
│   │   │   │   ├── customers/
│   │   │   │   ├── reviews/      # Управління відгуками
│   │   │   │   ├── discounts/
│   │   │   │   ├── blog/
│   │   │   │   ├── banners/
│   │   │   │   ├── faq/
│   │   │   │   ├── analytics/
│   │   │   │   ├── notifications/ # Налаштування email/SMS
│   │   │   │   └── settings/     # Глобальні налаштування сайту
│   │   │   └── api/              # Next.js API Routes (мінімально)
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui компоненти
│   │   │   ├── shop/             # Компоненти магазину
│   │   │   ├── admin/            # Компоненти адмінки
│   │   │   └── shared/           # Спільні компоненти
│   │   └── lib/
│   │       ├── api.ts            # API клієнт (axios instance)
│   │       ├── hooks/            # Custom hooks
│   │       └── utils/
│   │
│   └── backend/           # NestJS
│       └── src/
│           ├── auth/             # JWT авторизація
│           ├── users/            # Управління юзерами
│           ├── products/         # Товари
│           ├── categories/       # Категорії
│           ├── orders/           # Замовлення
│           ├── cart/             # Кошик
│           ├── reviews/          # Відгуки
│           ├── discounts/        # Знижки та промокоди
│           ├── blog/             # Блог / статті
│           ├── banners/          # Банери головної
│           ├── faq/              # FAQ
│           ├── wishlist/         # Список бажань
│           ├── loyalty/          # Бонусна програма
│           ├── analytics/        # Статистика
│           ├── notifications/    # Email нотифікації
│           ├── settings/         # Налаштування сайту (пікселі, ключі тощо)
│           ├── upload/           # Завантаження файлів → локальна папка /uploads
│           ├── nova-poshta/      # Інтеграція Нова Пошта
│           └── prisma/           # Prisma service + schema
│
└── packages/
    └── types/             # Спільні TypeScript типи
```

---

## 🗄️ Prisma Schema (повна)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ───────────────────────────────────────────────

enum Role {
  USER
  MANAGER
  ADMIN
  SUPER_ADMIN
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum PaymentMethod {
  CARD_ONLINE
  CASH_ON_DELIVERY
  LIQPAY
  FONDY
}

enum DeliveryMethod {
  NOVA_POSHTA_BRANCH
  NOVA_POSHTA_COURIER
  PICKUP
}

enum DiscountType {
  PERCENTAGE
  FIXED_AMOUNT
  FREE_SHIPPING
  GIFT_PRODUCT
}

enum ReviewStatus {
  PENDING
  PUBLISHED
  HIDDEN
}

enum BlogStatus {
  DRAFT
  PUBLISHED
}

// ─── USERS ───────────────────────────────────────────────

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  phone             String?
  passwordHash      String?
  firstName         String?
  lastName          String?
  avatar            String?
  role              Role      @default(USER)
  isEmailVerified   Boolean   @default(false)
  isBlocked         Boolean   @default(false)
  blockReason       String?
  loyaltyPoints     Int       @default(0)
  totalSpent        Decimal   @default(0) @db.Decimal(10, 2)

  // OAuth
  googleId          String?   @unique
  facebookId        String?   @unique

  // Tokens
  refreshTokens     RefreshToken[]
  passwordResetToken String?
  passwordResetExpires DateTime?
  emailVerifyToken  String?

  // Relations
  orders            Order[]
  reviews           Review[]
  wishlist          WishlistItem[]
  cart              CartItem[]
  addresses         Address[]
  loyaltyHistory    LoyaltyHistory[]
  adminLogs         AdminLog[]

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model Address {
  id           String  @id @default(cuid())
  userId       String
  user         User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  label        String? // "Дім", "Робота"
  city         String
  npCityRef    String? // Нова Пошта city ref
  npBranchRef  String? // Нова Пошта branch ref
  npBranchName String?
  street       String?
  isDefault    Boolean @default(false)
  createdAt    DateTime @default(now())
}

// ─── CATEGORIES ──────────────────────────────────────────

model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  image       String?
  icon        String?
  parentId    String?
  parent      Category? @relation("CategoryChildren", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryChildren")
  sortOrder   Int       @default(0)
  isActive    Boolean   @default(true)

  // SEO
  seoTitle    String?
  seoDescription String?
  seoKeywords String?

  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// ─── PRODUCTS ────────────────────────────────────────────

model Product {
  id              String    @id @default(cuid())
  name            String
  slug            String    @unique
  description     String?   @db.Text
  shortDescription String?
  categoryId      String
  category        Category  @relation(fields: [categoryId], references: [id])

  // Pricing
  price           Decimal   @db.Decimal(10, 2)
  oldPrice        Decimal?  @db.Decimal(10, 2)
  discountPercent Int?

  // Stock
  stock           Int       @default(0)
  sku             String?   @unique
  unit            String    @default("кг") // кг, шт, л, уп

  // Images
  images          ProductImage[]

  // Attributes
  weight          Decimal?  @db.Decimal(8, 3)    // вага нетто
  origin          String?                          // країна вилову
  catchMethod     String?                          // метод вилову
  storageConditions String?                        // умови зберігання
  expiryDays      Int?                             // термін зберігання (діб)
  composition     String?   @db.Text              // склад
  calories        Decimal?  @db.Decimal(6, 2)     // ккал/100г
  proteins        Decimal?  @db.Decimal(6, 2)
  fats            Decimal?  @db.Decimal(6, 2)
  carbs           Decimal?  @db.Decimal(6, 2)
  isHaccp         Boolean   @default(true)        // HACCP маркування

  // Tags & Badges
  tags            ProductTag[]
  badges          String[]  @default([])           // ["Новинка", "Хіт", "Акція", "Пісний"]

  // Visibility
  isActive        Boolean   @default(true)
  isFeatured      Boolean   @default(false)
  sortOrder       Int       @default(0)

  // SEO
  seoTitle        String?
  seoDescription  String?
  seoKeywords     String?

  // Relations
  reviews         Review[]
  orderItems      OrderItem[]
  cartItems       CartItem[]
  wishlistItems   WishlistItem[]
  bundleProducts  BundleProduct[] @relation("BundleMain")
  bundleItems     BundleProduct[] @relation("BundleItems")

  viewCount       Int       @default(0)
  soldCount       Int       @default(0)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  alt       String?
  sortOrder Int     @default(0)
  isMain    Boolean @default(false)
}

model Tag {
  id       String       @id @default(cuid())
  name     String       @unique
  slug     String       @unique
  products ProductTag[]
}

model ProductTag {
  productId String
  tagId     String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([productId, tagId])
}

// Набори / бандли
model Bundle {
  id          String          @id @default(cuid())
  name        String
  slug        String          @unique
  description String?
  image       String?
  price       Decimal         @db.Decimal(10, 2)
  oldPrice    Decimal?        @db.Decimal(10, 2)
  isActive    Boolean         @default(true)
  products    BundleProduct[]
  createdAt   DateTime        @default(now())
}

model BundleProduct {
  bundleId  String
  productId String
  quantity  Int     @default(1)
  bundle    Bundle  @relation(fields: [bundleId], references: [id])
  product   Product @relation("BundleItems", fields: [productId], references: [id])
  @@id([bundleId, productId])
}

// ─── REVIEWS ─────────────────────────────────────────────

model Review {
  id          String       @id @default(cuid())
  productId   String
  product     Product      @relation(fields: [productId], references: [id], onDelete: Cascade)
  userId      String?
  user        User?        @relation(fields: [userId], references: [id], onDelete: SetNull)

  // Може бути null якщо додано адміном вручну
  authorName  String       // ім'я (реальне або фіктивне)
  authorCity  String?      // місто (реальне або фіктивне)
  authorAvatar String?     // аватар
  rating      Int          // 1-5
  title       String?
  text        String       @db.Text
  images      String[]     @default([])
  isVerified  Boolean      @default(false)  // "Перевірена покупка"
  isFake      Boolean      @default(false)  // адмін додав вручну
  status      ReviewStatus @default(PENDING)
  adminNote   String?      // внутрішня нотатка адміна
  sortOrder   Int          @default(0)      // пріоритет показу
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

// ─── ORDERS ──────────────────────────────────────────────

model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique // #ВЛ-00001
  userId          String?
  user            User?         @relation(fields: [userId], references: [id], onDelete: SetNull)

  // Контакти (можуть відрізнятись від профілю)
  contactFirstName String
  contactLastName  String
  contactPhone    String
  contactEmail    String

  // Доставка
  deliveryMethod  DeliveryMethod
  npCityName      String?
  npBranchName    String?
  npBranchRef     String?
  npTrackingNumber String?
  deliveryAddress String?       // для кур'єра
  deliveryCost    Decimal       @default(0) @db.Decimal(10, 2)

  // Оплата
  paymentMethod   PaymentMethod
  paymentStatus   PaymentStatus @default(PENDING)
  paymentId       String?       // ID транзакції в LiqPay/Fondy

  // Знижки
  discountCode    String?
  discountAmount  Decimal       @default(0) @db.Decimal(10, 2)
  loyaltyPointsUsed Int         @default(0)

  // Суми
  subtotal        Decimal       @db.Decimal(10, 2)
  total           Decimal       @db.Decimal(10, 2)

  // Статус
  status          OrderStatus   @default(PENDING)
  adminNote       String?       // нотатка менеджера

  items           OrderItem[]
  statusHistory   OrderStatusHistory[]

  // Нотифікації
  emailSentAt     DateTime?
  smsSentAt       DateTime?

  comment         String?       // коментар покупця
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId   String?
  product     Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  productName String   // snapshot назви
  productImage String? // snapshot фото
  price       Decimal  @db.Decimal(10, 2) // snapshot ціни
  quantity    Int
  total       Decimal  @db.Decimal(10, 2)
}

model OrderStatusHistory {
  id        String      @id @default(cuid())
  orderId   String
  order     Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)
  status    OrderStatus
  comment   String?
  createdAt DateTime    @default(now())
}

// ─── CART ────────────────────────────────────────────────

model CartItem {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  @@unique([userId, productId])
}

// ─── WISHLIST ────────────────────────────────────────────

model WishlistItem {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  @@unique([userId, productId])
}

// ─── DISCOUNTS ───────────────────────────────────────────

model Discount {
  id              String       @id @default(cuid())
  code            String       @unique
  description     String?
  type            DiscountType
  value           Decimal      @db.Decimal(10, 2) // % або грн
  minOrderAmount  Decimal?     @db.Decimal(10, 2)
  maxUsageCount   Int?         // null = необмежено
  usageCount      Int          @default(0)
  maxUsagePerUser Int          @default(1)
  isActive        Boolean      @default(true)
  startsAt        DateTime?
  expiresAt       DateTime?
  productIds      String[]     @default([]) // якщо для конкретних товарів
  categoryIds     String[]     @default([]) // якщо для категорій
  createdAt       DateTime     @default(now())
}

// Флеш-розпродаж
model FlashSale {
  id          String    @id @default(cuid())
  name        String
  startsAt    DateTime
  endsAt      DateTime
  isActive    Boolean   @default(true)
  products    FlashSaleProduct[]
  createdAt   DateTime  @default(now())
}

model FlashSaleProduct {
  flashSaleId String
  productId   String
  salePrice   Decimal  @db.Decimal(10, 2)
  flashSale   FlashSale @relation(fields: [flashSaleId], references: [id], onDelete: Cascade)
  @@id([flashSaleId, productId])
}

// ─── LOYALTY ─────────────────────────────────────────────

model LoyaltyHistory {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  points      Int      // + нарахування, - списання
  description String
  orderId     String?
  createdAt   DateTime @default(now())
}

// ─── CONTENT ─────────────────────────────────────────────

model Banner {
  id          String   @id @default(cuid())
  title       String
  subtitle    String?
  buttonText  String?
  buttonLink  String?
  image       String
  imageMobile String?  // окреме фото для мобільних
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  startsAt    DateTime?
  endsAt      DateTime?
  createdAt   DateTime @default(now())
}

model BlogPost {
  id          String     @id @default(cuid())
  title       String
  slug        String     @unique
  excerpt     String?
  content     String     @db.Text // HTML або Markdown
  image       String?
  authorName  String     @default("Команда ФОП Валігура")
  status      BlogStatus @default(DRAFT)
  tags        String[]   @default([])
  seoTitle    String?
  seoDescription String?
  publishedAt DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Faq {
  id        String   @id @default(cuid())
  question  String
  answer    String   @db.Text
  category  String?  // "Доставка", "Оплата", "Товари"
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}

// ─── SETTINGS ────────────────────────────────────────────

// Одна таблиця для всіх налаштувань сайту — key/value
model Setting {
  key       String   @id
  value     String   @db.Text
  label     String?  // людський опис для адмінки
  group     String   @default("general") // general, seo, pixels, delivery, notifications, payments
  updatedAt DateTime @updatedAt
}

// Групи налаштувань (group):
// general     → назва сайту, опис, лого, favicon, телефон, email, адреса
// pixels      → fbPixelId, fbConversionToken, gtmId, ga4Id, googleAdsLabel
// delivery    → novaPoshtaApiKey, freeDeliveryThreshold, pickupAddress
// payments    → liqpayPublicKey, liqpayPrivateKey, fondyMerchantId
// notifications → adminEmail (для нотифікацій), smtpHost, smtpPort, smtpUser, smtpPass
// seo         → defaultSeoTitle, defaultSeoDescription, defaultOgImage

// ─── ADMIN ───────────────────────────────────────────────

model AdminLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String   // "product.create", "order.status.update", "review.publish" тощо
  entityId  String?
  before    Json?    // стан до зміни
  after     Json?    // стан після зміни
  ip        String?
  createdAt DateTime @default(now())
}

model Popup {
  id        String   @id @default(cuid())
  title     String
  content   String
  image     String?
  buttonText String?
  buttonLink String?
  delay     Int      @default(3)  // секунди до показу
  showAfterScroll Int @default(0) // % прокрутки
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}
```

---

## 🔐 Система авторизації

### Ролі
```
SUPER_ADMIN  → повний доступ включно з налаштуваннями та ролями
ADMIN        → товари, категорії, замовлення, контент, відгуки, статистика, знижки
MANAGER      → тільки замовлення та клієнти (без налаштувань)
USER         → особистий кабінет, замовлення, відгуки, wishlist
```

### JWT Flow
- **Access token** — 15 хвилин, у заголовку Authorization: Bearer
- **Refresh token** — 30 днів, зберігається в HttpOnly cookie + в БД (RefreshToken)
- При рефреші — старий токен видаляється, видається новий (rotation)
- При logout — refresh token видаляється з БД

### Endpoints Auth
```
POST /auth/register          → реєстрація
POST /auth/login             → логін
POST /auth/logout            → logout
POST /auth/refresh           → оновлення access token
POST /auth/forgot-password   → надіслати email з посиланням
POST /auth/reset-password    → скинути пароль за токеном
POST /auth/verify-email      → підтвердження email
GET  /auth/me                → поточний юзер
```

---

## 📧 Email Нотифікації

Використовуємо **Resend** або **Nodemailer** + **SMTP** (налаштовується через адмінку).

### Тригерні листи (автоматичні)
| Подія | Отримувач | Зміст |
|-------|-----------|-------|
| Нова реєстрація | Юзер | Вітання + підтвердження email |
| Нове замовлення | **Юзер** | Підтвердження з деталями замовлення |
| Нове замовлення | **Адмін** | Сповіщення з усіма деталями + посилання в адмінку |
| Зміна статусу | Юзер | "Ваше замовлення відправлено" + ТТН |
| Скидання пароля | Юзер | Посилання для скидання (дійсне 1 годину) |
| Забутий кошик | Юзер | Нагадування через 2 години (черга Bull) |
| Flash sale | Підписники | Анонс розпродажу |

### Адмінський email (ВАЖЛИВО)
У таблиці `Setting` зберігається ключ `adminEmail`. Це email адміністратора, на який приходять:
- Сповіщення про нові замовлення
- Нові відгуки (що потребують модерації)
- Нові реєстрації оптових клієнтів

Адмін може змінити цей email у розділі `Налаштування → Нотифікації` в адмінці.

---

## 🎯 Система відгуків

### Логіка
- Реальні відгуки від юзерів → статус PENDING → адмін публікує або ховає
- Адмін може **додати власний відгук вручну** (поле `isFake: true`) — вказати:
  - Ім'я (будь-яке)
  - Місто
  - Аватар (завантажити або з генератора)
  - Рейтинг (1-5 зірок)
  - Текст відгуку
  - Дата (будь-яка, навіть минула)
  - Прив'язка до товару або "загальний"
  - Статус: одразу PUBLISHED
- Адмін може керувати порядком відображення відгуків (sortOrder)
- Позначка "Перевірена покупка" (`isVerified`) — адмін ставить вручну

---

## 🔧 Адмінка — повний функціонал

### Dashboard
- Виручка сьогодні / тиждень / місяць / рік — лінійний графік (Recharts)
- Нові замовлення за останні 24 год
- Кількість нових реєстрацій
- Топ-10 товарів за продажами
- Географія покупців по областях (Recharts map або звичайна таблиця)
- Конверсійна воронка: Відвідувачі → Кошик → Замовлення → Оплата
- Замовлення, що очікують підтвердження (червоний лічильник)

### Товари
- CRUD товарів з drag & drop сортуванням
- Масове завантаження фото (до 10 фото на товар)
- Таблиця КБЖВ, склад, умови зберігання — всі поля
- Badges: "Новинка", "Хіт продажів", "Акція", "Пісний" — чекбокси
- Копіювати товар (дублювання)
- SEO-поля для кожного товару
- Попередній перегляд як буде виглядати на сайті

### Категорії
- Необмежена вкладеність (батько → дочірня)
- Drag & drop сортування
- Іконка + зображення категорії
- SEO-поля

### Замовлення
- Канбан-дошка: Новий → Підтверджений → В обробці → Відправлений → Доставлений
- Фільтри: за датою, статусом, містом, сумою, способом оплати
- Деталі замовлення + редагування статусу
- Поле для внутрішньої нотатки менеджера
- Введення ТТН Нової Пошти → автоматично відправляється юзеру email
- Масові дії: змінити статус, надіслати email
- Експорт в Excel (xlsx)
- Друк замовлення

### Відгуки
- Список всіх відгуків з фільтрами
- Кнопки: Опублікувати / Приховати / Видалити
- Форма для ручного додавання відгуку (всі поля як описано вище)
- Редагування будь-якого відгуку

### Знижки та промокоди
- CRUD промокодів
- Типи: % знижки, фіксована сума, безкоштовна доставка
- Умови: мінімальна сума, конкретні товари/категорії, ліміт використань, термін
- Флеш-розпродажі з таймером — старт, кінець, список товарів зі спец. цінами

### Контент (CMS)
- **Банери** — зображення, текст, кнопка, посилання, активність за датами, мобільна версія
- **Блог / Рецепти** — WYSIWYG редактор (TipTap або Quill), SEO-поля, теги
- **FAQ** — питання-відповіді, категорії, сортування
- **Pop-up** — текст, зображення, затримка показу, умови показу
- **"Про нас"** — редагування тексту сторінки

### Налаштування сайту (Settings)
Усі налаштування зберігаються в таблиці `Setting` (key-value). Адмін може змінити через UI:

**Загальні**
- Назва сайту, слоган
- Логотип, favicon
- Телефон, email, адреса (для футера та Schema.org)
- Посилання на соцмережі

**Пікселі та аналітика**
- Facebook Pixel ID
- Facebook Conversion API Token
- Google Tag Manager ID
- Google Analytics 4 Measurement ID
- Google Ads Conversion Label
- (кожне поле — просто input, зберігається в БД, підхоплюється на фронті)

**Доставка**
- API ключ Нової Пошти
- Поріг безкоштовної доставки (грн)
- Адреса самовивозу

**Оплата**
- LiqPay Public Key / Private Key
- Fondy Merchant ID / Secret Key

**Email нотифікації**
- Admin Email (на який приходять сповіщення про замовлення)
- SMTP Host, Port, User, Password (або Resend API Key)
- Увімкнути/вимкнути кожен тип нотифікацій

### Клієнти
- Список з LTV, кількістю замовлень, датою реєстрації
- Сегментація: нові / постійні / сплячі (не купували 60+ днів)
- Деталі клієнта + всі його замовлення
- Ручна знижка для клієнта
- Блокування (причина + підтвердження)
- Blacklist по email/телефону

### Статистика / Аналітика
- Звіт продажів за будь-який період
- Топ товарів за виручкою та кількістю
- Звіт по категоріях
- Середній чек у динаміці
- Звіт по промокодах (скільки разів використано, яка знижка)
- Географія по областях
- Нові vs повторні покупці
- Експорт будь-якого звіту в Excel

### Лог дій
- Всі дії адмінів записуються в `AdminLog`
- Хто, коли, що змінив
- Доступно SUPER_ADMIN

---

## 🛍️ Публічний сайт — функціонал

### Головна сторінка
- Hero банер (слайдер) з банерів з адмінки
- Категорії товарів
- Хіти продажів (isFeatured = true)
- Новинки
- Блок переваг компанії (HACCP, свіжість, доставка) — редагується з адмінки
- Відгуки покупців (каруселька)
- Флеш-розпродаж з таймером (якщо активний)
- FAQ секція
- Блок рецептів / блогу

### Каталог
- Фільтрація: за категорією, ціною, тегами, наявністю
- Сортування: за ціною, рейтингом, новизною, популярністю
- Карта товару: фото, назва, ціна, стара ціна, рейтинг, кнопка "В кошик"
- Мобільна фільтрація (bottom sheet)

### Картка товару
- Галерея фото (zoom при наведенні)
- Ціна, знижка, HACCP бейдж
- Кнопки: "В кошик", "В обране"
- Вкладки: Опис / Характеристики / Відгуки (з рейтингом)
- Схожі товари
- Schema.org Product розмітка

### Кошик
- Зберігається для авторизованих (CartItem в БД)
- Для гостей — localStorage, при авторизації — merge
- Підрахунок суми, можливість змінити кількість
- Поле промокоду
- Інформація про безкоштовну доставку (скільки лишилось до порогу)

### Оформлення замовлення
- Крок 1: Контактні дані
- Крок 2: Доставка (Нова Пошта — автодоповнення міста та відділення через API)
- Крок 3: Оплата (вибір методу)
- Крок 4: Підтвердження
- Після замовлення: email юзеру + email адміну (на `adminEmail` з Settings)

### Особистий кабінет
- Профіль (ім'я, фото, телефон, email)
- Зміна пароля
- Мої замовлення (статуси, деталі)
- Список бажань
- Адреси доставки
- Бонусні бали (лояльність)

---

## 📊 Facebook Pixel та трекінг

На фронті (Next.js) читаємо налаштування пікселя з API (з таблиці Setting).
Якщо `fbPixelId` заповнений — підключаємо піксель.

### Події для трекінгу
```javascript
// Перегляд товару
fbq('track', 'ViewContent', { content_name, content_ids, value, currency: 'UAH' })

// Додання в кошик
fbq('track', 'AddToCart', { content_name, content_ids, value, currency: 'UAH' })

// Початок оформлення
fbq('track', 'InitiateCheckout', { value, currency: 'UAH', num_items })

// Покупка
fbq('track', 'Purchase', { value, currency: 'UAH', content_ids })
```

Також реалізуємо серверні події через **Facebook Conversions API** (якщо вказано `fbConversionToken`) через NestJS endpoint для точнішої статистики.

---

## 🔍 SEO

### На рівні Next.js
- `generateMetadata()` для кожної сторінки (товар, категорія, блог)
- Open Graph теги
- Twitter Cards
- Canonical URLs
- `next/image` для оптимізації зображень (WebP, lazy load)

### Технічне SEO
- `sitemap.xml` — динамічний, генерується з БД (Next.js route)
- `robots.txt` — заборонено: /admin, /api, /cart, /account
- Schema.org розмітка:
  - `Organization` на головній
  - `Product` на картці товару (ціна, наявність, рейтинг)
  - `BreadcrumbList` скрізь
  - `FAQPage` на FAQ
  - `Article` на блозі

### Швидкість
- ISR (Incremental Static Regeneration) для каталогу та карток
- CDN для зображень (Cloudflare R2)
- Мінімум зовнішніх скриптів (пікселі — тільки якщо налаштовані)
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1

---

## 📱 Мобільна версія

- **Mobile-first підхід** у всіх компонентах
- Нижня навігаційна панель на мобільних (Home, Catalog, Cart, Account)
- Bottom sheet для фільтрів каталогу
- Свайп-галерея на картці товару
- PWA: `manifest.json`, service worker, іконки — "Встановити додаток"
- Кнопка WhatsApp/Telegram float button

---

## 🏭 Інтеграція Нова Пошта

```
GET /nova-poshta/cities?search=Вінниця    → список міст
GET /nova-poshta/branches?cityRef=xxx     → відділення в місті
```

Використовуємо офіційний API Нової Пошти (ключ в Settings).
На фронті — autocomplete поле з debounce (300ms).

---

## 🔑 Змінні середовища

```env
# apps/backend/.env

DATABASE_URL=postgresql://user:pass@localhost:5432/fish_shop
REDIS_URL=redis://localhost:6379

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
# АБО
RESEND_API_KEY=re_xxx

# File Storage (локально)
UPLOADS_DIR=./uploads                        # папка для файлів
UPLOADS_URL=http://localhost:4000/uploads    # публічний URL

# Payments
LIQPAY_PUBLIC_KEY=xxx
LIQPAY_PRIVATE_KEY=xxx

# Nova Poshta
NOVA_POSHTA_API_KEY=xxx

FRONTEND_URL=http://localhost:3000
PORT=4000
```

```env
# apps/frontend/.env.local

NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🚀 Команди для старту

```bash
# Клонувати та встановити залежності
git clone <repo>
cd fish-shop
npm install          # встановлює залежності для всього monorepo (npm workspaces)

# База даних (PostgreSQL має бути запущений локально)
cd apps/backend
npx prisma migrate dev --name init
npx prisma db seed   # початкові дані (категорії, адмін-юзер, налаштування)
cd ../..

# Запуск в режимі розробки (frontend + backend паралельно)
npm run dev
```

### package.json (корінь)
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "npm run dev --workspace=apps/backend",
    "dev:frontend": "npm run dev --workspace=apps/frontend",
    "build": "npm run build --workspaces",
    "start": "concurrently \"npm run start:backend\" \"npm run start:frontend\"",
    "start:backend": "npm run start:prod --workspace=apps/backend",
    "start:frontend": "npm run start --workspace=apps/frontend"
  },
  "workspaces": ["apps/*", "packages/*"]
}
```

### Що потрібно встановити локально (один раз)
- **Node.js** v20+
- **PostgreSQL** v15+ (встановити та запустити службу)
- **Redis** v7+ (встановити та запустити службу)

На Windows: PostgreSQL та Redis можна встановити через офіційні інсталятори, вони запускаються як Windows-служби автоматично.

### Seed дані (prisma/seed.ts)
При першому запуску seed автоматично створює:
- Адмін-акаунт: `admin@fish-shop.ua` / пароль `Admin123!`
- Базові категорії: Свіжа риба, Заморожена риба, Консерви, Морепродукти, Делікатеси, Ікра
- Базові налаштування (Setting) з порожніми значеннями для всіх ключів

---

## 📐 Принципи коду

- **Завжди TypeScript** — ніяких `any`
- **Ніяких magic strings** — enum скрізь де можливо
- **Repository pattern** у NestJS (через Prisma)
- **DTO validation** — `class-validator` на всі вхідні дані
- **Error handling** — кастомні NestJS exceptions
- **Guards** — `JwtAuthGuard`, `RolesGuard` на всі захищені маршрути
- **Логування** — Winston у production
- **Коментарі** — всі публічні методи прокоментовані українською
- **Компоненти React** — функціональні, з кастомними хуками
- **Назви** — файли kebab-case, компоненти PascalCase, хуки useXxx

---

## ✅ Порядок розробки (рекомендований)

1. **Інфраструктура** — docker-compose, Prisma schema, seed
2. **Auth модуль** — реєстрація, логін, JWT, forgot password, email verification
3. **Upload модуль** — Cloudflare R2
4. **Categories модуль** — CRUD з деревом
5. **Products модуль** — CRUD, зображення, SEO-поля
6. **Settings модуль** — key-value налаштування
7. **Адмінка (frontend)** — dashboard, товари, категорії, налаштування
8. **Каталог (frontend)** — список, фільтри, картка товару
9. **Cart + Wishlist**
10. **Orders** — оформлення, Нова Пошта API, email нотифікації
11. **Reviews** — публічні + ручне додавання в адмінці
12. **Discounts + Flash Sales**
13. **Blog/FAQ/Banners** — CMS частина
14. **Loyalty** — бонусна програма
15. **Analytics** — дашборд статистики
16. **Facebook Pixel + GTM** — через Settings
17. **SEO** — sitemap, schema.org, metadata
18. **PWA** — manifest, service worker
19. **Performance** — ISR, оптимізація зображень, аудит Lighthouse

---

*Цей файл — єдине джерело правди. Перед кожною новою фічею читай відповідний розділ.*