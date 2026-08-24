import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Декоратор для отримання поточного користувача з запиту
 * Використовувати на параметрах методу контролера
 * Приклад: getCurrentUser(@CurrentUser() user: User)
 */
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
