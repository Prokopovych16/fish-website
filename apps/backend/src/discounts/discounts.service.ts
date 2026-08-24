import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscountDto, UpdateDiscountDto, FilterDiscountsDto } from './dto';
import { DiscountType } from '@prisma/client';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Створити нову знижку
   */
  async create(createDiscountDto: CreateDiscountDto) {
    const {
      code,
      type,
      value,
      minOrderAmount,
      maxUsageCount,
      maxUsagePerUser,
      startsAt,
      expiresAt,
      productIds,
      categoryIds,
      ...data
    } = createDiscountDto;

    // Перевірити унікальність коду
    const existingDiscount = await this.prisma.discount.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingDiscount) {
      throw new BadRequestException(`Промокод "${code}" вже існує`);
    }

    // Валідація дати
    if (startsAt && expiresAt && new Date(startsAt) >= new Date(expiresAt)) {
      throw new BadRequestException('Дата початку повинна бути раніше дати закінчення');
    }

    // Валідація значення залежно від типу
    if (type === 'PERCENTAGE' && (value < 0 || value > 100)) {
      throw new BadRequestException('Відсоток знижки повинен бути від 0 до 100');
    }

    if (type === 'FIXED_AMOUNT' && value < 0) {
      throw new BadRequestException('Сума знижки не може бути від\'ємною');
    }

    const discount = await this.prisma.discount.create({
      data: {
        code: code.toUpperCase(),
        type,
        value,
        minOrderAmount,
        maxUsageCount,
        maxUsagePerUser,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        productIds: productIds || [],
        categoryIds: categoryIds || [],
        ...data,
      },
    });

    return discount;
  }

  /**
   * Отримати всі знижки з фільтрацією
   */
  async findAll(filterDto: FilterDiscountsDto) {
    const {
      isActive,
      type,
      page = 1,
      limit = 20,
    } = filterDto;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (type) {
      where.type = type;
    }

    const [discounts, total] = await Promise.all([
      this.prisma.discount.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.discount.count({ where }),
    ]);

    return {
      data: discounts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Отримати знижку за ID
   */
  async findById(id: string) {
    const discount = await this.prisma.discount.findUnique({
      where: { id },
    });

    if (!discount) {
      throw new NotFoundException(`Знижка з ID ${id} не знайдена`);
    }

    return discount;
  }

  /**
   * Оновити знижку
   */
  async update(id: string, updateDiscountDto: UpdateDiscountDto) {
    const discount = await this.findById(id);

    const {
      code,
      type,
      value,
      minOrderAmount,
      maxUsageCount,
      maxUsagePerUser,
      startsAt,
      expiresAt,
      productIds,
      categoryIds,
      ...data
    } = updateDiscountDto;

    // Перевірити унікальність коду якщо він змінюється
    if (code && code.toUpperCase() !== discount.code) {
      const existingDiscount = await this.prisma.discount.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (existingDiscount) {
        throw new BadRequestException(`Промокод "${code}" вже існує`);
      }
    }

    // Валідація дати
    const startDate = startsAt ? new Date(startsAt) : discount.startsAt;
    const endDate = expiresAt ? new Date(expiresAt) : discount.expiresAt;

    if (startDate && endDate && startDate >= endDate) {
      throw new BadRequestException('Дата початку повинна бути раніше дати закінчення');
    }

    // Валідація значення залежно від типу
    const discountType = type || discount.type;
    const discountValue = value !== undefined ? value : Number(discount.value);

    if (discountType === 'PERCENTAGE' && (discountValue < 0 || discountValue > 100)) {
      throw new BadRequestException('Відсоток знижки повинен бути від 0 до 100');
    }

    if (discountType === 'FIXED_AMOUNT' && discountValue < 0) {
      throw new BadRequestException('Сума знижки не може бути від\'ємною');
    }

    const updatedDiscount = await this.prisma.discount.update({
      where: { id },
      data: {
        code: code ? code.toUpperCase() : discount.code,
        type: discountType,
        value: discountValue,
        minOrderAmount,
        maxUsageCount,
        maxUsagePerUser,
        startsAt: startDate,
        expiresAt: endDate,
        productIds: productIds || discount.productIds,
        categoryIds: categoryIds || discount.categoryIds,
        ...data,
      },
    });

    return updatedDiscount;
  }

  /**
   * Видалити знижку
   */
  async delete(id: string) {
    const discount = await this.findById(id);

    // Перевірити чи використовується знижка
    const usageCount = await this.prisma.order.count({
      where: { discountCode: discount.code },
    });

    if (usageCount > 0) {
      throw new BadRequestException('Неможливо видалити знижку, яка вже використовувалась');
    }

    await this.prisma.discount.delete({
      where: { id },
    });

    return { message: 'Знижка успішно видалена' };
  }

  /**
   * Перевірити та застосувати промокод
   */
  async validateDiscountCode(code: string, userId?: string, subtotal?: number, productIds?: string[]) {
    const discount = await this.prisma.discount.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discount) {
      throw new BadRequestException('Невірний промокод');
    }

    if (!discount.isActive) {
      throw new BadRequestException('Промокод не активний');
    }

    // Перевірити дати
    const now = new Date();
    if (discount.startsAt && now < discount.startsAt) {
      throw new BadRequestException('Промокод ще не активний');
    }

    if (discount.expiresAt && now > discount.expiresAt) {
      throw new BadRequestException('Промокод застарів');
    }

    // Перевірити мінімальну суму замовлення
    if (discount.minOrderAmount && subtotal && subtotal < Number(discount.minOrderAmount)) {
      throw new BadRequestException(`Мінімальна сума замовлення: ${discount.minOrderAmount}грн`);
    }

    // Перевірити ліміт використання
    if (discount.maxUsageCount && discount.usageCount >= discount.maxUsageCount) {
      throw new BadRequestException('Промокод більше не доступний');
    }

    // Перевірити використання користувачем
    if (userId && discount.maxUsagePerUser) {
      const userUsage = await this.prisma.order.count({
        where: {
          userId,
          discountCode: discount.code,
          status: { not: 'CANCELLED' },
        },
      });

      if (userUsage >= discount.maxUsagePerUser) {
        throw new BadRequestException('Ви вже використовували цей промокод');
      }
    }

    // Перевірити продукти/категорії якщо вказано
    if (productIds && productIds.length > 0) {
      if (discount.productIds.length > 0) {
        const hasValidProduct = productIds.some(id => discount.productIds.includes(id));
        if (!hasValidProduct) {
          throw new BadRequestException('Промокод не застосовується до вибраних товарів');
        }
      }

      if (discount.categoryIds.length > 0) {
        // Перевірити чи є товари з дозволених категорій
        const products = await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { categoryId: true },
        });

        const hasValidCategory = products.some(product =>
          discount.categoryIds.includes(product.categoryId)
        );

        if (!hasValidCategory) {
          throw new BadRequestException('Промокод не застосовується до вибраних товарів');
        }
      }
    }

    return discount;
  }

  /**
   * Розрахувати знижку для замовлення
   */
  calculateDiscount(discount: any, subtotal: number, productIds?: string[]): number {
    let discountAmount = 0;

    if (discount.type === 'PERCENTAGE') {
      discountAmount = subtotal * (Number(discount.value) / 100);
    } else if (discount.type === 'FIXED_AMOUNT') {
      discountAmount = Math.min(Number(discount.value), subtotal);
    } else if (discount.type === 'FREE_SHIPPING') {
      // Знижка на доставку обробляється окремо
      discountAmount = 0;
    }

    return discountAmount;
  }

  /**
   * Отримати статистику використання знижки
   */
  async getDiscountStats(id: string) {
    const discount = await this.findById(id);

    const [
      totalUsage,
      totalDiscountAmount,
      recentOrders,
    ] = await Promise.all([
      this.prisma.order.count({
        where: { discountCode: discount.code },
      }),
      this.prisma.order.aggregate({
        where: { discountCode: discount.code },
        _sum: { discountAmount: true },
      }),
      this.prisma.order.findMany({
        where: { discountCode: discount.code },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          discountAmount: true,
          createdAt: true,
          user: {
            select: { email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      discount,
      stats: {
        totalUsage,
        totalDiscountAmount: Number(totalDiscountAmount._sum.discountAmount) || 0,
        remainingUses: discount.maxUsageCount ? discount.maxUsageCount - discount.usageCount : null,
      },
      recentOrders,
    };
  }

  /**
   * Отримати активні знижки для товару
   */
  async getActiveDiscountsForProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });

    if (!product) {
      throw new NotFoundException(`Товар з ID ${productId} не знайдений`);
    }

    const now = new Date();

    const discounts = await this.prisma.discount.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [
              { productIds: { has: productId } },
              { categoryIds: { has: product.categoryId } },
              {
                AND: [
                  { productIds: { isEmpty: true } },
                  { categoryIds: { isEmpty: true } },
                ],
              },
            ],
          },
          {
            OR: [
              { startsAt: null },
              { startsAt: { lte: now } },
            ],
          },
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } },
            ],
          },
        ],
      },
    });

    return discounts;
  }
}