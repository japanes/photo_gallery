import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { Album } from './models/photo.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-container" [class.dark-mode]="themeService.isDarkMode()">
      <app-header
        [user]="authService.currentUser()"
        (toggleSidebar)="toggleSidebar()"
        (toggleDarkMode)="themeService.toggleDarkMode()">
      </app-header>

      <div class="app-body">
        @if (showSidebar()) {
          <app-sidebar
            [albums]="albums()"
            (albumSelected)="onAlbumSelected($event)">
          </app-sidebar>
        }

        <main class="main-content" [class.with-sidebar]="showSidebar()">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      font-family: Arial, sans-serif;
    }
    .app-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }
    .main-content.with-sidebar {
      margin-left: 0;
    }
    .dark-mode {
      background: var(--bg-secondary);
      color: var(--text-primary);
    }
  `]
})
export class AppComponent {
  private router = inject(Router);
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);

  showSidebar = signal(true);
  albums = signal<Album[]>([]);

  toggleSidebar() {
    this.showSidebar.update(v => !v);
  }

  onAlbumSelected(albumId: number) {
    this.router.navigate(['/gallery', albumId]);
  }
}
