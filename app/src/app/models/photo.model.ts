// BUG: Using class instead of interface, no immutability, weak typing
// PROBLEM: 'any' types, no readonly properties, mutable state

export class Photo {
  id: any;
  title: any;
  url: string;
  thumbnailUrl: string;
  albumId: any;
  uploadedAt: any;
  tags: any;
  metadata: any;
  isPublic: any;
  likes: number;
  ownerId: any;

  constructor(data: any) {
    this.id = data.id;
    this.title = data.title;
    this.url = data.url;
    this.thumbnailUrl = data.thumbnailUrl;
    this.albumId = data.albumId;
    this.uploadedAt = data.uploadedAt;
    this.tags = data.tags || [];
    this.metadata = data.metadata || {};
    this.isPublic = data.isPublic;
    this.likes = data.likes || 0;
    this.ownerId = data.ownerId;
  }
}

export class Album {
  id: any;
  name: any;
  description: any;
  photos: any[];
  createdAt: any;
  ownerId: any;
  coverPhotoUrl: any;
  isPublic: any;

  constructor(data: any) {
    Object.assign(this, data);
  }
}

export class User {
  id: any;
  name: any;
  email: any;
  avatarUrl: any;
  albums: any;
  role: any;

  constructor(data: any) {
    Object.assign(this, data);
  }
}

// BUG: No enum for roles, using magic strings throughout the app
// BUG: No type for photo metadata
// BUG: No type for upload progress/state
