import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoryComponent } from './history.component';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HistoryComponent,
        MatCardModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load orders on init', () => {
    expect(component.allOrders.length).toBe(10);
    expect(component.filteredOrders.length).toBe(10);
  });

  it('should generate order summaries on init', () => {
    expect(component.orderSummaries.length).toBe(4);
    expect(component.orderSummaries[0].label).toBe('Total Orders');
    expect(component.orderSummaries[1].label).toBe('Total Volume');
    expect(component.orderSummaries[2].label).toBe('Total Commissions');
    expect(component.orderSummaries[3].label).toBe('Avg Order Value');
  });

  describe('Filter Functionality', () => {
    it('should filter orders by status - FILLED', () => {
      component.filterStatus = 'FILLED';
      component.applyFilters();
      expect(component.filteredOrders.every(o => o.status === 'FILLED')).toBe(true);
    });

    it('should filter orders by order type - BUY', () => {
      component.filterOrderType = 'BUY';
      component.applyFilters();
      expect(component.filteredOrders.every(o => o.orderType === 'BUY')).toBe(true);
    });

    it('should reset filters', () => {
      component.filterStatus = 'FILLED';
      component.applyFilters();
      expect(component.filteredOrders.length).toBeLessThan(component.allOrders.length);
      
      component.resetFilters();
      expect(component.filterStatus).toBe('ALL');
      expect(component.filteredOrders.length).toBe(component.allOrders.length);
    });
  });

  describe('Summary Calculations', () => {
    it('should calculate order summaries', () => {
      const totalOrders = component.orderSummaries[0].value;
      expect(totalOrders).toBe(component.filteredOrders.length.toString());
    });
  });

  describe('Utility Methods', () => {
    it('should return correct status icon', () => {
      expect(component.getStatusIcon('FILLED')).toBe('check_circle');
      expect(component.getStatusIcon('PENDING')).toBe('hourglass_empty');
      expect(component.getStatusIcon('CANCELLED')).toBe('cancel');
    });

    it('should format date correctly', () => {
      const testDate = new Date('2024-01-15T10:30:00');
      const formatted = component.formatDate(testDate);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });
  });
});
