import { Routes } from '@angular/router';

export const routes: Routes = [{
    path: '',
    loadComponent: () => import('./Componentes/menu/menu.component').then(m => m.MenuComponent)
}];
