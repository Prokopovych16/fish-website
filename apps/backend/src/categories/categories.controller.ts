import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, CurrentUser } from '../common/decorators';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  /**
   * Отримати всі категорії з деревовідною структурою
   * Public endpoint
   */
  @Get()
  @ApiOperation({ summary: 'Отримати всі категорії з вложеністю' })
  @ApiResponse({ status: 200, description: 'Список категорій' })
  async findAll(@Query('includeInactive') includeInactive?: string) {
    const include = includeInactive === 'true';
    return this.categoriesService.findAll(include);
  }

  /**
   * Отримати категорію за ID
   * Public endpoint
   */
  @Get('by-id/:id')
  @ApiOperation({ summary: 'Отримати категорію за ID' })
  @ApiResponse({ status: 200, description: 'Дані категорії' })
  @ApiResponse({ status: 404, description: 'Категорія не знайдена' })
  async findById(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  /**
   * Отримати категорії для dropdown (flat) — must be before :slug to avoid route conflict
   * Public endpoint
   */
  @Get('options/flat')
  @ApiOperation({ summary: 'Отримати категорії для dropdown' })
  async findAllFlat() {
    return this.categoriesService.findAllFlat();
  }

  /**
   * Отримати категорію за slug
   * Public endpoint
   */
  @Get(':slug')
  @ApiOperation({ summary: 'Отримати категорію за slug' })
  @ApiResponse({ status: 200, description: 'Дані категорії' })
  @ApiResponse({ status: 404, description: 'Категорія не знайдена' })
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  /**
   * Створити нову категорію
   * Тільки для ADMIN та SUPER_ADMIN
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Створити нову категорію (Admin only)' })
  @ApiResponse({ status: 201, description: 'Категорія створена' })
  @ApiResponse({ status: 400, description: 'Невірні дані' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав' })
  async create(@Body() createCategoryDto: CreateCategoryDto, @CurrentUser() user: any) {
    return this.categoriesService.create(createCategoryDto);
  }

  /**
   * Оновити категорію
   * Тільки для ADMIN та SUPER_ADMIN
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Оновити категорію (Admin only)' })
  @ApiResponse({ status: 200, description: 'Категорія оновлена' })
  @ApiResponse({ status: 404, description: 'Категорія не знайдена' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() user: any,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  /**
   * Видалити категорію
   * Тільки для ADMIN та SUPER_ADMIN
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Видалити категорію (Admin only)' })
  @ApiResponse({ status: 200, description: 'Категорія видалена' })
  @ApiResponse({ status: 404, description: 'Категорія не знайдена' })
  @ApiResponse({ status: 400, description: 'Не можна видалити категорію з товарами' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.categoriesService.delete(id);
  }
}
