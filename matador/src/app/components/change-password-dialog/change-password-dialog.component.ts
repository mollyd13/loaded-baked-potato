import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChangePasswordService } from '../../services/change-password.service';

@Component({
  selector: 'app-change-password-dialog',
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, CommonModule],
  templateUrl: './change-password-dialog.component.html',
  styleUrl: './change-password-dialog.component.css'
})
export class ChangePasswordDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private changePasswordService: ChangePasswordService
  ) {}

  currentPassword: string = '';
  newPassword: string = '';

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
        console.log('Password changed successfully:', result);
        this.dialogRef.close();
      },
      error: (error) => {
        console.error('Error changing password:', error);
      }
    });
  }

}
