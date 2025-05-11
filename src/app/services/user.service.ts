import { Injectable } from '@angular/core';
import {BehaviorSubject, catchError, filter, Observable, of, switchMap, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {User} from '../model/user.model';
import {AuthService} from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.isAuthenticated$.pipe(
      filter(auth => auth),
      switchMap(() => this.loadCurrentUser()),
      catchError(() => of(null))
    ).subscribe();
  }

  private loadCurrentUser(): Observable<User> {
    return this.http.get<User>('http://localhost:8080/api/users/current').pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  // Можно использовать в Guard’ах
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}



