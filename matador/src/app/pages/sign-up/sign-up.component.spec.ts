import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SignUpComponent } from './sign-up.component'

describe('SignUp', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUpComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept valid credentials', () => {
    component.form.setValue({ firstName: 'Test', lastName: 'User', email: 'test@example.com', phone: '1234567890', password: 'password123' });
    expect(component.form.valid).toBeTrue();
  });

  it('should reject invalid email', () => {
    component.form.setValue({ firstName: 'Test', lastName: 'User', email: 'invalid-email', phone: '1234567890', password: '12345678' });
    expect(component.form.valid).toBeFalse();
  });

  it('should reject invalid password', () => {
    component.form.setValue({ firstName: 'Test', lastName: 'User', email: 'test@example.com', phone: '1234567890', password: '123' });
    expect(component.form.valid).toBeFalse();
  });

   it('should reject invalid phone number', () => {
    component.form.setValue({ firstName: 'Test', lastName: 'User', email: 'test@example.com', phone: '123', password: '12345678' });
    expect(component.form.valid).toBeFalse();
  });

  it('should reject empty first name', () => {
    component.form.setValue({ firstName: '', lastName: 'User', email: 'test@example.com', phone: '1234567890', password: '12345678' });
    expect(component.form.valid).toBeFalse();
  });

  it('should reject empty email', () => {
    component.form.setValue({ firstName: 'Test', lastName: 'User', email: '', phone: '1234567890', password: '12345678' });
    expect(component.form.valid).toBeFalse();
  });

  it('should reject empty phone number', () => {
    component.form.setValue({ firstName: 'Test', lastName: 'User', email: 'test@example.com', phone: '', password: '12345678' });
    expect(component.form.valid).toBeFalse();
  });

  it('should reject empty password', () => {
    component.form.setValue({ firstName: 'Test', lastName: 'User', email: 'test@example.com', phone: '1234567890', password: '' });
    expect(component.form.valid).toBeFalse();
  });

});
