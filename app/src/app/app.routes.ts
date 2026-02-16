import { Routes } from '@angular/router';
import { PhotoGalleryComponent } from './components/photo-gallery/photo-gallery.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';

export const routes: Routes = [
  { path: '', redirectTo: '/gallery', pathMatch: 'full' },
  { path: 'gallery', component: PhotoGalleryComponent }, // FIX: was HeaderComponent
  { path: 'profile', component: UserProfileComponent },
  { path: '**', redirectTo: '/gallery' }
];
