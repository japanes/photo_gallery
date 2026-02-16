import {
  Component, input, output, signal, computed, inject,
  OnInit, AfterViewInit, DestroyRef, ChangeDetectionStrategy,
  HostListener, ElementRef
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PhotoService } from '../../services/photo.service';
import { NotificationService } from '../../services/notification.service';
import { Photo } from '../../models/photo.model';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@Component({
  selector: 'app-upload-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- FIX: Backdrop click closes dialog; escape key handled via @HostListener -->
    <!-- FIX: Focus trap implemented via AfterViewInit + Tab key interception -->
    <div
      class="dialog-overlay"
      (click)="close()"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-dialog-title">
      <div class="dialog-content" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h3 id="upload-dialog-title">Upload Photo</h3>
          <button (click)="close()" class="btn-close" aria-label="Close dialog">&times;</button>
        </div>

        <form [formGroup]="uploadForm" (ngSubmit)="onSubmit()">
          <!-- FIX: Drag-and-drop support added -->
          <!-- FIX: File type restriction shown in UI -->
          <div
            class="form-group drop-zone"
            [class.drag-over]="isDragOver()"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)">
            <label for="upload-file">Select Photo</label>
            <input
              id="upload-file"
              type="file"
              (change)="onFileSelected($event)"
              accept="image/jpeg,image/png,image/gif,image/webp">
            <p class="drop-hint">or drag and drop an image here</p>
            <p class="file-types-hint">Allowed: JPEG, PNG, GIF, WebP (max 10 MB)</p>
            <!-- FIX: Error shown only when touched -->
            @if (uploadForm.get('file')?.invalid && uploadForm.get('file')?.touched) {
              <div class="error">Please select a file</div>
            }
            @if (fileError()) {
              <div class="error">{{ fileError() }}</div>
            }
          </div>

          <div class="form-group">
            <label for="upload-title">Title</label>
            <input
              id="upload-title"
              type="text"
              formControlName="title"
              placeholder="Enter photo title">
            @if (uploadForm.get('title')?.invalid && uploadForm.get('title')?.touched) {
              <div class="error">
                Title is required (3-100 characters)
              </div>
            }
          </div>

          <div class="form-group">
            <label for="upload-album">Album</label>
            <!-- FIX: Albums loaded from API in ngOnInit -->
            <select id="upload-album" formControlName="albumId">
              <option value="">Select album</option>
              @for (album of albums(); track album.id) {
                <option [value]="album.id">
                  {{ album.name }}
                </option>
              }
            </select>
          </div>

          <div class="form-group">
            <label for="upload-tags">Tags (comma separated)</label>
            <input
              id="upload-tags"
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

          <!-- FIX: Upload progress bar -->
          @if (uploading()) {
            <div class="progress-bar-container" role="progressbar"
              [attr.aria-valuenow]="uploadPercent()"
              aria-valuemin="0" aria-valuemax="100">
              <div class="progress-bar" [style.width.%]="uploadPercent()"></div>
              <span class="progress-text">{{ uploadPercent() }}%</span>
            </div>
          }

          <div class="dialog-actions">
            <button type="button" (click)="close()">Cancel</button>
            <button
              type="submit"
              [disabled]="uploadForm.invalid || uploading()"
              class="btn-submit">
              {{ uploading() ? 'Uploading...' : 'Upload' }}
            </button>
          </div>
        </form>

        <!-- FIX: Preview only shown when file is selected (previewUrl set after validation) -->
        @if (previewUrl()) {
          <div class="preview">
            <img [src]="previewUrl()" alt="Preview of selected photo">
          </div>
        }
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
      background: var(--bg-primary);
      color: var(--text-primary);
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
      color: var(--text-tertiary);
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      margin-bottom: 4px;
      font-size: 14px;
      color: var(--text-primary);
    }
    .form-group input[type="text"],
    .form-group select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--border-light);
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
      background: var(--bg-input);
      color: var(--text-primary);
    }
    .error {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 4px;
    }
    .drop-zone {
      border: 2px dashed var(--border-light);
      border-radius: 8px;
      padding: 16px;
      transition: border-color 0.2s, background-color 0.2s;
    }
    .drop-zone.drag-over {
      border-color: #3498db;
      background-color: rgba(52, 152, 219, 0.05);
    }
    .drop-hint {
      font-size: 13px;
      color: var(--text-tertiary);
      margin: 4px 0 0;
    }
    .file-types-hint {
      font-size: 12px;
      color: var(--text-tertiary);
      margin: 2px 0 0;
    }
    .progress-bar-container {
      position: relative;
      height: 24px;
      background: var(--border-light);
      border-radius: 4px;
      margin-bottom: 16px;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      background: #3498db;
      transition: width 0.2s;
    }
    .progress-text {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
    .dialog-actions button {
      padding: 8px 20px;
      border: 1px solid var(--border-light);
      border-radius: 4px;
      cursor: pointer;
      background: var(--bg-primary);
      color: var(--text-primary);
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
export class UploadDialogComponent implements OnInit, AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly photoService = inject(PhotoService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  /** When set, pre-selects this album in the dropdown */
  preselectedAlbumId = input<number | undefined>(undefined);

  closed = output<void>();
  uploaded = output<Photo>();

  uploadForm: FormGroup;
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  uploading = signal(false);
  readonly albums = this.photoService.albums;
  isDragOver = signal(false);
  fileError = signal<string | null>(null);

  /** Upload progress percentage derived from PhotoService signal */
  uploadPercent = computed(() => this.photoService.uploadProgress()?.percent ?? 0);

  private focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  private previouslyFocusedElement: Element | null = null;

  constructor() {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      albumId: [''],
      tags: [''],
      isPublic: [true],
      file: [null, Validators.required]
    });

    this.destroyRef.onDestroy(() => this.cleanup());
  }

  ngOnInit(): void {
    // Ensure albums are loaded (no-op if already loaded by sidebar)
    this.photoService.loadAlbums();

    // Pre-select the current album if provided and it exists in the list
    const preselected = this.preselectedAlbumId();
    if (preselected !== undefined && this.albums().some(a => a.id === preselected)) {
      this.uploadForm.patchValue({ albumId: String(preselected) });
    }
  }

  ngAfterViewInit(): void {
    // Save previously focused element to restore on close
    this.previouslyFocusedElement = document.activeElement;
    // Focus the first focusable element inside the dialog
    const el = this.elementRef.nativeElement as HTMLElement;
    const first = el.querySelector<HTMLElement>(this.focusableSelector);
    first?.focus();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
      return;
    }
    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  /** Keep Tab cycling within the dialog */
  private trapFocus(event: KeyboardEvent): void {
    const el = this.elementRef.nativeElement as HTMLElement;
    const focusable = Array.from(el.querySelectorAll<HTMLElement>(this.focusableSelector));
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // --- Drag-and-drop handlers ---

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const file = event.dataTransfer?.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.processFile(file);
    }
  }

  /** Validate file type and size, then set preview via blob URL */
  private processFile(file: File): void {
    this.fileError.set(null);

    // FIX: File type validation
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      this.fileError.set('Invalid file type. Allowed: JPEG, PNG, GIF, WebP');
      return;
    }

    // FIX: File size validation
    if (file.size > MAX_FILE_SIZE) {
      this.fileError.set(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max: 10 MB`);
      return;
    }

    // FIX: Revoke previous blob URL before creating a new one
    this.revokePreviewUrl();

    this.selectedFile.set(file);
    this.uploadForm.patchValue({ file });
    this.uploadForm.get('file')?.markAsTouched();

    // FIX: Use URL.createObjectURL instead of FileReader — no async leak, and we revoke on cleanup
    this.previewUrl.set(URL.createObjectURL(file));
  }

  onSubmit(): void {
    if (this.uploadForm.invalid || !this.selectedFile()) {
      return;
    }

    this.uploading.set(true);

    const formValue = this.uploadForm.value;

    // FIX: Tags properly parsed from comma-separated string
    const tags: string[] = formValue.tags
      ? (formValue.tags as string).split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
      : [];

    const metadata = {
      title: formValue.title as string,
      tags,
      isPublic: formValue.isPublic as boolean
    };

    // FIX: Error handling + user-visible notification via NotificationService
    this.photoService.uploadPhoto(this.selectedFile()!, formValue.albumId, metadata)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result: Photo) => {
          this.uploading.set(false);
          this.notificationService.show('Photo uploaded successfully', 'success');
          this.uploaded.emit(result);
        },
        error: (error: HttpErrorResponse) => {
          this.uploading.set(false);
          this.notificationService.show(
            error.message || 'Upload failed. Please try again.',
            'error'
          );
        }
      });
  }

  close(): void {
    this.cleanup();
    this.closed.emit();
  }

  /** Revoke the current blob preview URL if one exists */
  private revokePreviewUrl(): void {
    const url = this.previewUrl();
    if (url) {
      URL.revokeObjectURL(url);
      this.previewUrl.set(null);
    }
  }

  /** Clean up blob URL and restore focus to previously focused element */
  private cleanup(): void {
    this.revokePreviewUrl();
    (this.previouslyFocusedElement as HTMLElement | null)?.focus();
  }
}
