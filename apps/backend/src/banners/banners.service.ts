import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto, UpdateBannerDto } from './dto';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateBannerDto) {
    return this.prisma.banner.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        buttonText: data.buttonText,
        buttonLink: data.buttonLink,
        image: data.image,
        imageMobile: data.imageMobile,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
      },
    });
  }

  async findAll(includeInactive = false) {
    return this.prisma.banner.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findById(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Банер з ID ${id} не знайдено`);
    }
    return banner;
  }

  async update(id: string, data: UpdateBannerDto) {
    await this.findById(id);
    return this.prisma.banner.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        buttonText: data.buttonText,
        buttonLink: data.buttonLink,
        image: data.image,
        imageMobile: data.imageMobile,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.banner.delete({ where: { id } });
    return { message: 'Банер видалено' };
  }
}
