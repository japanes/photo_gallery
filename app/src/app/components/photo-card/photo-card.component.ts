import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from '../../pipes/truncate.pipe';

// PROBLEM: No OnPush change detection
// PROBLEM: No accessibility
@Component({
  selector: 'app-photo-card',
  standalone: true,
  imports: [CommonModule, TruncatePipe],
  template: `
    <div class="photo-card" (click)="onSelect()">
      <!-- BUG: No NgOptimizedImage, no lazy loading, no alt text derived from data -->
      <!-- BUG: No error handling for broken images -->
      <img [src]="photo?.thumbnailUrl" alt="photo" class="photo-image">

      <div class="photo-info">
        <h3 class="photo-title">{{ photo?.title }}</h3>

        <!-- BUG: Pipe 'truncate' used but might not work correctly -->
        <p class="photo-description">{{ photo?.title | truncate:50 }}</p>

        <div class="photo-meta">
          <span class="likes" (click)="onLike($event)">
            ❤️ {{ photo?.likes }}
          </span>
          <!-- BUG: No date formatting, raw date string shown -->
          <span class="date">{{ photo?.uploadedAt }}</span>
        </div>

        <div class="photo-actions">
          <!-- BUG: No aria labels, no keyboard support -->
          <button (click)="onLike($event)" class="btn-like">Like</button>
          <button (click)="onDelete($event)" class="btn-delete">Delete</button>
        </div>
      </div>

      <!-- BUG: Tags rendered without proper styling or click handling -->
      <div class="photo-tags" *ngIf="photo?.tags?.length">
        <span *ngFor="let tag of photo.tags" class="tag">{{ tag }}</span>
      </div>
    </div>
  `,
  styles: [`
    .photo-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
      background: #fff;
    }
    .photo-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .photo-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      /* BUG: No placeholder/skeleton while loading */
    }
    .photo-info {
      padding: 12px;
    }
    .photo-title {
      font-size: 14px;
      margin: 0 0 8px 0;
      /* BUG: No text overflow handling */
    }
    .photo-description {
      font-size: 12px;
      color: #666;
      margin: 0 0 8px 0;
    }
    .photo-meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #999;
      margin-bottom: 8px;
    }
    .likes {
      cursor: pointer;
    }
    .photo-actions {
      display: flex;
      gap: 8px;
    }
    .photo-actions button {
      flex: 1;
      padding: 6px;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .btn-like {
      background: #fff;
      color: #e74c3c;
      border-color: #e74c3c !important;
    }
    .btn-delete {
      background: #fff;
      color: #e74c3c;
    }
    .photo-tags {
      padding: 0 12px 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .tag {
      background: #f0f0f0;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      color: #666;
    }
  `]
})
export class PhotoCardComponent {
  // BUG: No type safety, using any
  @Input() photo: any;

  @Output() liked = new EventEmitter<any>();
  @Output() deleted = new EventEmitter<any>();
  @Output() selected = new EventEmitter<any>();

  onSelect() {
    this.selected.emit(this.photo);
  }

  onLike(event: Event) {
    event.stopPropagation();
    this.liked.emit(this.photo.id);
  }

  onDelete(event: Event) {
    event.stopPropagation();
    // BUG: No confirmation before emitting delete
    this.deleted.emit(this.photo.id);
  }
}
