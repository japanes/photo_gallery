import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Photo, Album } from '../models/photo.model';

// PROBLEM: No error handling, no retry logic, memory leaks
@Injectable({ providedIn: 'root' })
export class PhotoService {
  // BUG: Public mutable state - should be private with signals or proper encapsulation
  public photos: any[] = [];
  public albums: any[] = [];
  public loading = false;
  public error: any = null;

  // PROBLEM: BehaviorSubjects exposed directly - no encapsulation
  public photos$ = new BehaviorSubject<any[]>([]);
  public selectedPhoto$ = new BehaviorSubject<any>(null);
  public uploadProgress$ = new Subject<any>();

  // BUG: Hardcoded API URL, should use environment config
  private apiUrl = 'https://jsonplaceholder.typicode.com';

  constructor(private http: HttpClient) {}

  // BUG: No error handling, returns any, no typing
  getPhotos(albumId?: any) {
    this.loading = true;
    let url = `${this.apiUrl}/photos`;
    if (albumId) {
      url += `?albumId=${albumId}`;
    }

    // BUG: Subscribe inside service without cleanup - memory leak
    this.http.get(url).subscribe((data: any) => {
      this.photos = data.map((item: any) => new Photo(item));
      this.photos$.next(this.photos);
      this.loading = false;
    });
  }

  // BUG: No return type, mutates internal state directly
  getPhotoById(id: any) {
    return this.http.get(`${this.apiUrl}/photos/${id}`).pipe(
      map((data: any) => {
        const photo = new Photo(data);
        this.selectedPhoto$.next(photo);
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
    this.http.delete(`${this.apiUrl}/photos/${id}`).subscribe(() => {
      // BUG: Using == instead of ===
      this.photos = this.photos.filter((p: any) => p.id != id);
      this.photos$.next(this.photos);
    });
  }

  // BUG: No debounce, no minimum query length, hits API on every keystroke
  searchPhotos(query: any) {
    return this.http.get(`${this.apiUrl}/photos?title_like=${query}`);
  }

  // BUG: Likes stored in memory only, race condition possible
  likePhoto(id: any) {
    const photo = this.photos.find((p: any) => p.id == id);
    if (photo) {
      photo.likes++;
      this.photos$.next(this.photos);
    }
  }

  getAlbums(): Observable<any> {
    return this.http.get(`${this.apiUrl}/albums`);
  }

  // BUG: No pagination support
  getPhotosByAlbum(albumId: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/albums/${albumId}/photos`);
  }
}
