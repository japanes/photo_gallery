import { Component, output, signal, computed, inject, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PhotoService } from '../../services/photo.service';
import { NotificationService } from '../../services/notification.service';
import { Album } from '../../models/photo.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="sidebar">
      <nav class="sidebar-section" aria-label="Albums">
        <h3>Albums</h3>
        @if (albumsLoading()) {
          <div class="loading-state">
            @for (item of skeletonItems; track item) {
              <div class="skeleton-album">
                <div class="skeleton-cover"></div>
                <div class="skeleton-text"></div>
              </div>
            }
          </div>
        } @else {
          <ul class="album-list">
            @for (album of albums(); track album.id) {
              <li
                [class.active]="selectedAlbumId() === album.id"
                (click)="selectAlbum(album)"
                (keydown.enter)="selectAlbum(album)"
                tabindex="0">
                @if (album.coverPhotoUrl) {
                  <img
                    class="album-cover"
                    [src]="album.coverPhotoUrl"
                    [alt]="album.name + ' cover'"
                    loading="lazy">
                } @else {
                  <span class="album-initial" aria-hidden="true">
                    {{ album.name.charAt(0).toUpperCase() }}
                  </span>
                }
                <span class="album-name">{{ album.name }}</span>
                <span class="album-count">{{ album.photos?.length || 0 }}</span>
              </li>
            }
          </ul>
          @if (albums().length === 0) {
            <p class="empty-message">No albums yet</p>
          }
        }

        <button (click)="createAlbum()" class="btn-create">
          + New Album
        </button>
      </nav>

      <nav class="sidebar-section" aria-label="Tags">
        <h3>Tags</h3>
        <div class="tag-cloud" role="group" aria-label="Filter by tags">
          @for (tag of popularTags(); track tag) {
            <button
              class="tag"
              [class.active]="selectedTags().includes(tag)"
              [attr.aria-pressed]="selectedTags().includes(tag)"
              (click)="toggleTag(tag)">
              {{ tag }}
            </button>
          }
          @if (popularTags().length === 0) {
            <p class="empty-message">No tags available</p>
          }
        </div>
      </nav>

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
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      padding: 16px;
      overflow-y: auto;
      height: 100%;
      min-height: 0;
    }
    .sidebar-section {
      margin-bottom: 24px;
    }
    .sidebar-section h3 {
      font-size: 14px;
      text-transform: uppercase;
      color: var(--text-secondary);
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
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    .album-list li:hover {
      background: var(--hover-bg);
    }
    .album-list li:focus-visible {
      outline: 2px solid #3498db;
      outline-offset: -2px;
    }
    .album-list li.active {
      background: #3498db;
      color: white;
    }
    .album-cover {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      object-fit: cover;
      flex-shrink: 0;
    }
    .album-initial {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 4px;
      background: #3498db;
      color: white;
      font-size: 14px;
      font-weight: bold;
      flex-shrink: 0;
    }
    .album-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .album-count {
      background: rgba(0,0,0,0.1);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 12px;
      flex-shrink: 0;
    }
    .btn-create {
      width: 100%;
      padding: 8px;
      margin-top: 8px;
      border: 1px dashed var(--border-dashed);
      border-radius: 6px;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 13px;
    }
    .btn-create:hover {
      background: var(--hover-bg);
    }
    .tag-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .tag {
      padding: 4px 10px;
      background: var(--bg-tertiary);
      border: none;
      border-radius: 14px;
      font-size: 12px;
      cursor: pointer;
      color: var(--text-primary);
    }
    .tag:hover {
      opacity: 0.8;
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
      background: var(--bg-primary);
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }
    .stat-value {
      display: block;
      font-size: 18px;
      font-weight: bold;
      color: var(--text-heading);
    }
    .stat-label {
      display: block;
      font-size: 11px;
      color: var(--text-tertiary);
      margin-top: 2px;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .skeleton-album {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
    }
    .skeleton-cover {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      background: linear-gradient(90deg, var(--border-light, #e0e0e0) 25%, var(--bg-input, #f0f0f0) 50%, var(--border-light, #e0e0e0) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      flex-shrink: 0;
    }
    .skeleton-text {
      height: 14px;
      flex: 1;
      border-radius: 4px;
      background: linear-gradient(90deg, var(--border-light, #e0e0e0) 25%, var(--bg-input, #f0f0f0) 50%, var(--border-light, #e0e0e0) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .empty-message {
      font-size: 13px;
      color: var(--text-tertiary);
      padding: 8px 12px;
      margin: 0;
    }
  `]
})
export class SidebarComponent {
  private photoService = inject(PhotoService);
  private notificationService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  albumSelected = output<number>();

  albums = signal<Album[]>([]);
  albumsLoading = signal(true);
  selectedAlbumId = signal<number | null>(null);

  readonly selectedTags = this.photoService.selectedTags;
  readonly popularTags = this.photoService.popularTags;

  readonly skeletonItems = Array.from({ length: 4 }, (_, i) => i);

  totalPhotos = computed(() => this.photoService.totalPhotos());
  totalLikes = computed(() => this.photoService.totalLikes());
  totalAlbums = computed(() => this.albums().length);

  constructor() {
    this.photoService.getAlbums().pipe(
      takeUntilDestroyed()
    ).subscribe({
      next: (albums) => {
        this.albums.set(albums);
        this.albumsLoading.set(false);
      },
      error: () => {
        this.albumsLoading.set(false);
      }
    });
  }

  selectAlbum(album: Album) {
    this.selectedAlbumId.set(album.id);
    this.albumSelected.emit(album.id);
  }

  toggleTag(tag: string) {
    this.photoService.toggleTag(tag);
  }

  createAlbum() {
    const name = prompt('Enter album name:');
    if (!name?.trim()) {
      return;
    }

    this.photoService.createAlbum(name.trim()).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (album) => {
        this.albums.update(current => [...current, album]);
        this.notificationService.show(`Album "${album.name}" created`, 'success', 3000);
      },
      error: () => {
        this.notificationService.show('Failed to create album', 'error', 3000);
      }
    });
  }
}
