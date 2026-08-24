import { IsString, IsNumber, IsOptional, IsArray, IsEnum, Min, Max, ValidateNested, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, DeliveryMethod } from '@prisma/client';

export class OrderItemDto {
  @IsString()
  productId!: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity!: number;

  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;
}

export class CreateOrderDto {
  // Контактні дані
  @IsString()
  contactFirstName!: string;

  @IsString()
  contactLastName!: string;

  @IsString()
  contactPhone!: string;

  @IsEmail()
  contactEmail!: string;

  // Доставка
  @IsEnum(DeliveryMethod)
  deliveryMethod!: DeliveryMethod;

  @IsOptional()
  @IsString()
  npCityName?: string;

  @IsOptional()
  @IsString()
  npBranchName?: string;

  @IsOptional()
  @IsString()
  npBranchRef?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  // Оплата
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  // Знижки
  @IsOptional()
  @IsString()
  discountCode?: string;

  // Товари
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  // Коментар
  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
  status!: string;

  @IsOptional()
  @IsString()
  adminNote?: string;

  @IsOptional()
  @IsString()
  npTrackingNumber?: string;
}

export class FilterOrdersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
  status?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  deliveryMethod?: string;

  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}