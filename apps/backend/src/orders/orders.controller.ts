import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, FilterOrdersDto } from './dto';
import { JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, CurrentUser } from '../common/decorators';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  /**
   * Створити нове замовлення (авторизовані та гості)
   */
  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Створити нове замовлення' })
  @ApiResponse({ status: 201, description: 'Замовлення створено' })
  @ApiResponse({ status: 400, description: 'Невірні дані' })
  async create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: any) {
    return this.ordersService.create(createOrderDto, user?.id);
  }

  /**
   * Публічна перевірка статусу замовлення за номером (для сторінки success після оплати)
   */
  @Get('track/:orderNumber')
  @ApiOperation({ summary: 'Перевірити статус замовлення за номером (публічно)' })
  @ApiResponse({ status: 200, description: 'Статус замовлення' })
  @ApiResponse({ status: 404, description: 'Замовлення не знайдено' })
  async trackOrder(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.trackByOrderNumber(orderNumber);
  }

  /**
   * Отримати замовлення за ID (власник або admin)
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Отримати замовлення за ID' })
  @ApiResponse({ status: 200, description: 'Дані замовлення' })
  @ApiResponse({ status: 404, description: 'Замовлення не знайдено' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  async findById(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user?.role && ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(user.role);
    return this.ordersService.findById(id, isAdmin ? undefined : user?.id);
  }

  /**
   * Отримати замовлення за номером (власник або admin)
   */
  @Get('number/:orderNumber')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Отримати замовлення за номером' })
  @ApiResponse({ status: 200, description: 'Дані замовлення' })
  @ApiResponse({ status: 404, description: 'Замовлення не знайдено' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  async findByOrderNumber(@Param('orderNumber') orderNumber: string, @CurrentUser() user: any) {
    const isAdmin = user?.role && ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(user.role);
    return this.ordersService.findByOrderNumber(orderNumber, isAdmin ? undefined : user?.id);
  }

  /**
   * Отримати замовлення користувача
   */
  @Get('user/my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Отримати свої замовлення' })
  @ApiResponse({ status: 200, description: 'Список замовлень' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  async getUserOrders(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.findUserOrders(
      user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  /**
   * Отримати всі замовлення з фільтрацією (Admin only)
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Отримати всі замовлення з фільтрацією (Admin only)' })
  @ApiResponse({ status: 200, description: 'Список замовлень' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав' })
  async findAll(@Query() filterDto: FilterOrdersDto) {
    return this.ordersService.findAll(filterDto);
  }

  /**
   * Оновити статус замовлення (Admin only)
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Оновити статус замовлення (Admin only)' })
  @ApiResponse({ status: 200, description: 'Статус оновлено' })
  @ApiResponse({ status: 404, description: 'Замовлення не знайдено' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }

  /**
   * Скасувати замовлення (власник або admin)
   */
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Скасувати замовлення' })
  @ApiResponse({ status: 200, description: 'Замовлення скасовано' })
  @ApiResponse({ status: 404, description: 'Замовлення не знайдено' })
  @ApiResponse({ status: 400, description: 'Неможливо скасувати' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  async cancelOrder(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.cancelOrder(id, user?.id, reason);
  }

  /**
   * Виручка по днях (Admin only)
   */
  @Get('stats/daily')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Виручка по днях (Admin only)' })
  async getDailyRevenue(@Query('days') days?: string) {
    return this.ordersService.getDailyRevenue(days ? Number(days) : 30);
  }

  /**
   * Отримати статистику замовлень (Admin only)
   */
  @Get('stats/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Отримати статистику замовлень (Admin only)' })
  @ApiResponse({ status: 200, description: 'Статистика замовлень' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав' })
  async getOrderStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.ordersService.getOrderStats(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}