import { Component, input, output, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PhotoService } from '../../services/photo.service';
import { User } from '../../models/photo.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="header" role="banner">
      <nav class="header-left" aria-label="Main navigation">
        <button (click)="toggleSidebar.emit()" class="btn-menu" aria-label="Toggle sidebar">☰</button>
        <h1 class="logo">PhotoManager</h1>
      </nav>

      <div class="header-center">
        <input
          type="text"
          placeholder="Search photos..."
          class="global-search"
          [ngModel]="photoService.searchQuery()"
          (ngModelChange)="photoService.setSearchQuery($event)"
          aria-label="Search photos">
      </div>

      <div class="header-right">
        @if (authService.isAuthenticated()) {
          <div class="user-info">
            <a routerLink="/profile" class="profile-link" aria-label="Go to profile">
              <span>{{ user()?.name }}</span>
              @if (!avatarFailed()) {
                <img
                  [src]="user()?.avatarUrl"
                  class="avatar"
                  (error)="avatarFailed.set(true)"
                  alt="User avatar">
              } @else {
                <span class="avatar avatar-fallback">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </span>
              }
            </a>
            <button (click)="onLogout()">Logout</button>
          </div>
        }

        @if (!authService.isAuthenticated()) {
          @if (showLoginForm()) {
            <form class="login-form" (ngSubmit)="onLogin()">
              <input
                type="email"
                placeholder="Email"
                [ngModel]="loginEmail()"
                (ngModelChange)="loginEmail.set($event)"
                name="email"
                required>
              <input
                type="password"
                placeholder="Password"
                [ngModel]="loginPassword()"
                (ngModelChange)="loginPassword.set($event)"
                name="password"
                required>
              <button type="submit">Go</button>
              <button type="button" (click)="showLoginForm.set(false)">✕</button>
            </form>
          } @else {
            <div>
              <button (click)="showLoginForm.set(true)">Login</button>
            </div>
          }
        }

        <button (click)="toggleDarkMode.emit()" class="btn-theme">
          🌙
        </button>
      </div>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      background: #2c3e50;
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .btn-menu {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
    }
    .logo {
      font-size: 18px;
      margin: 0;
    }
    .global-search {
      padding: 8px 16px;
      border: none;
      border-radius: 20px;
      width: 300px;
      font-size: 14px;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .profile-link {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      text-decoration: none;
      cursor: pointer;
    }
    .profile-link:hover {
      opacity: 0.85;
    }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }
    .avatar-fallback {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #95a5a6;
      color: white;
    }
    .avatar-fallback svg {
      width: 20px;
      height: 20px;
    }
    .header-right button {
      padding: 6px 12px;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 4px;
      background: transparent;
      color: white;
      cursor: pointer;
    }
    .btn-theme {
      border: none !important;
      font-size: 18px;
    }
    .login-form {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .login-form input {
      padding: 6px 10px;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 4px;
      background: transparent;
      color: white;
      font-size: 13px;
      width: 130px;
    }
    .login-form input::placeholder {
      color: rgba(255,255,255,0.5);
    }
  `]
})
export class HeaderComponent {
  readonly authService = inject(AuthService);
  readonly photoService = inject(PhotoService);
  private readonly router = inject(Router);

  user = input<User | null>();
  toggleSidebar = output<void>();
  toggleDarkMode = output<void>();

  avatarFailed = signal(false);
  showLoginForm = signal(false);
  loginEmail = signal('');
  loginPassword = signal('');

  onLogin(): void {
    const email = this.loginEmail();
    const password = this.loginPassword();
    if (email && password) {
      this.authService.login(email, password);
      this.showLoginForm.set(false);
      this.loginEmail.set('');
      this.loginPassword.set('');
    }
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }
}
