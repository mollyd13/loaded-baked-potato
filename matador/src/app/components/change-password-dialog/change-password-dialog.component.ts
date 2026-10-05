import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChangePasswordService } from '../../services/change-password.service';

@Component({
  selector: 'app-change-password-dialog',
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSnackBarModule, FormsModule, CommonModule],
  templateUrl: './change-password-dialog.component.html',
  styleUrl: './change-password-dialog.component.css'
})
export class ChangePasswordDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private changePasswordService: ChangePasswordService,
    private snackBar: MatSnackBar
  ) {}

  currentPassword: string = '';
  newPassword: string = '';

  get isFormValid(): boolean {
    return this.currentPassword.length > 0 && this.newPassword.length >= 8;
  }

  onNoClick(): void {
    //close the dialog without returning any data
    this.dialogRef.close();
  }

  onOkClick(): void {
    //close the dialog and return the entered data
    this.updatePassword();
  }

  updatePassword(): void {
    this.changePasswordService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: (result) => {
        this.snackBar.open('Password changed successfully', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close();
      },
      error: (error) => {
        const errorMessage = error?.error?.body?.detail || 'Failed to change password. Please try again.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

}
