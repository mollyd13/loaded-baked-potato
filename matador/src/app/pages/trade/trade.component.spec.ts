import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradeComponent } from './trade.component';
import { ApiService, StockCandles, StockQuote } from '../../api.service';
import { PlaceOrderService } from '../../services/place-order.service';
import { CashService } from '../../services/cash.service';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

describe('TradeComponent', () => {
  let component: TradeComponent;
  let fixture: ComponentFixture<TradeComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockPlaceOrderService: jasmine.SpyObj<PlaceOrderService>;
  let mockCashService: jasmine.SpyObj<CashService>;

  const mockStockQuote: StockQuote = {
    data: {
      symbol: 'NVDA',
      price: 485.20,
      change: 11.32,
      changePercent: 2.40,
      bid: 485.10,
      ask: 485.30,
      asOf: '2026-10-05',
      currency: 'USD',
      spreadBps: 2,
      previousClose: 473.88,
      marketState: 'OPEN'
    }
  };

  const mockHttpResponse = new HttpResponse<StockQuote>({
    body: mockStockQuote,
    status: 200,
    statusText: 'OK'
  });

  const mockCandles = new HttpResponse<StockCandles>({
    body: {
      data: {
        symbol: 'NVDA',
        interval: '1d',
        currency: 'USD',
        candles: [100, 110, 105, 120].map((close) => (
          { date: '2026-10-01', open: close, high: close, low: close, close, volume: 1, synthetic: false }
        ))
      }
    },
    status: 200,
    statusText: 'OK'
  });

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', ['getStockQuote', 'getStockCandles']);
    mockPlaceOrderService = jasmine.createSpyObj('PlaceOrderService', ['placeOrder']);
    mockCashService = jasmine.createSpyObj('CashService', ['getBalance']);

    await TestBed.configureTestingModule({
      imports: [TradeComponent],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: PlaceOrderService, useValue: mockPlaceOrderService},
        { provide: CashService, useValue: mockCashService },
        provideHttpClient()
      ]
    }).compileComponents();

    mockApiService.getStockQuote.and.returnValue(of(mockHttpResponse));
    mockApiService.getStockCandles.and.returnValue(of(mockCandles));
    mockCashService.getBalance.and.returnValue(of({ currency: 'USD', balance: 10000 }));
    fixture = TestBed.createComponent(TradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to a 10 share buy of the quoted symbol', () => {
    expect(component.orderForm.value.action).toBe('BUY');
    expect(component.orderForm.value.quantity).toBe(10);
    expect(component.data?.data.symbol).toBe('NVDA');
  });

  describe('price history chart', () => {
    it('should load daily closes for the default 1M range', () => {
      expect(component.history).toEqual([100, 110, 105, 120]);
      const args = mockApiService.getStockCandles.calls.mostRecent().args;
      expect(args[0]).toBe('AAPL'); // the ticker typed in the form
      expect(args[3]).toBe('1d');
      const days = (new Date(args[2]).getTime() - new Date(args[1]).getTime()) / 86400000;
      expect(Math.round(days)).toBe(30);
    });

    it('should scale closes into polyline points within the chart box', () => {
      const points = component.sparklinePoints.split(' ').map((p) => p.split(',').map(Number));
      expect(points.length).toBe(4);
      expect(points[0][0]).toBe(0);
      expect(points[3][0]).toBe(300);
      expect(points[3][1]).toBe(0);   // highest close sits at the top
      expect(points[0][1]).toBe(48);  // lowest close sits at the bottom
    });

    it('should refetch when the range changes', () => {
      component.setChartRange(component.chartRanges[0]);
      const args = mockApiService.getStockCandles.calls.mostRecent().args;
      const days = (new Date(args[2]).getTime() - new Date(args[1]).getTime()) / 86400000;
      expect(Math.round(days)).toBe(7);
      expect(component.selectedRange.label).toBe('1W');
    });

    it('should render the chart only when there is history', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('svg.sparkline')).toBeTruthy();

      component.history = [];
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('svg.sparkline')).toBeNull();
      expect(component.sparklinePoints).toBe('');
    });
  });

  describe('cost and quantitycalculation', () => {
    it('should price a market order off the live quote plus the system fee', () => {
      expect(component.executionPrice).toBe(485.20);
      expect(component.subtotal).toBeCloseTo(4852.00, 2);
      expect(component.estimatedTotal).toBeCloseTo(4854.50, 2);
    });

    it('should track quantity changes in the estimated total', () => {
      component.orderForm.patchValue({ quantity: 1 });
      expect(component.estimatedTotal).toBeCloseTo(487.70, 2);
    });
  });

  describe('price and quantity input handling', () => {
    it('should recalculate price when quantity changes', () => {
      component.orderForm.patchValue({ quantity: 2 });
      component.onQuantityInput();
      expect(component.orderForm.value.price).toBeCloseTo(component.subtotal, 2);
    });

    it('should recalculate quantity when price changes', () => {
      component.orderForm.patchValue({ price: 970.40 });
      component.onPriceInput();
      expect(component.orderForm.value.quantity).toBeCloseTo(2, 4);
    });
  });


  describe('buy and sell actions', () => {
    it('should show transaction mode for BUY', () => {
      expect(component.transactionMode).toBe('INSTANT BUY (NVDA)');
    });

    it('should show transaction mode for SELL', () => {
      component.orderForm.patchValue({ action: 'SELL' });
      expect(component.transactionMode).toBe('INSTANT SELL (NVDA)');
    });
  });

  describe('balance guards', () => {
    it('should allow a buy order that the balance covers', () => {
      expect(component.exceedsBalance).toBeFalse();
      expect(component.canTransmit).toBeTrue();
    });

    it('should block a buy that costs more than the available balance', () => {
      component.orderForm.patchValue({ quantity: 100 });

      expect(component.exceedsBalance).toBeTrue();
      expect(component.canTransmit).toBeFalse();
    });

    it('should not block a sell on available balance', () => {
      component.orderForm.patchValue({ quantity: 100, action: 'SELL' });

      expect(component.exceedsBalance).toBeFalse();
      expect(component.canTransmit).toBeTrue();
    });
  });

  describe('volatility warning', () => {
    it('should flag as volatile when the day change clears the threshold', () => {
      expect(component.isVolatile).toBeTrue();
      expect(component.data?.data.changePercent).toBe(2.40);
    });

    it('should not flag as volatile on a calm quote', () => {
      const calmQuote: StockQuote = {
        data: { ...mockStockQuote.data, changePercent: 0.4 }
      };
      component.data = calmQuote;

      expect(component.isVolatile).toBeFalse();
    });

    it('should flag as volatile on a steep drop', () => {
      const dropQuote: StockQuote = {
        data: { ...mockStockQuote.data, changePercent: -5.1 }
      };
      component.data = dropQuote;

      expect(component.isVolatile).toBeTrue();
      expect(component.isPositive).toBeFalse();
    });

    it('should flag positive changes correctly', () => {
      expect(component.isPositive).toBeTrue();

      const negativeQuote: StockQuote = {
        data: { ...mockStockQuote.data, changePercent: -2.5 }
      };
      component.data = negativeQuote;
      expect(component.isPositive).toBeFalse();
    });
  });


  describe('abort operation', () => {
    it('should reset form to defaults', () => {
      component.orderForm.patchValue({
        quantity: 50,
        action: 'SELL'
      });
      component.abortOperation();
      expect(component.orderForm.value.quantity).toBe(10);
      expect(component.orderForm.value.price).toBeCloseTo(485.20*10, 2);
      expect(component.orderForm.value.action).toBe('BUY');
    });
  });
});
