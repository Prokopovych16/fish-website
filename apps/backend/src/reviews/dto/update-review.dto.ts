import { PartialType } from '@nestjs/swagger';
import { CreateReviewDto } from './create-review.dto';
import { IsOptional, IsEnum, IsBoolean, IsInt, Min, Max, IsString, IsArray, IsUrl } from 'class-validator';
import { ReviewStatus } from '@prisma/client';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isFake?: boolean;

  @IsOptional()
  @IsString()
  adminNote?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];
}
