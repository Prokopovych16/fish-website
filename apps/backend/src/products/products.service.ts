import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateProductDto, UpdateProductDto, FilterProductsDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  /**
   * Генерувати slug з назви товару
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * Отримати всі товари з фільтрацією, пошуком та пагінацією (публічно)
   */
  async findAll(filterDto: FilterProductsDto) {
    const {
      search,
      categoryId,
      category: categorySlug,
      minPrice,
      maxPrice,
      tags,
      sort,
      sortBy,
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      onlyActive = true,
      inStock,
      minimal,
    } = filterDto;

    const skip = (page - 1) * limit;

    // Побудова фільтру
    const where: any = {};

    if (onlyActive !== false) {
      where.isActive = true;
    }

    // Фільтр категорії за slug (storefront) або ID (admin)
    if (categorySlug) {
      const cat = await this.prisma.category.findUnique({ where: { slug: categorySlug }, select: { id: true } });
      if (cat) where.categoryId = cat.id;
    } else if (categoryId) {
      where.categoryId = categoryId;
    }

    if (inStock) {
      where.stock = { gt: 0 };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            slug: { in: tags },
          },
        },
      };
    }

    // Resolve combined `sort` param (price_asc, price_desc, newest, popular, rating)
    let resolvedSortBy = sortBy ?? 'newest';
    let resolvedSortOrder: 'asc' | 'desc' = sortOrder ?? 'desc';
    if (sort) {
      switch (sort) {
        case 'price_asc':  resolvedSortBy = 'price';  resolvedSortOrder = 'asc';  break;
        case 'price_desc': resolvedSortBy = 'price';  resolvedSortOrder = 'desc'; break;
        case 'newest':     resolvedSortBy = 'newest'; resolvedSortOrder = 'desc'; break;
        case 'popular':    resolvedSortBy = 'popular';resolvedSortOrder = 'desc'; break;
        case 'rating':     resolvedSortBy = 'rating'; resolvedSortOrder = 'desc'; break;
      }
    }

    // Сортування
    let orderBy: any = {};
    switch (resolvedSortBy) {
      case 'price':
        orderBy.price = resolvedSortOrder;
        break;
      case 'popular':
        orderBy.viewCount = resolvedSortOrder;
        break;
      case 'rating':
        orderBy.soldCount = resolvedSortOrder;
        break;
      case 'newest':
      default:
        orderBy.createdAt = resolvedSortOrder;
    }

    // Отримати товари
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            where: { isMain: true },
            take: 1,
          },
          ...(minimal
            ? {}
            : {
                tags: { include: { tag: true } },
                _count: { select: { reviews: { where: { status: 'PUBLISHED' } } } },
              }),
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Отримати товар за ID (публічно)
   */
  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        reviews: {
          where: { status: 'PUBLISHED' },
          take: 50,
          select: { rating: true, id: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Товар з ID ${id} не знайдений`);
    }

    // Збільшити лічильник переглядів
    await this.prisma.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return this.withComputedRating(product);
  }

  /**
   * Отримати товар за slug (публічно)
   */
  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        reviews: {
          where: { status: 'PUBLISHED' },
          take: 50,
          select: { rating: true, id: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Товар зі slug "${slug}" не знайдений`);
    }

    // Збільшити лічильник переглядів
    await this.prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    return this.withComputedRating(product);
  }

  private withComputedRating(product: any) {
    const reviews: { rating: number }[] = product.reviews ?? [];
    const reviewsCount = reviews.length;
    const avgRating = reviewsCount > 0
      ? Math.round((reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviewsCount) * 10) / 10
      : null;
    return { ...product, rating: avgRating, reviewsCount };
  }

  /**
   *创建товар (Admin only)
   */
  async create(createProductDto: CreateProductDto) {
    const { name, slug, categoryId, tags, ...data } = createProductDto;

    // Перевірити категорію
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new BadRequestException(`Категорія з ID ${categoryId} не знайдена`);
    }

    // Перевірити унікальність slug
    const slugToUse = slug || this.generateSlug(name);
    const existingSlug = await this.prisma.product.findUnique({
      where: { slug: slugToUse },
    });

    if (existingSlug) {
      throw new BadRequestException(`Товар зі slug "${slugToUse}" вже існує`);
    }

    const product = await this.prisma.product.create({
      data: {
        name,
        slug: slugToUse,
        categoryId,
        ...data,
      },
      include: {
        category: true,
        images: true,
        tags: true,
      },
    });

    // Додати теги якщо вказані
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const slug = this.generateSlug(tagName);
        let tag = await this.prisma.tag.findUnique({
          where: { slug },
        });

        if (!tag) {
          tag = await this.prisma.tag.create({
            data: {
              name: tagName,
              slug,
            },
          });
        }

        await this.prisma.productTag.create({
          data: {
            productId: product.id,
            tagId: tag.id,
          },
        });
      }
    }

    return this.findById(product.id);
  }

  /**
   * Оновити товар (Admin only)
   */
  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Товар з ID ${id} не знайдений`);
    }

    const { name, slug, categoryId, tags, ...data } = updateProductDto;

    // Якщо змінюється категорія, перевірити її існування
    if (categoryId && categoryId !== product.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        throw new BadRequestException(`Категорія з ID ${categoryId} не знайдена`);
      }
    }

    // Якщо змінюється slug, перевірити унікальність
    const slugToUse = slug ? slug : name ? this.generateSlug(name) : product.slug;
    if (slugToUse !== product.slug) {
      const existingSlug = await this.prisma.product.findUnique({
        where: { slug: slugToUse },
      });
      if (existingSlug) {
        throw new BadRequestException(`Товар зі slug "${slugToUse}" вже існує`);
      }
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        name: name || product.name,
        slug: slugToUse,
        categoryId: categoryId || product.categoryId,
        ...data,
      },
      include: {
        category: true,
        images: true,
        tags: true,
      },
    });

    // Оновити теги якщо вказані
    if (tags && tags.length > 0) {
      // Видалити старі теги
      await this.prisma.productTag.deleteMany({
        where: { productId: id },
      });

      // Додати нові теги
      for (const tagName of tags) {
        const slug = this.generateSlug(tagName);
        let tag = await this.prisma.tag.findUnique({
          where: { slug },
        });

        if (!tag) {
          tag = await this.prisma.tag.create({
            data: {
              name: tagName,
              slug,
            },
          });
        }

        await this.prisma.productTag.create({
          data: {
            productId: id,
            tagId: tag.id,
          },
        });
      }
    }

    return this.findById(id);
  }

  /**
   * Видалити товар (Admin only)
   */
  async delete(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Товар з ID ${id} не знайдений`);
    }

    // Видалити всі асоціації
    await this.prisma.productTag.deleteMany({
      where: { productId: id },
    });

    await this.prisma.productImage.deleteMany({
      where: { productId: id },
    });

    // Видалити товар
    await this.prisma.product.delete({
      where: { id },
    });

    return { message: 'Товар успішно видалений' };
  }

  /**
   * Отримати товари за категорією (публічно)
   */
  async findByCategory(categoryId: string, limit = 10) {
    return this.prisma.product.findMany({
      where: {
        categoryId,
        isActive: true,
      },
      include: {
        category: true,
        images: {
          where: { isMain: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Отримати хітові товари (публічно)
   */
  async getFeatured(limit = 10) {
    return this.prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
      },
      include: {
        category: true,
        images: {
          where: { isMain: true },
          take: 1,
        },
      },
      orderBy: { sortOrder: 'asc' },
      take: limit,
    });
  }

  /**
   * Отримати схожі товари (публічно)
   */
  async getSimilar(productId: string, limit = 5) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Товар з ID ${productId} не знайдений`);
    }

    return this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId },
        isActive: true,
      },
      include: {
        category: true,
        images: {
          where: { isMain: true },
          take: 1,
        },
      },
      take: limit,
    });
  }

  /**
   * Додати зображення до товару (Admin only)
   */
  async addProductImage(productId: string, imageUrl: string, alt?: string, isMain = false) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Товар з ID ${productId} не знайдений`);
    }

    // Якщо це головне зображення, зняти позначку з інших
    if (isMain) {
      await this.prisma.productImage.updateMany({
        where: { productId },
        data: { isMain: false },
      });
    }

    // Отримати максимальний sortOrder
    const maxSortOrder = await this.prisma.productImage.findFirst({
      where: { productId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const nextSortOrder = (maxSortOrder?.sortOrder || 0) + 1;

    const productImage = await this.prisma.productImage.create({
      data: {
        productId,
        url: imageUrl,
        alt: alt || product.name,
        sortOrder: nextSortOrder,
        isMain,
      },
    });

    return productImage;
  }

  /**
   * Видалити зображення товару (Admin only)
   */
  async removeProductImage(productId: string, imageId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Товар з ID ${productId} не знайдений`);
    }

    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.productId !== productId) {
      throw new NotFoundException(`Зображення не знайдено`);
    }

    // Видалити файл з файлової системи
    await this.uploadService.deleteImage(image.url);

    // Видалити запис з БД
    await this.prisma.productImage.delete({
      where: { id: imageId },
    });

    return { message: 'Зображення успішно видалено' };
  }

  /**
   * Оновити порядок зображень товару (Admin only)
   */
  async updateProductImageOrder(productId: string, imageOrders: { id: string; sortOrder: number }[]) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Товар з ID ${productId} не знайдений`);
    }

    // Оновити порядок для кожного зображення
    for (const { id, sortOrder } of imageOrders) {
      await this.prisma.productImage.updateMany({
        where: { id, productId },
        data: { sortOrder },
      });
    }

    return { message: 'Порядок зображень оновлено' };
  }

  /**
   * Встановити головне зображення товару (Admin only)
   */
  async setMainProductImage(productId: string, imageId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Товар з ID ${productId} не знайдений`);
    }

    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.productId !== productId) {
      throw new NotFoundException(`Зображення не знайдено`);
    }

    // Зняти позначку з усіх зображень
    await this.prisma.productImage.updateMany({
      where: { productId },
      data: { isMain: false },
    });

    // Встановити головне зображення
    await this.prisma.productImage.update({
      where: { id: imageId },
      data: { isMain: true },
    });

    return { message: 'Головне зображення встановлено' };
  }
}
