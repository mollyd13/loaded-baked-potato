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
  orderType: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  totalValue: number;
  status: 'FILLED' | 'PARTIALLY_FILLED' | 'PENDING' | 'CANCELLED';
  commission: number;
  netProceeds: number;
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
  displayedColumns: string[] = ['timestamp', 'instrument', 'orderType', 'quantity', 'price', 'totalValue', 'status', 'commission', 'netProceeds'];
  
  allOrders: Order[] = [
    { id: 'ORD-001', timestamp: new Date('2024-01-15T10:30:00'), instrument: 'Apple Inc.', symbol: 'AAPL', orderType: 'BUY', quantity: 50, price: 180.25, totalValue: 9012.50, status: 'FILLED', commission: 9.00, netProceeds: 9021.50 },
    { id: 'ORD-002', timestamp: new Date('2024-01-14T14:15:00'), instrument: 'Microsoft Corp.', symbol: 'MSFT', orderType: 'SELL', quantity: 30, price: 412.50, totalValue: 12375.00, status: 'FILLED', commission: 12.00, netProceeds: 12363.00 },
    { id: 'ORD-003', timestamp: new Date('2024-01-12T09:45:00'), instrument: 'Alphabet Inc.', symbol: 'GOOGL', orderType: 'BUY', quantity: 100, price: 140.80, totalValue: 14080.00, status: 'FILLED', commission: 14.00, netProceeds: 14094.00 },
    { id: 'ORD-004', timestamp: new Date('2024-01-10T16:20:00'), instrument: 'Amazon.com Inc.', symbol: 'AMZN', orderType: 'BUY', quantity: 75, price: 172.30, totalValue: 12922.50, status: 'PARTIALLY_FILLED', commission: 13.00, netProceeds: 12935.50 },
    { id: 'ORD-005', timestamp: new Date('2024-01-08T11:00:00'), instrument: 'Tesla Inc.', symbol: 'TSLA', orderType: 'SELL', quantity: 40, price: 178.90, totalValue: 7156.00, status: 'FILLED', commission: 7.00, netProceeds: 7149.00 },
    { id: 'ORD-006', timestamp: new Date('2024-01-05T13:30:00'), instrument: 'JPMorgan Chase & Co.', symbol: 'JPM', orderType: 'BUY', quantity: 60, price: 188.00, totalValue: 11280.00, status: 'PENDING', commission: 11.00, netProceeds: 11291.00 },
    { id: 'ORD-007', timestamp: new Date('2024-01-02T10:15:00'), instrument: 'Visa Inc.', symbol: 'V', orderType: 'BUY', quantity: 25, price: 278.50, totalValue: 6962.50, status: 'FILLED', commission: 7.00, netProceeds: 6969.50 },
    { id: 'ORD-008', timestamp: new Date('2023-12-28T15:45:00'), instrument: 'NVIDIA Corporation', symbol: 'NVDA', orderType: 'SELL', quantity: 200, price: 850.00, totalValue: 170000.00, status: 'FILLED', commission: 150.00, netProceeds: 169850.00 },
    { id: 'ORD-009', timestamp: new Date('2023-12-25T12:00:00'), instrument: 'Apple Inc.', symbol: 'AAPL', orderType: 'SELL', quantity: 100, price: 189.50, totalValue: 18950.00, status: 'CANCELLED', commission: 0.00, netProceeds: 18950.00 },
    { id: 'ORD-010', timestamp: new Date('2023-12-20T09:30:00'), instrument: 'Microsoft Corp.', symbol: 'MSFT', orderType: 'BUY', quantity: 45, price: 378.20, totalValue: 17019.00, status: 'FILLED', commission: 17.00, netProceeds: 17036.00 },
  ];
  
  filteredOrders: Order[] = [];
  filterStatus: string = 'ALL';
  filterOrderType: string = 'ALL';
  startDate: Date | null = null;
  endDate: Date | null = null;

  ngOnInit(): void {
    this.filteredOrders = [...this.allOrders];
    this.updateSummaries();
  }

  updateSummaries(): void {
    const totalOrders = this.filteredOrders.length;
    const filledOrders = this.filteredOrders.filter(o => o.status === 'FILLED').length;
    const totalVolume = this.filteredOrders.reduce((sum, o) => sum + o.totalValue, 0);
    const totalCommissions = this.filteredOrders.reduce((sum, o) => sum + o.commission, 0);
    const buyOrders = this.filteredOrders.filter(o => o.orderType === 'BUY').length;

    this.orderSummaries = [
      { label: 'Total Orders', value: totalOrders.toString(), changeText: `${filledOrders} Filled`, changePositive: true },
      { label: 'Total Volume', value: `$${(totalVolume / 1000).toFixed(1)}K`, changeText: `${buyOrders} Buys`, changePositive: true },
      { label: 'Total Commissions', value: `$${totalCommissions.toFixed(2)}`, changeText: this.filteredOrders.filter(o => o.orderType === 'SELL').length + ' Sells' },
      { label: 'Avg Order Value', value: `$${(totalOrders > 0 ? totalVolume / totalOrders : 0).toFixed(2)}` }
    ];
  }

  applyFilters(): void {
    this.filteredOrders = this.allOrders.filter(order => {
      const statusMatch = this.filterStatus === 'ALL' || order.status === this.filterStatus;
      const typeMatch = this.filterOrderType === 'ALL' || order.orderType === this.filterOrderType;
      const startMatch = !this.startDate || order.timestamp >= this.startDate;
      const endMatch = !this.endDate || order.timestamp <= this.endDate;
      return statusMatch && typeMatch && startMatch && endMatch;
    });
    this.updateSummaries();
  }

  resetFilters(): void {
    this.filterStatus = 'ALL';
    this.filterOrderType = 'ALL';
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
