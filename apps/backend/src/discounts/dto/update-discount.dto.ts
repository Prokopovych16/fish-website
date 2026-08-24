import { PartialType } from '@nestjs/swagger';
import { CreateDiscountDto } from './create-discount.dto';
import { IsOptional, IsBoolean, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType } from '@prisma/client';

export class UpdateDiscountDto extends PartialType(CreateDiscountDto) {}

/**
 * DTO для фільтрації знижок
 */
export class FilterDiscountsDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsEnum(DiscountType)
  type?: DiscountType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}