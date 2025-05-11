import {Component, OnInit} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {UserService} from '../services/user.service';
import {User} from '../model/user.model';
import {AsyncPipe, NgIf} from '@angular/common';
import {Observable} from 'rxjs';

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
    this.authService.logout();
    await this.router.navigate(['/login']);
  }
}
