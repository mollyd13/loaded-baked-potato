import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

interface Order {
  id: string;
  timestamp: Date;
  instrument: string;
  symbol: string;
  assetType: string;
  actionType: 'BUY' | 'SELL';
  orderType: string;
  quantity: number;
  price: number;
  fee: number;

  timing: string;
  status: 'FILLED' | 'PARTIALLY_FILLED' | 'PENDING' | 'CANCELLED';
  currency: string;
}

interface OrderSummary {
  label: string;
  value: string;
  changeText?: string;
  changePositive?: boolean;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  orderSummaries: OrderSummary[] = [];
  displayedColumns: string[] = ['timestamp', 'instrument', 'assetType', 'actionType', 'orderType', 'quantity', 'price', 'totalValue', 'fee', 'timing', 'status', 'currency'];

  allOrders: Order[] = [
    { id: '1', timestamp: new Date('2026-09-30T14:32:00'), instrument: 'Apple Inc.', symbol: 'AAPL', assetType: 'EQUITY', actionType: 'BUY', orderType: 'MARKET', quantity: 50, price: 184.20, fee: 0.00, timing: 'DAY', status: 'FILLED', currency: 'USD' },
    { id: '2', timestamp: new Date('2026-09-29T10:15:00'), instrument: 'Bitcoin', symbol: 'BTC', assetType: 'CRYPTO', actionType: 'BUY', orderType: 'LIMIT', quantity: 2, price: 62000.00, fee: 434.00, timing: 'GTC', status: 'FILLED', currency: 'USD' },
    { id: '3', timestamp: new Date('2026-09-28T16:05:00'), instrument: 'EUR/USD', symbol: 'EURUSD', assetType: 'FX', actionType: 'SELL', orderType: 'MARKET', quantity: 1000, price: 1.09, fee: 8.18, timing: 'DAY', status: 'FILLED', currency: 'USD' }
  ];

  filteredOrders: Order[] = [];
  filterStatus: string = 'ALL';
  filterActionType: string = 'ALL';
  filterOrderType: string = 'ALL';
  filterAssetType: string = 'ALL';
  startDate: Date | null = null;
  endDate: Date | null = null;

  ngOnInit(): void {
    this.filteredOrders = [...this.allOrders];
    this.updateSummaries();
  }

    selectedOrder: Order | null = null;

  selectOrder(order: Order): void {
    this.selectedOrder = this.selectedOrder === order ? null : order;
  }

  netAmount(o: Order): number {
    const gross = o.price * o.quantity;
    return o.actionType === 'BUY' ? gross + o.fee : gross - o.fee;
  }

  updateSummaries(): void {
    const totalOrders = this.filteredOrders.length;
    const filledOrders = this.filteredOrders.filter(o => o.status === 'FILLED').length;
    const totalVolume = this.filteredOrders.reduce((sum, o) => sum + (o.price * o.quantity), 0);
    const buyOrders = this.filteredOrders.filter(o => o.orderType === 'BUY').length;

    this.orderSummaries = [
      { label: 'Total Orders', value: totalOrders.toString(), changeText: `${filledOrders} Filled`, changePositive: true },
      { label: 'Total Volume', value: `$${(totalVolume / 1000).toFixed(1)}K`, changeText: `${buyOrders} Buys`, changePositive: true },
      { label: 'Avg Order Value', value: `$${(totalOrders > 0 ? totalVolume / totalOrders : 0).toFixed(2)}` }
    ];
  }

  applyFilters(): void {
    this.filteredOrders = this.allOrders.filter(order => {
      const statusMatch = this.filterStatus === 'ALL' || order.status === this.filterStatus;
      const actionTypeMatch = this.filterActionType === 'ALL' || order.actionType === this.filterActionType;
      const orderTypeMatch = this.filterOrderType === 'ALL' || order.orderType === this.filterOrderType;
      const assetTypeMatch = this.filterAssetType === 'ALL' || order.assetType === this.filterAssetType;
      const startMatch = !this.startDate || order.timestamp >= this.startDate;
      const endMatch = !this.endDate || order.timestamp <= this.endDate;
      return statusMatch && actionTypeMatch && orderTypeMatch && assetTypeMatch && startMatch && endMatch;
    });
    this.updateSummaries();
  }

  resetFilters(): void {
    this.filterStatus = 'ALL';
    this.filterActionType = 'ALL';
    this.filterOrderType = 'ALL';
    this.filterAssetType = 'ALL';
    this.startDate = null;
    this.endDate = null;
    this.filteredOrders = [...this.allOrders];
    this.updateSummaries();
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'FILLED': 'check_circle',
      'PARTIALLY_FILLED': 'schedule',
      'PENDING': 'hourglass_empty',
      'CANCELLED': 'cancel'
    };
    return iconMap[status] || 'help';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
