import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { Album } from './models/photo.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-container" [class.dark-mode]="isDarkMode()">
      <app-header
        [user]="authService.currentUser()"
        (toggleSidebar)="toggleSidebar()"
        (toggleDarkMode)="toggleDarkMode()">
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
  readonly authService = inject(AuthService);

  showSidebar = signal(true);
  isDarkMode = signal(false);
  albums = signal<Album[]>([]);

  toggleSidebar() {
    this.showSidebar.update(v => !v);
  }

  onAlbumSelected(albumId: number) {
    console.log('Album selected:', albumId); // BUG: Console.log left in code
    // BUG: No actual navigation or filtering logic
  }

  toggleDarkMode() {
    this.isDarkMode.update(v => !v);
    // BUG: Preference not persisted
  }
}
