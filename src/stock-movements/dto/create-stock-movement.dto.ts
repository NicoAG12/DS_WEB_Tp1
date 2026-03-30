import { IsString, IsNumber, IsNotEmpty, IsOptional, IsIn, Min } from 'class-validator';

export class CreateStockMovementDto {
  @IsNumber()
  productId: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['COMPRA', 'VENTA', 'DEVOLUCION'])
  type: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  clientName?: string;
}
