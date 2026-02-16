import { Component, inject, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PhotoService } from '../../services/photo.service';
import { Photo } from '../../models/photo.model';

@Component({
  selector: 'app-photo-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <div class="detail-loading">Loading photo...</div>
    }

    @if (error()) {
      <div class="detail-error">
        <p>{{ error() }}</p>
        <button (click)="goBack()">Back to gallery</button>
      </div>
    }

    @if (photo(); as photo) {
      <div class="photo-detail">
        <div class="detail-header">
          <button class="btn-back" (click)="goBack()">&larr; Back</button>
          <h2>{{ photo.title }}</h2>
        </div>

        <div class="detail-content">
          <div class="detail-image-container">
            <img [src]="photo.url" [alt]="photo.title" class="detail-image">
          </div>

          <div class="detail-info">
            <div class="info-row">
              <span class="label">Likes</span>
              <span class="value">❤️ {{ photo.likes }}</span>
            </div>
            <div class="info-row">
              <span class="label">Album ID</span>
              <span class="value">{{ photo.albumId }}</span>
            </div>
            <div class="info-row">
              <span class="label">Visibility</span>
              <span class="value">{{ photo.isPublic ? 'Public' : 'Private' }}</span>
            </div>
            @if (photo.tags.length > 0) {
              <div class="info-row">
                <span class="label">Tags</span>
                <div class="tags">
                  @for (tag of photo.tags; track tag) {
                    <span class="tag">{{ tag }}</span>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .photo-detail {
      max-width: 900px;
      margin: 0 auto;
    }
    .detail-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    .detail-header h2 {
      margin: 0;
    }
    .btn-back {
      padding: 8px 16px;
      border: 1px solid var(--border-light);
      border-radius: 4px;
      cursor: pointer;
      background: var(--bg-primary);
      color: var(--text-primary);
      white-space: nowrap;
    }
    .btn-back:hover {
      background: var(--bg-input);
    }
    .detail-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .detail-image-container {
      border-radius: 8px;
      overflow: hidden;
      background: var(--bg-input);
    }
    .detail-image {
      width: 100%;
      max-height: 500px;
      object-fit: contain;
      display: block;
    }
    .detail-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .info-row {
      display: flex;
      gap: 12px;
      align-items: baseline;
    }
    .label {
      font-weight: 600;
      min-width: 80px;
      color: var(--text-secondary);
      font-size: 14px;
    }
    .value {
      color: var(--text-primary);
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .tag {
      background: var(--tag-bg);
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      color: var(--text-secondary);
    }
    .detail-loading, .detail-error {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-secondary, #666);
    }
    .detail-error button {
      margin-top: 16px;
      padding: 8px 16px;
      border: 1px solid var(--border-light);
      border-radius: 4px;
      cursor: pointer;
      background: var(--bg-primary);
      color: var(--text-primary);
    }
  `]
})
export class PhotoDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private photoService = inject(PhotoService);
  private destroyRef = inject(DestroyRef);

  photo = signal<Photo | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    this.route.params.pipe(
      takeUntilDestroyed()
    ).subscribe({
      next: (params) => {
        const id = Number(params['id']);
        if (isNaN(id)) {
          this.error.set('Invalid photo ID');
          this.loading.set(false);
          return;
        }
        this.loadPhoto(id);
      }
    });
  }

  private loadPhoto(id: number): void {
    // Try to use already-selected photo from service (instant)
    const selected = this.photoService.selectedPhoto();
    if (selected && selected.id === id) {
      this.photo.set(selected);
      this.loading.set(false);
      return;
    }

    // Otherwise fetch from API
    this.loading.set(true);
    this.photoService.getPhotoById(id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (photo) => {
        this.photo.set(photo);
        this.loading.set(false);
      },
      error: (err: { message: string }) => {
        this.error.set(err.message ?? 'Failed to load photo');
        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/gallery']);
  }
}
