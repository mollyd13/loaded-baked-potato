import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeLookupComponent } from './trade-lookup.component';

describe('TradeLookupComponent', () => {
  let component: TradeLookupComponent;
  let fixture: ComponentFixture<TradeLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradeLookupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TradeLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should find an order by its ID', () => {
    const target = component.allTrades[0];
    component.searchText = target.orderId;
    component.filterPeriod = 'ALL';
    component.applyFilters();
    expect(component.results).toEqual([target]);
  });

  it('should only list orders with the chosen status', () => {
    component.filterPeriod = 'ALL';
    component.toggleStatus('REJECTED');
    expect(component.results.length).toBeGreaterThan(0);
    expect(component.results.every((t) => t.status === 'REJECTED')).toBeTrue();
  });

  it('should start every lifecycle with submission and end filled orders with a fill', () => {
    for (const trade of component.allTrades) {
      expect(trade.events[0].type).toBe('SUBMITTED');
      if (trade.status === 'FILLED') {
        expect(trade.events[trade.events.length - 1].type).toBe('FILLED');
        expect(trade.balanceChanges.length).toBe(2);
      }
    }
  });

  it('should clear the selection when it is filtered out', () => {
    component.filterPeriod = 'ALL';
    component.applyFilters();
    component.select(component.results[0]);
    component.searchText = 'no-such-order';
    component.applyFilters();
    expect(component.selected).toBeNull();
  });
});
