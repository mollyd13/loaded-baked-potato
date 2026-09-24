import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export type AssetClass = 'Equity (UK)' | 'Equity (US)' | 'Equity (IN)' | 'FX' | 'Crypto';
export type ClientSegment = 'New' | 'Occasional' | 'Active';

/**
 * One day of aggregated trading for an instrument and client segment.
 * Rows carry no client identifiers: the analytics view only ever sees totals.
 */
export interface ActivityRow {
  date: Date;
  instrument: string;
  symbol: string;
  assetClass: AssetClass;
  segment: ClientSegment;
  orders: number;
  filled: number;
  volume: number;
}

export interface ActivityReport {
  /** When the reporting copy was last refreshed from the trading system. */
  asOf: Date;
  rows: ActivityRow[];
}

const INSTRUMENTS: { instrument: string; symbol: string; assetClass: AssetClass; avgTicket: number }[] = [
  { instrument: 'Apple Inc.', symbol: 'AAPL', assetClass: 'Equity (US)', avgTicket: 2400 },
  { instrument: 'NVIDIA Corporation', symbol: 'NVDA', assetClass: 'Equity (US)', avgTicket: 3100 },
  { instrument: 'HSBC Holdings', symbol: 'HSBA', assetClass: 'Equity (UK)', avgTicket: 1500 },
  { instrument: 'BP plc', symbol: 'BP', assetClass: 'Equity (UK)', avgTicket: 1200 },
  { instrument: 'Reliance Industries', symbol: 'RELIANCE', assetClass: 'Equity (IN)', avgTicket: 900 },
  { instrument: 'Infosys Ltd.', symbol: 'INFY', assetClass: 'Equity (IN)', avgTicket: 800 },
  { instrument: 'Euro / US Dollar', symbol: 'EURUSD', assetClass: 'FX', avgTicket: 5000 },
  { instrument: 'Bitcoin', symbol: 'BTC', assetClass: 'Crypto', avgTicket: 1800 }
];

const SEGMENTS: { segment: ClientSegment; weight: number }[] = [
  { segment: 'New', weight: 0.6 },
  { segment: 'Occasional', weight: 1 },
  { segment: 'Active', weight: 2.2 }
];

const DAYS_OF_HISTORY = 90;

/**
 * Supplies aggregated trading activity for internal reporting.
 * Returns generated mock data until the reporting API is available; swap the
 * body of getActivity() for an HttpClient call against the reporting store.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  getActivity(): Observable<ActivityReport> {
    return of({ asOf: new Date(), rows: buildMockRows() });
  }
}

function buildMockRows(): ActivityRow[] {
  const rows: ActivityRow[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let seed = 42;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  for (let day = DAYS_OF_HISTORY - 1; day >= 0; day--) {
    const date = new Date(today);
    date.setDate(today.getDate() - day);
    const trend = 1 + (DAYS_OF_HISTORY - day) / DAYS_OF_HISTORY;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    for (const inst of INSTRUMENTS) {
      // Only crypto trades at weekends.
      if (isWeekend && inst.assetClass !== 'Crypto') {
        continue;
      }
      for (const seg of SEGMENTS) {
        const orders = Math.round((2 + random() * 10) * seg.weight * trend);
        const filled = Math.round(orders * (0.85 + random() * 0.14));
        const volume = orders * inst.avgTicket * (0.7 + random() * 0.6);
        rows.push({
          date,
          instrument: inst.instrument,
          symbol: inst.symbol,
          assetClass: inst.assetClass,
          segment: seg.segment,
          orders,
          filled,
          volume
        });
      }
    }
  }
  return rows;
}
