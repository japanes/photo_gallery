import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { User, UserRole } from '../models/photo.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  // Private mutable signals
  private _currentUser = signal<User | null>(null);
  private _token = signal<string | null>(null);

  // Public readonly signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly token = this._token.asReadonly();

  constructor() {
    // Restore user from localStorage with error handling
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        this._currentUser.set(JSON.parse(savedUser) as User);
      }
    } catch {
      localStorage.removeItem('user');
    }
  }

  login(email: string, password: string) {
    // BUG: Sending password in query params instead of body
    return this.http.get<User[]>(`https://jsonplaceholder.typicode.com/users?email=${email}&password=${password}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users: User[]) => {
          if (users.length > 0) {
            const user: User = users[0];
            this._currentUser.set(user);
            // BUG: Storing full user object with sensitive data in localStorage
            localStorage.setItem('user', JSON.stringify(user));
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error('Login failed:', err);
        }
      });
  }

  logout() {
    this._currentUser.set(null);
    this._token.set(null);
    localStorage.removeItem('user');
  }

  // BUG: No actual token validation, just checks if user exists
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  // BUG: Role check using magic strings
  hasRole(role: UserRole): boolean {
    return this._currentUser()?.role === role;
  }

  // BUG: No token refresh mechanism
  getToken(): string | null {
    return this._token();
  }
}
