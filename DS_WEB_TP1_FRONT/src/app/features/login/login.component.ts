import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="glass-panel login-card">
        <div class="login-header">
          <span class="material-symbols-outlined logo-icon">inventory_2</span>
          <h2>Bienvenido al Sistema</h2>
          <p class="text-muted">Simulador de Autenticación</p>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">ID de Usuario</label>
            <input 
              type="number" 
              class="form-control" 
              formControlName="userId" 
              placeholder="Ej: 1" 
              required
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">Rol de Acceso</label>
            <select class="form-control" formControlName="role" required>
              <option value="ADMIN">Administrador (ADMIN)</option>
              <option value="VENDEDOR">Vendedor (VENDEDOR)</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary w-100 mt-4 d-flex justify-center"
            [disabled]="loginForm.invalid"
          >
            <span>Ingresar</span>
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    
    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 40px 30px;
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .logo-icon {
      font-size: 48px;
      color: var(--primary-color);
      margin-bottom: 10px;
    }
    
    .login-header h2 {
      margin-bottom: 5px;
    }
    
    .w-100 {
      width: 100%;
    }
    
    .mt-4 {
      margin-top: 1.5rem;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    userId: ['1', Validators.required],
    role: ['ADMIN', Validators.required]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const { userId, role } = this.loginForm.value;
      this.authService.login(userId.toString(), role);
      this.router.navigate(['/']);
    }
  }
}
