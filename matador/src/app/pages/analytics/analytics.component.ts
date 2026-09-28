import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivityRow, AnalyticsService, AssetClass, ClientSegment } from './analytics.service';

type Period = '7' | '30' | '90';

interface SummaryCard {
  label: string;
  value: string;
  changeText?: string;
  changePositive?: boolean;
}

interface VolumeBar {
  label: string;
  volume: number;
  heightPct: number;
}

interface InstrumentStat {
  rank: number;
  instrument: string;
  symbol: string;
  assetClass: AssetClass;
  orders: number;
  volume: number;
  sharePct: number;
}

interface SegmentStat {
  segment: ClientSegment;
  orders: number;
  volume: number;
  sharePct: number;
}

/** Periods longer than this are charted by week rather than by day. */
const DAILY_BUCKET_LIMIT_DAYS = 30;

const TOP_INSTRUMENT_COUNT = 5;

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements OnInit {
  readonly assetClasses: AssetClass[] = ['Equity (UK)', 'Equity (US)', 'Equity (IN)', 'FX', 'Crypto'];
  readonly segments: ClientSegment[] = ['New', 'Occasional', 'Active'];

  filterPeriod: Period = '30';
  filterAssetClass: AssetClass | 'ALL' = 'ALL';
  filterSegment: ClientSegment | 'ALL' = 'ALL';

  asOf: Date | null = null;
  summaryCards: SummaryCard[] = [];
  volumeBars: VolumeBar[] = [];
  topInstruments: InstrumentStat[] = [];
  segmentStats: SegmentStat[] = [];
  instrumentColumns: string[] = ['rank', 'instrument', 'assetClass', 'orders', 'volume', 'share'];

  private allRows: ActivityRow[] = [];

  constructor(private analytics: AnalyticsService) {}

  ngOnInit(): void {
    this.analytics.getActivity().subscribe((report) => {
      this.asOf = report.asOf;
      this.allRows = report.rows;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    const days = Number(this.filterPeriod);
    const current = this.rowsInWindow(days, 0);
    const previous = this.rowsInWindow(days, days);

    this.summaryCards = this.buildSummaryCards(current, previous);
    this.volumeBars = this.buildVolumeBars(current, days);
    this.topInstruments = this.buildTopInstruments(current);
    // Segment breakdown ignores the segment filter so the comparison stays meaningful.
    this.segmentStats = this.buildSegmentStats(this.rowsInWindow(days, 0, false));
  }

  resetFilters(): void {
    this.filterPeriod = '30';
    this.filterAssetClass = 'ALL';
    this.filterSegment = 'ALL';
    this.applyFilters();
  }

  formatCurrency(value: number): string {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  }

  /** Rows for the `days`-long window ending `offsetDays` before today. */
  private rowsInWindow(days: number, offsetDays: number, applySegment = true): ActivityRow[] {
    const end = startOfToday();
    end.setDate(end.getDate() - offsetDays + 1);
    const start = new Date(end);
    start.setDate(end.getDate() - days);

    return this.allRows.filter((row) =>
      row.date >= start &&
      row.date < end &&
      (this.filterAssetClass === 'ALL' || row.assetClass === this.filterAssetClass) &&
      (!applySegment || this.filterSegment === 'ALL' || row.segment === this.filterSegment)
    );
  }

  private buildSummaryCards(current: ActivityRow[], previous: ActivityRow[]): SummaryCard[] {
    const now = totals(current);
    const before = totals(previous);
    const avgOrder = now.orders > 0 ? now.volume / now.orders : 0;
    const fillRate = now.orders > 0 ? (now.filled / now.orders) * 100 : 0;

    return [
      { label: 'Trading Volume', value: this.formatCurrency(now.volume), ...changeVsPrevious(now.volume, before.volume) },
      { label: 'Orders Placed', value: now.orders.toLocaleString('en-US'), ...changeVsPrevious(now.orders, before.orders) },
      { label: 'Avg Order Value', value: this.formatCurrency(avgOrder) },
      { label: 'Fill Rate', value: `${fillRate.toFixed(1)}%` }
    ];
  }

  private buildVolumeBars(rows: ActivityRow[], days: number): VolumeBar[] {
    const bucketDays = days > DAILY_BUCKET_LIMIT_DAYS ? 7 : 1;
    const bucketCount = Math.ceil(days / bucketDays);
    const windowStart = startOfToday();
    windowStart.setDate(windowStart.getDate() - days + 1);

    const buckets = Array.from({ length: bucketCount }, (_, i) => {
      const start = new Date(windowStart);
      start.setDate(windowStart.getDate() + i * bucketDays);
      return { start, volume: 0 };
    });

    for (const row of rows) {
      const index = Math.floor((row.date.getTime() - windowStart.getTime()) / (bucketDays * 86_400_000));
      if (index >= 0 && index < bucketCount) {
        buckets[index].volume += row.volume;
      }
    }

    const max = Math.max(...buckets.map((b) => b.volume), 1);
    return buckets.map((b) => ({
      label: b.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: b.volume,
      heightPct: (b.volume / max) * 100
    }));
  }

  private buildTopInstruments(rows: ActivityRow[]): InstrumentStat[] {
    const bySymbol = new Map<string, Omit<InstrumentStat, 'rank' | 'sharePct'>>();
    for (const row of rows) {
      const stat = bySymbol.get(row.symbol) ??
        { instrument: row.instrument, symbol: row.symbol, assetClass: row.assetClass, orders: 0, volume: 0 };
      stat.orders += row.orders;
      stat.volume += row.volume;
      bySymbol.set(row.symbol, stat);
    }

    const totalVolume = totals(rows).volume || 1;
    return [...bySymbol.values()]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, TOP_INSTRUMENT_COUNT)
      .map((stat, i) => ({ ...stat, rank: i + 1, sharePct: (stat.volume / totalVolume) * 100 }));
  }

  private buildSegmentStats(rows: ActivityRow[]): SegmentStat[] {
    const totalVolume = totals(rows).volume || 1;
    return this.segments.map((segment) => {
      const segmentTotals = totals(rows.filter((row) => row.segment === segment));
      return {
        segment,
        orders: segmentTotals.orders,
        volume: segmentTotals.volume,
        sharePct: (segmentTotals.volume / totalVolume) * 100
      };
    });
  }
}

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function totals(rows: ActivityRow[]): { orders: number; filled: number; volume: number } {
  return rows.reduce(
    (acc, row) => ({ orders: acc.orders + row.orders, filled: acc.filled + row.filled, volume: acc.volume + row.volume }),
    { orders: 0, filled: 0, volume: 0 }
  );
}

function changeVsPrevious(current: number, previous: number): Pick<SummaryCard, 'changeText' | 'changePositive'> {
  if (previous <= 0) {
    return {};
  }
  const pct = ((current - previous) / previous) * 100;
  return {
    changeText: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% vs previous period`,
    changePositive: pct >= 0
  };
}
