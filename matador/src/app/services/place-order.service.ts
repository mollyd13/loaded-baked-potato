import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderRequest } from '../models/order-request.model';
import { OrderResponse } from '../models/order-response.model';

@Injectable({
  providedIn: 'root'
})
export class PlaceOrderService {

  constructor(private http: HttpClient) { }

  placeOrder(order: OrderRequest): Observable<OrderResponse> {
    // Request as text to avoid JSON parse errors, then cast to OrderResponse
    return this.http.post('/api/orders', order, { 
      responseType: 'text'
    }).pipe(
      map((response: string) => {
        try {
          return JSON.parse(response) as OrderResponse;
        } catch {
          // If not JSON, return as-is (will be caught as string in error handler)
          throw response;
        }
      })
    ) as Observable<OrderResponse>;
  }
}



