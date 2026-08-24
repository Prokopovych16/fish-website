import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FaqService } from './faq.service';
import { CreateFaqDto, UpdateFaqDto, FilterFaqDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('FAQ')
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  @ApiOperation({ summary: 'Отримати всі FAQ' })
  @ApiResponse({ status: 200, description: 'Список FAQ' })
  async findAll(@Query() filter: FilterFaqDto) {
    return this.faqService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати FAQ за ID' })
  @ApiResponse({ status: 200, description: 'FAQ знайдено' })
  @ApiResponse({ status: 404, description: 'FAQ не знайдено' })
  async findById(@Param('id') id: string) {
    return this.faqService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Створити FAQ' })
  @ApiResponse({ status: 201, description: 'FAQ створено' })
  async create(@Body() createFaqDto: CreateFaqDto) {
    return this.faqService.create(createFaqDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Оновити FAQ' })
  @ApiResponse({ status: 200, description: 'FAQ оновлено' })
  async update(@Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto) {
    return this.faqService.update(id, updateFaqDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Видалити FAQ' })
  @ApiResponse({ status: 200, description: 'FAQ видалено' })
  async remove(@Param('id') id: string) {
    return this.faqService.delete(id);
  }
}
