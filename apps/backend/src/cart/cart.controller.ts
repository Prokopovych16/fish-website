import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  /**
   * Отримати вміст кошика
   */
  @Get()
  @ApiOperation({ summary: 'Отримати вміст кошика' })
  @ApiResponse({ status: 200, description: 'Вміст кошика' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  async getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(user.id);
  }

  /**
   * Додати товар до кошика
   */
  @Post('items')
  @ApiOperation({ summary: 'Додати товар до кошика' })
  @ApiResponse({ status: 201, description: 'Товар додано до кошика' })
  @ApiResponse({ status: 400, description: 'Невірні дані або недостатньо товару' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  async addToCart(@Body() addToCartDto: AddToCartDto, @CurrentUser() user: any) {
    return this.cartService.addToCart(user.id, addToCartDto);
  }

  /**
   * Оновити кількість товару в кошику
   */
  @Put('items/:productId')
  @ApiOperation({ summary: 'Оновити кількість товару в кошику' })
  @ApiResponse({ status: 200, description: 'Кількість оновлено' })
  @ApiResponse({ status: 404, description: 'Товар не знайдений в кошику' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  async updateCartItem(
    @Param('productId') productId: string,
    @Body() updateDto: UpdateCartItemDto,
    @CurrentUser() user: any,
  ) {
    return this.cartService.updateCartItem(user.id, productId, updateDto);
  }

  /**
   * Видалити товар з кошика
   */
  @Delete('items/:productId')
  @ApiOperation({ summary: 'Видалити товар з кошика' })
  @ApiResponse({ status: 200, description: 'Товар видалено з кошика' })
  @ApiResponse({ status: 404, description: 'Товар не знайдений в кошику' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  async removeFromCart(@Param('productId') productId: string, @CurrentUser() user: any) {
    return this.cartService.removeFromCart(user.id, productId);
  }

  /**
   * Очистити кошик
   */
  @Delete()
  @ApiOperation({ summary: 'Очистити кошик' })
  @ApiResponse({ status: 200, description: 'Кошик очищено' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  async clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user.id);
  }

  /**
   * Перевірити кошик на валідність
   */
  @Get('validate')
  @ApiOperation({ summary: 'Перевірити кошик на валідність' })
  @ApiResponse({ status: 200, description: 'Результат перевірки' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  async validateCart(@CurrentUser() user: any) {
    return this.cartService.validateCart(user.id);
  }

  /**
   * Отримати кількість товарів в кошику
   */
  @Get('count')
  @ApiOperation({ summary: 'Отримати кількість товарів в кошику' })
  @ApiResponse({ status: 200, description: 'Кількість товарів' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  async getCartItemCount(@CurrentUser() user: any) {
    const count = await this.cartService.getCartItemCount(user.id);
    return { count };
  }

  /**
   * Злити гостьовий кошик з кошиком авторизованого користувача
   */
  @Post('merge')
  @ApiOperation({ summary: 'Злити гостьовий кошик при авторизації' })
  @ApiResponse({ status: 200, description: 'Кошики злито' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  async mergeCart(
    @Body() body: { items: { productId: string; quantity: number }[] },
    @CurrentUser() user: any,
  ) {
    if (!body.items || body.items.length === 0) {
      return this.cartService.getCart(user.id);
    }
    return this.cartService.mergeGuestCart(user.id, body.items);
  }
}