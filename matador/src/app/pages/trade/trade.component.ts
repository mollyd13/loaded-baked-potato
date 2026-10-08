import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
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
import { CashService } from '../../services/cash.service';
import { AuthService } from '../../services/auth.service';

/** Flat per-order commission, in the account's currency. */
const SYSTEM_FEE = 2.5;

/** Day change beyond this magnitude surfaces the volatility warning. */
const VOLATILITY_THRESHOLD_PCT = 2;

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
  
  orderForm: FormGroup;
  availableBalance: number;
  currency: string;

  ngOnInit(): void {
    // Load initial ticker and calculate initial price on component init
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
          this.initCurrency();
          this.initPrice();
          this.fetchUserBalance();
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

  constructor(private placeOrderService: PlaceOrderService, private fb : FormBuilder, private cashService: CashService, private authService: AuthService) {
    this.orderForm = this.fb.group({
      ticker: ['AAPL'],
      action: ["BUY"],
      quantity: [10],
      price: [0],
      timing: ['GTC'],
    });
    this.availableBalance = 0;
    this.currency = '';
  }

  initCurrency(): void {
    this.currency = this.data?.data.currency ?? '';
  }

  initPrice(): void {
    this.orderForm.patchValue({ price: (this.executionPrice * this.orderForm.value.quantity).toFixed(2) });
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

  fetchUserBalance(): void {
    this.cashService.getBalance(this.currency).subscribe({
      next: (response) => {
        this.availableBalance = response.balance;
        console.log('Fetched user balance:', this.availableBalance);
      },
      error: (err) => {
        console.error('Failed to fetch user balance:', err);
        this.availableBalance = 0;
      }
    });
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
      asset_type: 'EQUITY', // Replace with actual asset type
      action_type: this.orderForm.value.action,
      quantity: this.orderForm.value.quantity,
      price: this.executionPrice,
      currency: 'USD' // Replace with actual currency if needed
    };
    this.placeOrderService.placeOrder(orderRequest);
  }

  abortOperation(): void {
    this.orderForm.patchValue({ quantity: 10 });
    this.orderForm.patchValue({ price: (this.executionPrice * 10).toFixed(2) });
    this.orderForm.patchValue({ action: 'BUY' });
    this.orderForm.patchValue({ price: (this.executionPrice * 10.0).toFixed(2) });
  }

  saveTemplate(): void {
    // Placeholder for future order template persistence
  }
}
