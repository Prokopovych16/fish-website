import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { CreateReviewDto, UpdateReviewDto, FilterReviewsDto } from './dto';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private loyaltyService: LoyaltyService,
  ) {}

  async create(createReviewDto: CreateReviewDto, userId?: string, isAdmin = false) {
    const product = await this.prisma.product.findUnique({
      where: { id: createReviewDto.productId },
    });

    if (!product) {
      throw new BadRequestException(`Товар з ID ${createReviewDto.productId} не знайдено`);
    }

    if (!product.isActive) {
      throw new BadRequestException('Неможливо залишити відгук для неактивного товару');
    }

    if (userId && !isAdmin) {
      const existing = await this.prisma.review.findFirst({
        where: { productId: createReviewDto.productId, userId },
      });
      if (existing) {
        throw new BadRequestException('Ви вже залишили відгук для цього товару');
      }
    }

    return this.prisma.review.create({
      data: {
        productId: createReviewDto.productId,
        userId,
        authorName: createReviewDto.authorName,
        authorCity: createReviewDto.authorCity,
        authorAvatar: createReviewDto.authorAvatar,
        rating: createReviewDto.rating,
        title: createReviewDto.title,
        text: createReviewDto.text,
        images: createReviewDto.images || [],
        // Admin-only fields: ignored for regular users to prevent moderation bypass
        isVerified: isAdmin ? (createReviewDto.isVerified ?? false) : false,
        isFake: isAdmin ? (createReviewDto.isFake ?? false) : false,
        status: isAdmin ? (createReviewDto.status ?? 'PENDING') : 'PENDING',
        adminNote: isAdmin ? createReviewDto.adminNote : undefined,
        sortOrder: isAdmin ? (createReviewDto.sortOrder ?? 0) : 0,
      },
    });
  }

  async findPublishedByProduct(productId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId, status: 'PUBLISHED' },
        orderBy: { sortOrder: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where: { productId, status: 'PUBLISHED' } }),
    ]);

    return {
      data: reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findPublished(limit = 6) {
    return this.prisma.review.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
  }

  async findAll(filter: FilterReviewsDto) {
    const { productId, status, page = 1, limit = 20 } = filter;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (productId) where.productId = productId;
    if (status) where.status = status;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          product: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Відгук з ID ${id} не знайдено`);
    }

    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto) {
    const existing = await this.findById(id);

    const updated = await this.prisma.review.update({
      where: { id },
      data: {
        authorName: updateReviewDto.authorName,
        authorCity: updateReviewDto.authorCity,
        authorAvatar: updateReviewDto.authorAvatar,
        rating: updateReviewDto.rating,
        title: updateReviewDto.title,
        text: updateReviewDto.text,
        images: updateReviewDto.images,
        isVerified: updateReviewDto.isVerified,
        isFake: updateReviewDto.isFake,
        status: updateReviewDto.status,
        adminNote: updateReviewDto.adminNote,
        sortOrder: updateReviewDto.sortOrder,
      },
    });

    // Нарахувати бонус за відгук, якщо адмін щойно опублікував реальний відгук
    const wasPublished = existing.status !== 'PUBLISHED' && updateReviewDto.status === 'PUBLISHED';
    if (wasPublished && !existing.isFake && existing.userId) {
      this.loyaltyService.giveReviewBonus(existing.userId).catch(err =>
        console.error('Помилка нарахування бонусу за відгук:', err.message),
      );
    }

    return updated;
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.review.delete({ where: { id } });
    return { message: 'Відгук успішно видалено' };
  }
}