import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PhotoService } from '../../services/photo.service';
import { NotificationService } from '../../services/notification.service';
import { Photo } from '../../models/photo.model';
import { PhotoCardComponent } from '../photo-card/photo-card.component';
import { UploadDialogComponent } from '../upload-dialog/upload-dialog.component';

// PROBLEM: Uses OnInit/OnDestroy lifecycle instead of modern patterns
@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule, PhotoCardComponent, UploadDialogComponent],
  template: `
    <div class="gallery-container">
      <div class="gallery-header">
        <h2>Photo Gallery</h2>
        <div class="gallery-actions">
          <input
            type="text"
            placeholder="Search photos..."
            [(ngModel)]="searchQuery"
            (keyup)="onSearch($event)"
            class="search-input">
          <select [(ngModel)]="sortBy" (change)="onSortChange()">
            <option value="date">Date</option>
            <option value="title">Title</option>
            <option value="likes">Likes</option>
          </select>
          <button (click)="openUploadDialog()" class="btn-upload">
            Upload Photo
          </button>
        </div>
      </div>

      <!-- BUG: No loading skeleton, just a spinner -->
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        Loading...
      </div>

      <!-- BUG: No empty state handling -->
      <div *ngIf="error" class="error">
        {{ error }}
      </div>

      <!-- BUG: No trackBy function, will re-render entire list on any change -->
      <div class="photo-grid" *ngIf="!loading">
        <app-photo-card
          *ngFor="let photo of filteredPhotos"
          [photo]="photo"
          (liked)="onPhotoLiked($event)"
          (deleted)="onPhotoDeleted($event)"
          (selected)="onPhotoSelected($event)">
        </app-photo-card>
      </div>

      <!-- BUG: Pagination is broken - always shows page 1 -->
      <div class="pagination" *ngIf="filteredPhotos.length > 0">
        <button
          (click)="previousPage()"
          [disabled]="currentPage === 1">
          Previous
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button
          (click)="nextPage()"
          [disabled]="currentPage === totalPages">
          Next
        </button>
      </div>

      <app-upload-dialog
        *ngIf="showUploadDialog"
        (closed)="showUploadDialog = false"
        (uploaded)="onPhotoUploaded($event)">
      </app-upload-dialog>
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
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
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
      border: 4px solid #f3f3f3;
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
      background: #ffeaea;
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
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      background: #fff;
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
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  `]
})
export class PhotoGalleryComponent implements OnInit, OnDestroy {
  photos: any[] = [];
  filteredPhotos: any[] = [];
  loading = false;
  error: any = null;
  searchQuery = '';
  sortBy = 'date';
  showUploadDialog = false;
  currentPage = 1;
  pageSize = 20;
  totalPages = 1;

  // BUG: Subscriptions stored but some never unsubscribed
  private subscriptions: Subscription[] = [];

  constructor(
    private photoService: PhotoService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadPhotos();

    // BUG: Memory leak - subscription added but cleanup is inconsistent
    const sub = this.photoService.photos$.subscribe(photos => {
      this.photos = photos;
      this.applyFilters();
    });
    this.subscriptions.push(sub);

    // BUG: Another subscription not tracked
    this.photoService.uploadProgress$.subscribe(progress => {
      console.log('Upload progress:', progress);
    });
  }

  ngOnDestroy() {
    // BUG: Only unsubscribes from tracked subscriptions, misses the upload progress one
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadPhotos() {
    this.loading = true;
    this.error = null;

    // BUG: getPhotos() doesn't return observable, it subscribes internally
    // This means we can't handle errors here
    this.photoService.getPhotos();

    // BUG: Sets loading to false immediately, doesn't wait for response
    // The actual loading state is managed by the subscription above, but race condition exists
  }

  // BUG: Called on every keyup without debounce
  onSearch(event: any) {
    this.searchQuery = event.target.value;
    this.applyFilters();
  }

  onSortChange() {
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.photos];

    // Filter by search query
    if (this.searchQuery) {
      // BUG: Case-sensitive search
      result = result.filter((p: any) =>
        p.title.includes(this.searchQuery)
      );
    }

    // Sort
    switch (this.sortBy) {
      case 'date':
        // BUG: uploadedAt is 'any' type, sort might not work correctly
        result.sort((a: any, b: any) => b.uploadedAt - a.uploadedAt);
        break;
      case 'title':
        result.sort((a: any, b: any) => a.title.localeCompare(b.title));
        break;
      case 'likes':
        result.sort((a: any, b: any) => b.likes - a.likes);
        break;
    }

    // Pagination
    this.totalPages = Math.ceil(result.length / this.pageSize);
    // BUG: Doesn't reset to page 1 when filters change
    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredPhotos = result.slice(start, start + this.pageSize);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  openUploadDialog() {
    this.showUploadDialog = true;
  }

  onPhotoLiked(photoId: any) {
    this.photoService.likePhoto(photoId);
  }

  onPhotoDeleted(photoId: any) {
    // BUG: No confirmation dialog before deletion
    this.photoService.deletePhoto(photoId);
    this.notificationService.show('Photo deleted', 'success', 3000);
  }

  onPhotoSelected(photo: any) {
    // BUG: No navigation to detail view, just logs
    console.log('Selected photo:', photo);
  }

  onPhotoUploaded(photo: any) {
    this.showUploadDialog = false;
    this.notificationService.show('Photo uploaded successfully!', 'success', 3000);
    this.loadPhotos(); // BUG: Reloads all photos instead of adding to existing list
  }
}
