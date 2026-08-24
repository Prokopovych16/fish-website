import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FlashSalesService } from './flash-sales.service';
import { FlashSalesController } from './flash-sales.controller';

@Module({
  imports: [PrismaModule],
  providers: [FlashSalesService],
  controllers: [FlashSalesController],
  exports: [FlashSalesService],
})
export class FlashSalesModule {}
