import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { SignInComponent } from './sign-in.component'

describe('SignIn', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept valid credentials', () => {
    component.form.setValue({ email: 'test@example.com', password: 'password123' });
    expect(component.form.valid).toBeTrue();
  });

  it('should reject invalid email', () => {
    component.form.setValue({ email: 'invalid-email', password: '12345678' });
    expect(component.form.valid).toBeFalse();
  });

  it('should reject empty password', () => {
    component.form.setValue({ email: 'test@example.com', password: '' });
    expect(component.form.valid).toBeFalse();
  });

  it('should reject empty email', () => {
    component.form.setValue({ email: '', password: '12345678' });
    expect(component.form.valid).toBeFalse();
  });

});
