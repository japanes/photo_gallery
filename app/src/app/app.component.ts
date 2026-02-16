import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

// PROBLEM: Not standalone, uses legacy module approach
@Component({
  selector: 'app-root',
  template: `
    <div class="app-container" [class.dark-mode]="isDarkMode">
      <app-header
        [user]="authService.currentUser"
        (toggleSidebar)="showSidebar = !showSidebar"
        (toggleDarkMode)="toggleDarkMode()">
      </app-header>

      <div class="app-body">
        <app-sidebar
          *ngIf="showSidebar"
          [albums]="albums"
          (albumSelected)="onAlbumSelected($event)">
        </app-sidebar>

        <main class="main-content" [class.with-sidebar]="showSidebar">
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
    /* BUG: Dark mode styles incomplete */
    .dark-mode {
      background: #1a1a1a;
      color: #fff;
    }
  `]
})
export class AppComponent implements OnInit {
  showSidebar = true;
  isDarkMode = false;
  albums: any[] = [];

  // PROBLEM: Direct service injection via constructor, public access
  constructor(public authService: AuthService) {}

  ngOnInit() {
    // BUG: No error handling, no loading state
    this.loadAlbums();
  }

  loadAlbums() {
    // BUG: This method doesn't actually work - no PhotoService injected
    // but code doesn't error because albums starts as empty array
  }

  onAlbumSelected(albumId: any) {
    console.log('Album selected:', albumId); // BUG: Console.log left in code
    // BUG: No actual navigation or filtering logic
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    // BUG: Preference not persisted
  }
}
