import { Injectable } from '@angular/core';
import { OrderRequest } from '../models/order-request.model';

@Injectable({
  providedIn: 'root'
})
export class PlaceOrderService {

  constructor() { }

  placeOrder(order : OrderRequest): void {
    console.log('Order placed:', order);
  }
}
