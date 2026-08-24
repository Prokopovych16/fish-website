import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard для маршрутів, доступних і гостям, і авторизованим користувачам.
 * Якщо передано валідний JWT — request.user заповнюється (дані прив'язуються до акаунту).
 * Якщо токена немає або він невалідний — запит все одно пропускається, просто як гостьовий.
 *
 * Без цього guard'а @CurrentUser() на незахищеному маршруті ЗАВЖДИ повертає undefined,
 * навіть якщо клієнт надіслав дійсний токен — Passport-стратегія просто не запускається.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      await super.canActivate(context);
    } catch {
      // Невалідний/відсутній токен — пропускаємо як гостя, не блокуємо запит
    }
    return true;
  }

  handleRequest(err: any, user: any) {
    return user || null;
  }
}
