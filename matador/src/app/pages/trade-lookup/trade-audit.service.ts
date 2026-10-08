import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export type TradeSide = 'BUY' | 'SELL';
export type TradeStatus = 'SUBMITTED' | 'ACCEPTED' | 'FILLED' | 'REJECTED';
export type AuditEventType = 'SUBMITTED' | 'VALIDATED' | 'ACCEPTED' | 'PRICED' | 'FILLED' | 'REJECTED';

export interface RuleCheck {
  rule: string;
  passed: boolean;
  detail: string;
}

/** One step in an order's lifecycle, as recorded at the time it happened. */
export interface AuditEvent {
  type: AuditEventType;
  at: Date;
  summary: string;
  checks?: RuleCheck[];
}

export interface BalanceChange {
  label: string;
  before: string;
  after: string;
}

/** The permanent record of one order, from submission to outcome. Read-only. */
export interface TradeRecord {
  orderId: string;
  clientId: string;
  clientName: string;
  symbol: string;
  instrument: string;
  assetClass: string;
  side: TradeSide;
  quantity: number;  // Supports NUMERIC(38,4) - up to 4 decimal places from backend
  orderType: 'Market' | 'Limit';
  limitPrice: number | null;
  currency: string;
  status: TradeStatus;
  submittedAt: Date;
  quotePrice: number | null;
  fillPrice: number | null;
  fee: number;
  settledAmount: number | null;
  rejectionReason: string | null;
  events: AuditEvent[];
  balanceChanges: BalanceChange[];
}

interface MockInstrument {
  symbol: string;
  instrument: string;
  assetClass: string;
  currency: string;
  price: number;
}

const INSTRUMENTS: MockInstrument[] = [
  { symbol: 'AAPL', instrument: 'Apple Inc.', assetClass: 'Equity (US)', currency: 'USD', price: 184.2 },
  { symbol: 'NVDA', instrument: 'NVIDIA Corporation', assetClass: 'Equity (US)', currency: 'USD', price: 875.12 },
  { symbol: 'HSBA', instrument: 'HSBC Holdings', assetClass: 'Equity (UK)', currency: 'GBP', price: 6.42 },
  { symbol: 'BP', instrument: 'BP plc', assetClass: 'Equity (UK)', currency: 'GBP', price: 4.87 },
  { symbol: 'INFY', instrument: 'Infosys Ltd.', assetClass: 'Equity (IN)', currency: 'INR', price: 1512.4 },
  { symbol: 'EURUSD', instrument: 'Euro / US Dollar', assetClass: 'FX', currency: 'USD', price: 1.0842 },
  { symbol: 'BTC', instrument: 'Bitcoin', assetClass: 'Crypto', currency: 'USD', price: 63250 }
];

const CLIENTS = [
  { id: 'CL-1042', name: 'Joanna Reeves' },
  { id: 'CL-1187', name: 'Marcus Chen' },
  { id: 'CL-1203', name: 'Aisha Patel' },
  { id: 'CL-1311', name: 'Tom Okafor' },
  { id: 'CL-1456', name: 'Lena Novak' }
];

const FEE = 2.5;
const MOCK_ORDER_COUNT = 40;

/**
 * Reads the audit trail for orders. Returns generated mock records until the
 * audit API is available; swap the body of getTrades() for an HttpClient call.
 */
@Injectable({ providedIn: 'root' })
export class TradeAuditService {
  getTrades(): Observable<TradeRecord[]> {
    return of(buildMockTrades());
  }
}

