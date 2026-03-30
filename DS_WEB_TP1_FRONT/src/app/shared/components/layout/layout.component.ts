import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
    }
    
    .main-content {
      flex: 1;
      padding: 30px 40px;
      overflow-y: auto;
      height: 100vh;
    }
    
    @media (max-width: 768px) {
      .app-layout {
        flex-direction: column;
      }
      .main-content {
        padding: 20px;
      }
    }
  `]
})
export class LayoutComponent {}
