import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OrderResponse } from '../models/order-response.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GetOrderService {

  constructor(private http: HttpClient) { }

  getOrders(): Observable<OrderResponse[]> {

    return this.http.get<OrderResponse[]>('api/orders');
  }
}
