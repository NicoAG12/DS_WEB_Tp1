import { Controller, Post, Body, Get, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('stock-movements')
@UseGuards(RolesGuard)
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post()
  @Roles('ADMIN', 'VENDEDOR')
  create(@Body() createStockMovementDto: CreateStockMovementDto, @Req() req: any) {
    const userRole = req.user.role.toUpperCase();
    const userId = req.user.id;

    if (createStockMovementDto.type === 'COMPRA' && userRole !== 'ADMIN') {
      throw new ForbiddenException('Los vendedores no pueden registrar compras de inventario.');
    }

    return this.stockMovementsService.create(createStockMovementDto, userId);
  }

  @Get('traceability')
  @Roles('ADMIN')
  findAll() {
    return this.stockMovementsService.findAll();
  }
}
