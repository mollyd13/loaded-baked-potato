import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradeComponent } from './trade.component';
import { ApiService, StockQuote } from '../../api.service';
import { PlaceOrderService } from '../../services/place-order.service';
import { HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';

describe('TradeComponent', () => {
  let component: TradeComponent;
  let fixture: ComponentFixture<TradeComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockPlaceOrderService: jasmine.SpyObj<PlaceOrderService>;

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

    await TestBed.configureTestingModule({
      imports: [TradeComponent],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: PlaceOrderService, useValue: mockPlaceOrderService }
      ]
    }).compileComponents();

    mockApiService.getStockQuote.and.returnValue(of(mockHttpResponse));
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
    expect(component.orderForm.value.limitPrice).toBeNull();
    expect(component.data?.data.symbol).toBe('NVDA');
  });

  describe('cost calculation', () => {
    it('should price a market order off the live quote plus the system fee', () => {
      expect(component.executionPrice).toBe(485.20);
      expect(component.subtotal).toBeCloseTo(4852.00, 2);
      expect(component.estimatedTotal).toBeCloseTo(4854.50, 2);
    });

    it('should price off the limit price once one is entered', () => {
      component.orderForm.patchValue({ limitPrice: 480 });

      expect(component.executionPrice).toBe(480);
      expect(component.estimatedTotal).toBeCloseTo(4802.50, 2);
      expect(component.orderTypeLabel).toBe('Limit');
    });

    it('should ignore a zero or negative limit price', () => {
      component.orderForm.patchValue({ limitPrice: 0 });
      expect(component.executionPrice).toBe(485.20);

      component.orderForm.patchValue({ limitPrice: -25 });
      expect(component.executionPrice).toBe(485.20);
      expect(component.orderTypeLabel).toBe('Market');
    });

    it('should track quantity changes in the estimated total', () => {
      component.orderForm.patchValue({ quantity: 1 });
      expect(component.estimatedTotal).toBeCloseTo(487.70, 2);
    });
  });

  describe('quantity stepper', () => {
    it('should increment and decrement by one share', () => {
      component.incrementQuantity();
      expect(component.orderForm.value.quantity).toBe(11);

      component.decrementQuantity();
      expect(component.orderForm.value.quantity).toBe(10);
    });

    it('should not decrement below a single share', () => {
      component.orderForm.patchValue({ quantity: 1 });
      component.decrementQuantity();
      expect(component.orderForm.value.quantity).toBe(1);
    });

    it('should clamp typed input to whole shares with minimum of 1', () => {
      component.onQuantityChange('25');
      expect(component.orderForm.value.quantity).toBe(25);

      component.onQuantityChange(12.9);
      expect(component.orderForm.value.quantity).toBe(12);

      component.onQuantityChange(-4);
      expect(component.orderForm.value.quantity).toBe(1);

      component.onQuantityChange('abc');
      expect(component.orderForm.value.quantity).toBe(1);
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

    it('should update order type label when action changes', () => {
      expect(component.orderTypeLabel).toBe('Market');
      component.orderForm.patchValue({ limitPrice: 480 });
      expect(component.orderTypeLabel).toBe('Limit');
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

  describe('limit price adjustment', () => {
    it('should increment limit price by 0.01', () => {
      component.orderForm.patchValue({ limitPrice: 480.00 });
      component.incrementLimit();
      expect(component.orderForm.value.limitPrice).toBe(480.01);
    });

    it('should decrement limit price by 0.01', () => {
      component.orderForm.patchValue({ limitPrice: 480.50 });
      component.decrementLimit();
      expect(component.orderForm.value.limitPrice).toBeCloseTo(480.49, 2);
    });

    it('should not decrement limit price below 0', () => {
      component.orderForm.patchValue({ limitPrice: 0.005 });
      component.decrementLimit();
      expect(component.orderForm.value.limitPrice).toBeLessThanOrEqual(0);
    });
  });

  describe('fee calculation', () => {
    it('should expose the system fee', () => {
      expect(component.fee).toBe(2.5);
    });
  });

  describe('abort operation', () => {
    it('should reset form to defaults', () => {
      component.orderForm.patchValue({
        quantity: 50,
        limitPrice: 500,
        action: 'SELL'
      });
      component.abortOperation();
      expect(component.orderForm.value.quantity).toBe(10);
      expect(component.orderForm.value.limitPrice).toBeNull();
      expect(component.orderForm.value.action).toBe('BUY');
    });
  });
});
