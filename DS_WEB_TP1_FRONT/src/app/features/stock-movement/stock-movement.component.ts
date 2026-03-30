import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product, ProductService } from '../../core/services/product.service';
import { StockMovementService, CreateStockMovementDto } from '../../core/services/stock-movement.service';
import { AuthService } from '../../core/services/auth.service';

interface CartItem extends CreateStockMovementDto {
  productName: string;
}

@Component({
  selector: 'app-stock-movement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mb-4">
      <h1>Registrar Movimiento</h1>
      <p class="text-muted">Ingresa compras, ventas o devoluciones de inventario</p>
    </div>

    <div class="grid grid-cols-1 md-grid-cols-2 gap-4">
      <!-- Formulario de Ingreso -->
      <div class="glass-panel form-container h-fit">
        <h3>Añadir Movimiento</h3>
        <form [formGroup]="movementForm" (ngSubmit)="addToCart()">
          <div class="form-group">
            <label class="form-label">Producto</label>
            <select class="form-control" formControlName="productId">
              <option value="">-- Seleccione un producto --</option>
              <option *ngFor="let prod of products()" [value]="prod.id">
                [{{ prod.sku }}] {{ prod.description }} - Stock: {{ prod.currentStock }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Tipo de Movimiento</label>
            <select class="form-control" formControlName="type" (change)="onTypeChange()">
              <option value="COMPRA">Compra (Ingreso de Stock)</option>
              <option value="VENTA">Venta (Egreso de Stock)</option>
              <option value="DEVOLUCION">Devolución (Ingreso de Stock)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Cantidad</label>
            <input type="number" class="form-control" formControlName="quantity" min="1">
          </div>
          
          <div class="form-group" *ngIf="isClientRequired()">
            <label class="form-label">Nombre del Cliente (Opcional)</label>
            <input type="text" class="form-control" formControlName="clientName" placeholder="Juan Pérez">
          </div>
          
          <button type="submit" class="btn btn-secondary w-100 mt-4 d-flex align-center justify-center gap-2" [disabled]="movementForm.invalid">
            <span class="material-symbols-outlined">add_shopping_cart</span>
            Añadir a lista
          </button>
        </form>
      </div>

      <!-- Resumen del Carrito -->
      <div class="glass-panel form-container">
        <h3>Lista de Operaciones</h3>
        
        <div *ngIf="successMessage()" class="alert alert-success mb-4 d-flex align-center gap-2">
          <span class="material-symbols-outlined">check_circle</span>
          {{ successMessage() }}
        </div>
        
        <div *ngIf="errorMessage()" class="alert alert-danger mb-4 d-flex align-center gap-2">
          <span class="material-symbols-outlined">error</span>
          {{ errorMessage() }}
        </div>

        <div class="cart-items" *ngIf="cartItems().length > 0; else emptyCart">
          <div class="cart-item" *ngFor="let item of cartItems(); let i = index">
            <div class="cart-item-details">
              <span class="badge" [ngClass]="item.type.toLowerCase()">{{ item.type }}</span>
              <span class="font-medium d-block mt-2">{{ item.productName }}</span>
              <span class="text-sm text-muted">Cantidad: {{ item.quantity }} <span *ngIf="item.clientName">| Cliente: {{ item.clientName }}</span></span>
            </div>
            <button class="btn btn-sm btn-icon" (click)="removeFromCart(i)">
              <span class="material-symbols-outlined text-danger">delete</span>
            </button>
          </div>
        </div>
        <ng-template #emptyCart>
          <div class="empty-state text-center p-4">
            <span class="material-symbols-outlined text-muted" style="font-size: 48px;">receipt_long</span>
            <p class="text-muted mt-2">Añade movimientos a la lista para registrarlos todos juntos.</p>
          </div>
        </ng-template>

        <div class="mt-4 pt-4 border-top">
          <p class="text-muted text-sm mb-4">* Tanto administradores como vendedores pueden registrar compras, ventas o devoluciones.</p>
          <button type="button" class="btn btn-primary w-100 d-flex justify-center align-center gap-2" 
                  [disabled]="cartItems().length === 0 || isSaving()" 
                  (click)="submitBatch()">
            <span class="material-symbols-outlined" *ngIf="!isSaving()">cloud_upload</span>
            <span class="material-symbols-outlined spin" *ngIf="isSaving()">refresh</span>
            {{ isSaving() ? 'Procesando...' : 'Registrar Todo' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mb-4 { margin-bottom: 2rem; }
    .mt-4 { margin-top: 1.5rem; }
    .mt-2 { margin-top: 0.5rem; }
    .pt-4 { padding-top: 1.5rem; }
    .p-4 { padding: 1rem; }
    .w-100 { width: 100%; }
    .h-fit { height: fit-content; }
    .border-top { border-top: 1px solid var(--panel-border); }
    .text-sm { font-size: 0.85rem; }
    .text-center { text-align: center; }
    .justify-center { justify-content: center; }
    
    .form-container { padding: 30px; }
    
    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 15px;
      max-height: 400px;
      overflow-y: auto;
    }
    
    .cart-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--panel-border);
      border-radius: var(--radius-sm);
    }
    
    .badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .badge.compra { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .badge.venta { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
    .badge.devolucion { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    
    .btn-icon {
      background: transparent;
      border: none;
      padding: 8px;
      cursor: pointer;
      border-radius: 50%;
      display: flex;
    }
    .btn-icon:hover { background: rgba(255,0,0,0.1); }
    .text-danger { color: #ef4444; }
    
    .alert {
      padding: 12px 16px;
      border-radius: var(--radius-sm);
      font-weight: 500;
    }
    .alert-success { background: var(--success-bg); color: var(--success-color); border: 1px solid rgba(16, 185, 129, 0.2); }
    .alert-danger { background: var(--danger-bg); color: var(--danger-color); border: 1px solid rgba(239, 68, 68, 0.2); }
    
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `]
})
export class StockMovementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private movementService = inject(StockMovementService);
  authService = inject(AuthService);
  
  products = signal<Product[]>([]);
  cartItems = signal<CartItem[]>([]);
  isSaving = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  
  movementForm: FormGroup = this.fb.group({
    productId: ['', Validators.required],
    type: ['COMPRA', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    clientName: ['']
  });

  ngOnInit() {
    this.refreshStock();
  }

  refreshStock() {
    this.productService.getProducts().subscribe({
      next: (data) => this.products.set(data),
      error: (err) => console.error(err)
    });
  }

  isClientRequired(): boolean {
    const type = this.movementForm.get('type')?.value;
    return type === 'VENTA' || type === 'DEVOLUCION';
  }

  onTypeChange() {
    if (!this.isClientRequired()) {
      this.movementForm.get('clientName')?.setValue('');
    }
  }

  addToCart() {
    if (this.movementForm.invalid) return;
    
    const value = this.movementForm.value;
    const productId = Number(value.productId);
    const product = this.products().find(p => p.id === productId);
    
    if (!product) return;

    this.cartItems.update(items => [...items, {
      productId,
      type: value.type,
      quantity: value.quantity,
      clientName: value.clientName || undefined,
      productName: product.description
    }]);

    // Reset form for next item
    this.movementForm.patchValue({ quantity: 1, clientName: '' });
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  removeFromCart(index: number) {
    this.cartItems.update(items => items.filter((_, i) => i !== index));
  }

  submitBatch() {
    if (this.cartItems().length === 0) return;
    
    this.isSaving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
    
    // Preparar payload puro (sin productName)
    const payload: CreateStockMovementDto[] = this.cartItems().map(item => ({
      productId: item.productId,
      type: item.type,
      quantity: item.quantity,
      clientName: item.clientName
    }));
    
    this.movementService.createBatchMovement(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('Las operaciones fueron registradas exitosamente.');
        this.cartItems.set([]); // Limpiar carrito
        this.refreshStock(); // Refrescar lista de stock real
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err.error?.message || 'Error al enviar el lote al servidor.');
      }
    });
  }
}
