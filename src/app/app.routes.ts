import { Routes } from '@angular/router';
import { authGuard } from './Auth/auth.guard';
import { roleGuard } from './Auth/role.guard';
import { LoginComponent } from './Auth/login/login.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
        path: 'miembros/registrar',
        loadComponent: () => import('./Components/registrar-miembro/registrar-miembro.component').then(m => m.RegistrarMiembroComponent),
      },
  
      {
    path: 'forgot-password',
    loadComponent: () => import('./Auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    // Esta ruta debe llamarse exactamente como la pusimos en el Backend (EmailService)
    path: 'restablecer-password', 
    loadComponent: () => import('./Auth/restablecer-password/restablecer-password.component').then(m => m.RestablecerPasswordComponent)
  },
  
  {
    path: '',
    loadComponent: () => import('./Components/menu/menu.component').then(m => m.MenuComponent),
    children: [
      {
        path: 'lista-recursos',
        loadComponent: () => import('./Components/lista-recursos/lista-recursos.component').then(m => m.ListaRecursosComponent)
      },
      {
        
        path: 'miembros',
        loadComponent: () => import('./Components/listar-miembros/listar-miembros.component').then(m => m.ListarMiembrosComponent),
        canActivate: [authGuard,roleGuard],
        data: { roles: ['administrador','bibliotecario'] }
      },
      {
        path: 'prestamos',
        loadComponent: () => import('./Components/lista-prestamos/lista-prestamos.component').then(m => m.ListaPrestamosComponent),
        canActivate: [authGuard,roleGuard],
        data: { roles: ['administrador','bibliotecario'] }
      },
      
      // Redirección si entra a la raíz y SÍ está logueado
      {
        path: '', 
        redirectTo: 'lista-recursos', 
        pathMatch: 'full' 
      },
      {
        path: 'miembros/registrar',
        loadComponent: () => import('./Components/registrar-miembro/registrar-miembro.component').then(m => m.RegistrarMiembroComponent)
      }

    ]
},
{ 
    path: '**', 
    redirectTo: 'login' 
  }
];
