import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormControl, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UpdateUserService } from '../../services/update-user.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  imports: [MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  form: FormGroup;
  submitted = false;

    constructor(private fb: FormBuilder, public auth: AuthService, private userService: UpdateUserService) {
      this.form = this.fb.group({
        fname: ['', [Validators.required]],
        lname: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^(\+\d{1,3}\s?)?(\(?\d{2,4}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}$/)]],
        password: ['', [Validators.required, Validators.minLength(8)]]
      });
      this.initializeForm();
  }

  initializeForm(): void {
    this.form.patchValue({
      fname: this.auth.currentUser()?.firstName,
      lname: this.auth.currentUser()?.lastName,
      phone: this.auth.currentUser()?.phone,
      email: this.auth.currentUser()?.email,
      password: '********'
    });
    this.form.disable();
  }

  toggleEditModeOn() {
    this.form.enable();
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      // TODO: show error
      return;
    }
    this.userService.updateUser({
      fname: this.form.value.fname,
      lname: this.form.value.lname,
      email: this.form.value.email,
      password: this.form.value.password,
      phone: this.form.value.phone
    }).subscribe({
      next: () => {
        console.log('Profile updated successfully');
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error updating profile', err);
      }
    });
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
