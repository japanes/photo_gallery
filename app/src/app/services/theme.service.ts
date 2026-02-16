import { Injectable, signal, inject, effect } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly authService = inject(AuthService);

  private readonly _isDarkMode = signal(false);
  readonly isDarkMode = this._isDarkMode.asReadonly();

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this._isDarkMode.set(this.loadPreference(user.id));
      } else {
        this._isDarkMode.set(false);
      }
    });
  }

  toggleDarkMode(): void {
    const newValue = !this._isDarkMode();
    this._isDarkMode.set(newValue);

    const user = this.authService.currentUser();
    if (user) {
      this.savePreference(user.id, newValue);
    }
  }

  private loadPreference(userId: number): boolean {
    try {
      return localStorage.getItem(`theme_dark_mode_${userId}`) === 'true';
    } catch {
      return false;
    }
  }

  private savePreference(userId: number, isDark: boolean): void {
    try {
      localStorage.setItem(`theme_dark_mode_${userId}`, String(isDark));
    } catch {
      // localStorage unavailable — silently ignore
    }
  }
}
