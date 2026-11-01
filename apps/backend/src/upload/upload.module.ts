import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [
    MulterModule.register({
      // Тримаємо файл у пам'яті (file.buffer), Sharp сам зберігає оптимізований WebP
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // макс 5MB
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService], // експортуємо сервіс для використання в інших модулях
})
export class UploadModule {}
