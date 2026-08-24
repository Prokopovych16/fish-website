import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Отримати список бажань' })
  getWishlist(@CurrentUser() user: any) {
    return this.wishlistService.getWishlist(user.id);
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Додати/видалити товар зі списку бажань (toggle)' })
  toggle(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.wishlistService.toggle(user.id, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Видалити товар зі списку бажань' })
  remove(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.wishlistService.remove(user.id, productId);
  }

  @Get('check/:productId')
  @ApiOperation({ summary: 'Перевірити чи товар у списку бажань' })
  check(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.wishlistService.isInWishlist(user.id, productId);
  }
}
