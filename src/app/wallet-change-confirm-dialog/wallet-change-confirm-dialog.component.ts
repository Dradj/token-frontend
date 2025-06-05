import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {WalletService} from '../services/wallet.service';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-wallet-change-confirm-dialog',
  standalone: true,
  template: `
    <h2 mat-dialog-title>Подтверждение смены кошелька</h2>

    <mat-dialog-content>
      <p>На вашу почту отправлен код подтверждения. Введите его ниже:</p>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Код подтверждения</mat-label>
        <input matInput [(ngModel)]="code" maxlength="6">
      </mat-form-field>

      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Отмена</button>
      <button mat-raised-button color="primary" (click)="confirm()" [disabled]="!code">
        Подтвердить
      </button>
    </mat-dialog-actions>
  `,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatLabel,
    MatFormField,
    MatDialogActions,
    MatButton,
    NgIf,
    FormsModule,
    MatInput,
  ],
  styles: [`
    .w-full {
      width: 100%;
    }

    .error-message {
      color: #f44336;
      margin-top: 10px;
    }

    mat-form-field {
      margin-bottom: 15px;
    }
  `]
})
export class WalletChangeConfirmDialogComponent {
  code: string = '';
  errorMessage: string = '';
  countdown: number = 180;
  private timer: any;

  constructor(
    public dialogRef: MatDialogRef<WalletChangeConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { newWallet: string },
    private walletService: WalletService,
    private snackBar: MatSnackBar
  ) {
    this.startCountdown();
  }

  startCountdown() {
    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.timer);
        this.errorMessage = 'Время действия кода истекло';
      }
    }, 1000);
  }

  confirm() {
    if (!this.code) return;

    this.walletService.confirmWalletChange(this.code).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.errorMessage = 'Неверный код подтверждения';
        console.error('Ошибка подтверждения:', err);
      }
    });
  }

  cancel() {
    clearInterval(this.timer);
    this.dialogRef.close(false);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }
}
