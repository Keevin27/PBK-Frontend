import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService); // Inyectamos tu servicio
  const token = authService.getToken();    // Buscamos el token

  // Si hay token, clonamos la petición y le pegamos el token en la cabecera
  if (token) {
    const peticionClonada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(peticionClonada); // Enviamos la petición modificada
  }

  // Si no hay token (ej. cuando apenas se está logueando), pasa normal
  return next(req);
};