import { Module } from '@nestjs/common';
import { NovaPoshtaController } from './nova-poshta.controller';
import { NovaPoshtaService } from './nova-poshta.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [NovaPoshtaController],
  providers: [NovaPoshtaService, PrismaService],
})
export class NovaPoshtaModule {}
