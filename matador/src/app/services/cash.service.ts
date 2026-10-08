import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Cash } from '../models/cash.model';

interface BalanceResponse {
  balance: number;
}
@Injectable({
  providedIn: 'root'
})

export class CashService {

  constructor(private http: HttpClient) { }

  getBalance(userId: number): Observable<BalanceResponse> {
    return this.http.get<BalanceResponse>(`/cash/${userId}`);
  }
}
