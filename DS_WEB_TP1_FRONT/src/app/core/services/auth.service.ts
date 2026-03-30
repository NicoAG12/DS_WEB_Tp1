import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  role = signal<string | null>(localStorage.getItem('user_role'));
  userId = signal<string | null>(localStorage.getItem('user_id'));

  login(id: string, role: string) {
    localStorage.setItem('user_id', id);
    localStorage.setItem('user_role', role);
    this.userId.set(id);
    this.role.set(role);
  }

  logout() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    this.userId.set(null);
    this.role.set(null);
  }

  isLoggedIn(): boolean {
    return !!this.userId() && !!this.role();
  }

  isAdmin(): boolean {
    return this.role() === 'ADMIN';
  }
}
