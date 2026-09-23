import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export type TradeAction = 'BUY' | 'SELL';

export interface Quote {
  ticker: string;
  name: string;
  price: number;
  changePct: number;
  /** Recent closes, oldest first, used to draw the sparkline. */
  history: number[];
}

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
export class TradeComponent {
  quote: Quote = {
    ticker: 'NVDA',
    name: 'NVIDIA Corp.',
    price: 485.20,
    changePct: 2.40,
    history: [468.10, 470.40, 469.20, 474.80, 473.10, 478.60, 481.90, 480.20, 483.70, 485.20]
  };

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
    return this.limitPrice && this.limitPrice > 0 ? this.limitPrice : this.quote.price;
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
    return `INSTANT ${this.action} (${this.quote.ticker})`;
  }

  get isPositive(): boolean {
    return this.quote.changePct >= 0;
  }

  get isVolatile(): boolean {
    return Math.abs(this.quote.changePct) >= VOLATILITY_THRESHOLD_PCT;
  }

  /** A buy cannot settle for more cash than the account holds; a sell always can. */
  get exceedsBalance(): boolean {
    return this.action === 'BUY' && this.estimatedTotal > this.availableBalance;
  }

  get canTransmit(): boolean {
    return this.quantity > 0 && this.quantity <= this.positionLimit && !this.exceedsBalance;
  }

  /** Quote history mapped onto a 120x40 viewBox as an SVG polyline. */
  get sparklinePoints(): string {
    const points = this.quote.history;
    if (points.length < 2) {
      return '';
    }
    const min = Math.min(...points);
    const max = Math.max(...points);
    const span = max - min || 1;
    return points
      .map((value, index) => {
        const x = (index / (points.length - 1)) * 120;
        const y = 40 - ((value - min) / span) * 40;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
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
