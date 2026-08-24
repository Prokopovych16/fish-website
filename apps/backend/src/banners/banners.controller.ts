import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { CreateBannerDto, UpdateBannerDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @ApiOperation({ summary: 'Отримати всі банери' })
  @ApiResponse({ status: 200, description: 'Список банерів' })
  async findAll(@Query('includeInactive') includeInactive?: string) {
    return this.bannersService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати банер за ID' })
  @ApiResponse({ status: 200, description: 'Банер знайдено' })
  @ApiResponse({ status: 404, description: 'Банер не знайдено' })
  async findById(@Param('id') id: string) {
    return this.bannersService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Створити банер' })
  @ApiResponse({ status: 201, description: 'Банер створено' })
  async create(@Body() createBannerDto: CreateBannerDto) {
    return this.bannersService.create(createBannerDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Оновити банер' })
  @ApiResponse({ status: 200, description: 'Банер оновлено' })
  async update(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
    return this.bannersService.update(id, updateBannerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Видалити банер' })
  @ApiResponse({ status: 200, description: 'Банер видалено' })
  async remove(@Param('id') id: string) {
    return this.bannersService.delete(id);
  }
}
