import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { StockMovement, StockMovementService } from '../../core/services/stock-movement.service';

@Component({
  selector: 'app-traceability',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe, CurrencyPipe],
  template: `
    <div class="mb-4">
      <h1>Trazabilidad de Movimientos</h1>
      <p class="text-muted">Historial completo de entradas y salidas de stock del sistema</p>
    </div>

    <div *ngIf="loading()" class="glass-panel text-center p-4 my-4">
      <span class="material-symbols-outlined spin" style="font-size: 32px">refresh</span>
      <p class="mt-2">Cargando registros...</p>
    </div>

    <div class="glass-panel table-container" *ngIf="!loading()">
      <table class="table w-100">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Producto (SKU)</th>
            <th>Cantidad</th>
            <th>Precio Unit.</th>
            <th>Total Transacción</th>
            <th>Usuario</th>
            <th>Cliente</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngIf="movements().length === 0">
            <td colspan="9" class="text-center text-muted p-4">No hay movimientos registrados.</td>
          </tr>
          <tr *ngFor="let m of movements()">
            <td class="text-muted">#{{ m.id }}</td>
            <td>{{ m.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
            <td>
              <span class="badge" 
                    [ngClass]="{
                      'badge-success': m.type === 'COMPRA',
                      'badge-warning': m.type === 'VENTA',
                      'badge-primary': m.type === 'DEVOLUCION'
                    }">
                {{ m.type }}
              </span>
            </td>
            <td>
              <strong>{{ m.product?.description || 'N/A' }}</strong><br>
              <span class="text-xs text-muted">SKU: {{ m.product?.sku || 'N/A' }}</span>
            </td>
            <td class="font-bold text-center">
              <span [class.text-success]="m.type === 'COMPRA' || m.type === 'DEVOLUCION'"
                    [class.text-danger]="m.type === 'VENTA'">
                {{ (m.type === 'VENTA') ? '-' : '+'}}{{ m.quantity }}
              </span>
            </td>
            <td>{{ m.unitPrice | currency:'ARS':'symbol':'1.0-0' }}</td>
            <td class="font-bold" [class.text-success]="m.type === 'VENTA'" [class.text-danger]="m.type === 'COMPRA'">
              {{ (m.type === 'COMPRA') ? '-' : '+'}}{{ m.totalPrice | currency:'ARS':'symbol':'1.0-0' }}
            </td>
            <td>ID: {{ m.user?.id || 'N/A' }}</td>
            <td>{{ m.clientName || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .mb-4 { margin-bottom: 2rem; }
    .my-4 { margin-top: 2rem; margin-bottom: 2rem; }
    .mt-2 { margin-top: 0.5rem; }
    .p-4 { padding: 1.5rem; }
    .text-center { text-align: center; }
    .text-xs { font-size: 0.75rem; }
    .font-bold { font-weight: 600; }
    .w-100 { width: 100%; }
    
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `]
})
export class TraceabilityComponent implements OnInit {
  private ds = inject(StockMovementService);
  
  movements = signal<StockMovement[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.ds.getTraceability().subscribe({
      next: (data) => {
        this.movements.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }
}
