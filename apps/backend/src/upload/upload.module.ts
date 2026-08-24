import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads', // тимчасова папка для multer
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService], // експортуємо сервіс для використання в інших модулях
})
export class UploadModule {}