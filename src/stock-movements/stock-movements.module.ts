import { Module } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { StockMovementsController } from './stock-movements.controller';

@Module({
  providers: [StockMovementsService],
  controllers: [StockMovementsController]
})
export class StockMovementsModule {}
