import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserRole } from '../models/photo.model';
import { environment } from '@env/environment';

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

interface AuthToken {
  readonly value: string;
  readonly expiresAt: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user';
  private static readonly TOKEN_DURATION_MS = 60 * 60 * 1000; // 1 hour

  // Private mutable signals
  private _currentUser = signal<User | null>(null);
  private _token = signal<AuthToken | null>(null);

  // Public readonly signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() =>
    this._currentUser() !== null && this.isTokenValid()
  );

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const savedUser = localStorage.getItem(AuthService.USER_KEY);
      const savedToken = localStorage.getItem(AuthService.TOKEN_KEY);
      if (savedUser && savedToken) {
        const token = JSON.parse(savedToken) as AuthToken;
        if (this.isTokenExpired(token)) {
          this.clearStorage();
          return;
        }
        this._currentUser.set(JSON.parse(savedUser) as User);
        this._token.set(token);
      }
    } catch {
      this.clearStorage();
    }
  }

  login(_email: string, _password: string): void {
    this.http.get<JsonPlaceholderUser>(`${environment.apiUrl}/users/1`)
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
          const token: AuthToken = {
            value: this.generateToken(),
            expiresAt: Date.now() + AuthService.TOKEN_DURATION_MS
          };
          this._currentUser.set(user);
          this._token.set(token);
          localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
          localStorage.setItem(AuthService.TOKEN_KEY, JSON.stringify(token));
        },
        error: (err: HttpErrorResponse) => {
          if (environment.debug) {
            console.error('Login failed:', err);
          }
        }
      });
  }

  logout(): void {
    this._currentUser.set(null);
    this._token.set(null);
    this.clearStorage();
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  hasRole(role: UserRole): boolean {
    return this._currentUser()?.role === role;
  }

  getToken(): string | null {
    const token = this._token();
    if (token === null || this.isTokenExpired(token)) {
      return null;
    }
    return token.value;
  }

  refreshToken(): void {
    const currentToken = this._token();
    if (currentToken === null || this.isTokenExpired(currentToken)) {
      this.logout();
      return;
    }
    const newToken: AuthToken = {
      value: this.generateToken(),
      expiresAt: Date.now() + AuthService.TOKEN_DURATION_MS
    };
    this._token.set(newToken);
    localStorage.setItem(AuthService.TOKEN_KEY, JSON.stringify(newToken));
  }

  updateProfile(updates: { name: string; email: string }): Observable<User> {
    const currentUser = this._currentUser();
    if (currentUser === null) {
      return throwError(() => new Error('No user logged in'));
    }
    return this.http.put<JsonPlaceholderUser>(
      `${environment.apiUrl}/users/${currentUser.id}`,
      updates
    ).pipe(
      map((data: JsonPlaceholderUser) => {
        const updatedUser: User = {
          ...currentUser,
          name: data.name,
          email: data.email,
        };
        this._currentUser.set(updatedUser);
        localStorage.setItem(AuthService.USER_KEY, JSON.stringify(updatedUser));
        return updatedUser;
      })
    );
  }

  private isTokenValid(): boolean {
    const token = this._token();
    return token !== null && !this.isTokenExpired(token);
  }

  private isTokenExpired(token: AuthToken): boolean {
    return Date.now() >= token.expiresAt;
  }

  private generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  private clearStorage(): void {
    localStorage.removeItem(AuthService.USER_KEY);
    localStorage.removeItem(AuthService.TOKEN_KEY);
  }
}
