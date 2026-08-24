import {
  Controller,
  Post,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, CurrentUser } from '../common/decorators';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  /**
   * Завантажити одне зображення
   * Admin only
   */
  @Post('image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Завантажити одне зображення' })
  @ApiResponse({ status: 201, description: 'Зображення завантажено' })
  @ApiResponse({ status: 400, description: 'Невірний файл' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('Файл не було завантажено');
    }

    const url = await this.uploadService.uploadImage(file, {
      width: 1000,
      height: 1000,
      quality: 80,
    });

    return {
      message: 'Зображення успішно завантажено',
      url,
    };
  }

  /**
   * Завантажити множинні зображення
   * Admin only
   */
  @Post('images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseInterceptors(FilesInterceptor('files', 10)) // максимум 10 файлів
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Завантажити множинні зображення (макс 10)' })
  @ApiResponse({ status: 201, description: 'Зображення завантажено' })
  @ApiResponse({ status: 400, description: 'Невірні файли' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Файли не було завантажено');
    }

    const urls = await this.uploadService.uploadMultiple(files, {
      width: 1000,
      height: 1000,
      quality: 80,
    });

    return {
      message: `${urls.length} зображень успішно завантажено`,
      urls,
    };
  }

  /**
   * Видалити зображення
   * Admin only
   */
  @Delete('image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Видалити зображення' })
  @ApiResponse({ status: 200, description: 'Зображення видалено' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  async deleteImage(@Body('url') url: string, @CurrentUser() user: any) {
    if (!url) {
      throw new BadRequestException('URL не вказаний');
    }

    await this.uploadService.deleteImage(url);

    return {
      message: 'Зображення успішно видалено',
    };
  }

  /**
   * Видалити множинні зображення
   * Admin only
   */
  @Delete('images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Видалити множинні зображення' })
  @ApiResponse({ status: 200, description: 'Зображення видалено' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  async deleteImages(@Body('urls') urls: string[], @CurrentUser() user: any) {
    if (!urls || urls.length === 0) {
      throw new BadRequestException('URLs не вказані');
    }

    await this.uploadService.deleteMultiple(urls);

    return {
      message: `${urls.length} зображень успішно видалено`,
    };
  }
}
