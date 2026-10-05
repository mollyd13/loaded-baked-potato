import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { ChangePasswordService } from './change-password.service';
import { AuthService } from './auth.service';

describe('ChangePasswordService', () => {
  let service: ChangePasswordService;
  let httpMock: HttpTestingController;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockUserId = '12345';

  beforeEach(() => {
    // Create a spy object with mocked currentUser property
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      currentUser: jasmine.createSpy('currentUser').and.returnValue({
        userId: mockUserId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      })
    });

    TestBed.configureTestingModule({
      providers: [
        ChangePasswordService,
        { provide: AuthService, useValue: mockAuthService },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ChangePasswordService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make PATCH request to change password endpoint with correct userId', (done) => {
    const currentPassword = 'oldPassword';
    const newPassword = 'newPassword123';
    const mockResponse = 'Password updated successfully';

    service.changePassword(currentPassword, newPassword).subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    // Expect CSRF request first
    const csrfReq = httpMock.expectOne('api/auth/csrf');
    expect(csrfReq.request.method).toBe('GET');
    csrfReq.flush({});

    // Expect password change request with userId from mocked AuthService
    const updateReq = httpMock.expectOne(`/users/${mockUserId}/password`);
    expect(updateReq.request.method).toBe('PATCH');
    updateReq.flush(mockResponse);
  });
});
