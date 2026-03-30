import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';

@Module({
  imports: [PrismaModule, ProductsModule, StockMovementsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
