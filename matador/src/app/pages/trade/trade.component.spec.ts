import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradeComponent } from './trade.component';
import { ApiService, StockQuote } from '../../api.service';
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

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', ['getStockQuote']);
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
