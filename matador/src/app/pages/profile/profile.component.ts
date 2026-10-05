import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UpdateUserService } from '../../services/update-user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { ChangePasswordDialogComponent } from '../../components/change-password-dialog/change-password-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  imports: [MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, CommonModule, ReactiveFormsModule, MatCardModule, MatDialogModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  readonly dialog = inject(MatDialog);
  form: FormGroup;
  submitted = false;

    constructor(private fb: FormBuilder, public auth: AuthService, private userService: UpdateUserService, private snackBar: MatSnackBar) {
      this.form = this.fb.group({
        fname: ['', [Validators.required]],
        lname: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^(\+\d{1,3}\s?)?(\(?\d{2,4}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}$/)]]
      });
      this.initializeForm();
  }

  initializeForm(): void {
    this.form.patchValue({
      fname: this.auth.currentUser()?.firstName,
      lname: this.auth.currentUser()?.lastName,
      phone: this.auth.currentUser()?.phone,
      email: this.auth.currentUser()?.email,
    });
    this.form.disable();
  }

  toggleEditModeOn() {
    this.form.enable();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result !== undefined) {
       console.log(result);
      }
    });
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
      phone: this.form.value.phone
    }).subscribe({
      next: () => {
        this.snackBar.open('Profile updated successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err: HttpErrorResponse) => {
        this.snackBar.open('Error updating profile', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
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

