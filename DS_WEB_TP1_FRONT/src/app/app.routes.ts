import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProductFormComponent } from './features/product-form/product-form.component';
import { StockMovementComponent } from './features/stock-movement/stock-movement.component';
import { TraceabilityComponent } from './features/traceability/traceability.component';
import { AuthService } from './core/services/auth.service';

const authGuard = () => {
  const authService = inject(AuthService);
  return authService.isLoggedIn() ? true : inject(Router).createUrlTree(['/login']);
};

const adminGuard = () => {
  const authService = inject(AuthService);
  return authService.isAdmin() ? true : inject(Router).createUrlTree(['/dashboard']);
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products/new', component: ProductFormComponent, canActivate: [adminGuard] },
      { path: 'products/:id/edit', component: ProductFormComponent, canActivate: [adminGuard] },
      { path: 'movements', component: StockMovementComponent },
      { path: 'traceability', component: TraceabilityComponent, canActivate: [adminGuard] }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
