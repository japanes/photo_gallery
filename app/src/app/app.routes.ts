import { Routes } from '@angular/router';
import { PhotoGalleryComponent } from './components/photo-gallery/photo-gallery.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';

export const routes: Routes = [
  { path: '', redirectTo: '/gallery', pathMatch: 'full' },
  { path: 'gallery', component: PhotoGalleryComponent },
  { path: 'gallery/:albumId', component: PhotoGalleryComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: '**', redirectTo: '/gallery' }
];
