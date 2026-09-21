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
  displayedColumns: string[] = ['timestamp', 'instrument', 'assetType', 'actionType', 'orderType', 'quantity', 'price', 'totalValue', 'timing', 'status', 'currency'];
  
  allOrders: Order[] = [
    { id: 'ORD-001', timestamp: new Date('2024-01-15T10:30:00'), instrument: 'Apple Inc.', symbol: 'AAPL', assetType: 'Equity', actionType: 'BUY', orderType: 'Market', quantity: 50, price: 180.25, timing: 'day', status: 'FILLED', currency: 'USD' },
    { id: 'ORD-002', timestamp: new Date('2024-01-14T14:15:00'), instrument: 'Microsoft Corp.', symbol: 'MSFT', assetType: 'Crypto', actionType: 'SELL', orderType: 'Market', quantity: 30, price: 412.50, timing: 'day', status: 'FILLED', currency: 'USD' },
    { id: 'ORD-003', timestamp: new Date('2024-01-12T09:45:00'), instrument: 'Alphabet Inc.', symbol: 'GOOGL', assetType: 'Equity', actionType: 'BUY', orderType: 'Market', quantity: 100, price: 140.80, timing: 'day', status: 'FILLED', currency: 'USD' },
    { id: 'ORD-004', timestamp: new Date('2024-01-10T16:20:00'), instrument: 'Amazon.com Inc.', symbol: 'AMZN', assetType: 'Equity', actionType: 'BUY', orderType: 'Limit', quantity: 75, price: 172.30, timing: 'day', status: 'PARTIALLY_FILLED', currency: 'USD' },
    { id: 'ORD-005', timestamp: new Date('2024-01-08T11:00:00'), instrument: 'Tesla Inc.', symbol: 'TSLA', assetType: 'FX', actionType: 'SELL', orderType: 'Limit', quantity: 40, price: 178.90, timing: 'day', status: 'FILLED', currency: 'USD' },
    { id: 'ORD-006', timestamp: new Date('2024-01-05T13:30:00'), instrument: 'JPMorgan Chase & Co.', symbol: 'JPM', assetType: 'Equity', actionType: 'BUY', orderType: 'Market', quantity: 60, price: 188.00, timing: 'day', status: 'PENDING', currency: 'USD' },
    { id: 'ORD-007', timestamp: new Date('2024-01-02T10:15:00'), instrument: 'Visa Inc.', symbol: 'V', assetType: 'Equity', actionType: 'BUY', orderType: 'Market', quantity: 25, price: 278.50, timing: 'day', status: 'FILLED', currency: 'USD' },
    { id: 'ORD-008', timestamp: new Date('2023-12-28T15:45:00'), instrument: 'NVIDIA Corporation', symbol: 'NVDA', assetType: 'FX', actionType: 'SELL', orderType: 'Limit', quantity: 200, price: 850.00, timing: 'day', status: 'FILLED', currency: 'USD' },
    { id: 'ORD-009', timestamp: new Date('2023-12-25T12:00:00'), instrument: 'Apple Inc.', symbol: 'AAPL', assetType: 'Crypto', actionType: 'SELL', orderType: 'Market', quantity: 100, price: 189.50, timing: 'day', status: 'CANCELLED', currency: 'USD' },
    { id: 'ORD-010', timestamp: new Date('2023-12-20T09:30:00'), instrument: 'Microsoft Corp.', symbol: 'MSFT', assetType: 'Equity', actionType: 'BUY', orderType: 'Market', quantity: 45, price: 378.20, timing: 'day', status: 'FILLED', currency: 'USD' },
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
