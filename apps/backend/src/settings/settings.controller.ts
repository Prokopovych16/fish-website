import { Controller, Get, Patch, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { EmailService } from '../email/email.service';
import { UpdateSettingDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(
    private settingsService: SettingsService,
    private emailService: EmailService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Отримати всі настройки (публічні, без секретів)' })
  @ApiResponse({ status: 200, description: 'Список налаштувань' })
  async findAll() {
    return this.settingsService.findAll();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отримати всі настройки включно з секретами (Admin only)' })
  @ApiResponse({ status: 200, description: 'Повний список налаштувань' })
  async findAllForAdmin() {
    return this.settingsService.findAllForAdmin();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Отримати налаштування за ключем (секретні ключі заборонені)' })
  @ApiResponse({ status: 200, description: 'Налаштування знайдено' })
  async findByKey(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }

  @Patch(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Оновити налаштування за ключем' })
  @ApiResponse({ status: 200, description: 'Налаштування оновлено' })
  async update(@Param('key') key: string, @Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.update(key, updateSettingDto);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Оновити декілька налаштувань' })
  @ApiResponse({ status: 200, description: 'Налаштування оновлені' })
  async bulkUpdate(@Body() settings: UpdateSettingDto[]) {
    return this.settingsService.bulkUpdate(settings);
  }

  @Post('test-email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Надіслати тестовий email для перевірки SMTP' })
  async testEmail(@Body('email') email: string) {
    return this.emailService.sendTestEmail(email);
  }
}