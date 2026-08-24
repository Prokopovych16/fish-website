import { IsString, IsOptional, IsEnum, IsArray, IsUrl, IsDateString } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { BlogStatus } from '@prisma/client';

export class CreateBlogPostDto {
  @ApiProperty({ example: 'Рецепт смачної риби' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'recept-smachnoyi-ribi' })
  @IsString()
  slug!: string;

  @ApiPropertyOptional({ example: 'Короткий опис посту' })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({ example: '<p>...</p>' })
  @IsString()
  content!: string;

  @ApiPropertyOptional({ example: 'https://...' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ example: 'Команда ФОП Валігура' })
  @IsOptional()
  @IsString()
  authorName?: string;

  @ApiPropertyOptional({ enum: BlogStatus })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'SEO title' })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'SEO description' })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ example: '2026-05-06T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
