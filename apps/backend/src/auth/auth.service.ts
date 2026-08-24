import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private usersService: UsersService,
    private emailService: EmailService,
    private loyaltyService: LoyaltyService,
  ) {}

  /**
   * Реєстрація нового користувача
   */
  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;

    const { user, emailVerifyToken } = await this.usersService.create(email, password, firstName, lastName);

    // Прив'язати замовлення, зроблені гостем з цим email, до нового акаунту
    const linked = await this.prisma.order.updateMany({
      where: { contactEmail: email.toLowerCase(), userId: null },
      data: { userId: user.id },
    });
    if (linked.count > 0) {
      console.log(`[Auth] Прив'язано ${linked.count} замовлень гостя до нового акаунту ${email}`);
    }

    // Відправити email для верифікації (не блокує реєстрацію якщо SMTP не налаштований)
    this.emailService.sendVerificationEmail(email, emailVerifyToken, firstName).catch(err =>
      console.error('Помилка надсилання email підтвердження:', err.message),
    );

    return {
      message: 'Реєстрація успішна! Перевірте вашу поштову скриньку для підтвердження email',
      user,
    };
  }

  /**
   * Логін користувача
   */
  async login(loginDto: LoginDto, response: any) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email або пароль невірні');
    }

    const isPasswordValid = await this.usersService.validatePassword(user.id, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email або пароль невірні');
    }

    if (!user.isEmailVerified) {
      throw new BadRequestException('Будь ласка, підтвердіть ваш email');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.role);

    // Встановити refresh token в cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
    });

    const userWithoutPassword = await this.usersService.findById(user.id);

    return {
      message: 'Дякуємо за вхід!',
      accessToken,
      user: userWithoutPassword,
    };
  }

  /**
   * Оновити access token за refresh token (з ротацією — старий токен видаляється)
   */
  async refresh(user: any, response: any) {
    // Видалити старий refresh token з БД перед видачею нового
    if (user.refreshToken) {
      await this.prisma.refreshToken.deleteMany({ where: { token: user.refreshToken } });
    }

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.role);

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Токен оновлений',
      accessToken,
    };
  }

  /**
   * Логаут (очистити cookie та видалити refresh token з БД)
   */
  async logout(response: any, refreshToken?: string) {
    response.clearCookie('refreshToken');
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => {});
    }
    return { message: 'Дякуємо за використання!' };
  }

  /**
   * Отримати поточного користувача
   */
  async getCurrentUser(userId: string) {
    return this.usersService.findById(userId);
  }

  /**
   * Верифікація email за токеном
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.usersService.verifyEmail(verifyEmailDto.token);

    // Нарахувати вітальний бонус після підтвердження email
    this.loyaltyService.giveWelcomeBonus(user.id).catch(err =>
      console.error('Помилка нарахування вітального бонусу:', err.message),
    );

    return {
      message: 'Email успішно підтверджений!',
      user,
    };
  }

  /**
   * Повторно надіслати лист верифікації email
   */
  async resendVerification(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (user && !user.isEmailVerified) {
      const { v4: uuidv4 } = await import('uuid');
      const newToken = uuidv4();

      await this.usersService.setEmailVerifyToken(user.id, newToken);

      this.emailService.sendVerificationEmail(email, newToken, user.firstName || 'Користувач').catch(err =>
        console.error('Помилка надсилання листа верифікації:', err.message),
      );
    }

    // Завжди повертаємо успіх (безпека — не розкриваємо чи email існує)
    return { message: 'Якщо акаунт з таким email існує і не підтверджений — лист надіслано' };
  }

  /**
   * Запит на скидання пароля
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const resetToken = await this.usersService.generatePasswordResetToken(email);

    if (resetToken) {
      const user = await this.usersService.findByEmail(email);
      if (user) {
        this.emailService.sendPasswordResetEmail(email, resetToken, user.firstName || 'користувач').catch(err =>
          console.error('Помилка надсилання email скидання пароля:', err.message),
        );
      }
    }

    // Завжди повертаємо успіх для безпеки (не видимо чи email існує)
    return {
      message: 'Якщо email існує, ви отримаєте посилання для скидання пароля',
    };
  }

  /**
   * Скидання пароля за токеном
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;
    const user = await this.usersService.resetPassword(token, newPassword);

    return {
      message: 'Пароль успішно змінено!',
      user,
    };
  }

  /**
   * Оновити профіль користувача
   */
  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string }) {
    return this.usersService.updateProfile(userId, data);
  }

  /**
   * Змінити пароль користувача
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) throw new BadRequestException('Пароль не встановлено');

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Невірний поточний пароль');

    const hash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
    return { message: 'Пароль успішно змінено' };
  }

  /**
   * Генерувати access та refresh токени
   */
  private async generateTokens(userId: string, email: string, role: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, email, role },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET') as string,
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES') || '15m',
      } as any,
    );

    const refreshTokenExpires = this.configService.get<string>('JWT_REFRESH_EXPIRES') || '30d';
    const refreshToken = this.jwtService.sign(
      { sub: userId, email },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') as string,
        expiresIn: refreshTokenExpires,
      } as any,
    );

    // Зберегти refresh token в БД
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }
}
