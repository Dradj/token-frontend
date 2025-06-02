import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatButton} from '@angular/material/button';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-wallet-connect-dialog',
  template: `
    <h2 class="dialog-title">Подключение кошелька</h2>

    <div class="dialog-content">
      <ng-container *ngIf="!isMetaMaskInstalled; else connectSection">
        <p>Для работы с приложением требуется установить MetaMask</p>
        <button mat-raised-button color="primary" (click)="installMetaMask()">
          Установить MetaMask
        </button>
      </ng-container>

      <ng-template #connectSection>
        <p>Подключите ваш кошелек для доступа к функциям приложения</p>
        <button mat-raised-button color="primary" (click)="connectWallet()">
          Подключить
        </button>
      </ng-template>
    </div>

    <div class="dialog-actions">
      <button mat-button (click)="closeDialog()">Закрыть</button>
    </div>
  `,
  imports: [
    MatButton,
    NgIf
  ],
  styles: [`
    .dialog-title {
      margin: 0;
      padding: 16px 24px;
      border-bottom: 1px solid #eee;
      font-size: 1.25rem;
    }

    .dialog-content {
      padding: 24px;
      text-align: center;

      p {
        margin-bottom: 20px;
        font-size: 1rem;
      }

      button {
        width: 100%;
        padding: 10px;
      }
    }

    .dialog-actions {
      padding: 10px 24px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class WalletConnectDialogComponent {
  isMetaMaskInstalled = !!window.ethereum;

  constructor(
    public dialogRef: MatDialogRef<WalletConnectDialogComponent>,
    private snackBar: MatSnackBar
  ) {}

  async connectWallet() {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        this.dialogRef.close(accounts[0]);
      } else {
        this.showError('Не удалось получить доступ к аккаунтам');
      }
    } catch (error: any) {
      console.error('Ошибка подключения:', error);

      let errorMessage = 'Ошибка подключения к кошельку';
      if (error.code === 4001) {
        errorMessage = 'Вы отменили запрос на подключение';
      }

      this.showError(errorMessage);
    }
  }

  installMetaMask() {
    window.open('https://metamask.io/download/', '_blank');
    this.closeDialog();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
