import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersModule } from '../orders/orders.module';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { WayForPayProvider } from './providers/wayforpay.provider';
import { LiqpayProvider } from './providers/liqpay.provider';

@Module({
  imports: [PrismaModule, OrdersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, WayForPayProvider, LiqpayProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
