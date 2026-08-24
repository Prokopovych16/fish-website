import { Controller, Post, Patch, Body, Get, Req, UseGuards, Res, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, ChangePasswordDto, UpdateProfileDto } from './dto';
import { JwtAuthGuard, RefreshTokenGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';
import { Request, Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Реєстрація нового користувача' })
  @ApiResponse({ status: 201, description: 'Користувач успішно зареєстрований' })
  @ApiResponse({ status: 400, description: 'Email вже існує' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Вхід в систему' })
  @ApiResponse({ status: 200, description: 'Успішний вхід' })
  @ApiResponse({ status: 401, description: 'Невирні облікові дані' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(loginDto, response);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Підтвердження email адреси' })
  @ApiResponse({ status: 200, description: 'Email підтверджений' })
  @ApiResponse({ status: 400, description: 'Невалідний токен' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Повторно надіслати лист верифікації email' })
  @ApiResponse({ status: 200, description: 'Лист надіслано' })
  async resendVerification(@Body() body: ForgotPasswordDto) {
    return this.authService.resendVerification(body.email);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Запит на скидання пароля' })
  @ApiResponse({ status: 200, description: 'Email відправлено' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Скидання пароля за токеном' })
  @ApiResponse({ status: 200, description: 'Пароль змінено' })
  @ApiResponse({ status: 400, description: 'Невалідний токен' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({ summary: 'Оновлення access token' })
  @ApiResponse({ status: 200, description: 'Novo токен видано' })
  async refresh(@CurrentUser() user: any, @Res({ passthrough: true }) response: Response) {
    return this.authService.refresh(user, response);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Вихід з системи' })
  @ApiResponse({ status: 200, description: 'Успішний вихід' })
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies?.refreshToken;
    return this.authService.logout(response, refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Отримати поточного користувача' })
  @ApiResponse({ status: 200, description: 'Дані користувача' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  async getCurrentUser(@CurrentUser() user: any) {
    return this.authService.getCurrentUser(user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Оновити профіль користувача' })
  @ApiResponse({ status: 200, description: 'Профіль оновлено' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  async updateProfile(
    @Body() body: UpdateProfileDto,
    @CurrentUser() user: any,
  ) {
    return this.authService.updateProfile(user.id, body);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Змінити пароль' })
  @ApiResponse({ status: 200, description: 'Пароль змінено' })
  @ApiResponse({ status: 400, description: 'Невірний поточний пароль' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  async changePassword(
    @Body() body: ChangePasswordDto,
    @CurrentUser() user: any,
  ) {
    return this.authService.changePassword(user.id, body.currentPassword, body.newPassword);
  }
}
