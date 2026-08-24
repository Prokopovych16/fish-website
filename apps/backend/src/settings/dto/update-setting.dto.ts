import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingDto {
  @ApiPropertyOptional({ description: 'Ключ налаштування (з URL або тіла)' })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional({ description: 'Значення налаштування', example: 'Fish Shop' })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional({ description: 'Лейбл для адмінки', example: 'Назва сайту' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: 'Група налаштувань', example: 'general' })
  @IsOptional()
  @IsString()
  group?: string;
}