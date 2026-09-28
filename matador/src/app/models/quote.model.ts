// Should be populated with real-time market data from our api

export interface Quote {
  symbol: string; // ticker
  price: number;
  bid: number;
  ask: number;
  spreadBps: number; // spread in basis points
  currency: string;
  change: number;
  changePct: number;
  previousClose: number; // previous closing price
  asOf: Date; // timestamp of the quote
  marketState: string; // current market state (e.g., open, closed)
  /** Used for drawing the sparkline chart. */
  history: number[];
}

// siymbol, price, bid, ask, spreadbps, currenty, change, changePct, previous_close, as_of, market_state

// ask is minimum guaranteed price whne im buying
// bid is maximum bidding buy price