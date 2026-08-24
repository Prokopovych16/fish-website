import { Controller, Get, Post, Patch, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Loyalty')
@Controller('loyalty')
export class LoyaltyController {
  constructor(private loyaltyService: LoyaltyService) {}

  /** Публічні рівні лояльності — для відображення на сторінці акаунту */
  @Get('tiers')
  @ApiOperation({ summary: 'Отримати рівні лояльності та налаштування' })
  getTiers() {
    return this.loyaltyService.getLoyaltySettings();
  }

  /** Історія балів поточного юзера */
  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отримати історію балів лояльності' })
  getHistory(@CurrentUser() user: any) {
    return this.loyaltyService.getHistory(user.id);
  }

  // ─── Admin ─────────────────────────────────────────────────

  @Get('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Список юзерів з балами (адмін)' })
  adminGetUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.loyaltyService.adminGetUsers(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      search,
    );
  }

  @Post('admin/adjust')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ручне коригування балів юзера (адмін)' })
  adminAdjust(@Body() body: { userId: string; points: number; description: string }) {
    return this.loyaltyService.adminAdjustPoints(body.userId, body.points, body.description);
  }

  @Get('admin/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Налаштування бонусної програми (адмін)' })
  getSettings() {
    return this.loyaltyService.getLoyaltySettings();
  }

  @Patch('admin/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Оновити налаштування бонусної програми (адмін)' })
  updateSettings(@Body() body: any) {
    return this.loyaltyService.updateLoyaltySettings(body);
  }
}
