import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { CreateOrderDto, UpdateOrderStatusDto, FilterOrdersDto } from './dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private loyaltyService: LoyaltyService,
  ) {}

  /**
   * Генерувати номер замовлення
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ВЛ-${timestamp}-${random}`;
  }

  /**
   * Розрахувати вартість доставки
   */
  private async calculateDeliveryCost(deliveryMethod: string, subtotal: number, freeShipping = false): Promise<number> {
    if (freeShipping) return 0;
    switch (deliveryMethod) {
      case 'NOVA_POSHTA_BRANCH':
        return 0;
      case 'NOVA_POSHTA_COURIER': {
        const setting = await this.prisma.setting.findUnique({ where: { key: 'free_shipping_threshold' } });
        const threshold = Number(setting?.value) || 1000;
        return subtotal >= threshold ? 0 : 50;
      }
      case 'PICKUP':
        return 0;
      default:
        return 0;
    }
  }

  /**
   * Створити нове замовлення
   */
  async create(createOrderDto: CreateOrderDto, userId?: string) {
    const {
      items,
      discountCode,
      deliveryMethod,
      paymentMethod,
      contactFirstName,
      contactLastName,
      contactPhone,
      contactEmail,
      ...deliveryData
    } = createOrderDto;

    // Перевірити товари та розрахувати суму
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        include: { images: { orderBy: { sortOrder: 'asc' } } },
      });

      if (!product) {
        throw new BadRequestException(`Товар з ID ${item.productId} не знайдений`);
      }

      if (!product.isActive || product.stock < item.quantity) {
        throw new BadRequestException(`Товар "${product.name}" недоступний або недостатньо на складі`);
      }

      const price = product.oldPrice && product.discountPercent
        ? Number(product.oldPrice) * (1 - Number(product.discountPercent) / 100)
        : Number(product.price);

      const total = price * item.quantity;
      subtotal += total;

      const mainImage = product.images.find(img => img.isMain) ?? product.images[0];

      orderItems.push({
        productId: item.productId,
        productName: product.name,
        productImage: mainImage?.url ?? null,
        price,
        quantity: item.quantity,
        total,
      });
    }

    // Розрахувати знижку
    let discountAmount = 0;
    let freeShipping = false;
    if (discountCode) {
      const discount = await this.prisma.discount.findUnique({
        where: { code: discountCode },
      });

      if (!discount || !discount.isActive) {
        throw new BadRequestException('Невірний або неактивний промокод');
      }

      // Перевірити умови знижки
      if (discount.minOrderAmount && subtotal < Number(discount.minOrderAmount)) {
        throw new BadRequestException(`Мінімальна сума замовлення для цієї знижки: ${discount.minOrderAmount}грн`);
      }

      // Розрахувати знижку
      if (discount.type === 'PERCENTAGE') {
        discountAmount = subtotal * (Number(discount.value) / 100);
      } else if (discount.type === 'FIXED_AMOUNT') {
        discountAmount = Math.min(Number(discount.value), subtotal);
      } else if (discount.type === 'FREE_SHIPPING') {
        freeShipping = true;
      }

      // Перевірити ліміт використань
      if (discount.maxUsageCount && discount.usageCount >= discount.maxUsageCount) {
        throw new BadRequestException('Цей промокод більше не доступний');
      }

      // Перевірити використання користувачем
      if (userId && discount.maxUsagePerUser) {
        const userUsage = await this.prisma.order.count({
          where: {
            userId,
            discountCode,
            status: { not: 'CANCELLED' },
          },
        });

        if (userUsage >= discount.maxUsagePerUser) {
          throw new BadRequestException('Ви вже використовували цей промокод');
        }
      }
    }

    // Знижка рівня лояльності (застосовується на суму після промокоду)
    let tierDiscountAmount = 0;
    if (userId) {
      const tierDiscountPercent = await this.loyaltyService.getUserTierDiscount(userId);
      if (tierDiscountPercent > 0) {
        const base = subtotal - discountAmount;
        tierDiscountAmount = Math.max(0, base * (tierDiscountPercent / 100));
      }
    }
    discountAmount += tierDiscountAmount;

    // Розрахувати доставку
    const deliveryCost = await this.calculateDeliveryCost(deliveryMethod, subtotal - discountAmount, freeShipping);

    // Загальна сума
    const total = subtotal - discountAmount + deliveryCost;

    // Створити замовлення
    const order = await this.prisma.order.create({
      data: {
        orderNumber: this.generateOrderNumber(),
        userId,
        contactFirstName,
        contactLastName,
        contactPhone,
        contactEmail,
        deliveryMethod,
        paymentMethod,
        discountCode,
        discountAmount,
        subtotal,
        total,
        deliveryCost,
        paymentStatus: 'PENDING',
        status: 'PENDING',
        comment: createOrderDto.comment,
        ...deliveryData,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    // Зменшити кількість товарів на складі
    for (const item of orderItems) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          soldCount: { increment: item.quantity },
        },
      });
    }

    // Збільшити використання промокоду
    if (discountCode) {
      await this.prisma.discount.update({
        where: { code: discountCode },
        data: { usageCount: { increment: 1 } },
      });
    }

    // Надіслати email підтвердження клієнту та нотифікацію адміну
    this.emailService.sendOrderConfirmation(order).catch(err =>
      console.error('Помилка надсилання email підтвердження:', err),
    );
    this.emailService.sendAdminOrderNotification(order).catch(err =>
      console.error('Помилка надсилання нотифікації адміну:', err),
    );

    return order;
  }

  /**
   * Застосувати результат оплати від будь-якого платіжного провайдера.
   * Єдине місце бізнес-логіки (резерв складу, статус замовлення) — провайдери
   * лише перевіряють підпис і передають нормалізований результат сюди.
   */
  async applyPaymentResult(orderId: string, paymentStatus: PaymentStatus, providerPaymentId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return;

    // Провайдер може надіслати той самий callback кілька разів — не обробляємо повторно
    if (order.paymentStatus === paymentStatus) return;

    // Товар резервується (списується зі складу) одразу при створенні замовлення.
    // Якщо оплата провалилась/повернена — звільняємо склад; якщо після цього
    // оплата все ж пройшла (повторна спроба) — резервуємо знову.
    const wasReserved = !['FAILED', 'REFUNDED'].includes(order.paymentStatus);
    const willBeReserved = !['FAILED', 'REFUNDED'].includes(paymentStatus);

    if (wasReserved && !willBeReserved) {
      for (const item of order.items) {
        if (item.productId) {
          await this.prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity }, soldCount: { decrement: item.quantity } },
          });
        }
      }
    } else if (!wasReserved && willBeReserved) {
      for (const item of order.items) {
        if (item.productId) {
          await this.prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } },
          });
        }
      }
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus,
        paymentId: providerPaymentId,
        ...(paymentStatus === PaymentStatus.PAID && { status: OrderStatus.CONFIRMED }),
      },
    });
  }

  /**
   * Отримати замовлення за ID
   */
  async findById(id: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, images: true },
            },
          },
        },
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Замовлення з ID ${id} не знайдено`);
    }

    // Перевірити права доступу (користувач може бачити тільки свої замовлення)
    if (userId && order.userId !== userId) {
      throw new NotFoundException('Замовлення не знайдено');
    }

    return order;
  }

  /**
   * Отримати замовлення за номером
   */
  async findByOrderNumber(orderNumber: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, images: true },
            },
          },
        },
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Замовлення з номером ${orderNumber} не знайдено`);
    }

    // Перевірити права доступу
    if (userId && order.userId !== userId) {
      throw new NotFoundException('Замовлення не знайдено');
    }

    return order;
  }

  /**
   * Публічна перевірка статусу замовлення за номером (для сторінки success після оплати)
   * Повертає лише мінімальний безпечний набір полів, без персональних даних
   */
  async trackByOrderNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        total: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Замовлення з номером ${orderNumber} не знайдено`);
    }

    return { ...order, total: Number(order.total) };
  }

  /**
   * Отримати всі замовлення з фільтрацією (Admin only)
   */
  async findAll(filterDto: FilterOrdersDto) {
    const {
      search,
      status,
      paymentMethod,
      deliveryMethod,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filterDto;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (deliveryMethod) {
      where.deliveryMethod = deliveryMethod;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
        { contactPhone: { contains: search, mode: 'insensitive' } },
        { contactFirstName: { contains: search, mode: 'insensitive' } },
        { contactLastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, images: true },
              },
            },
          },
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Отримати замовлення користувача
   */
  async findUserOrders(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, slug: true, images: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return {
      data: orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Оновити статус замовлення (Admin only)
   */
  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Замовлення з ID ${id} не знайдено`);
    }

    const { status, adminNote, npTrackingNumber } = updateStatusDto;

    // Оновити замовлення
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: status as OrderStatus,
        adminNote,
        npTrackingNumber,
        updatedAt: new Date(),
      },
      include: {
        items: true,
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    // Створити запис в історії статусів
    await this.prisma.orderStatusHistory.create({
      data: {
        orderId: id,
        status: status as OrderStatus,
        comment: adminNote,
      },
    });

    // Нарахувати бонусні бали при доставці (1 бал за 10 грн)
    if (status === 'DELIVERED' && order.status !== 'DELIVERED' && updatedOrder.user?.id) {
      const points = Math.floor(Number(updatedOrder.total) / 10);
      if (points > 0) {
        this.loyaltyService.addPoints(
          updatedOrder.user.id,
          points,
          `Бонуси за замовлення ${order.orderNumber}`,
          id,
        ).catch(err => console.error('Помилка нарахування балів:', err));
        // Оновити totalSpent
        this.prisma.user.update({
          where: { id: updatedOrder.user.id },
          data: { totalSpent: { increment: Number(updatedOrder.total) } },
        }).catch(() => {});
      }
    }

    // Надіслати email про зміну статусу
    try {
      await this.emailService.sendOrderStatusUpdate(updatedOrder);
    } catch (error) {
      console.error('Помилка надсилання email про зміну статусу:', error);
    }

    return updatedOrder;
  }

  /**
   * Скасувати замовлення
   */
  async cancelOrder(id: string, userId?: string, reason?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Замовлення з ID ${id} не знайдено`);
    }

    // Перевірити права доступу
    if (userId && order.userId !== userId) {
      throw new BadRequestException('Неможливо скасувати чуже замовлення');
    }

    // Перевірити чи можна скасувати
    if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
      throw new BadRequestException('Неможливо скасувати доставлене або вже скасоване замовлення');
    }

    // Повернути товари на склад — лише якщо вони ще зарезервовані.
    // Якщо онлайн-оплата вже провалилась раніше, склад уже звільнено через LiqPay callback.
    const wasReserved = !['FAILED', 'REFUNDED'].includes(order.paymentStatus);
    if (wasReserved) {
      for (const item of order.items) {
        if (item.productId) {
          await this.prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              soldCount: { decrement: item.quantity },
            },
          });
        }
      }
    }

    // Оновити статус
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        adminNote: reason || 'Скасовано користувачем',
      },
      include: {
        items: true,
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    // Створити запис в історії
    await this.prisma.orderStatusHistory.create({
      data: {
        orderId: id,
        status: 'CANCELLED',
        comment: reason || 'Скасовано користувачем',
      },
    });

    // Надіслати email
    try {
      await this.emailService.sendOrderStatusUpdate(updatedOrder);
    } catch (error) {
      console.error('Помилка надсилання email про скасування:', error);
    }

    return updatedOrder;
  }

  /**
   * Виручка по днях за останні N днів
   */
  async getDailyRevenue(days = 30): Promise<{ date: string; revenue: number; orders: number }[]> {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: 'CANCELLED' },
      },
      select: { createdAt: true, total: true },
    });

    // Build a map date → { revenue, count }
    const map: Record<string, { revenue: number; orders: number }> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      map[key] = { revenue: 0, orders: 0 };
    }

    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      if (map[key]) {
        map[key].revenue += Number(o.total);
        map[key].orders += 1;
      }
    }

    return Object.entries(map).map(([date, v]) => ({ date, ...v }));
  }

  /**
   * Отримати статистику замовлень (Admin only)
   */
  async getOrderStats(startDate?: Date, endDate?: Date) {
    const dateFilter = startDate || endDate ? {
      createdAt: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      },
    } : {};

    const [
      totalOrders,
      totalRevenue,
      ordersByStatus,
      ordersByPaymentMethod,
      ordersByDeliveryMethod,
    ] = await Promise.all([
      this.prisma.order.count({ where: dateFilter }),
      this.prisma.order.aggregate({
        where: { ...dateFilter, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        where: dateFilter,
        _count: true,
      }),
      this.prisma.order.groupBy({
        by: ['paymentMethod'],
        where: dateFilter,
        _count: true,
      }),
      this.prisma.order.groupBy({
        by: ['deliveryMethod'],
        where: dateFilter,
        _count: true,
      }),
    ]);

    return {
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.total) || 0,
      ordersByStatus,
      ordersByPaymentMethod,
      ordersByDeliveryMethod,
    };
  }
}