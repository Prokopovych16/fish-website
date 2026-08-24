import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFaqDto, UpdateFaqDto, FilterFaqDto } from './dto';

@Injectable()
export class FaqService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateFaqDto) {
    return this.prisma.faq.create({
      data: {
        question: data.question,
        answer: data.answer,
        category: data.category,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  }

  async findAll(filter: FilterFaqDto) {
    const { category, isActive, page = 1, limit = 50 } = filter;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive;
    return this.prisma.faq.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      skip,
      take: limit,
    });
  }

  async findById(id: string) {
    const faq = await this.prisma.faq.findUnique({ where: { id } });
    if (!faq) {
      throw new NotFoundException(`FAQ з ID ${id} не знайдено`);
    }
    return faq;
  }

  async update(id: string, data: UpdateFaqDto) {
    await this.findById(id);
    return this.prisma.faq.update({
      where: { id },
      data: {
        question: data.question,
        answer: data.answer,
        category: data.category,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.faq.delete({ where: { id } });
    return { message: 'FAQ видалено' };
  }
}
