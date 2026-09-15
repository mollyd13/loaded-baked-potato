import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormControl, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-profile',
  imports: [MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  form: FormGroup;
  submitted = false;

  mockUser = {
    fullName: 'John Doe',
    phoneNumber: '123-456-7890',
    address: '123 Main St',
    email: 'john.doe@example.com',
    dateOfBirth: '01/01/1990',
    password: 'password123'
  };

    constructor(private fb: FormBuilder) {
      this.form = this.fb.group({
        fullName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', [Validators.required, Validators.pattern(/^(\+\d{1,3}\s?)?(\(?\d{2,4}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}$/)]],
        address: ['', [Validators.required]],
        dateOfBirth: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/)]],
        password: ['', [Validators.required, Validators.minLength(8)]]
      });
      this.initializeForm();
  }

  initializeForm(): void {
    this.form.patchValue({
      fullName: this.mockUser.fullName,
      phoneNumber: this.mockUser.phoneNumber,
      address: this.mockUser.address,
      email: this.mockUser.email,
      dateOfBirth: this.mockUser.dateOfBirth,
      password: this.mockUser.password
    });
    this.form.disable();
  }

  toggleEditModeOn() {
    this.form.enable();
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    console.log('Update submitted', this.form.value);
    this.form.disable();
    this.submitted = false;
  }

  getFieldError(fieldName: string, errorType: string): boolean {
    const field = this.form.get(fieldName);
    
    if (!field) {
      return false;
    }

    const hasError = field.hasError(errorType);
    const isFieldInteracted = field.touched || this.submitted;

    return hasError && isFieldInteracted;
  }
}
