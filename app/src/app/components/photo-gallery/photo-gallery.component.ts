import { Component, signal, computed, effect, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PhotoService } from '../../services/photo.service';
import { NotificationService } from '../../services/notification.service';
import { PhotoCardComponent } from '../photo-card/photo-card.component';
import { UploadDialogComponent } from '../upload-dialog/upload-dialog.component';
import { Photo } from '../../models/photo.model';

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
            (ngModelChange)="photoService.setSearchQuery($event)"
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

      @if (loading()) {
        <div class="photo-grid">
          @for (item of skeletonItems; track item) {
            <div class="skeleton-card">
              <div class="skeleton-image"></div>
              <div class="skeleton-text"></div>
              <div class="skeleton-text short"></div>
            </div>
          }
        </div>
      }

      @if (error()) {
        <div class="error">
          {{ error() }}
        </div>
      }

      @if (!loading() && !error() && filteredPhotos().length === 0) {
        <div class="empty-state">
          <p>No photos found</p>
          @if (searchQuery()) {
            <p class="empty-state-hint">Try adjusting your search or filters</p>
          }
        </div>
      }

      @if (!loading() && filteredPhotos().length > 0) {
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
    .skeleton-card {
      border-radius: 8px;
      overflow: hidden;
      background: var(--bg-primary);
      border: 1px solid var(--border-light);
    }
    .skeleton-image {
      width: 100%;
      height: 180px;
      background: linear-gradient(90deg, var(--border-light) 25%, var(--bg-input) 50%, var(--border-light) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .skeleton-text {
      height: 14px;
      margin: 12px;
      border-radius: 4px;
      background: linear-gradient(90deg, var(--border-light) 25%, var(--bg-input) 50%, var(--border-light) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .skeleton-text.short {
      width: 60%;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-secondary, #666);
    }
    .empty-state-hint {
      font-size: 14px;
      margin-top: 8px;
      opacity: 0.7;
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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly photoService = inject(PhotoService);
  private notificationService = inject(NotificationService);

  readonly skeletonItems = Array.from({ length: 8 }, (_, i) => i);

  // Read service signals directly
  readonly loading = this.photoService.loading;
  readonly error = this.photoService.error;

  // Search query shared via PhotoService
  readonly searchQuery = this.photoService.searchQuery;

  // Local UI state signals
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

    // Load photos based on :albumId route param (re-fetches on param change)
    this.route.params.pipe(
      takeUntilDestroyed()
    ).subscribe({
      next: (params) => {
        const albumId = params['albumId'] ? Number(params['albumId']) : undefined;
        this.photoService.getPhotos(albumId);
      }
    });
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
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }
    this.photoService.deletePhoto(photoId);
    this.notificationService.show('Photo deleted', 'success', 3000);
  }

  onPhotoSelected(photo: Photo) {
    this.photoService.selectPhoto(photo);
    this.router.navigate(['/photo', photo.id]);
  }

  onPhotoUploaded(photo: Photo) {
    this.showUploadDialog.set(false);
    this.photoService.addPhoto(photo);
    this.notificationService.show('Photo uploaded successfully!', 'success', 3000);
  }
}
