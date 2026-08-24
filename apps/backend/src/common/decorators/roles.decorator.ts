import { SetMetadata } from '@nestjs/common';

/**
 * Декоратор для встановлення необхідних ролей на маршруті
 * Використовувати разом з RolesGuard
 * Приклад: @Roles('ADMIN', 'SUPER_ADMIN')
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
