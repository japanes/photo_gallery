import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { map, filter, catchError } from 'rxjs/operators';
import { Photo, Album, UploadProgress, createPhoto } from '../models/photo.model';
import { environment } from '@env/environment';

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
  private _searchQuery = signal('');

  // Public readonly signals
  readonly photos = this._photos.asReadonly();
  readonly selectedPhoto = this._selectedPhoto.asReadonly();
  readonly uploadProgress = this._uploadProgress.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly selectedTags = this._selectedTags.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();

  // Computed derived state
  readonly totalPhotos = computed(() => this._photos().length);
  readonly totalLikes = computed(() =>
    this._photos().reduce((sum, p) => sum + (p.likes || 0), 0)
  );

  private readonly apiUrl = environment.apiUrl;

  getPhotos(albumId?: number): void {
    this._loading.set(true);
    this._error.set(null);
    const url = albumId
      ? `${this.apiUrl}/albums/${albumId}/photos`
      : `${this.apiUrl}/photos`;

    this.http.get<Photo[]>(url).pipe(
      map((data: Photo[]) => data.map((item: Photo) => createPhoto(item))),
      catchError((err: { message: string }) => {
        this._error.set(err.message ?? 'Failed to load photos');
        return of([] as Photo[]);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (photos: Photo[]) => {
        this._photos.set(photos);
        this._loading.set(false);
      }
    });
  }

  getPhotoById(id: number): Observable<Photo> {
    return this.http.get<Photo>(`${this.apiUrl}/photos/${id}`).pipe(
      map((data: Photo) => createPhoto(data)),
      catchError((err: { message: string }) => {
        this._error.set(err.message ?? 'Failed to load photo');
        throw err;
      })
    );
  }

  selectPhoto(photo: Photo | null): void {
    this._selectedPhoto.set(photo);
  }

  private static readonly ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  uploadPhoto(file: File, albumId: number, metadata: Record<string, unknown>): Observable<Photo> {
    if (!PhotoService.ALLOWED_FILE_TYPES.includes(file.type)) {
      this._error.set(`Invalid file type: ${file.type}. Allowed: ${PhotoService.ALLOWED_FILE_TYPES.join(', ')}`);
      throw new Error(this._error()!);
    }

    if (file.size > PhotoService.MAX_FILE_SIZE) {
      this._error.set(`File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB. Max: 10 MB`);
      throw new Error(this._error()!);
    }

    this._uploadProgress.set({ percent: 0, loaded: 0, total: file.size });

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('albumId', String(albumId));
    formData.append('metadata', JSON.stringify(metadata));

    return this.http.post<Photo>(`${this.apiUrl}/photos`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          const total = event.total ?? file.size;
          this._uploadProgress.set({
            percent: Math.round((event.loaded / total) * 100),
            loaded: event.loaded,
            total
          });
        }
        if (event.type === HttpEventType.Response) {
          this._uploadProgress.set(null);
          return createPhoto(event.body as Photo);
        }
        return null;
      }),
      filter((photo): photo is Photo => photo !== null),
      catchError((err: { message: string }) => {
        this._uploadProgress.set(null);
        this._error.set(err.message ?? 'Upload failed');
        throw err;
      })
    );
  }

  deletePhoto(id: number): void {
    this.http.delete(`${this.apiUrl}/photos/${id}`).pipe(
      catchError((err: { message: string }) => {
        this._error.set(err.message ?? 'Failed to delete photo');
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (result) => {
        if (result !== null) {
          this._photos.update(current => [...current.filter((p: Photo) => p.id !== id)]);
        }
      }
    });
  }

  private static readonly MIN_SEARCH_LENGTH = 2;

  searchPhotos(query: string): Observable<Photo[]> {
    const trimmed = query.trim();
    if (trimmed.length < PhotoService.MIN_SEARCH_LENGTH) {
      return of([]);
    }

    return this.http.get<Photo[]>(
      `${this.apiUrl}/photos?title_like=${encodeURIComponent(trimmed)}`
    ).pipe(
      map((data: Photo[]) => data.map((item: Photo) => createPhoto(item))),
      catchError((err: { message: string }) => {
        this._error.set(err.message ?? 'Search failed');
        return of([]);
      })
    );
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

  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  getAlbums(): Observable<Album[]> {
    return this.http.get<Album[]>(`${this.apiUrl}/albums`).pipe(
      catchError((err: { message: string }) => {
        this._error.set(err.message ?? 'Failed to load albums');
        return of([]);
      })
    );
  }

  getPhotosByAlbum(albumId: number, page: number = 1, limit: number = 20): Observable<Photo[]> {
    return this.http.get<Photo[]>(
      `${this.apiUrl}/albums/${albumId}/photos?_page=${page}&_limit=${limit}`
    ).pipe(
      map((data: Photo[]) => data.map((item: Photo) => createPhoto(item))),
      catchError((err: { message: string }) => {
        this._error.set(err.message ?? 'Failed to load album photos');
        return of([]);
      })
    );
  }
}
