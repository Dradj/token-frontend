import {Injectable} from '@angular/core';
import {CanActivate, Router,UrlTree} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {filter, map, Observable, switchMap, take} from 'rxjs';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.isInitialized$.pipe(
      filter(isInitialized => isInitialized), // Ждем завершения инициализации
      take(1),
      switchMap(() => this.auth.isAuthenticated$),
      take(1),
      map(isAuthenticated => {
        return isAuthenticated ? true : this.router.parseUrl('/login');
      })
    );
  }
}
