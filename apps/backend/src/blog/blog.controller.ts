import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreateBlogPostDto, UpdateBlogPostDto, FilterBlogPostsDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @ApiOperation({ summary: 'Отримати всі публікації блогу' })
  @ApiResponse({ status: 200, description: 'Список публікацій' })
  async findAll(@Query() filter: FilterBlogPostsDto) {
    return this.blogService.findAll(filter);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Отримати публікацію за slug' })
  @ApiResponse({ status: 200, description: 'Публікація знайдена' })
  @ApiResponse({ status: 404, description: 'Публікацію не знайдено' })
  async findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати публікацію за ID' })
  @ApiResponse({ status: 200, description: 'Публікація знайдена' })
  @ApiResponse({ status: 404, description: 'Публікацію не знайдено' })
  async findById(@Param('id') id: string) {
    return this.blogService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Створити публікацію' })
  @ApiResponse({ status: 201, description: 'Публікацію створено' })
  async create(@Body() createBlogPostDto: CreateBlogPostDto) {
    return this.blogService.create(createBlogPostDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Оновити публікацію' })
  @ApiResponse({ status: 200, description: 'Публікацію оновлено' })
  async update(@Param('id') id: string, @Body() updateBlogPostDto: UpdateBlogPostDto) {
    return this.blogService.update(id, updateBlogPostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Видалити публікацію' })
  @ApiResponse({ status: 200, description: 'Публікацію видалено' })
  async remove(@Param('id') id: string) {
    return this.blogService.delete(id);
  }
}
