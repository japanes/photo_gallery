import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { User, UserRole } from '../models/photo.model';

interface JsonPlaceholderUser {
  readonly id: number;
  readonly name: string;
  readonly username: string;
  readonly email: string;
  readonly phone: string;
  readonly website: string;
  readonly address: {
    readonly street: string;
    readonly suite: string;
    readonly city: string;
    readonly zipcode: string;
    readonly geo: { readonly lat: string; readonly lng: string };
  };
  readonly company: {
    readonly name: string;
    readonly catchPhrase: string;
    readonly bs: string;
  };
}

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

  login(_email: string, _password: string) {
    return this.http.get<JsonPlaceholderUser>('https://jsonplaceholder.typicode.com/users/1')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          const user: User = {
            id: data.id,
            name: data.name,
            email: data.email,
            avatarUrl: '',
            albums: [],
            role: 'user',
          };
          this._currentUser.set(user);
          localStorage.setItem('user', JSON.stringify(user));
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
