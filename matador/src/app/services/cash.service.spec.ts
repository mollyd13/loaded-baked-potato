import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CashService } from './cash.service';

describe('CashService', () => {
  let service: CashService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CashService]
    });
    service = TestBed.inject(CashService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that no unmatched requests are outstanding
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBalance', () => {
    it('should fetch balance for a given currency', () => {
      const mockResponse = {
        currency: 'USD',
        balance: 10000.50
      };

      service.getBalance('USD').subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.currency).toBe('USD');
        expect(response.balance).toBe(10000.50);
      });

      const req = httpMock.expectOne('/api/cash/USD');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should construct correct URL with currency parameter', () => {
      const currency = 'EUR';
      
      service.getBalance(currency).subscribe();

      const req = httpMock.expectOne(`/api/cash/${currency}`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should handle different currency types', () => {
      const currencies = ['USD', 'EUR', 'GBP', 'JPY'];

      currencies.forEach(currency => {
        const mockResponse = {
          currency: currency,
          balance: 5000
        };

        service.getBalance(currency).subscribe((response) => {
          expect(response.currency).toBe(currency);
        });

        const req = httpMock.expectOne(`/api/cash/${currency}`);
        req.flush(mockResponse);
      });
    });

    it('should handle HTTP error responses', () => {
      service.getBalance('USD').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne('/api/cash/USD');
      req.flush('Cash not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 server errors', () => {
      service.getBalance('USD').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne('/api/cash/USD');
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle 401 authentication errors', () => {
      service.getBalance('USD').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne('/api/cash/USD');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should return Observable that can be subscribed to multiple times', () => {
      const mockResponse = {
        currency: 'USD',
        balance: 15000
      };

      const observable = service.getBalance('USD');

      // First subscription
      observable.subscribe((response) => {
        expect(response.balance).toBe(15000);
      });

      let req = httpMock.expectOne('/api/cash/USD');
      req.flush(mockResponse);

      // Second subscription
      observable.subscribe((response) => {
        expect(response.balance).toBe(15000);
      });

      req = httpMock.expectOne('/api/cash/USD');
      req.flush(mockResponse);
    });

    it('should properly type the response as BalanceResponse', () => {
      const mockResponse = {
        currency: 'USD',
        balance: 7500.75
      };

      service.getBalance('USD').subscribe((response) => {
        // TypeScript should recognize these properties
        expect(response.currency).toBeDefined();
        expect(response.balance).toBeDefined();
        expect(typeof response.balance).toBe('number');
        expect(typeof response.currency).toBe('string');
      });

      const req = httpMock.expectOne('/api/cash/USD');
      req.flush(mockResponse);
    });
  });
});
