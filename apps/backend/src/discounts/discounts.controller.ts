import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto, UpdateDiscountDto, FilterDiscountsDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Знижки')
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Створити знижку' })
  @ApiResponse({ status: 201, description: 'Знижка створена успішно' })
  @ApiResponse({ status: 400, description: 'Невірні дані' })
  create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountsService.create(createDiscountDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отримати всі знижки' })
  @ApiResponse({ status: 200, description: 'Список знижок' })
  findAll(@Query() filterDto: FilterDiscountsDto) {
    return this.discountsService.findAll(filterDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отримати знижку за ID' })
  @ApiResponse({ status: 200, description: 'Знижка знайдена' })
  @ApiResponse({ status: 404, description: 'Знижка не знайдена' })
  findById(@Param('id') id: string) {
    return this.discountsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Оновити знижку' })
  @ApiResponse({ status: 200, description: 'Знижка оновлена' })
  @ApiResponse({ status: 404, description: 'Знижка не знайдена' })
  update(@Param('id') id: string, @Body() updateDiscountDto: UpdateDiscountDto) {
    return this.discountsService.update(id, updateDiscountDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Видалити знижку' })
  @ApiResponse({ status: 200, description: 'Знижка видалена' })
  @ApiResponse({ status: 404, description: 'Знижка не знайдена' })
  remove(@Param('id') id: string) {
    return this.discountsService.delete(id);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Перевірити промокод' })
  @ApiResponse({ status: 200, description: 'Промокод валідний' })
  @ApiResponse({ status: 400, description: 'Невірний промокод' })
  async validateDiscountCode(
    @Body() body: { code: string; userId?: string; subtotal?: number; productIds?: string[] },
  ) {
    const { code, userId, subtotal, productIds } = body;

    if (!code) {
      throw new BadRequestException('Код промокоду обов\'язковий');
    }

    const discount = await this.discountsService.validateDiscountCode(
      code,
      userId,
      subtotal,
      productIds,
    );

    return {
      valid: true,
      discount: {
        id: discount.id,
        code: discount.code,
        type: discount.type,
        value: discount.value,
        minOrderAmount: discount.minOrderAmount,
        description: discount.description,
      },
    };
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отримати статистику використання знижки' })
  @ApiResponse({ status: 200, description: 'Статистика знижки' })
  getDiscountStats(@Param('id') id: string) {
    return this.discountsService.getDiscountStats(id);
  }

  @Get('product/:productId/active')
  @ApiOperation({ summary: 'Отримати активні знижки для товару' })
  @ApiResponse({ status: 200, description: 'Активні знижки для товару' })
  getActiveDiscountsForProduct(@Param('productId') id: string) {
    return this.discountsService.getActiveDiscountsForProduct(id);
  }
}