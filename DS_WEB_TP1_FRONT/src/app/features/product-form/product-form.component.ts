import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mb-4">
      <button class="btn btn-secondary mb-3 d-flex align-center gap-2" (click)="goBack()">
        <span class="material-symbols-outlined" style="font-size: 18px">arrow_back</span>
        Volver
      </button>
      
      <h1>{{ isEdit ? 'Editar Producto' : 'Nuevo Producto' }}</h1>
      <p class="text-muted">{{ isEdit ? 'Modifica los datos del producto' : 'Agrega un producto al inventario' }}</p>
    </div>

    <div class="glass-panel form-container">
      <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
        
        <div class="grid grid-cols-1 md-grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">SKU</label>
            <input type="text" class="form-control" formControlName="sku" placeholder="Ej: PROD-001" [readonly]="isEdit">
          </div>
          
          <div class="form-group">
            <label class="form-label">Categoría</label>
            <select class="form-control" formControlName="category">
              <option value="HOGAR">HOGAR</option>
              <option value="VIAJE">VIAJE</option>
              <option value="ROPA">ROPA</option>
              <option value="BELLEZA">BELLEZA</option>
              <option value="TECNOLOGIA">TECNOLOGIA</option>
            </select>
          </div>
          
          <div class="form-group grid-span-2">
            <label class="form-label">Descripción</label>
            <input type="text" class="form-control" formControlName="description" placeholder="Nombre completo del producto">
          </div>
          
          <div class="form-group">
            <label class="form-label">Precio de Compra ($)</label>
            <input type="number" step="0.01" class="form-control" formControlName="purchasePrice">
          </div>
          
          <div class="form-group">
            <label class="form-label">Precio de Venta ($)</label>
            <input type="number" step="0.01" class="form-control" formControlName="salePrice">
          </div>
          
          <div class="form-group">
            <label class="form-label">Nivel Crítico de Stock</label>
            <input type="number" class="form-control" formControlName="criticalStockLevel">
          </div>
          
          <div class="form-group" *ngIf="!isEdit">
            <label class="form-label">Stock Inicial</label>
            <input type="number" class="form-control" formControlName="currentStock">
          </div>
        </div>
        
        <div class="d-flex justify-between align-center mt-4 pt-4 border-top">
          <p class="text-muted text-sm">* Campos obligatorios</p>
          <button type="submit" class="btn btn-primary d-flex align-center gap-2" [disabled]="productForm.invalid || isSaving">
            <span class="material-symbols-outlined" *ngIf="!isSaving">save</span>
            <span class="material-symbols-outlined spin" *ngIf="isSaving">refresh</span>
            {{ isSaving ? 'Guardando...' : 'Guardar Producto' }}
          </button>
        </div>
        
      </form>
    </div>
  `,
  styles: [`
    .mb-3 { margin-bottom: 1rem; }
    .mb-4 { margin-bottom: 2rem; }
    .mt-4 { margin-top: 1.5rem; }
    .pt-4 { padding-top: 1.5rem; }
    .border-top { border-top: 1px solid var(--panel-border); }
    .text-sm { font-size: 0.85rem; }
    
    .form-container {
      padding: 30px;
      max-width: 800px;
    }
    
    .grid-span-2 { grid-column: span 2; }
    @media (max-width: 768px) {
      .grid-span-2 { grid-column: span 1; }
      .md-grid-cols-2 { grid-template-columns: 1fr; }
    }
    
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `]
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  
  isEdit = false;
  productId: number | null = null;
  isSaving = false;
  
  productForm: FormGroup = this.fb.group({
    sku: ['', Validators.required],
    description: ['', Validators.required],
    category: ['HOGAR', Validators.required],
    purchasePrice: [0, [Validators.required, Validators.min(0)]],
    salePrice: [0, [Validators.required, Validators.min(0)]],
    criticalStockLevel: [10, [Validators.required, Validators.min(0)]],
    currentStock: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.productId) {
      this.isEdit = true;
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: number) {
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.productForm.patchValue(product);
      },
      error: (err) => console.error(err)
    });
  }

  onSubmit() {
    if (this.productForm.invalid) return;
    
    this.isSaving = true;
    const value = this.productForm.getRawValue();
    
    if (this.isEdit) {
      this.productService.updateProduct(this.productId!, value).subscribe({
        next: () => {
          this.isSaving = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error(err);
          this.isSaving = false;
        }
      });
    } else {
      this.productService.createProduct(value).subscribe({
        next: () => {
          this.isSaving = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error(err);
          this.isSaving = false;
        }
      });
    }
  }

  goBack() {
    this.location.back();
  }
}
