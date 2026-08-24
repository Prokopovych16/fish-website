import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

@Injectable()
export class UploadService {
  private uploadsDir: string;
  private uploadsUrl: string;

  constructor(private configService: ConfigService) {
    this.uploadsDir = this.configService.get<string>('UPLOADS_DIR') || './uploads';
    this.uploadsUrl = this.configService.get<string>('UPLOADS_URL') || 'http://localhost:4000/uploads';

    // Створити папку uploads якщо не існує
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Завантажити та оптимізувати зображення
   * Розпізнає формат, перетворює у WebP та резмір
   */
  async uploadImage(
    file: Express.Multer.File,
    options?: {
      width?: number;
      height?: number;
      quality?: number;
    },
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('Файл не було завантажено');
    }

    // Перевірити тип файлу
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Дозволені тільки зображення (JPEG, PNG, WebP, GIF)');
    }

    // Перевірити розмір (макс 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Розмір файлу не повинен перевищувати 5MB');
    }

    try {
      // Генерувати унікальне ім'я файлу
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const filename = `${timestamp}-${randomStr}.webp`;
      const filepath = path.join(this.uploadsDir, filename);

      // Оптимізувати зображення через Sharp
      let pipeline = sharp(file.buffer);

      // Resize якщо вказано
      if (options?.width || options?.height) {
        pipeline = pipeline.resize(options.width || 1000, options.height || 1000, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Конвертувати в WebP з оптимізацією
      await pipeline
        .webp({ quality: options?.quality || 80 })
        .toFile(filepath);

      // Повернути URL файлу
      return `${this.uploadsUrl}/${filename}`;
    } catch (error) {
      throw new BadRequestException(`Помилка при завантаженні файлу: ${(error as Error).message}`);
    }
  }

  /**
   * Завантажити множинні зображення
   */
  async uploadMultiple(
    files: Express.Multer.File[],
    options?: {
      width?: number;
      height?: number;
      quality?: number;
    },
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Файли не було завантажено');
    }

    const urls: string[] = [];

    for (const file of files) {
      const url = await this.uploadImage(file, options);
      urls.push(url);
    }

    return urls;
  }

  /**
   * Видалити зображення за URL
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const filename = path.basename(imageUrl.split('/').pop() || '');
      if (!filename || filename.startsWith('.')) return;

      const filepath = path.join(this.uploadsDir, filename);
      const resolvedFilepath = path.resolve(filepath);
      const resolvedUploadsDir = path.resolve(this.uploadsDir);
      if (!resolvedFilepath.startsWith(resolvedUploadsDir + path.sep)) return;

      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch (error) {
      // Не кидаємо помилку - може бути помилка з локаль
      console.error(`Помилка при видаленні файлу: ${(error as Error).message}`);
    }
  }

  /**
   * Видалити множинні зображення
   */
  async deleteMultiple(imageUrls: string[]): Promise<void> {
    for (const url of imageUrls) {
      await this.deleteImage(url);
    }
  }
}
