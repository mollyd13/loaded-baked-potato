import { TestBed } from '@angular/core/testing';

import { GetOrderService } from './get-order.service';

describe('GetOrderService', () => {
  let service: GetOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
