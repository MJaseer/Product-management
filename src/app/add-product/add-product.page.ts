import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonNote, IonItem, IonText, IonButton } from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { Product } from '../services/interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.page.html',
  styleUrls: ['./add-product.page.scss'],
  standalone: true,
  imports: [IonButton, IonText, IonItem, IonNote, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,
    ReactiveFormsModule
  ]
})
export class AddProductPage {

  // productForm!: FormGroup;
  productService = inject(ProductService);
  formError = signal<string | null>(null)
  isSubmitting = signal(false);
  get name() { return this.productForm.get('name'); }
  get price() { return this.productForm.get('price'); }
  get category() { return this.productForm.get('category'); }

  products = signal<Product[]>([]);

  constructor(private fb: FormBuilder,
    private alertController: AlertController,
    private router: Router) {

    this.productService.getProducts().subscribe({
      next: (products: any) => {

        this.products.set(products)

      }
    });
  }


  productForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    price: [0, [Validators.required, Validators.min(0)]],
    category: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    inStock: [true], // Default value for inStock
  });

  async presentAlert(msg: string) {
    const alert = await this.alertController.create({
      header: 'Alert',
      message: msg,
      buttons: ['OK'],
    });

    await alert.present().then(() => {
      this.router.navigate(['/'])
    })

  }

  // Adding Product

  addProduct() {
    this.formError.set(null)

    if (this.productForm.invalid) {
      this.formError.set('Please fill all required fields')
      return;
    }

    const nextId = this.products().length > 0 ? Math.max(...this.products().map(p => p.id)) + 1 : 1;

    this.isSubmitting.set(true);

    const newProduct: Product = {
      ...this.productForm.value as any,
      id: `${nextId}`
    };


    this.productService.addProducts(newProduct).subscribe({
      next: (addedProduct) => {
        
        this.productService.newProduct.next(newProduct)

        this.isSubmitting.set(false);
        this.productForm.reset(); 
        this.presentAlert('Product Added Successfully')
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.presentAlert(err.error.status_message)
        console.error('Error adding product:', err);
      },
    })
  }
}

