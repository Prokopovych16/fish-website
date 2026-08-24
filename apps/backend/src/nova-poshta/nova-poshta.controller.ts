import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NovaPoshtaService } from './nova-poshta.service';

@ApiTags('Nova Poshta')
@Controller('nova-poshta')
export class NovaPoshtaController {
  constructor(private novaPoshtaService: NovaPoshtaService) {}

  @Get('cities')
  @ApiOperation({ summary: 'Пошук міст Нової Пошти' })
  async getCities(@Query('search') search: string) {
    return this.novaPoshtaService.getCities(search);
  }

  @Get('branches')
  @ApiOperation({ summary: 'Відділення Нової Пошти в місті' })
  async getBranches(@Query('cityRef') cityRef: string, @Query('search') search?: string) {
    return this.novaPoshtaService.getBranches(cityRef, search);
  }
}
