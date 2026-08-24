import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LoyaltyTier {
  name: string;
  min: number;
  discount: number;
}

export interface LoyaltySettings {
  pointsRate: number;        // скільки грн за 1 бал
  welcomeBonus: number;
  reviewBonus: number;
  tiers: LoyaltyTier[];
}

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  /** Читає налаштування лояльності з таблиці Setting */
  async getLoyaltySettings(): Promise<LoyaltySettings> {
    const keys = [
      'loyalty_points_rate',
      'loyalty_welcome_bonus',
      'loyalty_review_bonus',
      'loyalty_tier_silver_min',
      'loyalty_tier_gold_min',
      'loyalty_tier_platinum_min',
      'loyalty_tier_silver_discount',
      'loyalty_tier_gold_discount',
      'loyalty_tier_platinum_discount',
    ];
    const rows = await this.prisma.setting.findMany({ where: { key: { in: keys } } });
    const s: Record<string, number> = {};
    for (const r of rows) s[r.key] = Number(r.value) || 0;

    return {
      pointsRate:   s['loyalty_points_rate']   || 10,
      welcomeBonus: s['loyalty_welcome_bonus']  || 50,
      reviewBonus:  s['loyalty_review_bonus']   || 25,
      tiers: [
        { name: 'Бронзовий',  min: 0,                                    discount: 0 },
        { name: 'Срібний',    min: s['loyalty_tier_silver_min']   || 500,  discount: s['loyalty_tier_silver_discount']   || 5  },
        { name: 'Золотий',    min: s['loyalty_tier_gold_min']     || 1500, discount: s['loyalty_tier_gold_discount']     || 10 },
        { name: 'Платиновий', min: s['loyalty_tier_platinum_min'] || 3000, discount: s['loyalty_tier_platinum_discount'] || 15 },
      ],
    };
  }

  /** Оновлює налаштування лояльності */
  async updateLoyaltySettings(data: Partial<{
    pointsRate: number;
    welcomeBonus: number;
    reviewBonus: number;
    silverMin: number;
    goldMin: number;
    platinumMin: number;
    silverDiscount: number;
    goldDiscount: number;
    platinumDiscount: number;
  }>) {
    const map: Record<string, number | undefined> = {
      loyalty_points_rate:          data.pointsRate,
      loyalty_welcome_bonus:        data.welcomeBonus,
      loyalty_review_bonus:         data.reviewBonus,
      loyalty_tier_silver_min:      data.silverMin,
      loyalty_tier_gold_min:        data.goldMin,
      loyalty_tier_platinum_min:    data.platinumMin,
      loyalty_tier_silver_discount: data.silverDiscount,
      loyalty_tier_gold_discount:   data.goldDiscount,
      loyalty_tier_platinum_discount: data.platinumDiscount,
    };

    for (const [key, val] of Object.entries(map)) {
      if (val !== undefined) {
        await this.prisma.setting.upsert({
          where: { key },
          update: { value: String(val) },
          create: { key, value: String(val), group: 'loyalty' },
        });
      }
    }

    return this.getLoyaltySettings();
  }

  /** Історія балів поточного юзера */
  async getHistory(userId: string) {
    const [history, user] = await Promise.all([
      this.prisma.loyaltyHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { loyaltyPoints: true, totalSpent: true },
      }),
    ]);

    return {
      currentPoints: user?.loyaltyPoints ?? 0,
      totalSpent: Number(user?.totalSpent ?? 0),
      history,
    };
  }

  /** Нарахувати бали */
  async addPoints(userId: string, points: number, description: string, orderId?: string) {
    await this.prisma.$transaction([
      this.prisma.loyaltyHistory.create({
        data: { userId, points, description, orderId },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { loyaltyPoints: { increment: points } },
      }),
    ]);
  }

  /** Списати бали */
  async spendPoints(userId: string, points: number, description: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { loyaltyPoints: true } });
    if (!user || user.loyaltyPoints < points) {
      throw new Error('Недостатньо балів');
    }
    await this.prisma.$transaction([
      this.prisma.loyaltyHistory.create({
        data: { userId, points: -points, description },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { loyaltyPoints: { decrement: points } },
      }),
    ]);
  }

  /** Нарахувати вітальний бонус після підтвердження email */
  async giveWelcomeBonus(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { loyaltyPoints: true } });
    // Даємо лише якщо ще немає балів (щоб не дублювати)
    if (user && user.loyaltyPoints === 0) {
      const settings = await this.getLoyaltySettings();
      if (settings.welcomeBonus > 0) {
        await this.addPoints(userId, settings.welcomeBonus, 'Вітальний бонус за реєстрацію');
      }
    }
  }

  /** Нарахувати бонус за опублікований відгук */
  async giveReviewBonus(userId: string) {
    const settings = await this.getLoyaltySettings();
    if (settings.reviewBonus > 0) {
      await this.addPoints(userId, settings.reviewBonus, 'Бонус за відгук');
    }
  }

  // ─── Admin endpoints ────────────────────────────────────────

  /** Список юзерів з балами (для адмінки) */
  async adminGetUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          loyaltyPoints: true,
          totalSpent: true,
          createdAt: true,
        },
        orderBy: { loyaltyPoints: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const settings = await this.getLoyaltySettings();

    return {
      data: users.map(u => ({
        ...u,
        totalSpent: Number(u.totalSpent),
        tier: this.calcTier(u.loyaltyPoints, settings.tiers),
      })),
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      settings,
    };
  }

  /** Ручне коригування балів адміном */
  async adminAdjustPoints(userId: string, points: number, description: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`Користувача не знайдено`);

    if (points < 0) {
      const abs = Math.abs(points);
      if (user.loyaltyPoints < abs) {
        // Обнуляємо замість від'ємного балансу
        const actual = -user.loyaltyPoints;
        if (actual === 0) return { message: 'Балів і так 0' };
        await this.prisma.$transaction([
          this.prisma.loyaltyHistory.create({ data: { userId, points: actual, description } }),
          this.prisma.user.update({ where: { id: userId }, data: { loyaltyPoints: 0 } }),
        ]);
        return { newBalance: 0 };
      }
    }

    await this.prisma.$transaction([
      this.prisma.loyaltyHistory.create({ data: { userId, points, description } }),
      this.prisma.user.update({
        where: { id: userId },
        data: { loyaltyPoints: { increment: points } },
      }),
    ]);

    const updated = await this.prisma.user.findUnique({ where: { id: userId }, select: { loyaltyPoints: true } });
    return { newBalance: updated?.loyaltyPoints ?? 0 };
  }

  /** Повертає % знижки для конкретного юзера згідно його тиру */
  async getUserTierDiscount(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { loyaltyPoints: true },
    });
    if (!user) return 0;
    const settings = await this.getLoyaltySettings();
    const tier = this.calcTier(user.loyaltyPoints, settings.tiers);
    return tier.discount;
  }

  private calcTier(points: number, tiers: LoyaltyTier[]): LoyaltyTier {
    return [...tiers].reverse().find(t => points >= t.min) ?? tiers[0];
  }
}
