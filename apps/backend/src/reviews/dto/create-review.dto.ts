import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional, IsArray, IsUrl, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';

export class CreateReviewDto {
  @ApiProperty({ description: 'ID товару', example: 'cl9q0zt6j0000kr3q9a1c3z69' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ description: 'Ім’я автора відгуку', example: 'Олег' })
  @IsString()
  @IsNotEmpty()
  authorName!: string;

  @ApiPropertyOptional({ description: 'Місто автора', example: 'Київ' })
  @IsOptional()
  @IsString()
  authorCity?: string;

  @ApiPropertyOptional({ description: 'Аватар автора', example: 'https://...' })
  @IsOptional()
  @IsUrl()
  authorAvatar?: string;

  @ApiProperty({ description: 'Рейтинг відгуку', example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ description: 'Заголовок відгуку', example: 'Чудовий товар' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Текст відгуку', example: 'М’яка, свіжа риба, доставили швидко.' })
  @IsString()
  @IsNotEmpty()
  text!: string;

  @ApiPropertyOptional({ description: 'Фото у відгуку', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Статус відгуку (тільки для адміна)', enum: ReviewStatus })
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;

  @ApiPropertyOptional({ description: 'Перевірена покупка (тільки для адміна)' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'Адмінський відгук (isFake)' })
  @IsOptional()
  @IsBoolean()
  isFake?: boolean;

  @ApiPropertyOptional({ description: 'Нотатка адміна' })
  @IsOptional()
  @IsString()
  adminNote?: string;

  @ApiPropertyOptional({ description: 'Порядок сортування' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}