import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {catchError, map, Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginRedirectGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.auth.checkSession().pipe(
      map(isValid => {
        if (isValid && state.url === '/login') { // Уже на /login? Редирект!
          return this.router.parseUrl('/courses');
        }
        return isValid ? this.router.parseUrl('/courses') : true;
      }),
      catchError(() => {
        this.auth.logout(); // Очистить остатки токенов
        return of(true); // Разрешить доступ к /login
      })
    );
  }
}
