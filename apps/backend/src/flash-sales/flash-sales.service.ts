import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FlashSalesService {
  constructor(private prisma: PrismaService) {}

  /** Поточний активний флеш-розпродаж (для публічного фронтенду) */
  async findActive() {
    const now = new Date();
    return this.prisma.flashSale.findFirst({
      where: {
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      include: {
        products: {
          include: {
            product: {
              include: { images: { where: { isMain: true }, take: 1 } },
            },
          },
        },
      },
      orderBy: { startsAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.flashSale.findMany({
      include: {
        products: {
          include: {
            product: { select: { id: true, name: true, price: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const sale = await this.prisma.flashSale.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              include: { images: { where: { isMain: true }, take: 1 } },
            },
          },
        },
      },
    });
    if (!sale) throw new NotFoundException('Флеш-розпродаж не знайдено');
    return sale;
  }

  async create(data: {
    name: string;
    startsAt: string;
    endsAt: string;
    isActive?: boolean;
    products: { productId: string; salePrice: number }[];
  }) {
    const { products, ...rest } = data;
    return this.prisma.flashSale.create({
      data: {
        ...rest,
        startsAt: new Date(rest.startsAt),
        endsAt: new Date(rest.endsAt),
        products: {
          create: products.map(p => ({
            productId: p.productId,
            salePrice: p.salePrice,
          })),
        },
      },
      include: { products: { include: { product: true } } },
    });
  }

  async update(id: string, data: {
    name?: string;
    startsAt?: string;
    endsAt?: string;
    isActive?: boolean;
    products?: { productId: string; salePrice: number }[];
  }) {
    const { products, ...rest } = data;
    await this.prisma.flashSale.findUniqueOrThrow({ where: { id } });

    if (products !== undefined) {
      await this.prisma.flashSaleProduct.deleteMany({ where: { flashSaleId: id } });
      await this.prisma.flashSaleProduct.createMany({
        data: products.map(p => ({ flashSaleId: id, productId: p.productId, salePrice: p.salePrice })),
      });
    }

    return this.prisma.flashSale.update({
      where: { id },
      data: {
        ...rest,
        ...(rest.startsAt && { startsAt: new Date(rest.startsAt) }),
        ...(rest.endsAt && { endsAt: new Date(rest.endsAt) }),
      },
      include: { products: { include: { product: true } } },
    });
  }

  async remove(id: string) {
    await this.prisma.flashSale.findUniqueOrThrow({ where: { id } });
    return this.prisma.flashSale.delete({ where: { id } });
  }
}
