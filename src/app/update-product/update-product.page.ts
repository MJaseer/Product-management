import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-update-product',
  templateUrl: './update-product.page.html',
  styleUrls: ['./update-product.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class UpdateProductPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
