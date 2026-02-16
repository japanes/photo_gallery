import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { Photo } from '../../models/photo.model';

@Component({
  selector: 'app-photo-card',
  standalone: true,
  imports: [TruncatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="photo-card" (click)="onSelect()">
      <!-- BUG: No NgOptimizedImage, no lazy loading, no alt text derived from data -->
      <!-- BUG: No error handling for broken images -->
      <img [src]="photo()?.thumbnailUrl" alt="photo" class="photo-image">

      <div class="photo-info">
        <h3 class="photo-title">{{ photo()?.title }}</h3>

        <!-- BUG: Pipe 'truncate' used but might not work correctly -->
        <p class="photo-description">{{ photo()?.title | truncate:50 }}</p>

        <div class="photo-meta">
          <span class="likes" (click)="onLike($event)">
            ❤️ {{ photo()?.likes }}
          </span>
          <!-- BUG: No date formatting, raw date string shown -->
          <span class="date">{{ photo()?.uploadedAt }}</span>
        </div>

        <div class="photo-actions">
          <!-- BUG: No aria labels, no keyboard support -->
          <button (click)="onLike($event)" class="btn-like">Like</button>
          <button (click)="onDelete($event)" class="btn-delete">Delete</button>
        </div>
      </div>

      <!-- BUG: Tags rendered without proper styling or click handling -->
      @if (photo()?.tags?.length) {
        <div class="photo-tags">
          @for (tag of photo().tags; track tag) {
            <span class="tag">{{ tag }}</span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .photo-card {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
      background: var(--bg-primary);
    }
    .photo-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px var(--card-shadow);
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
      color: var(--text-secondary);
      margin: 0 0 8px 0;
    }
    .photo-meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-tertiary);
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
      border: 1px solid var(--border-light);
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      background: var(--bg-primary);
      color: var(--text-primary);
    }
    .btn-like {
      color: #e74c3c !important;
      border-color: #e74c3c !important;
    }
    .btn-delete {
      color: #e74c3c !important;
    }
    .photo-tags {
      padding: 0 12px 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .tag {
      background: var(--tag-bg);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      color: var(--text-secondary);
    }
  `]
})
export class PhotoCardComponent {
  photo = input.required<Photo>();

  liked = output<number>();
  deleted = output<number>();
  selected = output<Photo>();

  onSelect() {
    this.selected.emit(this.photo());
  }

  onLike(event: Event) {
    event.stopPropagation();
    this.liked.emit(this.photo().id);
  }

  onDelete(event: Event) {
    event.stopPropagation();
    // BUG: No confirmation before emitting delete
    this.deleted.emit(this.photo().id);
  }
}
