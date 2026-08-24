import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FlashSalesService } from './flash-sales.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Flash Sales')
@Controller('flash-sales')
export class FlashSalesController {
  constructor(private flashSalesService: FlashSalesService) {}

  @Get('active')
  @ApiOperation({ summary: 'Поточний активний флеш-розпродаж (публічний)' })
  async findActive() {
    return this.flashSalesService.findActive();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Всі флеш-розпродажі (адмін)' })
  async findAll() {
    return this.flashSalesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  async findById(@Param('id') id: string) {
    return this.flashSalesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Створити флеш-розпродаж (адмін)' })
  async create(@Body() body: any) {
    return this.flashSalesService.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() body: any) {
    return this.flashSalesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return this.flashSalesService.remove(id);
  }
}
