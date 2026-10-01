import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradeComponent } from './trade.component';

describe('TradeComponent', () => {
  let component: TradeComponent;
  let fixture: ComponentFixture<TradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradeComponent]
    }).compileComponents();

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
    expect(component.quote.symbol).toBe('NVDA');
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
      expect(component.quote.changePct).toBe(2.40);
    });

    it('should not flag as volatile on a calm quote', () => {
      component.quote = { ...component.quote, changePct: 0.4 };

      expect(component.isVolatile).toBeFalse();
    });

    it('should flag as volatile on a steep drop', () => {
      component.quote = { ...component.quote, changePct: -5.1 };

      expect(component.isVolatile).toBeTrue();
      expect(component.isPositive).toBeFalse();
    });

    it('should flag positive changes correctly', () => {
      expect(component.isPositive).toBeTrue();

      component.quote = { ...component.quote, changePct: -2.5 };
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

  describe('sparkline', () => {
    it('should plot one point per close inside the view box', () => {
      const points = component.sparklinePoints.split(' ');
      expect(points.length).toBe(component.quote.history.length);

      const coordinates = points.map((point) => point.split(',').map(Number));
      coordinates.forEach(([x, y]) => {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(120);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(40);
      });
    });

    it('should return nothing when there is too little history to draw', () => {
      component.quote = { ...component.quote, history: [485.20] };
      expect(component.sparklinePoints).toBe('');
    });

    it('should survive a flat history without dividing by zero', () => {
      component.quote = { ...component.quote, history: [100, 100, 100] };

      expect(component.sparklinePoints).toContain('0.00,40.00');
      expect(component.sparklinePoints).not.toContain('NaN');
    });
  });

  describe('fee calculation', () => {
    it('should expose the system fee', () => {
      expect(component.fee).toBe(2.5);
    });
  });
});
