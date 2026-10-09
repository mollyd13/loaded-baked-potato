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
import { OrderResponse } from '../../models/order-response.model';
import { GetOrderService } from '../../services/get-order.service';

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
  displayedColumns: string[] = ['instrument', 'actionType', 'quantity', 'price', 'totalValue', 'fee', 'status'];

  allOrders: OrderResponse[] = [];
  
  filteredOrders: OrderResponse[] = [];
  filterStatus: string = 'ALL';
  filterActionType: string = 'ALL';
  startDate: Date | null = null;
  endDate: Date | null = null;

  constructor(private orderService: GetOrderService) { }

  ngOnInit(): void {
    this.fetchOrders();
  }

    selectedOrder: OrderResponse | null = null;

  selectOrder(order: OrderResponse): void {
    this.selectedOrder = this.selectedOrder === order ? null : order;
  }

  netAmount(o: OrderResponse): number {
    const gross = o.price * o.quantity;
    return o.actionType === 'BUY' ? gross + o.estimatedFee : gross - o.estimatedFee;
  }

  updateSummaries(): void {
    const totalOrders = this.filteredOrders.length;
    const filledOrders = this.filteredOrders.filter(o => o.orderStatus === 'FILLED').length;
    const totalVolume = this.filteredOrders.reduce((sum, o) => sum + (o.price * o.quantity), 0);
    const buyOrders = this.filteredOrders.filter(o => o.actionType === 'BUY').length;
    const totalFees = this.filteredOrders.reduce((sum, o) => sum + o.estimatedFee, 0);

    this.orderSummaries = [
      { label: 'Total Orders', value: totalOrders.toString(), changeText: `${filledOrders} Filled`, changePositive: true },
      { label: 'Total Volume', value: `$${(totalVolume / 1000).toFixed(1)}K`, changeText: `${buyOrders} Buys`, changePositive: true },
      { label: 'Total Commissions', value: `$${totalFees.toFixed(2)}` },
      { label: 'Avg Order Value', value: `$${(totalOrders > 0 ? totalVolume / totalOrders : 0).toFixed(2)}` }
    ];
  }

  applyFilters(): void {
    this.filteredOrders = this.allOrders.filter(order => {
      const statusMatch = this.filterStatus === 'ALL' || order.orderStatus === this.filterStatus;
      const actionTypeMatch = this.filterActionType === 'ALL' || order.actionType === this.filterActionType;
      return statusMatch && actionTypeMatch;
    });
    this.updateSummaries();
  }

  resetFilters(): void {
    this.filterStatus = 'ALL';
    this.filterActionType = 'ALL';
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

  fetchOrders(): void {
    this.orderService.getOrders().subscribe(orders => {
      this.allOrders = orders;
      this.filteredOrders = [...this.allOrders];
      this.updateSummaries();
    });
  }
}
