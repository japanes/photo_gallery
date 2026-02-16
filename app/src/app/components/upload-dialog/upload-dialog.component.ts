import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PhotoService } from '../../services/photo.service';

// PROBLEM: Not standalone
// PROBLEM: No proper dialog/modal implementation (no backdrop, no escape key, no focus trap)
@Component({
  selector: 'app-upload-dialog',
  template: `
    <!-- BUG: No backdrop click to close, no escape key handler -->
    <!-- BUG: No focus trap for accessibility -->
    <div class="dialog-overlay">
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>Upload Photo</h3>
          <button (click)="close()" class="btn-close">&times;</button>
        </div>

        <form [formGroup]="uploadForm" (ngSubmit)="onSubmit()">
          <!-- BUG: No drag-and-drop support -->
          <!-- BUG: No file type restriction in UI (only in validation) -->
          <div class="form-group">
            <label>Select Photo</label>
            <input
              type="file"
              (change)="onFileSelected($event)"
              accept="image/*">
            <!-- BUG: Error message shown incorrectly -->
            <div class="error" *ngIf="uploadForm.get('file').invalid">
              Please select a file
            </div>
          </div>

          <div class="form-group">
            <label>Title</label>
            <input
              type="text"
              formControlName="title"
              placeholder="Enter photo title">
            <div class="error" *ngIf="uploadForm.get('title').invalid && uploadForm.get('title').touched">
              Title is required (3-100 characters)
            </div>
          </div>

          <div class="form-group">
            <label>Album</label>
            <!-- BUG: Albums not loaded, empty select -->
            <select formControlName="albumId">
              <option value="">Select album</option>
              <option *ngFor="let album of albums" [value]="album.id">
                {{ album.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              formControlName="tags"
              placeholder="nature, landscape, sunset">
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" formControlName="isPublic">
              Make photo public
            </label>
          </div>

          <!-- BUG: No upload progress bar -->
          <div class="dialog-actions">
            <button type="button" (click)="close()">Cancel</button>
            <button
              type="submit"
              [disabled]="uploadForm.invalid || uploading"
              class="btn-submit">
              {{ uploading ? 'Uploading...' : 'Upload' }}
            </button>
          </div>
        </form>

        <!-- BUG: Preview shown even when no file selected -->
        <div class="preview" *ngIf="previewUrl">
          <img [src]="previewUrl" alt="Preview">
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .dialog-content {
      background: white;
      border-radius: 12px;
      padding: 24px;
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .dialog-header h3 {
      margin: 0;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #999;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      margin-bottom: 4px;
      font-size: 14px;
      color: #333;
    }
    .form-group input[type="text"],
    .form-group select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }
    .error {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 4px;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
    .dialog-actions button {
      padding: 8px 20px;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-submit {
      background: #3498db;
      color: white;
      border: none !important;
    }
    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .preview {
      margin-top: 16px;
      text-align: center;
    }
    .preview img {
      max-width: 100%;
      max-height: 200px;
      border-radius: 8px;
    }
  `]
})
export class UploadDialogComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();
  @Output() uploaded = new EventEmitter<any>();

  uploadForm: FormGroup;
  selectedFile: any = null;
  previewUrl: any = null;
  uploading = false;
  albums: any[] = [];

  // PROBLEM: Using constructor injection instead of inject()
  constructor(
    private fb: FormBuilder,
    private photoService: PhotoService
  ) {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      albumId: [''],
      tags: [''],
      isPublic: [true],
      file: [null, Validators.required]
    });
  }

  ngOnInit() {
    // BUG: Albums never loaded because getAlbums() result is not subscribed properly
    this.photoService.getAlbums();
    // Should be: this.photoService.getAlbums().subscribe(albums => this.albums = albums);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    // BUG: No file size validation
    // BUG: No file type validation beyond accept attribute
    if (file) {
      this.selectedFile = file;
      this.uploadForm.patchValue({ file: file });

      // BUG: FileReader not cleaned up, potential memory leak
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.uploadForm.invalid || !this.selectedFile) {
      return;
    }

    this.uploading = true;

    const formValue = this.uploadForm.value;
    // BUG: Tags not properly parsed from comma-separated string
    const metadata = {
      title: formValue.title,
      tags: formValue.tags, // Should be: formValue.tags.split(',').map(t => t.trim())
      isPublic: formValue.isPublic
    };

    // BUG: No error handling, no progress tracking
    this.photoService.uploadPhoto(this.selectedFile, formValue.albumId, metadata)
      .subscribe(
        (result: any) => {
          this.uploading = false;
          this.uploaded.emit(result);
        },
        // BUG: Using deprecated error callback syntax
        (error: any) => {
          this.uploading = false;
          console.error('Upload failed:', error);
          // BUG: No user-visible error notification
        }
      );
  }

  close() {
    // BUG: No cleanup of preview URL (URL.revokeObjectURL not called)
    this.closed.emit();
  }
}
