import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  initiateWalletChange(newWallet: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/wallet/initiate-change`, { newWallet });
  }

  confirmWalletChange(code: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/wallet/confirm-change`, { code });
  }
}
