import { Component, signal, computed, effect, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PhotoService } from '../../services/photo.service';
import { NotificationService } from '../../services/notification.service';
import { PhotoCardComponent } from '../photo-card/photo-card.component';
import { UploadDialogComponent } from '../upload-dialog/upload-dialog.component';
import { Photo } from '../../models/photo.model';
import { environment } from '@env/environment';

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [FormsModule, PhotoCardComponent, UploadDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gallery-container">
      <div class="gallery-header">
        <h2>Photo Gallery</h2>
        <div class="gallery-actions">
          <input
            type="text"
            placeholder="Search photos..."
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            class="search-input">
          <select [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event)">
            <option value="date">Date</option>
            <option value="title">Title</option>
            <option value="likes">Likes</option>
          </select>
          <button (click)="showUploadDialog.set(true)" class="btn-upload">
            Upload Photo
          </button>
        </div>
      </div>

      <!-- BUG: No loading skeleton, just a spinner -->
      @if (loading()) {
        <div class="loading">
          <div class="spinner"></div>
          Loading...
        </div>
      }

      <!-- BUG: No empty state handling -->
      @if (error()) {
        <div class="error">
          {{ error() }}
        </div>
      }

      <!-- BUG: No trackBy function, will re-render entire list on any change -->
      @if (!loading()) {
        <div class="photo-grid">
          @for (photo of paginatedPhotos(); track photo.id) {
            <app-photo-card
              [photo]="photo"
              (liked)="onPhotoLiked($event)"
              (deleted)="onPhotoDeleted($event)"
              (selected)="onPhotoSelected($event)">
            </app-photo-card>
          }
        </div>
      }

      <!-- BUG: Pagination is broken - always shows page 1 -->
      @if (paginatedPhotos().length > 0) {
        <div class="pagination">
          <button
            (click)="previousPage()"
            [disabled]="currentPage() === 1">
            Previous
          </button>
          <span>Page {{ currentPage() }} of {{ totalPages() }}</span>
          <button
            (click)="nextPage()"
            [disabled]="currentPage() === totalPages()">
            Next
          </button>
        </div>
      }

      @if (showUploadDialog()) {
        <app-upload-dialog
          (closed)="showUploadDialog.set(false)"
          (uploaded)="onPhotoUploaded($event)">
        </app-upload-dialog>
      }
    </div>
  `,
  styles: [`
    .gallery-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .gallery-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .gallery-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .search-input {
      padding: 8px 12px;
      border: 1px solid var(--border-light);
      border-radius: 4px;
      font-size: 14px;
      background: var(--bg-input);
      color: var(--text-primary);
    }
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      flex-direction: column;
      gap: 10px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--border-color);
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .error {
      color: #e74c3c;
      padding: 20px;
      text-align: center;
      background: var(--error-bg);
      border-radius: 8px;
    }
    .pagination {
      display: flex;
      justify-content: center;
      gap: 15px;
      align-items: center;
      margin-top: 20px;
      padding: 15px 0;
    }
    .pagination button {
      padding: 8px 16px;
      border: 1px solid var(--border-light);
      border-radius: 4px;
      cursor: pointer;
      background: var(--bg-primary);
      color: var(--text-primary);
    }
    .pagination button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-upload {
      padding: 8px 16px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-upload:hover {
      background: #2980b9;
    }
    select {
      padding: 8px;
      border: 1px solid var(--border-light);
      border-radius: 4px;
      background: var(--bg-input);
      color: var(--text-primary);
    }
  `]
})
export class PhotoGalleryComponent {
  private photoService = inject(PhotoService);
  private notificationService = inject(NotificationService);

  // Read service signals directly
  readonly loading = this.photoService.loading;
  readonly error = this.photoService.error;

  // Local UI state signals
  searchQuery = signal('');
  sortBy = signal('date');
  showUploadDialog = signal(false);
  currentPage = signal(1);
  pageSize = signal(20);

  // Computed: filtered and sorted photos (replaces applyFilters())
  filteredPhotos = computed(() => {
    let result = [...this.photoService.photos()];
    const query = this.searchQuery();
    const tags = this.photoService.selectedTags();

    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter((p: Photo) =>
        p.title.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter by selected tags
    if (tags.length > 0) {
      result = result.filter((p: Photo) =>
        tags.some(tag => p.tags.includes(tag))
      );
    }

    // Sort
    switch (this.sortBy()) {
      case 'date':
        result.sort((a: Photo, b: Photo) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        break;
      case 'title':
        result.sort((a: Photo, b: Photo) => a.title.localeCompare(b.title));
        break;
      case 'likes':
        result.sort((a: Photo, b: Photo) => b.likes - a.likes);
        break;
    }

    return result;
  });

  // Computed: total pages derived from filtered count
  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredPhotos().length / this.pageSize()))
  );

  // Computed: paginated slice of filtered photos
  paginatedPhotos = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredPhotos().slice(start, start + this.pageSize());
  });

  constructor() {
    // Reset page to 1 when any filter changes
    effect(() => {
      this.searchQuery();
      this.sortBy();
      this.photoService.selectedTags();
      this.currentPage.set(1);
    }, { allowSignalWrites: true });

    // Load photos on init
    this.photoService.getPhotos();
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  onPhotoLiked(photoId: number) {
    this.photoService.likePhoto(photoId);
  }

  onPhotoDeleted(photoId: number) {
    // BUG: No confirmation dialog before deletion
    this.photoService.deletePhoto(photoId);
    this.notificationService.show('Photo deleted', 'success', 3000);
  }

  onPhotoSelected(photo: Photo) {
    // BUG: No navigation to detail view
    if (environment.debug) { console.log('Selected photo:', photo); }
  }

  onPhotoUploaded(photo: Photo) {
    this.showUploadDialog.set(false);
    this.notificationService.show('Photo uploaded successfully!', 'success', 3000);
    this.photoService.getPhotos(); // BUG: Reloads all photos instead of adding to existing list
  }
}
