import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, Product } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-products-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-header d-flex justify-between align-center mb-4">
      <div>
        <h1>Inventario de Productos</h1>
        <p class="text-muted">Gestiona el catálogo y los niveles de stock</p>
      </div>
      
      <button *ngIf="authService.isAdmin()" routerLink="/products/new" class="btn btn-primary d-flex align-center gap-2">
        <span class="material-symbols-outlined">add</span>
        Nuevo Producto
      </button>
    </div>

    <div *ngIf="loading()" class="glass-panel text-center p-4 my-4">
      <span class="material-symbols-outlined spin" style="font-size: 32px">refresh</span>
      <p class="mt-2">Cargando catálogo...</p>
    </div>
    
    <div *ngIf="!loading() && products().length === 0" class="glass-panel p-4 text-center text-muted">
      No hay productos registrados en el sistema.
    </div>

    <div class="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-4" *ngIf="!loading()">
      
      <div class="glass-panel product-card" *ngFor="let product of products()">
        <div class="card-header d-flex justify-between align-center">
          <span class="badge badge-success">{{ product.category }}</span>
          <span class="sku text-muted">#{{ product.sku }}</span>
        </div>
        
        <h3 class="product-title">{{ product.description }}</h3>
        
        <div class="stock-status" [class.critical]="product.currentStock <= product.criticalStockLevel">
          <div class="d-flex justify-between text-sm mb-1">
            <span>Stock Actual</span>
            <span class="font-bold">{{ product.currentStock }} unid.</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" 
                 [style.width]="getPercentage(product.currentStock, product.criticalStockLevel * 3) + '%'"
                 [class.bg-danger]="product.currentStock <= product.criticalStockLevel"
                 [class.bg-success]="product.currentStock > product.criticalStockLevel">
            </div>
          </div>
          <p class="critical-alert mt-1" *ngIf="product.currentStock <= product.criticalStockLevel">
            <span class="material-symbols-outlined" style="font-size: 14px">warning</span>
            Stock Crítico (Mín: {{ product.criticalStockLevel }})
          </p>
        </div>
        
        <div class="pricing d-flex justify-between mt-3">
          <div>
            <span class="text-muted text-xs">Precio Venta</span>
            <p class="price-val font-bold text-success">\${{ product.salePrice | number:'1.2-2' }}</p>
          </div>
          <div *ngIf="authService.isAdmin()">
            <span class="text-muted text-xs">Precio Compra</span>
            <p class="price-val font-bold">\${{ product.purchasePrice | number:'1.2-2' }}</p>
          </div>
        </div>
        
        <div class="card-actions mt-4 d-flex gap-2" *ngIf="authService.isAdmin()">
          <button class="btn btn-secondary flex-1" [routerLink]="['/products', product.id, 'edit']">
            <span class="material-symbols-outlined" style="font-size: 18px">edit</span> Editar
          </button>
          <button class="btn btn-danger icon-btn" (click)="deleteProduct(product.id!)">
            <span class="material-symbols-outlined" style="font-size: 18px">delete</span>
          </button>
        </div>
        
      </div>
      
    </div>
  `,
  styles: [`
    .mb-4 { margin-bottom: 2rem; }
    .my-4 { margin-top: 2rem; margin-bottom: 2rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-3 { margin-top: 1rem; }
    .mt-4 { margin-top: 1.5rem; }
    .p-4 { padding: 1.5rem; }
    .text-center { text-align: center; }
    .text-sm { font-size: 0.85rem; }
    .text-xs { font-size: 0.75rem; }
    .font-bold { font-weight: 600; }
    .flex-1 { flex: 1; }
    .w-100 { width: 100%; }
    
    .spin {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
    
    .lg-grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    @media (max-width: 1200px) {
      .lg-grid-cols-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 768px) {
      .lg-grid-cols-3 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    }
    
    .product-card {
      padding: 1.5rem;
      transition: all 0.3s ease;
    }
    
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
      border-color: rgba(255, 255, 255, 0.15);
    }
    
    .sku { font-family: monospace; }
    
    .product-title {
      font-size: 1.2rem;
      margin: 1rem 0;
      color: var(--text-main);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .stock-status {
      background: rgba(0, 0, 0, 0.2);
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--panel-border);
    }
    
    .stock-status.critical {
      background: var(--danger-bg);
      border-color: rgba(239, 68, 68, 0.3);
    }
    
    .progress-bar {
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
    }
    
    .bg-success { background: var(--success-color); }
    .bg-danger { background: var(--danger-color); }
    
    .critical-alert {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--danger-color);
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .price-val { font-size: 1.1rem; }
    
    .icon-btn {
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class DashboardComponent implements OnInit {
  productService = inject(ProductService);
  authService = inject(AuthService);
  
  products = signal<Product[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching products', err);
        this.loading.set(false);
      }
    });
  }

  deleteProduct(id: number) {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.loadProducts();
      });
    }
  }

  getPercentage(current: number, max: number): number {
    if (max === 0) return 0;
    const p = (current / max) * 100;
    return p > 100 ? 100 : p;
  }
}
