import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../api.service';
import { StockQuote } from '../../api.service';

export type TradeAction = 'BUY' | 'SELL';

/** Flat per-order commission, in the account's currency. */
const SYSTEM_FEE = 2.5;

/** Day change beyond this magnitude surfaces the volatility warning. */
const VOLATILITY_THRESHOLD_PCT = 2;

@Component({
  selector: 'app-trade',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatIconModule, MatButtonModule],
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

  action: TradeAction = 'BUY';
  quantity = 10;
  /** Empty means a market order priced at the terminal quote. */
  limitPrice: number | null = null;
  orderType = 'Market';
  timing = 'GTC';

  readonly systemFee = SYSTEM_FEE;
  availableBalance = 12450.00;
  positionLimit = 500;
  stopLoss: number | null = null;
  takeProfit: number | null = null;

  setAction(action: TradeAction): void {
    this.action = action;
  }

  increment(): void {
    if (this.quantity < this.positionLimit) {
      this.quantity += 1;
    }
  }

  decrement(): void {
    if (this.quantity > 1) {
      this.quantity -= 1;
    }
  }

  /** Clamps whatever the user typed into [1, positionLimit] as a whole number. */
  onQuantityChange(value: unknown): void {
    const parsed = Math.floor(Number(value));
    if (!Number.isFinite(parsed) || parsed < 1) {
      this.quantity = 1;
      return;
    }
    this.quantity = Math.min(parsed, this.positionLimit);
  }

  /** The limit price when one is set, otherwise the live quote. */
  get executionPrice(): number {
    return this.limitPrice && this.limitPrice > 0 ? this.limitPrice : (this.data?.data.price ?? 0);
  }

  get orderTypeLabel(): string {
    return this.limitPrice && this.limitPrice > 0 ? 'Limit' : 'Market';
  }

  get subtotal(): number {
    return this.quantity * this.executionPrice;
  }

  get estimatedTotal(): number {
    return this.subtotal + this.systemFee;
  }

  get transactionMode(): string {
    return `INSTANT ${this.action} (${this.data?.data.symbol ?? 'N/A'})`;
  }

  get isPositive(): boolean {
    return (this.data?.data.changePercent ?? 0) >= 0;
  }

  get isVolatile(): boolean {
    return Math.abs(this.data?.data.changePercent ?? 0) >= VOLATILITY_THRESHOLD_PCT;
  }

  /** A buy cannot settle for more cash than the account holds; a sell always can. */
  get exceedsBalance(): boolean {
    return this.action === 'BUY' && this.estimatedTotal > this.availableBalance;
  }

  get canTransmit(): boolean {
    return this.quantity > 0 && this.quantity <= this.positionLimit && !this.exceedsBalance;
  }

  transmitOrder(): void {
    if (!this.canTransmit) {
      return;
    }
    // Placeholder for future order submission integration
  }

  abortOperation(): void {
    this.quantity = 10;
    this.limitPrice = null;
    this.action = 'BUY';
  }

  saveTemplate(): void {
    // Placeholder for future order template persistence
  }
}
