import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Product } from './interfaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private http = inject(HttpClient)

  private _newProduct = new BehaviorSubject<Product|null>(null);
  newProduct = this._newProduct

  getProducts(page = 1) {
    return this.http.get('http://localhost:3000/products/')
  }

  getProductDetails(id: string) {
    return this.http.get(`http://localhost:3000/products/${id}`)
  }

  addProducts(product: Product) {
    return this.http.post('http://localhost:3000/products', product)
  }

  deleteProduct(id: number) {
    console.log('id:', id);

    return this.http.delete(`http://localhost:3000/products/${id}`)
  }

  updateProducts(product: Product) {
    console.log('product:', product);

    return this.http.put(`http://localhost:3000/products/${product.id}`, product)
  }

}
