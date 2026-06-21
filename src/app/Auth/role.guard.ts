import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtenemos los roles permitidos que configuraremos en el archivo de rutas
  const expectedRoles = route.data['roles'] as Array<string>;
  const userRoles = authService.getUserRoles();

  // Verificamos si el usuario tiene al menos UNO de los roles permitidos
  const hasRole = expectedRoles.some(role => userRoles.includes(role));

  if (!hasRole) {
    Swal.fire({
      icon: 'error',
      title: 'Acceso Denegado',
      text: 'No tienes los permisos necesarios para ver esta sección.',
      confirmButtonColor: '#1a1d24'
    });
    
    // Lo redirigimos a una zona segura si no tiene acceso
    router.navigate(['/lista-recursos']); 
    return false;
  }

  return true;
};