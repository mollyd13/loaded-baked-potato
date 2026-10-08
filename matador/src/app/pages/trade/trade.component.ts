import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../api.service';
import { StockQuote } from '../../api.service';

export type TradeAction = 'BUY' | 'SELL';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PlaceOrderService } from '../../services/place-order.service';
import { OrderRequest } from '../../models/order-request.model';
import { OrderResponse } from '../../models/order-response.model';

/** Flat per-order commission, in the account's currency. */
const SYSTEM_FEE = 2.5;

/** Day change beyond this magnitude surfaces the volatility warning. */
const VOLATILITY_THRESHOLD_PCT = 2;

/** Selectable chart ranges, in days of daily closes (see Quote.history in models/quote.model.ts). */
export const CHART_RANGES = [
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 },
] as const;

const CHART_WIDTH = 300;
const CHART_HEIGHT = 48;

@Component({
  selector: 'app-trade',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './trade.component.html',
  styleUrl: './trade.component.css'
})
export class TradeComponent implements OnInit {
  private apiService = inject(ApiService);
  errorMessage: string | null = null;

  data: StockQuote | null = null;

  /** Daily closing prices, oldest first; drives the sparkline (Quote.history). */
  history: number[] = [];

  readonly chartRanges = CHART_RANGES;
  selectedRange: (typeof CHART_RANGES)[number] = CHART_RANGES[1];

  ngOnInit(): void {
    // Load initial ticker on component init
    this.loadStockQuote();
  }

