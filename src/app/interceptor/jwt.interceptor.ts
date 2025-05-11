import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {AuthService} from '../services/auth.service';
import {catchError, Observable, switchMap, take, throwError} from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Если это запрос на refresh токен, не добавляем access token
    if (req.url.endsWith('/api/auth/refresh')) {
      return next.handle(req);
    }

    // Добавляем access token в заголовки запроса
    const accessToken = this.authService.getAccessToken();
    const authReq = accessToken
      ? req.clone({
        setHeaders: { Authorization: `Bearer ${accessToken}` },
      })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Если получен 401, то пробуем обновить access token
        if (error.status === 401) {
          return this.authService.refreshAccessToken().pipe(
            take(1),
            switchMap(token => {
              if (!token) {
                return throwError(() => error);
              }

              // После получения нового access token повторно отправляем запрос
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${this.authService.getAccessToken()}` },
              });

              return next.handle(retryReq);
            }),
            catchError(err => throwError(() => err))
          );
        }

        return throwError(() => error);
      })
    );
  }
}

