import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonAlert, IonSkeletonText, IonAvatar, IonItem, IonList, IonInfiniteScrollContent, IonInfiniteScroll, IonBadge, InfiniteScrollCustomEvent, IonListHeader, IonGrid, IonRow, IonCol, IonButton, IonSelectOption, IonInput, IonIcon, IonItemOption, IonNote, IonSelect, IonToggle } from '@ionic/angular/standalone';
import { ProductService } from '../services/product.service';
import { catchError, finalize } from 'rxjs';
import { Product } from '../services/interfaces';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { trash } from 'ionicons/icons'
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonToggle, IonNote, IonIcon, IonInput, IonButton, IonCol, IonRow, IonGrid, IonHeader, IonToolbar, IonTitle,
    IonContent, IonAlert, IonBadge, IonLabel, IonAlert, IonSkeletonText, IonAvatar, IonItem, IonHeader,
    IonToolbar, IonTitle, IonContent, IonList, IonLabel, RouterModule, FormsModule, CommonModule, ReactiveFormsModule,
    IonSelectOption, IonSelect
  ],
})
export class HomePage implements OnInit {

  private productService = inject(ProductService);
  currentPage = signal(1);
  isLoading = false;
  dummyArray = new Array(5)
  editingProduct: WritableSignal<any> = signal(null);

  products = signal<Product[]>([]);
  productsFilter = signal<Product[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  filter = ''

  productForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    price: [0, [Validators.required, Validators.min(0)]],
    category: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    inStock: [true],
  });

  stockValue: WritableSignal<boolean> = signal(true);
  filterOptions = signal<string[]>([])

  get name() { return this.productForm.get('name'); }
  get price() { return this.productForm.get('price'); }
  get category() { return this.productForm.get('category'); }

  constructor(private fb: FormBuilder,
    private alertController: AlertController) {
    addIcons({ trash })
    this.loadProducts()
  }

  newProduct: Product | any;

  ngOnInit(): void {

    this.productService.newProduct.subscribe(product => {
      if (product) {
        this.newProduct = product;
        this.products.update((currentProducts) => [...currentProducts, this.newProduct]);
        this.productsFilter.update((currentProducts) => [...currentProducts, this.newProduct]);
      }
    });

  }

  // Fetching Products
  loadProducts(event?: InfiniteScrollCustomEvent) {
    this.error.set(null);

    if (!event) {
      this.loading.set(true);
    }

    this.productService.getProducts(this.currentPage())
      .pipe(
        finalize(() => {
          this.isLoading = false;
          if (event) event.target.complete();
        }),
        catchError((err: any) => {
          this.error = err.error.status_message;
          return []
        }),
      ).subscribe({
        next: (products: any) => {

          this.products.set(products)
          this.productsFilter.set(products)
          this.filterCategories()

          this.loading.set(false);

        }
      });

  }

  // Making Product Editable
  onEdit(product: Product) {

    this.productForm.patchValue({
      category: product.category,
      name: product.name,
      // price:product.price,
      inStock: product.inStock,
    })

    this.editingProduct.set(product)
  }

  // Filtering Categories
  filterCategories() {
    const uniqueCategories = [
      ...new Set(this.products().map((product) => product.category)),
    ];

    uniqueCategories.push('clear')

    this.filterOptions.set(uniqueCategories)
  }

  // Filter method here
  filterProduct() {

    let filteredProducts = this.products()
    if (this.filter != 'clear') {
      filteredProducts = this.products().filter(data => {
        return data.category === this.filter
      })
    }

    this.productsFilter.set(filteredProducts)
  }

  // Saving Edited Product's Data
  onSave(updatedProduct: Product) {

    updatedProduct.inStock = this.stockValue()

    if(this.productForm.invalid){
      this.presentAlert('Add Valid Inputs')
      return 
    }

    this.productService.updateProducts(updatedProduct).subscribe({
      next: (res: any) => {

        this.products.set(this.products().map(product =>
          product.id === updatedProduct.id ? res : product
        ))

        this.productsFilter.set(this.products().map(product =>
          product.id === updatedProduct.id ? res : product
        ))

        this.filterCategories()
        this.presentAlert('Product Updated Successfully')
      },
      error: (err: any) => {
        this.presentAlert('Product Updation Failed')
      }
    })

    this.editingProduct.set(null) // Exit edit mode
  }

  // Cancelling Edit
  onCancel() {
    this.editingProduct.set(null); // Exit edit mode without saving
  }

  // Delete Product Method
  deleteProduct(id: number) {

    if (id) {

      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.products.set(this.products().filter(product => product.id !== id));
          this.productsFilter.set(this.products().filter(product => product.id !== id));
          this.presentAlert('Product Deleted Successfully')
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          this.presentAlert('Product Deletion Failed');
        }
      })
    }
  }

  // Stock update
  changeStock() {
    this.stockValue.set(!this.stockValue())
  }

  async presentAlert(msg: string) {
    const alert = await this.alertController.create({
      header: 'Alert',
      message: msg,
      buttons: ['OK'],
    });

    await alert.present()

  }


}
