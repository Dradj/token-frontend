import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, catchError, map, Observable, of, switchMap, tap} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private accessToken: string | null = null;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private isInitializedSubject = new BehaviorSubject<boolean>(false);
  isInitialized$ = this.isInitializedSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<{ accessToken: string, role: string }> {
    return this.http.post<{ accessToken: string, role: any }>(
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
    return this.http.post('http://localhost:8080/api/auth/logout', {}, {
      withCredentials: true
    });
  }


  getAccessToken(): string | null {
    return this.accessToken;
  }


  refreshAccessToken(): Observable<boolean> {
    console.log('[AuthService] Отправка запроса на /refresh');
    return this.http.post<{ accessToken: string }>(
      'http://localhost:8080/api/auth/refresh',
      {},
      { withCredentials: true }
    ).pipe(
      tap(response => {
        console.log('[AuthService] Получен новый access token:', response.accessToken);
        this.accessToken = response.accessToken;
        this.isAuthenticatedSubject.next(true); // Обновляем состояние аутентификации
        this.isInitializedSubject.next(true);
      }),
      switchMap(() => of(true)),
      catchError(err => {
        console.error('[AuthService] Ошибка при обновлении токена:', err);
        this.accessToken = null;
        this.isAuthenticatedSubject.next(false);
        this.isInitializedSubject.next(true);
        return of(false);
      })
    );
  }


  checkSession(): Observable<boolean> {
    return this.http.get('http://localhost:8080/api/auth/check-session', {
      withCredentials: true,
      responseType: 'text'
    }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}


