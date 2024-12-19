import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'add-product',
    loadComponent: () => import('./add-product/add-product.page').then( m => m.AddProductPage)
  },
  {
    path: 'update-product',
    loadComponent: () => import('./update-product/update-product.page').then( m => m.UpdateProductPage)
  },
];
