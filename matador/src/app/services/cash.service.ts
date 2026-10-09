import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Cash } from '../models/cash.model';

interface BalanceResponse {
  currency: string;
  balance: number;
}
@Injectable({
  providedIn: 'root'
})

export class CashService {

  constructor(private http: HttpClient) { }

  getBalance(currency: string): Observable<BalanceResponse> {
    return this.http.get<BalanceResponse>(`/api/cash/${currency}`);
  }
}
