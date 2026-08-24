import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  /**
   * Отримати кошик користувача
   */
  async getCart(userId: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            oldPrice: true,
            discountPercent: true,
            stock: true,
            images: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Розрахувати підсумки
    let subtotal = 0;
    let totalItems = 0;
    let totalDiscount = 0;

    const items = cartItems.map((item) => {
      const product = item.product;
      if (!product) return null;

      const price = product.oldPrice && product.discountPercent
        ? Number(product.oldPrice) * (1 - Number(product.discountPercent) / 100)
        : Number(product.price);

      const discount = product.oldPrice && product.discountPercent
        ? Number(product.oldPrice) - price
        : 0;

      const total = price * item.quantity;

      subtotal += total;
      totalItems += item.quantity;
      totalDiscount += discount * item.quantity;

      return {
        id: item.id,
        productId: item.productId,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          oldPrice: product.oldPrice,
          discountPercent: product.discountPercent,
          stock: product.stock,
          image: product.images?.[0]?.url || null,
        },
        quantity: item.quantity,
        price,
        discount,
        total,
        createdAt: item.createdAt,
      };
    }).filter(Boolean);

    return {
      items,
      summary: {
        totalItems,
        subtotal,
        totalDiscount,
        total: subtotal,
      },
    };
  }

  /**
   * Додати товар до кошика
   */
  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { productId, quantity } = addToCartDto;

    // Перевірити товар
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Товар з ID ${productId} не знайдений`);
    }

    if (!product.isActive) {
      throw new BadRequestException('Товар недоступний');
    }

    if (product.stock < quantity) {
      throw new BadRequestException(`Недостатньо товару на складі. Доступно: ${product.stock}`);
    }

    // Перевірити чи товар вже в кошику
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingItem) {
      // Оновити кількість
      const newQuantity = existingItem.quantity + quantity;

      if (product.stock < newQuantity) {
        throw new BadRequestException(`Недостатньо товару на складі. Доступно: ${product.stock}`);
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Додати новий товар
      await this.prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  /**
   * Оновити кількість товару в кошику
   */
  async updateCartItem(userId: string, productId: string, updateDto: UpdateCartItemDto) {
    const { quantity } = updateDto;

    // Перевірити товар
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Товар з ID ${productId} не знайдений`);
    }

    if (!product.isActive) {
      throw new BadRequestException('Товар недоступний');
    }

    if (product.stock < quantity) {
      throw new BadRequestException(`Недостатньо товару на складі. Доступно: ${product.stock}`);
    }

    // Знайти товар в кошику
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Товар не знайдений в кошику');
    }

    // Оновити кількість
    await this.prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    return this.getCart(userId);
  }

  /**
   * Видалити товар з кошика
   */
  async removeFromCart(userId: string, productId: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Товар не знайдений в кошику');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    return this.getCart(userId);
  }

  /**
   * Очистити кошик
   */
  async clearCart(userId: string) {
    await this.prisma.cartItem.deleteMany({
      where: { userId },
    });

    return this.getCart(userId);
  }

  /**
   * Злити кошик гостя з кошиком користувача при авторизації
   */
  async mergeGuestCart(userId: string, guestCartItems: { productId: string; quantity: number }[]) {
    for (const guestItem of guestCartItems) {
      try {
        await this.addToCart(userId, guestItem);
      } catch (error) {
        // Ігнорувати помилки злиття (наприклад, якщо товар недоступний)
        console.warn(`Не вдалося злити товар ${guestItem.productId}:`, (error as Error).message);
      }
    }

    return this.getCart(userId);
  }

  /**
   * Перевірити чи всі товари в кошику доступні
   */
  async validateCart(userId: string): Promise<{ valid: boolean; errors: string[] }> {
    const cart = await this.getCart(userId);
    const errors: string[] = [];

    for (const item of cart.items) {
      if (!item) continue;

      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        errors.push(`Товар "${item.product.name}" більше не існує`);
        continue;
      }

      if (!product.isActive) {
        errors.push(`Товар "${product.name}" недоступний`);
      }

      if (product.stock < item.quantity) {
        errors.push(`Недостатньо товару "${product.name}" на складі. Доступно: ${product.stock}, в кошику: ${item.quantity}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Отримати кількість товарів в кошику
   */
  async getCartItemCount(userId: string): Promise<number> {
    const result = await this.prisma.cartItem.aggregate({
      where: { userId },
      _sum: { quantity: true },
    });

    return result._sum.quantity || 0;
  }
}