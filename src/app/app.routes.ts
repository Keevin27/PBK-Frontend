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
      }
    ]
}];
