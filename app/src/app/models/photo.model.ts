export interface PhotoMetadata {
  readonly width?: number;
  readonly height?: number;
  readonly format?: string;
  readonly size?: number;
}

export interface Photo {
  readonly id: number;
  readonly title: string;
  readonly url: string;
  readonly thumbnailUrl: string;
  readonly albumId: number;
  readonly uploadedAt: Date;
  readonly tags: string[];
  readonly metadata: PhotoMetadata;
  readonly isPublic: boolean;
  readonly likes: number;
  readonly ownerId: number;
}

export interface Album {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly photos: Photo[];
  readonly createdAt: Date;
  readonly ownerId: number;
  readonly coverPhotoUrl: string;
  readonly isPublic: boolean;
}

export type UserRole = 'admin' | 'user' | 'moderator';

export interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly avatarUrl: string;
  readonly albums: Album[];
  readonly role: UserRole;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  readonly id: number;
  readonly message: string;
  readonly type: NotificationType;
  readonly timestamp: Date;
}

export interface UploadProgress {
  readonly percent: number;
  readonly loaded: number;
  readonly total: number;
}

export function createPhoto(data: Partial<Photo> & Pick<Photo, 'id' | 'title' | 'url' | 'thumbnailUrl'>): Photo {
  return {
    id: data.id,
    title: data.title,
    url: data.url,
    thumbnailUrl: data.thumbnailUrl,
    albumId: data.albumId ?? 0,
    uploadedAt: data.uploadedAt ?? new Date(),
    tags: data.tags ?? [],
    metadata: data.metadata ?? {},
    isPublic: data.isPublic ?? false,
    likes: data.likes ?? 0,
    ownerId: data.ownerId ?? 0,
  };
}
