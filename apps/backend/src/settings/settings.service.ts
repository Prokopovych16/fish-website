import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingDto } from './dto';

// Ключі, значення яких ніколи не повертаються через публічні (неавторизовані) ендпоінти
const SECRET_KEYS = ['smtp_pass', 'liqpay_private_key', 'nova_poshta_api_key', 'wayforpay_merchant_secret_key'];

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Публічний список налаштувань (без секретних значень) — для фронтенду (пікселі, контакти тощо)
   */
  async findAll() {
    const settings = await this.prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });
    return settings.filter((s) => !SECRET_KEYS.includes(s.key));
  }

  /**
   * Повний список налаштувань включно з секретами — тільки для адмінки
   */
  async findAllForAdmin() {
    return this.prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  /**
   * Отримати налаштування за ключем — публічний доступ заборонений для секретних ключів
   */
  async findByKey(key: string) {
    if (SECRET_KEYS.includes(key)) {
      throw new ForbiddenException('Доступ до цього налаштування заборонено');
    }

    const setting = await this.prisma.setting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Налаштування з ключем ${key} не знайдено`);
    }

    return setting;
  }

  async update(key: string, updateSettingDto: UpdateSettingDto) {
    return this.prisma.setting.upsert({
      where: { key },
      create: {
        key,
        value: updateSettingDto.value ?? '',
        label: updateSettingDto.label,
        group: updateSettingDto.group || 'general',
      },
      update: {
        ...(updateSettingDto.value !== undefined && { value: updateSettingDto.value }),
        ...(updateSettingDto.label !== undefined && { label: updateSettingDto.label }),
        ...(updateSettingDto.group !== undefined && { group: updateSettingDto.group }),
      },
    });
  }

  async bulkUpdate(settings: UpdateSettingDto[]) {
    const operations = settings.map((setting) =>
      this.prisma.setting.upsert({
        where: { key: setting.key ?? '' },
        create: {
          key: setting.key ?? '',
          value: setting.value ?? '',
          label: setting.label,
          group: setting.group || 'general',
        },
        update: {
          ...(setting.value !== undefined && { value: setting.value }),
          ...(setting.label !== undefined && { label: setting.label }),
          ...(setting.group !== undefined && { group: setting.group }),
        },
      }),
    );

    return this.prisma.$transaction(operations);
  }
}