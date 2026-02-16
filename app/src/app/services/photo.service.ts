import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Photo, Album, UploadProgress, createPhoto } from '../models/photo.model';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  // Private mutable signals
  private _photos = signal<Photo[]>([]);
  private _selectedPhoto = signal<Photo | null>(null);
  private _uploadProgress = signal<UploadProgress | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _selectedTags = signal<string[]>([]);

  // Public readonly signals
  readonly photos = this._photos.asReadonly();
  readonly selectedPhoto = this._selectedPhoto.asReadonly();
  readonly uploadProgress = this._uploadProgress.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly selectedTags = this._selectedTags.asReadonly();

  // Computed derived state
  readonly totalPhotos = computed(() => this._photos().length);
  readonly totalLikes = computed(() =>
    this._photos().reduce((sum, p) => sum + (p.likes || 0), 0)
  );

  // BUG: Hardcoded API URL, should use environment config
  private apiUrl = 'https://jsonplaceholder.typicode.com';

  // BUG: No error handling, returns any, no typing
  getPhotos(albumId?: number): void {
    this._loading.set(true);
    let url = `${this.apiUrl}/photos`;
    if (albumId) {
      url += `?albumId=${albumId}`;
    }

    this.http.get<Photo[]>(url).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data: Photo[]) => {
        this._photos.set(data.map((item: Photo) => createPhoto(item)));
        this._loading.set(false);
      },
      error: (err: { message: string }) => {
        this._error.set(err.message);
        this._loading.set(false);
      }
    });
  }

  // BUG: No return type, mutates internal state directly
  getPhotoById(id: number): Observable<Photo> {
    return this.http.get<Photo>(`${this.apiUrl}/photos/${id}`).pipe(
      map((data: Photo) => {
        const photo = createPhoto(data);
        this._selectedPhoto.set(photo);
        return photo;
      })
    );
  }

  // BUG: No validation, no progress tracking, fake implementation
  uploadPhoto(file: File, albumId: number, metadata: Record<string, unknown>): Observable<Photo> {
    // BUG: Building FormData incorrectly, no file type validation
    const formData = new FormData();
    formData.append('file', file);
    formData.append('albumId', String(albumId));
    formData.append('metadata', JSON.stringify(metadata)); // BUG: Should be JSON.stringify

    return this.http.post<Photo>(`${this.apiUrl}/photos`, formData);
  }

  // BUG: Mutates array directly instead of creating new reference
  deletePhoto(id: number): void {
    this.http.delete(`${this.apiUrl}/photos/${id}`).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this._photos.update(current => current.filter((p: Photo) => p.id !== id));
      }
    });
  }

  // BUG: No debounce, no minimum query length, hits API on every keystroke
  searchPhotos(query: string): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.apiUrl}/photos?title_like=${query}`);
  }

  // Immutable update via _photos.update() + spread
  likePhoto(id: number): void {
    this._photos.update(current =>
      current.map((p: Photo) =>
        p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p
      )
    );
  }

  toggleTag(tag: string): void {
    this._selectedTags.update(current => {
      const index = current.indexOf(tag);
      if (index > -1) {
        return current.filter(t => t !== tag);
      }
      return [...current, tag];
    });
  }

  getAlbums(): Observable<Album[]> {
    return this.http.get<Album[]>(`${this.apiUrl}/albums`);
  }

  // BUG: No pagination support
  getPhotosByAlbum(albumId: number): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.apiUrl}/albums/${albumId}/photos`);
  }
}
