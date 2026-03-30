import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const role = authService.role();
  const userId = authService.userId();

  if (role && userId) {
    const cloned = req.clone({
      setHeaders: {
        'x-user-role': role,
        'x-user-id': userId
      }
    });
    return next(cloned);
  }

  return next(req);
};
