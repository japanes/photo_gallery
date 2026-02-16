import { NgModule } from '@angular/core';
import { SharedModule } from './shared.module';
import { PhotoGalleryComponent } from '../components/photo-gallery/photo-gallery.component';
import { PhotoCardComponent } from '../components/photo-card/photo-card.component';
import { UploadDialogComponent } from '../components/upload-dialog/upload-dialog.component';
import { PhotoService } from '../services/photo.service';
import { NotificationService } from '../services/notification.service';

// PROBLEM: Feature module instead of standalone components
// PROBLEM: Services provided in module instead of root
@NgModule({
  declarations: [
    PhotoGalleryComponent,
    PhotoCardComponent,
    UploadDialogComponent,
  ],
  imports: [
    SharedModule,
  ],
  exports: [
    PhotoGalleryComponent,
  ],
  providers: [
    PhotoService,
    NotificationService,
  ]
})
export class GalleryModule { }
