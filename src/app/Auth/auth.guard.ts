import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  // Inyectamos los servicios directamente en la función
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // Si hay token, lo dejamos pasar
  } else {
    router.navigate(['/login']); // Si no hay token, al login
    return false;
  }
};