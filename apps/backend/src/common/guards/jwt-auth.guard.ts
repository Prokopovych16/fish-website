import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Guard для перевірки JWT access token
   * Використовувати на всіх захищених маршрутах: @UseGuards(JwtAuthGuard)
   */
}
