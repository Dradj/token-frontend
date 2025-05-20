import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {AuthService} from '../services/auth.service';
import {BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError} from 'rxjs';
import {Router} from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 1. Исключаем запросы на обновление токена
    if (req.url.endsWith('/api/auth/refresh')) {
      return next.handle(req);
    }

    // 2. Добавляем токен к запросам, требующим авторизации
    const authReq = this.addAuthHeader(req);

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // 3. Обрабатываем только 401 ошибки для авторизованных запросов
        if (error.status !== 401 || this.isPublicRequest(req)) {
          return throwError(() => error);
        }

        // 4. Обработка конкурентных запросов
        if (this.isRefreshing) {
          return this.refreshSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(() => next.handle(this.addAuthHeader(req)))
          );
        }

        this.isRefreshing = true;
        this.refreshSubject.next(null);

        // 5. Пытаемся обновить токен
        return this.authService.refreshAccessToken().pipe(
          switchMap((success) => {
            if (!success) throw new Error('Refresh failed');

            this.isRefreshing = false;
            const newToken = this.authService.getAccessToken();
            this.refreshSubject.next(newToken);
            return next.handle(this.addAuthHeader(req));
          }),
          catchError((err) => {
            this.isRefreshing = false;
            this.authService.logout();
            this.router.navigate(['/login']);
            return throwError(() => err);
          })
        );
      })
    );
  }

  private addAuthHeader(req: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getAccessToken();
    return token && this.requiresAuth(req)
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;
  }

  private requiresAuth(req: HttpRequest<any>): boolean {
    // 6. Логика определения защищенных эндпоинтов
    return !req.url.includes('/public/');
  }

  private isPublicRequest(req: HttpRequest<any>): boolean {
    return !this.requiresAuth(req);
  }
}

