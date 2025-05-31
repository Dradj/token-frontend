import {Component} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {UserService} from '../services/user.service';
import {User} from '../model/user.model';
import {AsyncPipe, NgIf} from '@angular/common';
import {lastValueFrom, Observable} from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    AsyncPipe,
    NgIf
  ]
})
export class HeaderComponent {
  user$: Observable<User | null>;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
    this.user$ = this.userService.currentUser$;
  }

  async logout(): Promise<void> {
    try {
      // 1. Выполняем запрос логаута
      await lastValueFrom(this.authService.logout());

      // 2. Только если всё прошло успешно — переходим на /login
      await this.router.navigate(['/login']);
    } catch (err) {
      console.error('Ошибка при выходе:', err);
      // Здесь можно показать уведомление или оставить пользователя на текущей странице
    }
  }
}
