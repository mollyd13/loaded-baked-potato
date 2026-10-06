import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { AuditEventType, TradeAuditService, TradeRecord, TradeStatus } from './trade-audit.service';

type Period = '1' | '7' | '30' | 'ALL';

interface StatusCount {
  status: TradeStatus;
  label: string;
  count: number;
}

const STATUS_LABELS: Record<TradeStatus, string> = {
  SUBMITTED: 'Submitted',
  ACCEPTED: 'Accepted',
  FILLED: 'Filled',
  REJECTED: 'Rejected'
};

const EVENT_ICONS: Record<AuditEventType, string> = {
  SUBMITTED: 'send',
  VALIDATED: 'rule',
  ACCEPTED: 'verified',
  PRICED: 'price_check',
  FILLED: 'check_circle',
  REJECTED: 'cancel'
};

const EVENT_LABELS: Record<AuditEventType, string> = {
  SUBMITTED: 'Order submitted',
  VALIDATED: 'Trading rules checked',
  ACCEPTED: 'Order accepted',
  PRICED: 'Priced',
  FILLED: 'Filled',
  REJECTED: 'Rejected'
};

@Component({
  selector: 'app-trade-lookup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule
  ],
  templateUrl: './trade-lookup.component.html',
  styleUrl: './trade-lookup.component.css'
})
export class TradeLookupComponent implements OnInit {
  readonly statuses: TradeStatus[] = ['SUBMITTED', 'ACCEPTED', 'FILLED', 'REJECTED'];
  displayedColumns: string[] = ['submittedAt', 'orderId', 'client', 'instrument', 'side', 'quantity', 'status'];

  searchText = '';
  filterStatus: TradeStatus | 'ALL' = 'ALL';
  filterPeriod: Period = '30';

  allTrades: TradeRecord[] = [];
  results: TradeRecord[] = [];
  statusCounts: StatusCount[] = [];
  selected: TradeRecord | null = null;

  constructor(private audit: TradeAuditService) {}

  ngOnInit(): void {
    this.audit.getTrades().subscribe((trades) => {
      this.allTrades = trades;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    const query = this.searchText.trim().toLowerCase();
    const since = this.filterPeriod === 'ALL' ? 0 : Date.now() - Number(this.filterPeriod) * 86_400_000;

    const inPeriodAndSearch = this.allTrades.filter((trade) =>
      trade.submittedAt.getTime() >= since &&
      (!query ||
        trade.orderId.toLowerCase().includes(query) ||
        trade.clientId.toLowerCase().includes(query) ||
        trade.clientName.toLowerCase().includes(query) ||
        trade.symbol.toLowerCase().includes(query))
    );

    this.statusCounts = this.statuses.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      count: inPeriodAndSearch.filter((trade) => trade.status === status).length
    }));
    this.results = inPeriodAndSearch.filter((trade) => this.filterStatus === 'ALL' || trade.status === this.filterStatus);

    if (this.selected && !this.results.includes(this.selected)) {
      this.selected = null;
    }
  }

  toggleStatus(status: TradeStatus): void {
    this.filterStatus = this.filterStatus === status ? 'ALL' : status;
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchText = '';
    this.filterStatus = 'ALL';
    this.filterPeriod = '30';
    this.applyFilters();
  }

  select(trade: TradeRecord): void {
    this.selected = trade;
  }

  statusLabel(status: TradeStatus): string {
    return STATUS_LABELS[status];
  }

  eventIcon(type: AuditEventType): string {
    return EVENT_ICONS[type];
  }

  eventLabel(type: AuditEventType): string {
    return EVENT_LABELS[type];
  }

  /** Milliseconds after submission, so the ordering and gaps between steps are visible. */
  elapsed(trade: TradeRecord, at: Date): string {
    const ms = at.getTime() - trade.submittedAt.getTime();
    return ms === 0 ? 'T+0' : `T+${ms} ms`;
  }

  money(value: number | null, currency: string): string {
    if (value === null) {
      return '—';
    }
    const symbol = currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : '$';
    return `${symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: value < 10 ? 4 : 2 })}`;
  }

  /** Saves the selected record as JSON, for attaching to a dispute or regulatory response. */
  downloadRecord(): void {
    if (!this.selected) {
      return;
    }
    const blob = new Blob([JSON.stringify(this.selected, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.selected.orderId}-audit.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
