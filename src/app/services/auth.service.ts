import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, catchError, of, tap} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private accessToken: string | null = null;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<{ accessToken: string }>(
      'http://localhost:8080/api/auth/login',
      { email, password },
      { withCredentials: true }).pipe(
      tap(response => {
        this.accessToken = response.accessToken;
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  logout() {
    this.accessToken = null;
    this.isAuthenticatedSubject.next(false);
    return this.http.post('http://localhost:8080/api/auth/logout', {}, {
      withCredentials: true
    });
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Метод обновления токена
  refreshAccessToken() {
    console.log('[AuthService] Отправка запроса на /refresh');
    return this.http.post<{ accessToken: string }>(
      'http://localhost:8080/api/auth/refresh',
      {},
      { withCredentials: true }
    ).pipe(
      tap(response => {
        console.log('[AuthService] Получен новый access token:', response.accessToken);
        this.accessToken = response.accessToken;
      }),
      catchError(err => {
        console.error('[AuthService] Ошибка при обновлении токена:', err);
        this.accessToken = null;
        this.isAuthenticatedSubject.next(false);
        return of(null);
      })
    );
  }

  tryRestoreSession() {
    return this.refreshAccessToken().pipe(
      tap(token => {
        if (token) this.isAuthenticatedSubject.next(true);
      })
    );
  }
}


