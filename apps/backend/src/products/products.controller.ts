import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, FilterProductsDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, CurrentUser } from '../common/decorators';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  /**
   * Отримати всі товари з фільтрацією та пошуком (публічно)
   */
  @Get()
  @ApiOperation({ summary: 'Отримати товари з фільтрацією та пошуком' })
  @ApiResponse({ status: 200, description: 'Список товарів' })
  async findAll(@Query() filterDto: FilterProductsDto) {
    return this.productsService.findAll(filterDto);
  }

  /**
   * Отримати хітові товари (публічно)
   */
  @Get('featured/list')
  @ApiOperation({ summary: 'Отримати хітові товари' })
  async getFeatured(@Query('limit') limit?: string) {
    return this.productsService.getFeatured(limit ? parseInt(limit) : 10);
  }

  /**
   * Отримати товари за категорією (публічно)
   */
  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Отримати товари за категорією' })
  async findByCategory(
    @Param('categoryId') categoryId: string,
    @Query('limit') limit?: string,
  ) {
    return this.productsService.findByCategory(categoryId, limit ? parseInt(limit) : 10);
  }

  /**
   * Отримати схожі товари (публічно)
   */
  @Get(':id/similar')
  @ApiOperation({ summary: 'Отримати схожі товари' })
  async getSimilar(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.productsService.getSimilar(id, limit ? parseInt(limit) : 5);
  }

  /**
   * Отримати товар за ID (публічно)
   */
  @Get('by-id/:id')
  @ApiOperation({ summary: 'Отримати товар за ID' })
  @ApiResponse({ status: 200, description: 'Дані товару' })
  @ApiResponse({ status: 404, description: 'Товар не знайдений' })
  async findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  /**
   * Отримати товар за slug (публічно)
   */
  @Get(':slug')
  @ApiOperation({ summary: 'Отримати товар за slug' })
  @ApiResponse({ status: 200, description: 'Дані товару' })
  @ApiResponse({ status: 404, description: 'Товар не знайдений' })
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  /**
   * Створити новий товар (Admin only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Створити новий товар (Admin only)' })
  @ApiResponse({ status: 201, description: 'Товар створений' })
  @ApiResponse({ status: 400, description: 'Невірні дані' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав' })
  async create(@Body() createProductDto: CreateProductDto, @CurrentUser() user: any) {
    return this.productsService.create(createProductDto);
  }

  /**
   * Оновити товар (Admin only)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Оновити товар (Admin only)' })
  @ApiResponse({ status: 200, description: 'Товар оновлений' })
  @ApiResponse({ status: 404, description: 'Товар не знайдений' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: any,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * Видалити товар (Admin only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Видалити товар (Admin only)' })
  @ApiResponse({ status: 200, description: 'Товар видалений' })
  @ApiResponse({ status: 404, description: 'Товар не знайдений' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productsService.delete(id);
  }

  /**
   * Додати зображення до товару (Admin only)
   */
  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Додати зображення до товару (Admin only)' })
  @ApiResponse({ status: 201, description: 'Зображення додано' })
  @ApiResponse({ status: 404, description: 'Товар не знайдений' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав' })
  async addImage(
    @Param('id') productId: string,
    @Body() body: { url: string; alt?: string; isMain?: boolean },
    @CurrentUser() user: any,
  ) {
    return this.productsService.addProductImage(
      productId,
      body.url,
      body.alt,
      body.isMain || false,
    );
  }

  /**
   * Видалити зображення товару (Admin only)
   */
  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Видалити зображення товару (Admin only)' })
  @ApiResponse({ status: 200, description: 'Зображення видалено' })
  @ApiResponse({ status: 404, description: 'Товар або зображення не знайдено' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав' })
  async removeImage(
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
    @CurrentUser() user: any,
  ) {
    return this.productsService.removeProductImage(productId, imageId);
  }

  /**
   * Оновити порядок зображень товару (Admin only)
   */
  @Patch(':id/images/order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Оновити порядок зображень товару (Admin only)' })
  @ApiResponse({ status: 200, description: 'Порядок оновлено' })
  @ApiResponse({ status: 404, description: 'Товар не знайдений' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав' })
  async updateImageOrder(
    @Param('id') productId: string,
    @Body() body: { imageOrders: { id: string; sortOrder: number }[] },
    @CurrentUser() user: any,
  ) {
    return this.productsService.updateProductImageOrder(productId, body.imageOrders);
  }

  /**
   * Встановити головне зображення товару (Admin only)
   */
  @Patch(':id/images/:imageId/main')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Встановити головне зображення товару (Admin only)' })
  @ApiResponse({ status: 200, description: 'Головне зображення встановлено' })
  @ApiResponse({ status: 404, description: 'Товар або зображення не знайдено' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав' })
  async setMainImage(
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
    @CurrentUser() user: any,
  ) {
    return this.productsService.setMainProductImage(productId, imageId);
  }
}
