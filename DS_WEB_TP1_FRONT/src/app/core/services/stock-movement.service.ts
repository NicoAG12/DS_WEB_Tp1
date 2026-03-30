import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from './product.service';

export interface StockMovement {
  id: number;
  type: string;
  quantity: number;
  clientName?: string;
  createdAt: string;
  product: Product;
  user: any;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateStockMovementDto {
  productId: number;
  type: string;
  quantity: number;
  clientName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {
  private apiUrl = 'http://localhost:3000/stock-movements';

  constructor(private http: HttpClient) {}

  createMovement(movement: CreateStockMovementDto): Observable<StockMovement> {
    return this.http.post<StockMovement>(this.apiUrl, movement);
  }

  createBatchMovement(movements: CreateStockMovementDto[]): Observable<StockMovement[]> {
    return this.http.post<StockMovement[]>(`${this.apiUrl}/batch`, movements);
  }

  getTraceability(): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(`${this.apiUrl}/traceability`);
  }
}
