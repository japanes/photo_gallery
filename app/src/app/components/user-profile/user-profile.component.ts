import { Component, OnInit, signal, computed, inject, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { PhotoService } from '../../services/photo.service';
import { NotificationService } from '../../services/notification.service';
import { Photo, Album, UserRole } from '../../models/photo.model';

const RECENT_PHOTOS_LIMIT = 6;

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  moderator: 'Moderator',
  user: 'User',
};

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (user()) {
      <div class="profile-container">
        <div class="profile-header">
          @if (hasValidAvatar()) {
            <img [ngSrc]="user()!.avatarUrl" alt="Profile avatar for {{ user()!.name }}"
              width="100" height="100" class="profile-avatar"
              (error)="avatarFailed.set(true)" priority>
          } @else {
            <span class="profile-avatar avatar-fallback" role="img" aria-label="Default avatar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </span>
          }
          <div class="profile-info">
            <h2>{{ user()!.name }}</h2>
            <p>{{ user()!.email }}</p>
            <span class="role-badge" [class]="'role-' + user()!.role">
              {{ roleLabel() }}
            </span>
          </div>
        </div>

        <div class="profile-stats">
          <div class="stat-card">
            <h3>{{ userPhotos().length }}</h3>
            <p>Photos</p>
          </div>
          <div class="stat-card">
            <h3>{{ userAlbums().length }}</h3>
            <p>Albums</p>
          </div>
          <div class="stat-card">
            <h3>{{ totalLikes() }}</h3>
            <p>Total Likes</p>
          </div>
        </div>

        <div class="profile-section">
          <h3>Recent Photos</h3>
          @if (photosLoading()) {
            <div class="loading-state">Loading photos...</div>
          } @else if (userPhotos().length === 0) {
            <p class="empty-state">No photos uploaded yet.</p>
          } @else {
            <div class="photo-grid">
              @for (photo of displayedPhotos(); track photo.id) {
                <div class="photo-thumb">
                  <img [src]="photo.thumbnailUrl" [alt]="photo.title">
                </div>
              }
            </div>
            @if (hasMorePhotos()) {
              <button type="button" class="show-more-btn" (click)="showAllPhotos.set(true)">
                Show all {{ userPhotos().length }} photos
              </button>
            }
          }
        </div>

        <div class="profile-section">
          <h3>Settings</h3>
          <form>
            <div class="form-group">
              <label for="profile-name">Display Name</label>
              <input id="profile-name" type="text" [ngModel]="editName()" (ngModelChange)="editName.set($event)" name="name">
            </div>
            <div class="form-group">
              <label for="profile-email">Email</label>
              <input id="profile-email" type="email" [ngModel]="editEmail()" (ngModelChange)="editEmail.set($event)" name="email">
            </div>
            <button type="button" (click)="saveProfile()" [disabled]="saving()">
              {{ saving() ? 'Saving...' : 'Save Changes' }}
            </button>
          </form>
        </div>
      </div>
    } @else {
      <div class="no-user">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
        </svg>
        <p>Please log in to view your profile.</p>
      </div>
    }
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .profile-header {
      display: flex;
      gap: 20px;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border-color);
    }
    .profile-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #3498db;
    }
    .avatar-fallback {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #95a5a6;
      color: white;
    }
    .avatar-fallback svg {
      width: 56px;
      height: 56px;
    }
    .profile-info h2 {
      margin: 0 0 4px 0;
    }
    .profile-info p {
      margin: 0;
      color: var(--text-secondary);
    }
    .role-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      background: var(--bg-tertiary);
      color: var(--text-primary);
      margin-top: 6px;
    }
    .role-admin {
      background: #3498db;
      color: white;
    }
    .role-moderator {
      background: #e67e22;
      color: white;
    }
    .profile-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 30px;
    }
    .stat-card {
      text-align: center;
      padding: 20px;
      background: var(--bg-secondary);
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }
    .stat-card h3 {
      font-size: 28px;
      margin: 0;
      color: var(--text-heading);
    }
    .stat-card p {
      margin: 4px 0 0;
      color: var(--text-secondary);
      font-size: 14px;
    }
    .profile-section {
      margin-bottom: 30px;
    }
    .profile-section h3 {
      margin: 0 0 16px 0;
      color: var(--text-heading);
    }
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 8px;
    }
    .photo-thumb img {
      width: 100%;
      height: 120px;
      object-fit: cover;
      border-radius: 8px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      margin-bottom: 4px;
      color: var(--text-primary);
      font-size: 14px;
    }
    .form-group input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--border-light);
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
      background: var(--bg-input);
      color: var(--text-primary);
    }
    button[type="button"] {
      padding: 10px 24px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    button[type="button"]:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .show-more-btn {
      display: block;
      margin: 12px auto 0;
      background: transparent;
      color: #3498db;
      border: 1px solid #3498db;
      padding: 8px 20px;
    }
    .loading-state {
      text-align: center;
      padding: 30px;
      color: var(--text-secondary);
    }
    .empty-state {
      text-align: center;
      padding: 30px;
      color: var(--text-secondary);
    }
    .no-user {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-secondary);
    }
    .no-user svg {
      opacity: 0.4;
      margin-bottom: 12px;
    }
  `]
})
export class UserProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private photoService = inject(PhotoService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  readonly user = this.authService.currentUser;

  avatarFailed = signal(false);
  userPhotos = signal<Photo[]>([]);
  userAlbums = signal<Album[]>([]);
  photosLoading = signal(false);
  saving = signal(false);
  showAllPhotos = signal(false);

  editName = signal('');
  editEmail = signal('');

  readonly hasValidAvatar = computed(() => {
    const url = this.user()?.avatarUrl;
    return !!url && !this.avatarFailed();
  });

  readonly roleLabel = computed(() => {
    const role = this.user()?.role;
    return role ? ROLE_LABELS[role] : '';
  });

  readonly totalLikes = computed(() =>
    this.userPhotos().reduce((sum: number, p: Photo) => sum + (p.likes || 0), 0)
  );

  readonly displayedPhotos = computed(() => {
    const photos = this.userPhotos();
    return this.showAllPhotos() ? photos : photos.slice(0, RECENT_PHOTOS_LIMIT);
  });

  readonly hasMorePhotos = computed(() =>
    !this.showAllPhotos() && this.userPhotos().length > RECENT_PHOTOS_LIMIT
  );

  ngOnInit(): void {
    const currentUser = this.user();
    if (currentUser) {
      this.editName.set(currentUser.name || '');
      this.editEmail.set(currentUser.email || '');

      this.photosLoading.set(true);
      this.photoService.getPhotosByAlbum(currentUser.id).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (photos: Photo[]) => {
          this.userPhotos.set(photos);
          this.photosLoading.set(false);
        },
        error: () => {
          this.photosLoading.set(false);
        }
      });
    }
  }

  saveProfile(): void {
    const name = this.editName().trim();
    const email = this.editEmail().trim();

    if (!name || !email) {
      this.notificationService.show('Name and email are required.', 'warning');
      return;
    }

    this.saving.set(true);
    this.authService.updateProfile({ name, email }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.saving.set(false);
        this.notificationService.show('Profile updated successfully.', 'success');
      },
      error: () => {
        this.saving.set(false);
        this.notificationService.show('Failed to update profile.', 'error');
      }
    });
  }
}
