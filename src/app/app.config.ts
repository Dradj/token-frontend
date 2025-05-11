import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import {AuthInterceptor} from './interceptor/jwt.interceptor';
import {routes} from './app.routes';


export const appConfig: ApplicationConfig = {
  providers: [
    // включаем зону с объединением изменений (eventCoalescing)
    provideZoneChangeDetection({ eventCoalescing: true }),

    // HTTP-клиент для standalone-компонентов с interceptor
    provideHttpClient(withInterceptorsFromDi()),

    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

    // маршрутизация
    provideRouter(routes),
  ]
};



