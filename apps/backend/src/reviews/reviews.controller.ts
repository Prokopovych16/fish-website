import { Controller, Get, Post, Body, Param, Query, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto, FilterReviewsDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Додати відгук до товару' })
  @ApiResponse({ status: 201, description: 'Відгук створено' })
  @ApiResponse({ status: 400, description: 'Невірні дані' })
  async create(@Body() createReviewDto: CreateReviewDto, @CurrentUser() user: any) {
    const isAdmin = user && ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(user.role);
    return this.reviewsService.create(createReviewDto, user?.id, isAdmin);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Отримати опубліковані відгуки для товару' })
  @ApiResponse({ status: 200, description: 'Список відгуків' })
  async findPublishedByProduct(
    @Param('productId') productId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.findPublishedByProduct(
      productId,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Get('published')
  @ApiOperation({ summary: 'Отримати опубліковані відгуки для головної сторінки' })
  @ApiResponse({ status: 200, description: 'Список відгуків' })
  async findPublished(@Query('limit') limit?: string) {
    return this.reviewsService.findPublished(Number(limit) || 6);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отримати всі відгуки (admin)' })
  @ApiResponse({ status: 200, description: 'Список відгуків' })
  async findAll(@Query() filter: FilterReviewsDto) {
    return this.reviewsService.findAll(filter);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Оновити відгук' })
  @ApiResponse({ status: 200, description: 'Відгук оновлено' })
  async update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(id, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Видалити відгук' })
  @ApiResponse({ status: 200, description: 'Відгук видалено' })
  async delete(@Param('id') id: string) {
    return this.reviewsService.delete(id);
  }
}