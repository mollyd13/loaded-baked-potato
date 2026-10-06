import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../services/auth.service';
import { UpdateUserService } from '../../services/update-user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockUpdateUserService: jasmine.SpyObj<UpdateUserService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  const validFormData = {
    fname: 'John',
    lname: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567'
  };

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      currentUser: jasmine.createSpy('currentUser').and.returnValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '(555) 123-4567'
      })
    });

    mockUpdateUserService = jasmine.createSpyObj('UpdateUserService', ['updateUser']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UpdateUserService, useValue: mockUpdateUserService },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with user data', () => {
    expect(component.form.get('fname')?.value).toBe('John');
    expect(component.form.get('lname')?.value).toBe('Doe');
    expect(component.form.get('email')?.value).toBe('john.doe@example.com');
    expect(component.form.get('phone')?.value).toBe('(555) 123-4567');
  });

  it('should disable form on initialization', () => {
    expect(component.form.disabled).toBeTrue();
  });

  it('should enable form when toggleEditModeOn is called', () => {
    component.toggleEditModeOn();
    expect(component.form.enabled).toBeTrue();
  });

  describe('Form Validation - Valid Data', () => {
    it('should accept valid form data', () => {
      component.form.enable();
      component.form.setValue(validFormData);
      expect(component.form.valid).toBeTrue();
    });
  });

  describe('Form Validation - First Name', () => {
    it('should reject empty first name', () => {
      component.form.enable();
      component.form.patchValue({ fname: '' });
      expect(component.form.get('fname')?.hasError('required')).toBeTrue();
      expect(component.form.valid).toBeFalse();
    });

    it('should accept valid first name', () => {
      component.form.enable();
      component.form.patchValue({ fname: 'John' });
      expect(component.form.get('fname')?.valid).toBeTrue();
    });
  });

  describe('Form Validation - Last Name', () => {
    it('should reject empty last name', () => {
      component.form.enable();
      component.form.patchValue({ lname: '' });
      expect(component.form.get('lname')?.hasError('required')).toBeTrue();
      expect(component.form.valid).toBeFalse();
    });

    it('should accept valid last name', () => {
      component.form.enable();
      component.form.patchValue({ lname: 'Doe' });
      expect(component.form.get('lname')?.valid).toBeTrue();
    });
  });

  describe('Form Validation - Email', () => {
    it('should reject empty email', () => {
      component.form.enable();
      component.form.patchValue({ email: '' });
      expect(component.form.get('email')?.hasError('required')).toBeTrue();
    });

    it('should reject invalid email format', () => {
      component.form.enable();
      component.form.patchValue({ email: 'invalid-email' });
      expect(component.form.get('email')?.hasError('email')).toBeTrue();
    });

    it('should accept valid email', () => {
      component.form.enable();
      component.form.patchValue({ email: 'john.doe@example.com' });
      expect(component.form.get('email')?.valid).toBeTrue();
    });
  });

  describe('Form Validation - Phone', () => {
    it('should reject empty phone', () => {
      component.form.enable();
      component.form.patchValue({ phone: '' });
      expect(component.form.get('phone')?.hasError('required')).toBeTrue();
    });

    it('should reject invalid phone format', () => {
      component.form.enable();
      component.form.patchValue({ phone: '123' });
      expect(component.form.get('phone')?.hasError('pattern')).toBeTrue();
    });

    it('should accept valid phone format', () => {
      component.form.enable();
      component.form.patchValue({ phone: '(555) 123-4567' });
      expect(component.form.get('phone')?.valid).toBeTrue();
    });

    it('should accept phone without parentheses', () => {
      component.form.enable();
      component.form.patchValue({ phone: '555-123-4567' });
      expect(component.form.get('phone')?.valid).toBeTrue();
    });

    it('should accept phone with country code', () => {
      component.form.enable();
      component.form.patchValue({ phone: '+1 555 123-4567' });
      expect(component.form.get('phone')?.valid).toBeTrue();
    });
  });

  describe('Form Submission', () => {
    it('should not submit invalid form', () => {
      component.form.enable();
      component.form.patchValue({ fname: '' });
      component.onSubmit();
      expect(mockUpdateUserService.updateUser).not.toHaveBeenCalled();
    });

    it('should submit valid form', () => {
      mockUpdateUserService.updateUser.and.returnValue(of('User profile updated successfully'));
      component.form.enable();
      component.form.setValue(validFormData);
      component.onSubmit();
      expect(mockUpdateUserService.updateUser).toHaveBeenCalledWith({
        fname: 'John',
        lname: 'Doe',
        email: 'john.doe@example.com',
        phone: '(555) 123-4567'
      });
    });

    it('should show success snackbar on successful submission', () => {
      mockUpdateUserService.updateUser.and.returnValue(of('User profile updated successfully'));
      component.form.enable();
      component.form.setValue(validFormData);
      component.onSubmit();
      expect(mockSnackBar.open).toHaveBeenCalledWith('Profile updated successfully', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    });

    it('should disable form after successful submission', () => {
      mockUpdateUserService.updateUser.and.returnValue(of('User profile updated successfully'));
      component.form.enable();
      component.form.setValue(validFormData);
      component.onSubmit();
      expect(component.form.disabled).toBeTrue();
    });

    it('should reset submitted flag after submission', () => {
      mockUpdateUserService.updateUser.and.returnValue(of('User profile updated successfully'));
      component.form.enable();
      component.form.setValue(validFormData);
      component.onSubmit();
      expect(component.submitted).toBeFalse();
    });

    it('should handle submission error', () => {
      const errorResponse = new HttpErrorResponse({ status: 400, statusText: 'Bad Request' });
      mockUpdateUserService.updateUser.and.returnValue(throwError(() => errorResponse));
      component.form.enable();
      component.form.setValue(validFormData);
      component.onSubmit();
      expect(mockSnackBar.open).toHaveBeenCalledWith('Error updating profile', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    });
  });

  describe('getFieldError Method', () => {
    it('should return false for non-existent field', () => {
      const result = component.getFieldError('nonexistent', 'required');
      expect(result).toBeFalse();
    });

    it('should return false for field without error', () => {
      component.form.enable();
      component.form.patchValue({ fname: 'John' });
      const result = component.getFieldError('fname', 'required');
      expect(result).toBeFalse();
    });

    it('should return false for error on untouched and unsubmitted field', () => {
      component.form.enable();
      component.form.patchValue({ fname: '' });
      component.submitted = false;
      const result = component.getFieldError('fname', 'required');
      expect(result).toBeFalse();
    });

    it('should return true for error on touched field', () => {
      component.form.enable();
      component.form.patchValue({ fname: '' });
      const fNameControl = component.form.get('fname');
      fNameControl?.markAsTouched();
      const result = component.getFieldError('fname', 'required');
      expect(result).toBeTrue();
    });

    it('should return true for error when submitted flag is set', () => {
      component.form.enable();
      component.form.patchValue({ fname: '' });
      component.submitted = true;
      const result = component.getFieldError('fname', 'required');
      expect(result).toBeTrue();
    });
  });
});
