import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let validName = 'Test User';
  let validEmail = 'test@example.com';
  let validPhoneNumber = '1234567890';
  let validPassword = 'password123';
  let validDateOfBirth = '01/01/2000';
  let validAddress = '123 Main St';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept valid credentials', () => {
    component.form.enable();
    component.form.setValue({ fullName: validName, email: validEmail, phoneNumber: validPhoneNumber, password: validPassword, dateOfBirth: validDateOfBirth, address: validAddress });
    expect(component.form.valid).toBeTrue();
  });

  it('should reject invalid email', () => {
    component.form.enable();
    component.form.setValue({ fullName: validName, email: 'invalid-email', phoneNumber: validPhoneNumber, password: validPassword, dateOfBirth: validDateOfBirth, address: validAddress });
    expect(component.form.valid).toBeFalse();
  });

  it('should reject invalid password', () => {
    component.form.enable();
    component.form.setValue({ fullName: validName, email: validEmail, phoneNumber: validPhoneNumber, password: '123', dateOfBirth: validDateOfBirth, address: validAddress });
    expect(component.form.valid).toBeFalse();
  });

   it('should reject invalid phone number', () => {
    component.form.enable();
    component.form.setValue({ fullName: validName, email: validEmail, phoneNumber: '123', password: validPassword, dateOfBirth: validDateOfBirth, address: validAddress });
    expect(component.form.valid).toBeFalse();
  });

  it('should reject empty name', () => {
    component.form.enable();
    component.form.setValue({ fullName: '', email: validEmail, phoneNumber: validPhoneNumber, password: validPassword, dateOfBirth: validDateOfBirth, address: validAddress });
    expect(component.form.valid).toBeFalse();
  });

  it('should reject empty email', () => {
    component.form.enable();
    component.form.setValue({ fullName: validName, email: '', phoneNumber: validPhoneNumber, password: validPassword, dateOfBirth: validDateOfBirth, address: validAddress });
    expect(component.form.valid).toBeFalse();
  });

  it('should reject empty phone number', () => {
    component.form.enable();
    component.form.setValue({ fullName : validName, email: validEmail, phoneNumber: '', password: validPassword, dateOfBirth: validDateOfBirth, address: validAddress });
    expect(component.form.valid).toBeFalse();
  });

  it('should reject empty password', () => {
    component.form.enable();
    component.form.setValue({ fullName: validName, email: validEmail, phoneNumber: validPhoneNumber, password: '', dateOfBirth: validDateOfBirth, address: validAddress });
    expect(component.form.valid).toBeFalse();
  });

});
