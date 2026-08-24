import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { AppService } from './app.service';
import { EmailService } from './email/email.service';

class ContactDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  subject!: string;

  @IsString()
  @MinLength(10, { message: 'Повідомлення занадто коротке' })
  message!: string;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly emailService: EmailService,
  ) {}

  @Get('health')
  health() {
    return this.appService.health();
  }

  @Post('contact')
  @HttpCode(200)
  async contact(@Body() dto: ContactDto) {
    await this.emailService.sendContactMessage(dto);
    return { message: 'Повідомлення надіслано. Ми зв\'яжемося з вами найближчим часом!' };
  }
}
