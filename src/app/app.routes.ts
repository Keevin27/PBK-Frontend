import { Routes } from '@angular/router';

export const routes: Routes = [{
    path: '',
    loadComponent: () => import('./Components/menu/menu.component').then(m => m.MenuComponent),
    children: [
      {
        path: 'lista-recursos',
        loadComponent: () => import('./Components/lista-recursos/lista-recursos.component').then(m => m.ListaRecursosComponent)
      },
      {
        path: '', 
        redirectTo: 'lista-recursos', 
        pathMatch: 'full' 
      },
      {
        path: 'miembros',
        loadComponent: () => import('./Components/listar-miembros/listar-miembros.component').then(m => m.ListarMiembrosComponent)
      },
      {
        path: 'miembros/registrar',
        loadComponent: () => import('./Components/registrar-miembro/registrar-miembro.component').then(m => m.RegistrarMiembroComponent)
      },
      {
        path: 'prestamos',
        loadComponent: () => import('./Components/lista-prestamos/lista-prestamos.component').then(m => m.ListaPrestamosComponent)
      }

    ]
}];
