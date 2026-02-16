import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage, DatePipe } from '@angular/common';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { Photo } from '../../models/photo.model';

@Component({
  selector: 'app-photo-card',
  standalone: true,
  imports: [NgOptimizedImage, DatePipe, TruncatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="photo-card" (click)="onSelect()" (keydown.enter)="onSelect()" tabindex="0" role="article" [attr.aria-label]="'Photo: ' + photo().title">
      <div class="photo-image-container">
        @if (imageError()) {
          <div class="photo-image-fallback">
            <span>Image unavailable</span>
          </div>
        } @else {
          <img
            [ngSrc]="photo().thumbnailUrl"
            [alt]="photo().title"
            fill
            loading="lazy"
            (error)="onImageError()"
            class="photo-image"
          >
        }
      </div>

      <div class="photo-info">
        <h3 class="photo-title">{{ photo().title }}</h3>

        <p class="photo-description">{{ photo().title | truncate:50 }}</p>

        <div class="photo-meta">
          <span class="likes" (click)="onLike($event)" (keydown.enter)="onLike($event)" tabindex="0" role="button" aria-label="Like this photo">
            ❤️ {{ photo().likes }}
          </span>
          <span class="date">{{ photo().uploadedAt | date:'mediumDate' }}</span>
        </div>

        <div class="photo-actions">
          <button (click)="onLike($event)" class="btn-like" aria-label="Like this photo">Like</button>
          <button (click)="onDelete($event)" class="btn-delete" aria-label="Delete this photo">Delete</button>
        </div>
      </div>

      @if (photo().tags.length) {
        <div class="photo-tags">
          @for (tag of photo().tags; track tag) {
            <span
              class="tag"
              role="button"
              tabindex="0"
              (click)="onTagClick($event, tag)"
              (keydown.enter)="onTagClick($event, tag)"
              [attr.aria-label]="'Filter by tag: ' + tag"
            >{{ tag }}</span>
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
    .photo-card:focus-visible {
      outline: 2px solid var(--focus-color, #2196f3);
      outline-offset: 2px;
    }
    .photo-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px var(--card-shadow);
    }
    .photo-image-container {
      position: relative;
      width: 100%;
      height: 200px;
      background: var(--skeleton-bg, #e0e0e0);
    }
    .photo-image {
      object-fit: cover;
    }
    .photo-image-fallback {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--skeleton-bg, #e0e0e0);
      color: var(--text-tertiary);
      font-size: 12px;
    }
    .photo-info {
      padding: 12px;
    }
    .photo-title {
      font-size: 14px;
      margin: 0 0 8px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .photo-description {
      font-size: 12px;
      color: var(--text-secondary);
      margin: 0 0 8px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
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
    .likes:focus-visible {
      outline: 2px solid var(--focus-color, #2196f3);
      border-radius: 4px;
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
    .photo-actions button:focus-visible {
      outline: 2px solid var(--focus-color, #2196f3);
      outline-offset: 2px;
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
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .tag:hover {
      background: var(--tag-bg-hover, #c0c0c0);
      color: var(--text-primary);
    }
    .tag:focus-visible {
      outline: 2px solid var(--focus-color, #2196f3);
      outline-offset: 2px;
    }
  `]
})
export class PhotoCardComponent {
  photo = input.required<Photo>();

  liked = output<number>();
  deleted = output<number>();
  selected = output<Photo>();
  tagClicked = output<string>();

  imageError = signal(false);

  onSelect(): void {
    this.selected.emit(this.photo());
  }

  onLike(event: Event): void {
    event.stopPropagation();
    this.liked.emit(this.photo().id);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this photo?')) {
      this.deleted.emit(this.photo().id);
    }
  }

  onImageError(): void {
    this.imageError.set(true);
  }

  onTagClick(event: Event, tag: string): void {
    event.stopPropagation();
    this.tagClicked.emit(tag);
  }
}
