import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Injectable()
export class StockMovementsService {
  private readonly logger = new Logger(StockMovementsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createStockMovementDto: CreateStockMovementDto, userId: number) {
    const { productId, type, quantity, clientName } = createStockMovementDto;

    // Verificar si el usuario existe para la traza
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      // Para efectos de prueba local si no se ha configurado la BD de User
      // Podriamos hacer un upsert del User mock, o tirar error
      const mockUser = await this.prisma.user.upsert({
        where: { id: userId },
        create: { id: userId, username: `mockuser_${userId}`, role: 'ADMIN' },
        update: {},
      });
      console.log('Usuario mock auto-creado:', mockUser);
    }

    return await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException(`Producto con ID ${productId} no encontrado.`);
      }

      let newStock = product.currentStock;

      if (type === 'COMPRA' || type === 'DEVOLUCION') {
        newStock += quantity;
      } else if (type === 'VENTA') {
        if (newStock < quantity) {
          throw new BadRequestException('Stock insuficiente para realizar la venta.');
        }
        newStock -= quantity;
      }

      // 1. Actualizar el stock del producto
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock },
      });

      // Calcular precios
      const unitPrice = type === 'COMPRA' ? product.purchasePrice : product.salePrice;
      const totalPrice = unitPrice * quantity;

      // 2. Registrar el movimiento para trazabilidad
      const movement = await tx.stockMovement.create({
        data: {
          type,
          quantity,
          clientName,
          productId,
          userId,
          unitPrice,
          totalPrice,
        },
        include: { user: true, product: true },
      });

      // 3. Notificación (Log en consola) si el stock llega a crítico tras una venta
      if (type === 'VENTA' && newStock <= product.criticalStockLevel) {
        this.logger.warn(
          `ALERTA DE STOCK: El producto ${product.sku} - ${product.description} ha alcanzado un nivel crítico (${newStock} restantes. Nivel de alerta: ${product.criticalStockLevel}).`
        );
      }

    });
  }

  async createBatch(createStockMovementDtos: CreateStockMovementDto[], userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      await this.prisma.user.upsert({
        where: { id: userId },
        create: { id: userId, username: `mockuser_${userId}`, role: 'ADMIN' },
        update: {},
      });
    }

    return await this.prisma.$transaction(async (tx) => {
      const movements: any[] = [];
      for (const dto of createStockMovementDtos) {
        const { productId, type, quantity, clientName } = dto;
        const product = await tx.product.findUnique({ where: { id: productId } });

        if (!product) {
          throw new NotFoundException(`Producto con ID ${productId} no encontrado.`);
        }

        let newStock = product.currentStock;
        if (type === 'COMPRA' || type === 'DEVOLUCION') {
          newStock += quantity;
        } else if (type === 'VENTA') {
          if (newStock < quantity) {
            throw new BadRequestException(`Stock insuficiente para vender ${product.description}.`);
          }
          newStock -= quantity;
        }

        await tx.product.update({
          where: { id: productId },
          data: { currentStock: newStock },
        });

        const unitPrice = type === 'COMPRA' ? product.purchasePrice : product.salePrice;
        const totalPrice = unitPrice * quantity;

        const movement = await tx.stockMovement.create({
          data: {
            type,
            quantity,
            clientName,
            productId,
            userId,
            unitPrice,
            totalPrice,
          },
          include: { user: true, product: true },
        });

        if (type === 'VENTA' && newStock <= product.criticalStockLevel) {
          this.logger.warn(`ALERTA DE STOCK: ${product.description} en nivel crítico (${newStock}).`);
        }

        movements.push(movement);
      }
      return movements;
    });
  }

  async findAll() {
    return this.prisma.stockMovement.findMany({
      include: {
        product: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
