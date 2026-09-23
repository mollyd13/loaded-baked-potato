import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeComponent } from './trade.component';

describe('TradeComponent', () => {
  let component: TradeComponent;
  let fixture: ComponentFixture<TradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to a 10 share buy of the quoted ticker', () => {
    expect(component.action).toBe('BUY');
    expect(component.quantity).toBe(10);
    expect(component.limitPrice).toBeNull();
    expect(component.quote.ticker).toBe('NVDA');
  });

  describe('cost calculation', () => {
    it('should price a market order off the live quote plus the system fee', () => {
      expect(component.executionPrice).toBe(485.20);
      expect(component.subtotal).toBeCloseTo(4852.00, 2);
      expect(component.estimatedTotal).toBeCloseTo(4854.50, 2);
    });

    it('should price off the limit price once one is entered', () => {
      component.limitPrice = 480;

      expect(component.executionPrice).toBe(480);
      expect(component.estimatedTotal).toBeCloseTo(4802.50, 2);
      expect(component.orderTypeLabel).toBe('Limit');
    });

    it('should ignore a zero or negative limit price', () => {
      component.limitPrice = 0;
      expect(component.executionPrice).toBe(485.20);

      component.limitPrice = -25;
      expect(component.executionPrice).toBe(485.20);
      expect(component.orderTypeLabel).toBe('Market');
    });

    it('should track quantity changes in the estimated total', () => {
      component.quantity = 1;
      expect(component.estimatedTotal).toBeCloseTo(487.70, 2);
    });
  });

  describe('quantity stepper', () => {
    it('should increment and decrement by one share', () => {
      component.increment();
      expect(component.quantity).toBe(11);

      component.decrement();
      expect(component.quantity).toBe(10);
    });

    it('should not decrement below a single share', () => {
      component.quantity = 1;
      component.decrement();
      expect(component.quantity).toBe(1);
    });

    it('should not increment past the position limit', () => {
      component.quantity = component.positionLimit;
      component.increment();
      expect(component.quantity).toBe(component.positionLimit);
    });

    it('should clamp typed input to whole shares within the position limit', () => {
      component.onQuantityChange('25');
      expect(component.quantity).toBe(25);

      component.onQuantityChange(12.9);
      expect(component.quantity).toBe(12);

      component.onQuantityChange(-4);
      expect(component.quantity).toBe(1);

      component.onQuantityChange('abc');
      expect(component.quantity).toBe(1);

      component.onQuantityChange(9999);
      expect(component.quantity).toBe(component.positionLimit);
    });
  });

  describe('buy and sell actions', () => {
    it('should switch sides and relabel the transaction mode', () => {
      expect(component.transactionMode).toBe('INSTANT BUY (NVDA)');

      component.setAction('SELL');
      expect(component.action).toBe('SELL');
      expect(component.transactionMode).toBe('INSTANT SELL (NVDA)');
    });

    it('should render the action in the transmit button label', () => {
      const transmit = (): string =>
        fixture.nativeElement.querySelector('.transmit-button').textContent.trim();

      expect(transmit()).toContain('Transmit Buy Order');

      component.setAction('SELL');
      fixture.detectChanges();
      expect(transmit()).toContain('Transmit Sell Order');
    });
  });

  describe('balance guards', () => {
    it('should allow an order the balance covers', () => {
      expect(component.exceedsBalance).toBeFalse();
      expect(component.canTransmit).toBeTrue();
    });

    it('should block a buy that costs more than the available balance', () => {
      component.quantity = 100;

      expect(component.exceedsBalance).toBeTrue();
      expect(component.canTransmit).toBeFalse();
    });

    it('should not block a sell on available balance', () => {
      component.quantity = 100;
      component.setAction('SELL');

      expect(component.exceedsBalance).toBeFalse();
      expect(component.canTransmit).toBeTrue();
    });

    it('should disable the transmit button when the order cannot be placed', () => {
      component.quantity = 100;
      fixture.detectChanges();

      const transmit: HTMLButtonElement =
        fixture.nativeElement.querySelector('.transmit-button');
      expect(transmit.disabled).toBeTrue();
      expect(fixture.nativeElement.querySelector('.balance-error')).not.toBeNull();
    });

    it('should not submit an order that fails the guards', () => {
      component.quantity = 100;
      spyOn(component, 'transmitOrder').and.callThrough();

      component.transmitOrder();

      expect(component.canTransmit).toBeFalse();
    });
  });

  it('should reset the form when the operation is aborted', () => {
    component.setAction('SELL');
    component.quantity = 42;
    component.limitPrice = 400;

    component.abortOperation();

    expect(component.action).toBe('BUY');
    expect(component.quantity).toBe(10);
    expect(component.limitPrice).toBeNull();
  });

  describe('volatility warning', () => {
    it('should warn when the day change clears the threshold', () => {
      expect(component.isVolatile).toBeTrue();
      expect(fixture.nativeElement.querySelector('.risk-warning')).not.toBeNull();
    });

    it('should stay quiet on a calm quote', () => {
      component.quote = { ...component.quote, changePct: 0.4 };
      fixture.detectChanges();

      expect(component.isVolatile).toBeFalse();
      expect(fixture.nativeElement.querySelector('.risk-warning')).toBeNull();
    });

    it('should treat a steep drop as volatile', () => {
      component.quote = { ...component.quote, changePct: -5.1 };

      expect(component.isVolatile).toBeTrue();
      expect(component.isPositive).toBeFalse();
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

  it('should show the estimated total in the order detail log', () => {
    const detail = fixture.nativeElement.querySelector('.detail-total-value');
    expect(detail.textContent).toContain('4,854.50');
  });
});
