import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {FooterComponent} from '../footer/footer.component';
import {HeaderComponent} from '../header/header.component';
import { MatDialog } from '@angular/material/dialog';
import {WalletConnectDialogComponent} from '../wallet-connect-dialog/wallet-connect-dialog.component';
import {NgIf, SlicePipe} from '@angular/common';
import {MatButton} from '@angular/material/button';

declare global {
  interface Window {
    ethereum?: any;
  }
}

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  imports: [
    FooterComponent,
    RouterOutlet,
    HeaderComponent,
    SlicePipe,
    MatButton,
    NgIf
  ],
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  userAddress: string | null = null;
  isMetaMaskInstalled = false;

  constructor(private dialog: MatDialog) {
    this.isMetaMaskInstalled = !!window.ethereum;
  }

  async ngOnInit() {
    // Проверяем сохраненный адрес
    const savedAddress = localStorage.getItem('connectedWallet');
    if (savedAddress) {
      this.userAddress = savedAddress;
    }

    // Пытаемся автоматически подключить кошелек
    await this.tryAutoConnect();

    // Настраиваем обработчики событий кошелька
    this.setupWalletListeners();
  }

  private async tryAutoConnect(): Promise<void> {
    if (!this.isMetaMaskInstalled) {
      this.showWalletDialog();
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });

      if (accounts.length > 0) {
        this.handleWalletConnected(accounts[0]);
      } else if (!this.userAddress) {
        this.showWalletDialog();
      }
    } catch (error) {
      console.error('Ошибка подключения:', error);
      this.showWalletDialog();
    }
  }

  private setupWalletListeners(): void {
    if (!this.isMetaMaskInstalled) return;

    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length > 0 && accounts[0] !== this.userAddress) {
        this.handleWalletConnected(accounts[0]);
      } else {
        this.userAddress = null;
        localStorage.removeItem('connectedWallet');
        this.showWalletDialog();
      }
    });

    //window.ethereum.on('chainChanged', (chainId: string) => {
      //console.log('Сеть изменена:', chainId);
      //if (chainId !== '0x1') {
        //alert('Для работы приложения переключитесь на Ethereum Mainnet');
      //}
    //});
  }

  private handleWalletConnected(address: string): void {
    this.userAddress = address;
    localStorage.setItem('connectedWallet', address);
    console.log('Кошелек подключен:', address);
  }

  protected showWalletDialog(): void {
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
    alert('Для полного отключения: 1. Откройте MetaMask 2. Перейдите в "Подключенные сайты" 3. Найдите наш сайт 4. Нажмите "Отключить"');
  }
}
