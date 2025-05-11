import {Component, inject} from '@angular/core';
import { Router } from '@angular/router';
import {AuthService} from '../services/auth.service';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  onLogin(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: async () => {
        await this.router.navigate(['/courses']);
      },
      error: () => {
        this.errorMessage = 'Ошибка при авторизации. Проверьте данные и попробуйте снова.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}