  loadStockQuote(): void {
    const ticker = this.orderForm.get('ticker')?.value;
    console.log('loadStockQuote called with ticker:', ticker);
    
    if (!ticker || !ticker.trim()) {
      this.errorMessage = 'Please enter a valid ticker symbol.';
      console.warn('Empty ticker input');
      return;
    }

    this.errorMessage = null;
    const upperTicker = ticker.toUpperCase();
    console.log('Fetching stock quote for:', upperTicker);
    
    this.apiService.getStockQuote(upperTicker).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        if (response.status === 200 && response.body) {
          this.data = response.body;
          console.log('Data loaded:', this.data);
          this.loadPriceHistory(upperTicker);
          this.orderForm.patchValue({ price: (this.executionPrice * this.orderForm.value.quantity).toFixed(2) });
        }
        else {
          this.errorMessage = `Unexpected server response: ${response.status}`;
          console.error('Bad response status:', response.status);
        }
      },
      error: (err) => {
        console.error('API Error:', err);
        if (err.status === 400) {
          this.errorMessage = 'Market endpoint not found.';
        } else if (err.status === 401 || err.status === 403){
          this.errorMessage = 'Authentication failed.';
        } else {
          this.errorMessage = `Unexpected network error: ${err.status}`;
        } 
        console.error(err);
      }
    });
  }

  setChartRange(range: (typeof CHART_RANGES)[number]): void {
    this.selectedRange = range;
    const symbol = this.data?.data.symbol;
    if (symbol) {
      this.loadPriceHistory(symbol);
    }
  }

  /** Fetches daily candles for the selected range and keeps the closes for the chart. */
  loadPriceHistory(symbol: string): void {
    const to = new Date();
    const from = new Date(to.getTime() - this.selectedRange.days * 24 * 60 * 60 * 1000);
    const iso = (d: Date) => d.toISOString().slice(0, 10);

    this.history = [];
    this.apiService.getStockCandles(symbol, iso(from), iso(to), '1d').subscribe({
      next: (response) => {
        const candles = response.body?.data.candles ?? [];
        this.history = candles.map((c) => c.close);
      },
      error: (err) => console.error('Price history unavailable:', err)
    });
  }

  /** SVG polyline points scaled to the chart box; empty until there are two closes. */
  get sparklinePoints(): string {
    if (this.history.length < 2) {
      return '';
    }
    const min = Math.min(...this.history);
    const range = Math.max(...this.history) - min || 1;
    const step = CHART_WIDTH / (this.history.length - 1);
    return this.history
      .map((price, i) => `${(i * step).toFixed(1)},${(CHART_HEIGHT - ((price - min) / range) * CHART_HEIGHT).toFixed(1)}`)
      .join(' ');
  }

  orderForm: FormGroup;
  availableBalance = 10000; // Mock available balance

  constructor(private placeOrderService: PlaceOrderService, private fb : FormBuilder, private router: Router) {
    this.orderForm = this.fb.group({
      ticker: ['AAPL'],
      action: ["BUY"],
      quantity: [10],
      price: [0],
      timing: ['GTC'],
    });
  }

  /** Called on input - recalculates price from quantity */
  onQuantityInput(): void {
    const calculatedPrice = this.subtotal;
    const truncatedPrice = Math.floor(calculatedPrice * 100) / 100;
    this.orderForm.patchValue({ price: truncatedPrice }, { emitEvent: false });
  }

  /** Called on change - rounds quantity to 4 decimal places */
  onQuantityChange(): void {
    const quantity = Number(this.orderForm.value.quantity);
    const rounded = Math.round(quantity * 10000) / 10000;
    this.orderForm.patchValue({ quantity: rounded }, { emitEvent: false });
    this.onQuantityInput(); // recalculate price based on the new quantity
  }

  /** Called on input - recalculates quantity from price */
  onPriceInput(): void {
    const calculatedQuantity = this.orderForm.value.price / this.executionPrice;
    const truncatedQuantity = Math.floor(calculatedQuantity * 10000) / 10000;
    this.orderForm.patchValue({ quantity: truncatedQuantity }, { emitEvent: false });
  }

  /** Called on change - rounds price to 2 decimal places */
  onPriceChange(): void {
    const price = Number(this.orderForm.value.price);
    const rounded = Math.round(price * 100) / 100;
    this.orderForm.patchValue({ price: rounded }, { emitEvent: false });
    this.onPriceInput(); // recalculate quantity based on the new price
  }

  /** The limit price when one is set, otherwise the live quote. */
  get executionPrice(): number {
    return Number((this.data?.data.price.toFixed(2) ?? 0));
  }

  get subtotal(): number {
    return this.orderForm.value.quantity * this.executionPrice;
  }

  get estimatedTotal(): number {
    return this.subtotal + SYSTEM_FEE;
  }

  get transactionMode(): string {
    return `INSTANT ${this.orderForm.value.action} (${this.data?.data.symbol ?? 'N/A'})`;
  }

  get isPositive(): boolean {
    return (this.data?.data.changePercent ?? 0) >= 0;
  }

  get isVolatile(): boolean {
    return Math.abs(this.data?.data.changePercent ?? 0) >= VOLATILITY_THRESHOLD_PCT;
  }

  /** A buy cannot settle for more cash than the account holds; a sell always can. */
  get exceedsBalance(): boolean {
    return this.orderForm.value.action === 'BUY' && this.estimatedTotal > this.availableBalance;
  }

  get canTransmit(): boolean {
    return this.orderForm.value.quantity >= 1 && !this.exceedsBalance;
  }

  get fee(): number {
    return SYSTEM_FEE;
  }

  transmitOrder(): void {
    if (!this.canTransmit) {
      return;
    }
    const orderRequest: OrderRequest = {
      ticker: this.data?.data.symbol ?? 'N/A',
      assetType: 'EQUITY',
      actionType: this.orderForm.value.action,
      quantity: this.orderForm.value.quantity,
      price: this.executionPrice,
      currency: 'USD'
    };
    
    this.placeOrderService.placeOrder(orderRequest).subscribe({
      next: (orderResponse: OrderResponse) => {
        console.log('Order placed successfully:', orderResponse);
        this.router.navigate(['/order-confirmation'], {
          queryParams: {
            orderResponse: JSON.stringify(orderResponse)
          }
        });
      },
      error: (err) => {
        console.error('Order submission failed:', err);
        this.errorMessage = err.error?.message || 'Failed to submit order. Please try again.';
      }
    });
  }

  abortOperation(): void {
    this.orderForm.patchValue({ quantity: 10 });
    this.orderForm.patchValue({ price: (this.executionPrice * 10).toFixed(2) });
    this.orderForm.patchValue({ action: 'BUY' });
  }

  saveTemplate(): void {
    // Placeholder for future order template persistence
  }
}
