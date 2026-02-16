import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PhotoService } from '../../services/photo.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container" *ngIf="user">
      <div class="profile-header">
        <!-- BUG: No NgOptimizedImage -->
        <img [src]="user.avatarUrl" alt="avatar" class="profile-avatar">
        <div class="profile-info">
          <h2>{{ user.name }}</h2>
          <p>{{ user.email }}</p>
          <!-- BUG: Role displayed using magic string comparison -->
          <span class="role-badge" [class.admin]="user.role === 'admin'">
            {{ user.role }}
          </span>
        </div>
      </div>

      <div class="profile-stats">
        <div class="stat-card">
          <h3>{{ userPhotos.length }}</h3>
          <p>Photos</p>
        </div>
        <div class="stat-card">
          <h3>{{ userAlbums.length }}</h3>
          <p>Albums</p>
        </div>
        <div class="stat-card">
          <!-- BUG: Computed value recalculated on every change detection cycle -->
          <h3>{{ getTotalLikes() }}</h3>
          <p>Total Likes</p>
        </div>
      </div>

      <div class="profile-section">
        <h3>Recent Photos</h3>
        <!-- BUG: No trackBy, no lazy loading, shows ALL photos -->
        <div class="photo-grid">
          <div *ngFor="let photo of userPhotos" class="photo-thumb">
            <img [src]="photo.thumbnailUrl" alt="photo">
          </div>
        </div>
      </div>

      <div class="profile-section">
        <h3>Settings</h3>
        <!-- BUG: Form uses ngModel without FormsModule guarantee -->
        <form>
          <div class="form-group">
            <label>Display Name</label>
            <input type="text" [(ngModel)]="user.name" name="name">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="user.email" name="email">
          </div>
          <!-- BUG: Save doesn't do anything -->
          <button type="button" (click)="saveProfile()">Save Changes</button>
        </form>
      </div>
    </div>

    <!-- BUG: No loading state, no "not found" state -->
    <div *ngIf="!user" class="no-user">
      Please log in to view your profile.
    </div>
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
      border-bottom: 1px solid #e0e0e0;
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
      color: #666;
    }
    .role-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      background: #e9ecef;
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
      background: #f8f9fa;
      border-radius: 12px;
      border: 1px solid #e0e0e0;
    }
    .stat-card h3 {
      font-size: 28px;
      margin: 0;
      color: #2c3e50;
    }
    .stat-card p {
      margin: 4px 0 0;
      color: #666;
      font-size: 14px;
    }
    .profile-section {
      margin-bottom: 30px;
    }
    .profile-section h3 {
      margin: 0 0 16px 0;
      color: #2c3e50;
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
      color: #333;
      font-size: 14px;
    }
    .form-group input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
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
      color: #666;
    }
  `]
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  userPhotos: any[] = [];
  userAlbums: any[] = [];

  constructor(
    private authService: AuthService,
    private photoService: PhotoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // BUG: Uses authService.currentUser directly instead of observable
    this.user = this.authService.currentUser;

    if (this.user) {
      // BUG: No error handling, subscribes without cleanup
      this.photoService.getPhotosByAlbum(this.user.id).subscribe((photos: any) => {
        this.userPhotos = photos;
      });
    }
  }

  // BUG: Called on every change detection - should be a pipe or computed signal
  getTotalLikes(): number {
    return this.userPhotos.reduce((sum: number, p: any) => sum + (p.likes || 0), 0);
  }

  saveProfile() {
    // BUG: Not implemented, just logs
    console.log('Save profile - not implemented');
    // BUG: Mutates user object directly which affects auth service state
    // Should make HTTP call and update on success
  }
}
