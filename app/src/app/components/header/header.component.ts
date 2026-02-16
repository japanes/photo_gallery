import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// PROBLEM: No OnPush
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- BUG: No semantic HTML (should use <header>, <nav>) -->
    <div class="header">
      <div class="header-left">
        <button (click)="toggleSidebar.emit()" class="btn-menu">☰</button>
        <h1 class="logo">📷 PhotoManager</h1>
      </div>

      <div class="header-center">
        <!-- BUG: Search duplicated here and in gallery, no shared state -->
        <input
          type="text"
          placeholder="Search..."
          class="global-search"
          [(ngModel)]="globalSearchQuery"
          (keyup.enter)="onGlobalSearch()">
      </div>

      <div class="header-right">
        <!-- BUG: Directly accessing service state in template -->
        <div class="user-info" *ngIf="authService.isAuthenticated">
          <!-- BUG: Using innerHTML - XSS vulnerability -->
          <span [innerHTML]="user?.name"></span>
          <img
            [src]="user?.avatarUrl || 'assets/default-avatar.png'"
            class="avatar"
            (error)="onAvatarError($event)">
          <button (click)="onLogout()">Logout</button>
        </div>

        <div *ngIf="!authService.isAuthenticated">
          <button (click)="onLogin()">Login</button>
        </div>

        <button (click)="toggleDarkMode.emit()" class="btn-theme">
          🌙
        </button>
      </div>
    </div>
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
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
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
  `]
})
export class HeaderComponent {
  @Input() user: any;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() toggleDarkMode = new EventEmitter<void>();

  globalSearchQuery = '';

  // PROBLEM: Injecting AuthService directly AND receiving user as Input - inconsistent
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  onGlobalSearch() {
    // BUG: No actual search implementation
    console.log('Global search:', this.globalSearchQuery);
  }

  onLogin() {
    // BUG: Hardcoded credentials for "demo" - security issue
    this.authService.login('test@example.com', 'password123');
  }

  onLogout() {
    // BUG: No confirmation dialog
    this.authService.logout();
    this.router.navigate(['/']);
  }

  onAvatarError(event: any) {
    // BUG: Direct DOM manipulation
    event.target.src = 'assets/default-avatar.png';
  }
}