function buildMockTrades(): TradeRecord[] {
  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const pick = <T>(items: T[]): T => items[Math.floor(random() * items.length)];

  const trades: TradeRecord[] = [];
  const now = Date.now();

  for (let i = 0; i < MOCK_ORDER_COUNT; i++) {
    const inst = pick(INSTRUMENTS);
    const client = pick(CLIENTS);
    const side: TradeSide = random() < 0.6 ? 'BUY' : 'SELL';
    const quantity = inst.assetClass === 'Crypto' ? Number((0.05 + random() * 0.5).toFixed(3))
      : inst.assetClass === 'FX' ? Math.round(1000 + random() * 9000)
      : Math.round(1 + random() * 60);
    const isLimit = random() < 0.3;
    const quote = round(inst.price * (0.98 + random() * 0.04), inst.price < 10 ? 4 : 2);
    const limitPrice = isLimit ? round(quote * (0.995 + random() * 0.01), inst.price < 10 ? 4 : 2) : null;
    const submittedAt = new Date(now - Math.floor(random() * 30 * 86_400_000));

    const outcome = random();
    const failsValidation = outcome < 0.1;
    const stillExecuting = !failsValidation && outcome > 0.95;
    const limitMissed = !failsValidation && !stillExecuting && limitPrice !== null &&
      (side === 'BUY' ? quote > limitPrice : quote < limitPrice);

    const cashBefore = round(5000 + random() * 45000, 2);
    const holdingBefore = side === 'SELL' ? quantity + Math.round(random() * 20) : Math.round(random() * 20);

    const at = (ms: number) => new Date(submittedAt.getTime() + ms);
    const checks: RuleCheck[] = [
      { rule: 'Instrument tradable', passed: true, detail: `${inst.symbol} market open` },
      side === 'BUY'
        ? { rule: 'Sufficient cash', passed: !failsValidation, detail: failsValidation
            ? `Needs ${money(quantity * quote + FEE, inst.currency)}, has ${money(cashBefore * 0.1, inst.currency)}`
            : `Needs ${money(quantity * quote + FEE, inst.currency)}, has ${money(cashBefore, inst.currency)}` }
        : { rule: 'Sufficient holding', passed: !failsValidation, detail: failsValidation
            ? `Selling ${quantity}, holds ${Math.max(0, Math.floor(quantity / 2))}`
            : `Selling ${quantity}, holds ${holdingBefore}` },
      { rule: 'Within position limit', passed: true, detail: 'Order size within client limit' }
    ];

    const events: AuditEvent[] = [
      { type: 'SUBMITTED', at: at(0), summary: `${side} ${quantity} ${inst.symbol} (${isLimit ? `Limit ${limitPrice}` : 'Market'}) submitted by client` },
      { type: 'VALIDATED', at: at(38), summary: failsValidation ? 'Failed trading rule checks' : 'Passed trading rule checks', checks }
    ];

    let status: TradeStatus;
    let fillPrice: number | null = null;
    let settledAmount: number | null = null;
    let rejectionReason: string | null = null;
    let balanceChanges: BalanceChange[] = [];

    if (failsValidation) {
      status = 'REJECTED';
      rejectionReason = side === 'BUY' ? 'Insufficient cash' : 'Insufficient holding';
      events.push({ type: 'REJECTED', at: at(41), summary: `Rejected before acceptance: ${rejectionReason.toLowerCase()}. No change to cash or holdings.` });
    } else {
      events.push({ type: 'ACCEPTED', at: at(52), summary: 'Recorded as a firm commitment and queued for execution' });
      if (stillExecuting) {
        status = 'ACCEPTED';
      } else {
        events.push({ type: 'PRICED', at: at(310), summary: `Priced against live quote ${money(quote, inst.currency)}` });
        if (limitMissed) {
          status = 'REJECTED';
          rejectionReason = 'Limit price not met';
          events.push({ type: 'REJECTED', at: at(318), summary: `Quote ${money(quote, inst.currency)} outside limit ${money(limitPrice!, inst.currency)}. No change to cash or holdings.` });
        } else {
          status = 'FILLED';
          fillPrice = quote;
          const gross = round(quantity * fillPrice, 2);
          settledAmount = side === 'BUY' ? round(gross + FEE, 2) : round(gross - FEE, 2);
          const cashAfter = side === 'BUY' ? cashBefore - settledAmount : cashBefore + settledAmount;
          const holdingAfter = side === 'BUY' ? holdingBefore + quantity : holdingBefore - quantity;
          events.push({ type: 'FILLED', at: at(326), summary: `Filled ${quantity} @ ${money(fillPrice, inst.currency)}. Cash, holding and trade record updated together.` });
          balanceChanges = [
            { label: `Cash (${inst.currency})`, before: money(cashBefore, inst.currency), after: money(cashAfter, inst.currency) },
            { label: `${inst.symbol} holding`, before: `${round(holdingBefore, 3)}`, after: `${round(holdingAfter, 3)}` }
          ];
        }
      }
    }

    trades.push({
      orderId: `ORD-${(10000 + i * 37).toString()}`,
      clientId: client.id,
      clientName: client.name,
      symbol: inst.symbol,
      instrument: inst.instrument,
      assetClass: inst.assetClass,
      side,
      quantity,
      orderType: isLimit ? 'Limit' : 'Market',
      limitPrice,
      currency: inst.currency,
      status,
      submittedAt,
      quotePrice: events.some((e) => e.type === 'PRICED') ? quote : null,
      fillPrice,
      fee: status === 'FILLED' ? FEE : 0,
      settledAmount,
      rejectionReason,
      events,
      balanceChanges
    });
  }

  return trades.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
}

function round(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function money(value: number, currency: string): string {
  const symbol = currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : '$';
  return `${symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: value < 10 ? 4 : 2 })}`;
}
