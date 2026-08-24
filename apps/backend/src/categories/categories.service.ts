import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Генерувати slug з назви категорії
   * Приклад: "Свіжа Риба" → "svija-riba"
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // видалити спецсимволи
      .replace(/\s+/g, '-') // пробіли → дефіси
      .replace(/-+/g, '-'); // множинні дефіси → один
  }

  /**
   * Рекурсивно отримати категорію з дітьми
   */
  private async getCategoryWithChildren(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!category) {
      return null;
    }

    // Рекурсивно отримати дітей дітей
    if (category.children.length > 0) {
      for (const child of category.children) {
        const childWithGrandchildren = await this.getCategoryWithChildren(child.id);
        Object.assign(child, childWithGrandchildren);
      }
    }

    return category;
  }

  /**
   * Отримати всі категорії з деревом
   */
  async findAll(includeInactive = false) {
    /**
     * Отримує тільки категорії верхнього рівня (без батька)
     * та їх дітей рекурсивно
     */
    const whereCondition = includeInactive ? {} : { isActive: true };

    const rootCategories = await this.prisma.category.findMany({
      where: {
        ...whereCondition,
        parentId: null,
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          where: whereCondition,
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    // Заповнити дітей дітей для кожної корневої категорії
    const categoriesWithNesting = await Promise.all(
      rootCategories.map(async (category) => {
        if (category.children.length > 0) {
          for (const child of category.children) {
            const childWithGrandchildren = await this.getCategoryWithChildren(child.id);
            Object.assign(child, childWithGrandchildren);
          }
        }
        return category;
      }),
    );

    return categoriesWithNesting;
  }

  /**
   * Отримати категорію за ID з дітьми
   */
  async findById(id: string) {
    const category = await this.getCategoryWithChildren(id);
    if (!category) {
      throw new NotFoundException(`Категорія з ID ${id} не знайдена`);
    }
    return category;
  }

  /**
   * Отримати категорію за slug
   */
  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Категорія зі slug "${slug}" не знайдена`);
    }

    return category;
  }

  /**
   * Створити нову категорію
   */
  async create(createCategoryDto: CreateCategoryDto) {
    const { name, slug, parentId, ...data } = createCategoryDto;

    // Перевірити унікальність slug
    const slugToUse = slug || this.generateSlug(name);
    const existingSlug = await this.prisma.category.findUnique({
      where: { slug: slugToUse },
    });

    if (existingSlug) {
      throw new BadRequestException(`Категорія зі slug "${slugToUse}" вже існує`);
    }

    // Якщо вказаний батько, перевірити його існування
    if (parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new BadRequestException(`Категорія-батько з ID ${parentId} не знайдена`);
      }
    }

    const category = await this.prisma.category.create({
      data: {
        name,
        slug: slugToUse,
        parentId,
        ...data,
      },
      include: {
        children: true,
      },
    });

    return category;
  }

  /**
   * Оновити категорію
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Категорія з ID ${id} не знайдена`);
    }

    const { name, slug, parentId, ...data } = updateCategoryDto;

    // Якщо змінюється slug, перевірити унікальність
    if (slug && slug !== category.slug) {
      const existingSlug = await this.prisma.category.findUnique({
        where: { slug },
      });
      if (existingSlug) {
        throw new BadRequestException(`Категорія зі slug "${slug}" вже існує`);
      }
    }

    // Якщо змінюється батько, перевірити його існування
    if (parentId && parentId !== category.parentId) {
      if (parentId === id) {
        throw new BadRequestException('Категорія не може бути батьком сама для себе');
      }

      const parent = await this.prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new BadRequestException(`Категорія-батько з ID ${parentId} не знайдена`);
      }

      // Перевірити циклічні посилання
      let currentParent = parent;
      while (currentParent.parentId) {
        if (currentParent.parentId === id) {
          throw new BadRequestException('Виявлено циклічне посилання в деревовідної структури');
        }
        const nextParent = await this.prisma.category.findUnique({
          where: { id: currentParent.parentId },
        });
        if (!nextParent) break;
        currentParent = nextParent;
      }
    }

    const slugToUse = slug ? slug : name ? this.generateSlug(name) : category.slug;

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: {
        name: name || category.name,
        slug: slugToUse,
        parentId: parentId !== undefined ? parentId : category.parentId,
        ...data,
      },
      include: {
        children: true,
      },
    });

    return updatedCategory;
  }

  /**
   * Видалити категорію
   * Якщо категорія має дітей, видалити їх також (cascade)
   */
  async delete(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Категорія з ID ${id} не знайдена`);
    }

    if (category._count.products > 0) {
      throw new BadRequestException(
        `Не можна видалити категорію з товарами. Спочатку видаліть ${category._count.products} товарів.`,
      );
    }

    // Видалити всіх дітей (вони не мають товарів)
    await this.prisma.category.deleteMany({
      where: { parentId: id },
    });

    // Видалити саму категорію
    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Категорія успішно видалена' };
  }

  /**
   * Отримати всі категорії для dropdown (без деревої структури)
   */
  async findAllFlat() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
      },
      orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }],
    });
  }
}
