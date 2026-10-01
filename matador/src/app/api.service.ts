import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.development'; 

export interface ApiStatus {
    data: MarketData;
}

export interface MarketData {
    status: string;
    markets: MarketItem;
}

export interface MarketItem {
    market: string;
    latestEod: string | null;
    stale: boolean;
}

export interface KeyUsageData {
    keyLabel: string | null;
    cohort: string | null;
    dailyQuota: number;
    usedToday: number;
    resetsAt: string;
}

export interface KeyUsage {
    data: KeyUsageData;
}

export interface StockEodCoverage {
    eodFrom: string | null;
    eodTo: string | null;
}

export interface StockRegistryInfoData {
    symbol: string;
    name: string;
    type: string;
    exchange: string;
    currency: string;
    active: boolean;
    coverage: StockEodCoverage;
}

export interface StockRegistryInfo {
    data: StockRegistryInfoData;
}

export interface StockCandle {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    synthetic: boolean;
}

export interface StockCandlesData {
    symbol: string;
    interval: string;
    currency: string;
    candles: Array<{
        candle: StockCandle;
    }>;
}

export interface StockCandles {
    data: StockCandlesData;
}

export interface StockQuote {
    data: StockQuoteData;
}

export interface StockQuoteData {
    symbol: string;
    price: number;
    bid: number;
    ask: number;
    spreadBps: number;
    currency: string;
    change: number;
    changePercent: number;
    previousClose: number;
    asOf: string;
    marketState: string;
}

export interface StockQuoteMultiple {
    quotes: Array<{
        symbol: string;
        source: string;
        stale: boolean;
        quote: StockQuoteData;
    }>
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getMarketStatus(): Observable<HttpResponse<ApiStatus>> {
    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'x-api-key': environment.apiKey
    });
    
    return this.http.get<ApiStatus>(`${this.apiUrl}/health`, {
        headers: headers,
        observe: 'response'
    });
  }

  getKeyUsage(): Observable<HttpResponse<KeyUsage>> {
    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'x-api-key': environment.apiKey
    });

    return this.http.get<KeyUsage>(`${this.apiUrl}/usage`, {
        headers: headers,
        observe: 'response'
    });
  }

  getStockRegistryInfo(symbol: string): Observable<HttpResponse<StockRegistryInfo>> {
    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'x-api-key': environment.apiKey
    });

    return this.http.get<StockRegistryInfo>(`${this.apiUrl}/symbols/${symbol}`, {
        headers: headers,
        observe: 'response'
    });

  }

  getStockCandles(symbol: string, from: string, to: string, interval: string): Observable<HttpResponse<StockCandles>> {
    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'x-api-key': environment.apiKey
    });

    const params = new HttpParams({
        fromObject: {
            from: from,
            to: to,
            interval: interval
        }
    });

    return this.http.get<StockCandles>(`${this.apiUrl}/candles/${symbol}`, {
        headers: headers,
        params: params,
        observe: 'response'
    });
  }

  getStockQuote(symbol: string): Observable<HttpResponse<StockQuote>> {
    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'x-api-key': environment.apiKey
    });
    
    return this.http.get<StockQuote>(`${this.apiUrl}/quotes/${symbol}`, {
        headers: headers,
        observe: 'response'
    });
  }

  getStockQuoteMultiple(symbols: string[]): Observable<HttpResponse<StockQuoteMultiple>> {
    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'x-api-key': environment.apiKey
    });

    const params = new HttpParams({
        fromObject: {
            symbols: symbols.join(',')
        }
    });

    return this.http.get<StockQuoteMultiple>(`${this.apiUrl}/quotes`, {
        headers: headers,
        params: params,
        observe: 'response'
    });
  }


}