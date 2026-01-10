import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Service pour le sous-module 9.6 - Boutique Scolaire
 */
@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(tenantId: string, academicYearId: string, data: any) {
    const product = await this.prisma.shopProduct.create({
      data: {
        tenantId,
        academicYearId,
        code: data.code,
        name: data.name,
        description: data.description,
        category: data.category,
        unitPrice: data.unitPrice,
        costPrice: data.costPrice,
        isActive: true,
      },
    });

    // Créer le stock initial
    await this.prisma.shopStock.create({
      data: {
        productId: product.id,
        quantity: data.initialStock || 0,
        minThreshold: data.minThreshold || 10,
        maxThreshold: data.maxThreshold,
        lastRestocked: new Date(),
      },
    });

    return product;
  }

  async createSale(tenantId: string, academicYearId: string, data: any, soldBy: string) {
    // Vérifier le stock pour chaque article
    for (const item of data.items) {
      const product = await this.prisma.shopProduct.findFirst({
        where: { id: item.productId, tenantId },
        include: { stock: true },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }

      if (!product.stock || product.stock.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available: ${product.stock?.quantity || 0}, Requested: ${item.quantity}`,
        );
      }
    }

    // Générer le numéro de vente
    const saleCount = await this.prisma.shopSale.count({
      where: { tenantId, academicYearId },
    });
    const saleNumber = `SALE-${academicYearId.substring(0, 4)}-${String(saleCount + 1).padStart(4, '0')}`;

    // Calculer le total
    const totalAmount = data.items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unitPrice,
      0,
    );

    // Créer la vente
    const sale = await this.prisma.shopSale.create({
      data: {
        tenantId,
        academicYearId,
        saleNumber,
        saleDate: new Date(data.saleDate || Date.now()),
        customerType: data.customerType,
        customerId: data.customerId,
        customerName: data.customerName,
        totalAmount,
        paymentStatus: data.paymentStatus || 'PENDING',
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        soldBy,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // Mettre à jour les stocks
    for (const item of data.items) {
      await this.prisma.shopStock.update({
        where: { productId: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    return sale;
  }

  async findAllProducts(tenantId: string, academicYearId: string) {
    return this.prisma.shopProduct.findMany({
      where: { tenantId, academicYearId, isActive: true },
      include: { stock: true },
      orderBy: { name: 'asc' },
    });
  }

  async getShopStats(tenantId: string, academicYearId: string) {
    const products = await this.prisma.shopProduct.findMany({
      where: { tenantId, academicYearId },
      include: { stock: true },
    });

    const sales = await this.prisma.shopSale.findMany({
      where: {
        tenantId,
        academicYearId,
        saleDate: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        },
      },
      include: { items: true },
    });

    const totalRevenue = sales
      .filter((s) => s.paymentStatus === 'PAID')
      .reduce((sum, s) => sum + Number(s.totalAmount), 0);

    const lowStockProducts = products.filter(
      (p) => p.stock && p.stock.quantity <= p.stock.minThreshold,
    );

    return {
      totalProducts: products.length,
      totalSales: sales.length,
      totalRevenue,
      lowStockProducts: lowStockProducts.length,
      inventoryValue: products.reduce(
        (sum, p) => sum + (Number(p.costPrice || 0) * (p.stock?.quantity || 0)),
        0,
      ),
    };
  }
}

