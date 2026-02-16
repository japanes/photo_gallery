import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Photo } from '../models/photo.model';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  // Private mutable signals
  private _photos = signal<any[]>([]);
  private _selectedPhoto = signal<any>(null);
  private _uploadProgress = signal<any>(null);
  private _loading = signal(false);
  private _error = signal<any>(null);

  // Public readonly signals
  readonly photos = this._photos.asReadonly();
  readonly selectedPhoto = this._selectedPhoto.asReadonly();
  readonly uploadProgress = this._uploadProgress.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed derived state
  readonly totalPhotos = computed(() => this._photos().length);
  readonly totalLikes = computed(() =>
    this._photos().reduce((sum, p) => sum + (p.likes || 0), 0)
  );

  // BUG: Hardcoded API URL, should use environment config
  private apiUrl = 'https://jsonplaceholder.typicode.com';

  // BUG: No error handling, returns any, no typing
  getPhotos(albumId?: any) {
    this._loading.set(true);
    let url = `${this.apiUrl}/photos`;
    if (albumId) {
      url += `?albumId=${albumId}`;
    }

    this.http.get(url).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data: any) => {
        this._photos.set(data.map((item: any) => new Photo(item)));
        this._loading.set(false);
      },
      error: (err: any) => {
        this._error.set(err);
        this._loading.set(false);
      }
    });
  }

  // BUG: No return type, mutates internal state directly
  getPhotoById(id: any) {
    return this.http.get(`${this.apiUrl}/photos/${id}`).pipe(
      map((data: any) => {
        const photo = new Photo(data);
        this._selectedPhoto.set(photo);
        return photo;
      })
    );
  }

  // BUG: No validation, no progress tracking, fake implementation
  uploadPhoto(file: any, albumId: any, metadata: any): Observable<any> {
    // BUG: Building FormData incorrectly, no file type validation
    const formData = new FormData();
    formData.append('file', file);
    formData.append('albumId', albumId);
    formData.append('metadata', metadata); // BUG: Should be JSON.stringify

    return this.http.post(`${this.apiUrl}/photos`, formData);
  }

  // BUG: Mutates array directly instead of creating new reference
  deletePhoto(id: any) {
    this.http.delete(`${this.apiUrl}/photos/${id}`).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this._photos.update(current => current.filter((p: any) => p.id !== id));
      }
    });
  }

  // BUG: No debounce, no minimum query length, hits API on every keystroke
  searchPhotos(query: any) {
    return this.http.get(`${this.apiUrl}/photos?title_like=${query}`);
  }

  // Immutable update via _photos.update() + spread
  likePhoto(id: any) {
    this._photos.update(current =>
      current.map((p: any) =>
        p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p
      )
    );
  }

  getAlbums(): Observable<any> {
    return this.http.get(`${this.apiUrl}/albums`);
  }

  // BUG: No pagination support
  getPhotosByAlbum(albumId: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/albums/${albumId}/photos`);
  }
}
