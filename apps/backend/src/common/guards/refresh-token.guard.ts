import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
  /**
   * Guard для перевірки JWT refresh token з cookie
   * Використовувати на маршруті refresh: @UseGuards(RefreshTokenGuard)
   */
}
