import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogPostDto, UpdateBlogPostDto, FilterBlogPostsDto } from './dto';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateBlogPostDto) {
    return this.prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        image: data.image,
        authorName: data.authorName,
        status: data.status ?? 'DRAFT',
        tags: data.tags || [],
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      },
    });
  }

  async findAll(filter: FilterBlogPostsDto) {
    const { status, page = 1, limit = 20, search } = filter;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.blogPost.count({ where }),
    ]);
    return {
      data: posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Внутрішня перевірка існування (для admin update/delete) — без фільтра по статусу
   */
  private async findByIdInternal(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException(`Публікація з ID ${id} не знайдена`);
    return post;
  }

  /**
   * Публічний доступ за ID — тільки опубліковані пости
   */
  async findById(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post || post.status !== 'PUBLISHED') {
      throw new NotFoundException(`Публікація з ID ${id} не знайдена`);
    }
    return post;
  }

  /**
   * Публічний доступ за slug — тільки опубліковані пости
   */
  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post || post.status !== 'PUBLISHED') {
      throw new NotFoundException(`Публікація зі slug "${slug}" не знайдена`);
    }
    return post;
  }

  async update(id: string, data: UpdateBlogPostDto) {
    await this.findByIdInternal(id);
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        image: data.image,
        authorName: data.authorName,
        status: data.status,
        tags: data.tags,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
      },
    });
  }

  async delete(id: string) {
    await this.findByIdInternal(id);
    await this.prisma.blogPost.delete({ where: { id } });
    return { message: 'Публікацію видалено' };
  }
}
