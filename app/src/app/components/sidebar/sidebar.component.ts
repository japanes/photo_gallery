import { Component, input, output, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { PhotoService } from '../../services/photo.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- BUG: No semantic HTML (should use <aside>, <nav>) -->
    <div class="sidebar">
      <div class="sidebar-section">
        <h3>Albums</h3>
        <!-- BUG: No loading state for albums -->
        <ul class="album-list">
          @for (album of albums(); track album.id) {
            <li
              [class.active]="selectedAlbumId() === album.id"
              (click)="selectAlbum(album)">
              <!-- BUG: No album cover image, just text -->
              <span class="album-name">{{ album.name }}</span>
              <span class="album-count">{{ album.photos?.length || 0 }}</span>
            </li>
          }
        </ul>

        <!-- BUG: Create album doesn't work -->
        <button (click)="createAlbum()" class="btn-create">
          + New Album
        </button>
      </div>

      <div class="sidebar-section">
        <h3>Tags</h3>
        <!-- BUG: Tags hardcoded, not loaded from API -->
        <div class="tag-cloud">
          @for (tag of popularTags; track tag) {
            <span
              class="tag"
              [class.active]="selectedTags().includes(tag)"
              (click)="toggleTag(tag)">
              {{ tag }}
            </span>
          }
        </div>
      </div>

      <div class="sidebar-section">
        <h3>Quick Stats</h3>
        <div class="stats">
          <div class="stat">
            <span class="stat-value">{{ totalPhotos() }}</span>
            <span class="stat-label">Photos</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ totalAlbums() }}</span>
            <span class="stat-label">Albums</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ totalLikes() }}</span>
            <span class="stat-label">Likes</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      background: #f8f9fa;
      border-right: 1px solid #e0e0e0;
      padding: 16px;
      overflow-y: auto;
      /* BUG: Fixed height causes content cut-off on small screens */
      height: calc(100vh - 60px);
    }
    .sidebar-section {
      margin-bottom: 24px;
    }
    .sidebar-section h3 {
      font-size: 14px;
      text-transform: uppercase;
      color: #666;
      margin: 0 0 12px 0;
      letter-spacing: 0.5px;
    }
    .album-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .album-list li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    .album-list li:hover {
      background: #e9ecef;
    }
    .album-list li.active {
      background: #3498db;
      color: white;
    }
    .album-count {
      background: rgba(0,0,0,0.1);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 12px;
    }
    .btn-create {
      width: 100%;
      padding: 8px;
      margin-top: 8px;
      border: 1px dashed #ccc;
      border-radius: 6px;
      background: transparent;
      color: #666;
      cursor: pointer;
      font-size: 13px;
    }
    .btn-create:hover {
      background: #e9ecef;
    }
    .tag-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .tag {
      padding: 4px 10px;
      background: #e9ecef;
      border-radius: 14px;
      font-size: 12px;
      cursor: pointer;
    }
    .tag.active {
      background: #3498db;
      color: white;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .stat {
      text-align: center;
      padding: 8px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    .stat-value {
      display: block;
      font-size: 18px;
      font-weight: bold;
      color: #2c3e50;
    }
    .stat-label {
      display: block;
      font-size: 11px;
      color: #999;
      margin-top: 2px;
    }
  `]
})
export class SidebarComponent {
  private photoService = inject(PhotoService);

  albums = input<any[]>([]);
  albumSelected = output<any>();

  selectedAlbumId = signal<any>(null);
  selectedTags = signal<string[]>([]);

  // BUG: Hardcoded tags
  popularTags = ['nature', 'portrait', 'landscape', 'urban', 'macro', 'wedding', 'food'];

  // Computed signals derived from service state — no subscription needed (fixes memory leak)
  totalPhotos = computed(() => this.photoService.totalPhotos());
  totalLikes = computed(() => this.photoService.totalLikes());
  totalAlbums = computed(() => this.albums().length);

  selectAlbum(album: any) {
    this.selectedAlbumId.set(album.id);
    this.albumSelected.emit(album.id);
  }

  toggleTag(tag: string) {
    this.selectedTags.update(current => {
      const index = current.indexOf(tag);
      if (index > -1) {
        return current.filter(t => t !== tag);
      } else {
        return [...current, tag];
      }
    });
    // BUG: Tag filtering not connected to photo service
    console.log('Selected tags:', this.selectedTags());
  }

  createAlbum() {
    // BUG: Not implemented, just logs
    console.log('Create album - not implemented');
  }
}
