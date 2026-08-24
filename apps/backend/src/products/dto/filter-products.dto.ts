import { IsOptional, IsString, IsNumber, IsArray, IsBoolean, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class FilterProductsDto {
  @IsOptional()
  @IsString()
  search?: string;

  /** Category by ID (legacy) */
  @IsOptional()
  @IsString()
  categoryId?: string;

  /** Category by slug (used by storefront) */
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsArray()
  tags?: string[];

  /** Combined sort: price_asc | price_desc | newest | popular | rating */
  @IsOptional()
  @IsString()
  sort?: string;

  /** sortBy + sortOrder (legacy, kept for admin) */
  @IsOptional()
  @IsString()
  sortBy?: 'price' | 'newest' | 'popular' | 'rating';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  onlyActive?: boolean;

  /** Filter by stock > 0 */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  inStock?: boolean;

  /** Полегшена відповідь без tags/_count.reviews — для адмінської таблиці товарів */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  minimal?: boolean;
}
