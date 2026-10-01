import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UpdateUserService, UserPayload } from './update-user.service';
import { AuthService } from './auth.service';

describe('UpdateUserService', () => {
  let service: UpdateUserService;
  let httpMock: HttpTestingController;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockUserPayload: UserPayload = {
    fname: 'John',
    lname: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    password: 'SecurePass123'
  };

  const mockUserId = '12345';

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      currentUser: jasmine.createSpy('currentUser').and.returnValue({
        userId: mockUserId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      })
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UpdateUserService,
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    service = TestBed.inject(UpdateUserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('updateUser', () => {
    it('should send CSRF token request before updating user', (done) => {
      service.updateUser(mockUserPayload).subscribe(() => {
        done();
      });

      // Expect CSRF token request first
      const csrfRequest = httpMock.expectOne('api/auth/csrf');
      expect(csrfRequest.request.method).toBe('GET');
      csrfRequest.flush({}); // Send empty response

      // Expect user update request second
      const updateRequest = httpMock.expectOne(`/users/${mockUserId}`);
      expect(updateRequest.request.method).toBe('PUT');
      updateRequest.flush('User updated successfully');
    });

    it('should make PUT request to correct endpoint with userId', (done) => {
      service.updateUser(mockUserPayload).subscribe(() => {
        done();
      });

      const csrfRequest = httpMock.expectOne('api/auth/csrf');
      csrfRequest.flush({});

      const updateRequest = httpMock.expectOne(`/users/${mockUserId}`);
      expect(updateRequest.request.url).toContain(`/users/${mockUserId}`);
      updateRequest.flush('User updated successfully');
    });

    it('should send user payload in PUT request body', (done) => {
      service.updateUser(mockUserPayload).subscribe(() => {
        done();
      });

      const csrfRequest = httpMock.expectOne('api/auth/csrf');
      csrfRequest.flush({});

      const updateRequest = httpMock.expectOne(`/users/${mockUserId}`);
      expect(updateRequest.request.body).toEqual(mockUserPayload);
      updateRequest.flush('User updated successfully');
    });

    it('should return the server response message as string', (done) => {
      const responseMessage = 'User profile updated successfully';

      service.updateUser(mockUserPayload).subscribe((result) => {
        expect(result).toBe(responseMessage);
        done();
      });

      const csrfRequest = httpMock.expectOne('api/auth/csrf');
      csrfRequest.flush({});

      const updateRequest = httpMock.expectOne(`/users/${mockUserId}`);
      updateRequest.flush(responseMessage);
    });

    it('should handle CSRF token request error', (done) => {
      service.updateUser(mockUserPayload).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(403);
          done();
        }
      );

      const csrfRequest = httpMock.expectOne('api/auth/csrf');
      csrfRequest.flush('CSRF token error', { status: 403, statusText: 'Forbidden' });
    });

    it('should handle user update request error', (done) => {
      service.updateUser(mockUserPayload).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(400);
          done();
        }
      );

      const csrfRequest = httpMock.expectOne('api/auth/csrf');
      csrfRequest.flush({});

      const updateRequest = httpMock.expectOne(`/users/${mockUserId}`);
      updateRequest.flush('Invalid user data', { status: 400, statusText: 'Bad Request' });
    });

    it('should use currentUser userId from AuthService', (done) => {
      const differentUserId = '99999';
      (mockAuthService.currentUser as jasmine.Spy).and.returnValue({
        userId: differentUserId,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
      });

      service.updateUser(mockUserPayload).subscribe(() => {
        done();
      });

      const csrfRequest = httpMock.expectOne('api/auth/csrf');
      csrfRequest.flush({});

      const updateRequest = httpMock.expectOne(`/users/${differentUserId}`);
      expect(updateRequest.request.url).toContain(`/users/${differentUserId}`);
      updateRequest.flush('User updated successfully');
    });

    it('should handle null userId gracefully', (done) => {
      (mockAuthService.currentUser as jasmine.Spy).and.returnValue(null);

      service.updateUser(mockUserPayload).subscribe(
        () => fail('should have failed'),
        () => {
          done();
        }
      );

      const csrfRequest = httpMock.expectOne('api/auth/csrf');
      csrfRequest.flush({});

      // Expect request with /users/undefined
      const updateRequest = httpMock.expectOne('/users/undefined');
      updateRequest.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should support full user payload updates', (done) => {
      const updatedPayload: UserPayload = {
        fname: 'UpdatedFirst',
        lname: 'UpdatedLast',
        email: 'updated@example.com',
        phone: '(555) 999-8888',
        password: 'NewPassword123'
      };

      service.updateUser(updatedPayload).subscribe(() => {
        done();
      });

      const csrfRequest = httpMock.expectOne('api/auth/csrf');
      csrfRequest.flush({});

      const updateRequest = httpMock.expectOne(`/users/${mockUserId}`);
      expect(updateRequest.request.body).toEqual(updatedPayload);
      updateRequest.flush('User updated successfully');
    });

    it('should make sequential calls independently', (done) => {
      let callCount = 0;

      service.updateUser(mockUserPayload).subscribe(() => {
        callCount++;
        if (callCount === 2) {
          done();
        }
      });

      service.updateUser(mockUserPayload).subscribe(() => {
        callCount++;
        if (callCount === 2) {
          done();
        }
      });

      // First updateUser call
      const csrfRequest1 = httpMock.expectOne('api/auth/csrf');
      csrfRequest1.flush({});
      const updateRequest1 = httpMock.expectOne(`/users/${mockUserId}`);
      updateRequest1.flush('User updated successfully');

      // Second updateUser call
      const csrfRequest2 = httpMock.expectOne('api/auth/csrf');
      csrfRequest2.flush({});
      const updateRequest2 = httpMock.expectOne(`/users/${mockUserId}`);
      updateRequest2.flush('User updated successfully');
    });
  });
});
