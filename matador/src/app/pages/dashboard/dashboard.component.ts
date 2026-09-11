import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

interface SummaryCard {
  label: string;
  value: string;
  changeText?: string;
  changePositive?: boolean;
}

interface Holding {
  name: string;
  symbol: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  dayChangePct: number;
  totalReturnPct: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  summaryCards: SummaryCard[] = [
    { label: 'Total Portfolio Value', value: '$1,248,392.40', changeText: '+1.84% (+$22,510.12) Today', changePositive: true },
    { label: 'Available Cash Balance', value: '$142,390.10' },
    { label: "Today's Realized P&L", value: '+$4,180.50', changeText: '+0.34% Today', changePositive: true },
    { label: 'Active Open Orders', value: '3 Pending' }
  ];

  displayedColumns: string[] = ['instrument', 'quantity', 'avgCost', 'currentPrice', 'marketValue', 'dayChange', 'totalReturn'];

  holdings: Holding[] = [
    { name: 'Apple Inc.', symbol: 'AAPL', quantity: 250, avgCost: 172.50, currentPrice: 184.20, marketValue: 46050.00, dayChangePct: 1.40, totalReturnPct: 6.78 },
    { name: 'Microsoft Corp.', symbol: 'MSFT', quantity: 180, avgCost: 380.20, currentPrice: 415.60, marketValue: 74808.00, dayChangePct: -0.25, totalReturnPct: 9.31 },
    { name: 'Alphabet Inc.', symbol: 'GOOGL', quantity: 300, avgCost: 135.10, currentPrice: 142.80, marketValue: 42840.00, dayChangePct: 2.15, totalReturnPct: 5.70 },
    { name: 'Amazon.com Inc.', symbol: 'AMZN', quantity: 150, avgCost: 168.00, currentPrice: 174.42, marketValue: 26163.00, dayChangePct: 0.85, totalReturnPct: 3.82 },
    { name: 'Tesla Inc.', symbol: 'TSLA', quantity: 90, avgCost: 210.50, currentPrice: 175.34, marketValue: 15780.60, dayChangePct: -3.45, totalReturnPct: -16.70 },
    { name: 'JPMorgan Chase & Co.', symbol: 'JPM', quantity: 110, avgCost: 165.00, currentPrice: 192.12, marketValue: 21133.20, dayChangePct: 0.12, totalReturnPct: 16.44 },
    { name: 'Visa Inc.', symbol: 'V', quantity: 80, avgCost: 245.00, currentPrice: 281.50, marketValue: 22520.00, dayChangePct: 1.10, totalReturnPct: 14.89 },
    { name: 'NVIDIA Corporation', symbol: 'NVDA', quantity: 400, avgCost: 480.00, currentPrice: 875.12, marketValue: 350048.00, dayChangePct: 4.82, totalReturnPct: 82.31 }
  ];

  get totalPositions(): number {
    return this.holdings.length;
  }

  refreshHoldings(): void {
    // Placeholder for future data refresh integration
  }
}
