import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
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

/** Flat per-order commission, in the account's currency. */
const SYSTEM_FEE = 2.5;

/** Day change beyond this magnitude surfaces the volatility warning. */
const VOLATILITY_THRESHOLD_PCT = 2;

@Component({
  selector: 'app-trade',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './trade.component.html',
  styleUrl: './trade.component.css'
})
export class TradeComponent implements OnInit {
  private apiService = inject(ApiService);
  tickerInput: string = 'AAPL';  // User input for ticker
  errorMessage: string | null = null;

  data: StockQuote | null = null;

  ngOnInit(): void {
    // Load initial ticker on component init
    this.loadStockQuote();
  }

  loadStockQuote(): void {
    if (!this.tickerInput.trim()) {
      this.errorMessage = 'Please enter a valid ticker symbol.';
      return;
    }

    this.errorMessage = null;
    this.apiService.getStockQuote(this.tickerInput.toUpperCase()).subscribe({
      next: (response) => {
        if (response.status === 200 && response.body) {
          this.data = response.body;
        }
        else {
          this.errorMessage = `Unexpected server response: ${response.status}`;
        }
      },
      error: (err) => {
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

  orderForm: FormGroup;
  availableBalance = 10000; // Mock available balance

  constructor(private placeOrderService: PlaceOrderService, private fb : FormBuilder) {
    this.orderForm = this.fb.group({
      action: ["BUY"],
      quantity: [10],
      limitPrice: [null],
      orderType: ['Market'],
      timing: ['GTC'],
    });
  }


  /** Clamps whatever the user typed into [1, Infinity] as a whole number. */
  onQuantityChange(value: unknown): void {
    const parsed = Math.floor(Number(value));
    if (!Number.isFinite(parsed) || parsed < 1) {
      this.orderForm.patchValue({ quantity: 1 });
      return;
    }
    this.orderForm.patchValue({ quantity: parsed });
  }

  /** The limit price when one is set, otherwise the live quote. */
  get executionPrice(): number {
    return this.orderForm.value.limitPrice && this.orderForm.value.limitPrice > 0 ? this.orderForm.value.limitPrice : (this.data?.data.price ?? 0);
  }

  get orderTypeLabel(): string {
    return this.orderForm.value.limitPrice && this.orderForm.value.limitPrice > 0 ? 'Limit' : 'Market';
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
    return this.orderForm.value.quantity > 0 && !this.exceedsBalance;
  }

  get fee(): number {
    return SYSTEM_FEE;
  }


  decrementQuantity(): void {
    const currentQuantity = this.orderForm.value.quantity;
    if (currentQuantity > 1) {
      this.orderForm.patchValue({ quantity: currentQuantity - 1 });
    }
  }

  incrementQuantity(): void {
    const currentQuantity = this.orderForm.value.quantity;
    this.orderForm.patchValue({ quantity: currentQuantity + 1 });
  }

  decrementLimit(): void {
    const currentLimit = this.orderForm.value.limitPrice;
    if (currentLimit > 0) {
      this.orderForm.patchValue({ limitPrice: Number((currentLimit - .01).toFixed(2)) });
    }
  }

  incrementLimit(): void {
    const currentLimit = this.orderForm.value.limitPrice;
    this.orderForm.patchValue({ limitPrice: Number((currentLimit + .01).toFixed(2)) });
  }

  transmitOrder(): void {
    if (!this.canTransmit) {
      return;
    }
    const orderRequest: OrderRequest = {
      user_id: 1, // Replace with actual user ID
      ticker: this.data?.data.symbol ?? 'N/A',
      asset_type: 'EQUITY', // Replace with actual asset type
      action_type: this.orderForm.value.action,
      order_type: this.orderTypeLabel.toUpperCase(),
      quantity: this.orderForm.value.quantity,
      price: this.executionPrice,
      timing: this.orderForm.value.timing, // Replace with actual timing if needed
      currency: 'USD' // Replace with actual currency if needed
    };
    this.placeOrderService.placeOrder(orderRequest);
  }

  abortOperation(): void {
    this.orderForm.patchValue({ quantity: 10 });
    this.orderForm.patchValue({ limitPrice: null });
    this.orderForm.patchValue({ action: 'BUY' });
  }

  saveTemplate(): void {
    // Placeholder for future order template persistence
  }
}
