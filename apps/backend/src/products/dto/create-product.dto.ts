import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsString()
  categoryId!: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  oldPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  discountPercent?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock!: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weight?: number;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  catchMethod?: string;

  @IsOptional()
  @IsString()
  storageConditions?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  expiryDays?: number;

  @IsOptional()
  @IsString()
  composition?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  calories?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  proteins?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  fats?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  carbs?: number;

  @IsOptional()
  @IsBoolean()
  isHaccp?: boolean;

  @IsOptional()
  @IsArray()
  badges?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsString()
  seoKeywords?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}
