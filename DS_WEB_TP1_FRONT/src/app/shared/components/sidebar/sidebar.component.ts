import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar glass-panel">
      <div class="sidebar-header">
        <span class="material-symbols-outlined logo-icon">inventory_2</span>
        <h3>StockSys</h3>
      </div>
      
      <div class="user-info">
        <div class="avatar">
          <span class="material-symbols-outlined">person</span>
        </div>
        <div class="user-details">
          <p class="user-id">User ID: {{ authService.userId() }}</p>
          <span class="badge" 
                [ngClass]="authService.isAdmin() ? 'badge-primary' : 'badge-success'">
            {{ authService.role() }}
          </span>
        </div>
      </div>
      
      <nav class="nav-links">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
          <span class="material-symbols-outlined">dashboard</span>
          Productos
        </a>
        
        <a routerLink="/movements" routerLinkActive="active" class="nav-link">
          <span class="material-symbols-outlined">swap_horiz</span>
          Movimientos
        </a>
        
        <a *ngIf="authService.isAdmin()" routerLink="/traceability" routerLinkActive="active" class="nav-link">
          <span class="material-symbols-outlined">history</span>
          Trazabilidad
        </a>
      </nav>
      
      <div class="sidebar-footer">
        <button class="btn btn-danger w-100" (click)="logout()">
          <span class="material-symbols-outlined">logout</span>
          Salir
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      height: 100vh;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      border-radius: 0;
      border-top: none;
      border-bottom: none;
      border-left: none;
      padding: 1.5rem 1rem;
    }
    
    .sidebar-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 10px 20px;
      border-bottom: 1px solid var(--panel-border);
    }
    
    .logo-icon {
      font-size: 32px;
      color: var(--primary-color);
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 20px 10px;
      margin-bottom: 10px;
      border-bottom: 1px solid var(--panel-border);
    }
    
    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .user-details p {
      margin: 0 0 5px 0;
      font-weight: 500;
      font-size: 0.9rem;
    }
    
    .nav-links {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding-top: 15px;
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: var(--text-muted);
      text-decoration: none;
      border-radius: var(--radius-sm);
      transition: var(--transition);
      font-weight: 500;
    }
    
    .nav-link:hover {
      background: rgba(255,255,255,0.05);
      color: var(--text-main);
    }
    
    .nav-link.active {
      background: var(--primary-glow);
      color: var(--primary-color);
      border-left: 3px solid var(--primary-color);
    }
    
    .w-100 { width: 100%; }
  `]
})
export class SidebarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
