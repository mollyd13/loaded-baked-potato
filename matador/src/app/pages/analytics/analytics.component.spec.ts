import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsComponent } from './analytics.component';

describe('AnalyticsComponent', () => {
  let component: AnalyticsComponent;
  let fixture: ComponentFixture<AnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build four summary cards', () => {
    expect(component.summaryCards.length).toBe(4);
  });

  it('should chart weekly buckets for the 90 day period', () => {
    component.filterPeriod = '90';
    component.applyFilters();
    expect(component.volumeBars.length).toBe(13);
  });

  it('should only list instruments from the selected class', () => {
    component.filterAssetClass = 'Crypto';
    component.applyFilters();
    expect(component.topInstruments.every((s) => s.assetClass === 'Crypto')).toBeTrue();
  });
});
