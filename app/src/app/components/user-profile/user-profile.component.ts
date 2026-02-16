import { Component, OnInit, signal, computed, inject, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { PhotoService } from '../../services/photo.service';
import { Photo, Album } from '../../models/photo.model';
import { environment } from '@env/environment';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (user()) {
      <div class="profile-container">
        <div class="profile-header">
          <!-- BUG: No NgOptimizedImage -->
          <img [src]="user()!.avatarUrl" alt="avatar" class="profile-avatar">
          <div class="profile-info">
            <h2>{{ user()!.name }}</h2>
            <p>{{ user()!.email }}</p>
            <!-- BUG: Role displayed using magic string comparison -->
            <span class="role-badge" [class.admin]="user()!.role === 'admin'">
              {{ user()!.role }}
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
          <!-- BUG: No lazy loading, shows ALL photos -->
          <div class="photo-grid">
            @for (photo of userPhotos(); track photo.id) {
              <div class="photo-thumb">
                <img [src]="photo.thumbnailUrl" alt="photo">
              </div>
            }
          </div>
        </div>

        <div class="profile-section">
          <h3>Settings</h3>
          <form>
            <div class="form-group">
              <label>Display Name</label>
              <input type="text" [ngModel]="editName()" (ngModelChange)="editName.set($event)" name="name">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [ngModel]="editEmail()" (ngModelChange)="editEmail.set($event)" name="email">
            </div>
            <!-- BUG: Save doesn't do anything -->
            <button type="button" (click)="saveProfile()">Save Changes</button>
          </form>
        </div>
      </div>
    }

    <!-- BUG: No loading state, no "not found" state -->
    @if (!user()) {
      <div class="no-user">
        Please log in to view your profile.
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
    .role-badge.admin {
      background: #3498db;
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
    .no-user {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-secondary);
    }
  `]
})
export class UserProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private photoService = inject(PhotoService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  // Read user from auth service signal
  readonly user = this.authService.currentUser;

  userPhotos = signal<Photo[]>([]);
  userAlbums = signal<Album[]>([]);

  // Editable form signals (not bound directly to auth state)
  editName = signal('');
  editEmail = signal('');

  // Computed total likes — no longer recalculated every change detection cycle
  totalLikes = computed(() =>
    this.userPhotos().reduce((sum: number, p: Photo) => sum + (p.likes || 0), 0)
  );

  ngOnInit() {
    const currentUser = this.user();
    if (currentUser) {
      this.editName.set(currentUser.name || '');
      this.editEmail.set(currentUser.email || '');

      this.photoService.getPhotosByAlbum(currentUser.id).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (photos: Photo[]) => {
          this.userPhotos.set(photos);
        }
      });
    }
  }

  saveProfile() {
    // BUG: Not implemented
    if (environment.debug) { console.log('Save profile - not implemented'); }
    // BUG: Should make HTTP call and update on success
  }
}
