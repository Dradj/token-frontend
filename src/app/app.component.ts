import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AuthService} from './services/auth.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.refreshAccessToken().subscribe();
  }
}


