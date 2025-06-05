import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {FooterComponent} from '../footer/footer.component';
import {HeaderComponent} from '../header/header.component';
import { MatDialog } from '@angular/material/dialog';
import {WalletConnectDialogComponent} from '../wallet-connect-dialog/wallet-connect-dialog.component';
import {NgIf, SlicePipe} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {WalletService} from '../services/wallet.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatIcon} from '@angular/material/icon';
import {WalletChangeConfirmDialogComponent} from '../wallet-change-confirm-dialog/wallet-change-confirm-dialog.component';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

declare global {
  interface Window {
    ethereum?: any;
  }
}

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  standalone: true,
  imports: [
    FooterComponent,
    RouterOutlet,
    HeaderComponent,
    SlicePipe,
    MatButton,
    NgIf,
  ],
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  userAddress: string | null = null;
  isMetaMaskInstalled = false;
  pendingWalletChange: string | null = null;
  isLoading = false;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private walletService: WalletService
  ) {
    this.isMetaMaskInstalled = !!window.ethereum;
  }

  async ngOnInit() {
    // Проверяем сохраненный адрес
    const savedAddress = localStorage.getItem('connectedWallet');
    if (savedAddress) {
      this.userAddress = savedAddress;
    }



    // Настраиваем обработчики событий кошелька
    this.setupWalletListeners();
  }


  private setupWalletListeners(): void {
    if (!this.isMetaMaskInstalled) return;

    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      this.handleAccountsChanged(accounts);
    });
  }

  private handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      const newAddress = accounts[0];

      // Если это первое подключение
      if (!this.userAddress) {
        this.handleWalletConnected(newAddress);
      }
      // Если адрес изменился
      else if (newAddress !== this.userAddress) {
        // Показываем уведомление о начале процесса смены
        this.snackBar.open('Обнаружена смена кошелька. Запуск процесса подтверждения...', 'OK', { duration: 3000 });

        // Сохраняем новый адрес как ожидающий подтверждения
        this.pendingWalletChange = newAddress;

        // Показываем диалог подтверждения
        this.openWalletChangeConfirmDialog(newAddress);
      }
    } else {
      // Обработка отключения кошелька
      this.handleWalletDisconnected();
    }
  };

  private openWalletChangeConfirmDialog(newWallet: string): void {
    this.isLoading = true;

    // Инициируем процесс смены кошелька на бэкенде
    this.walletService.initiateWalletChange(newWallet).subscribe({
      next: () => {
        this.isLoading = false;

        // Показываем диалог подтверждения
        const dialogRef = this.dialog.open(WalletChangeConfirmDialogComponent, {
          width: '400px',
          disableClose: true,
          data: { newWallet }
        });

        dialogRef.afterClosed().subscribe(confirmed => {
          if (confirmed) {
            // Обновляем кошелек после подтверждения
            this.handleWalletConnected(this.pendingWalletChange!);
            this.snackBar.open('Кошелек успешно изменен', 'OK', { duration: 3000 });
          } else {
            // Возвращаем старый кошелек
            this.snackBar.open('Смена кошелька отменена', 'OK', { duration: 3000 });
            this.handleWalletConnected(this.userAddress!);
          }
          this.pendingWalletChange = null;
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Ошибка инициации смены кошелька:', err);
        this.snackBar.open('Ошибка отправки кода подтверждения', 'Закрыть', { duration: 5000 });
        this.pendingWalletChange = null;

        // Возвращаем старый адрес
        this.handleWalletConnected(this.userAddress!);
      }
    });
  }

  private handleWalletConnected(address: string): void {
    this.userAddress = address;
    localStorage.setItem('connectedWallet', address);
    console.log('Кошелек подключен:', address);
  }

  private handleWalletDisconnected(): void {
    this.userAddress = null;
    localStorage.removeItem('connectedWallet');
    this.snackBar.open('Кошелек отключен', 'OK', { duration: 3000 });
  }

  showWalletDialog(): void {
    if (this.dialog.openDialogs.length > 0) return;

    const dialogRef = this.dialog.open(WalletConnectDialogComponent, {
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: string | undefined) => {
      if (result) {
        this.handleWalletConnected(result);
      }
    });
  }

  disconnectWallet(): void {
    this.userAddress = null;
    localStorage.removeItem('connectedWallet');
    this.snackBar.open('Для полного отключения: 1. Откройте MetaMask 2. Перейдите в "Подключенные сайты" 3. Найдите наш сайт 4. Нажмите "Отключить"', 'OK', { duration: 10000 });
  }
}
