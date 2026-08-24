import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Знайти користувача за ID
   */
  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        isBlocked: true,
        avatar: true,
        loyaltyPoints: true,
        createdAt: true,
      },
    });
  }

  /**
   * Знайти користувача за email
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Створити нового користувача при реєстрації
   */
  async create(email: string, password: string, firstName: string, lastName?: string) {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Користувач з таким email вже існує');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerifyToken = uuidv4();

    const user = await this.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName,
        lastName,
        emailVerifyToken,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    return { user, emailVerifyToken };
  }

  /**
   * Перевірити пароль при логіні
   */
  async validatePassword(userId: string, password: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true, isBlocked: true },
    });

    if (!user) {
      throw new NotFoundException('Користувач не знайдений');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Ваш акаунт заблокований');
    }

    return await bcrypt.compare(password, user.passwordHash || '');
  }

  /**
   * Підтвердити email за токеном
   */
  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      throw new BadRequestException('Невалідний або скінчений токен верифікації');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email вже підтверджений');
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailVerifyToken: null },
      select: {
        id: true,
        email: true,
        firstName: true,
      },
    });
  }

  /**
   * Оновити токен верифікації email
   */
  async setEmailVerifyToken(userId: string, token: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { emailVerifyToken: token },
    });
  }

  /**
   * Генерувати токен для скидання пароля
   */
  async generatePasswordResetToken(email: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      // З міркувань безпеки не видимо, що email не існує
      return null;
    }

    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 година

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: expiresAt,
      },
    });

    return resetToken;
  }

  /**
   * Скинути пароль за токеном
   */
  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Невалідний або скінчений токен');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
      },
    });
  }

  /**
   * Оновити дані користувача
   */
  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string; avatar?: string }) {
    const { firstName, lastName, phone, avatar } = data;
    return this.prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, phone, avatar },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
      },
    });
  }

  /**
   * Видалити користувача (SUPER_ADMIN only)
   */
  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
    if (!user) throw new NotFoundException('Користувач не знайдений');
    if (user.role === 'SUPER_ADMIN') {
      throw new BadRequestException('Неможливо видалити SUPER_ADMIN');
    }
    return this.prisma.user.delete({ where: { id } });
  }

  /**
   * Заблокувати / розблокувати користувача
   */
  async setBlocked(id: string, blocked: boolean, reason?: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) throw new NotFoundException('Користувач не знайдений');
    return this.prisma.user.update({
      where: { id },
      data: { isBlocked: blocked, blockReason: blocked ? (reason ?? null) : null },
      select: { id: true, isBlocked: true, blockReason: true },
    });
  }

  async findAll(filterDto: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 20 } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isEmailVerified: true,
          isBlocked: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
