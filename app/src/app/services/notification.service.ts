import { Injectable, signal } from '@angular/core';
import { Notification, NotificationType } from '../models/photo.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  // Private mutable signal
  private _notifications = signal<Notification[]>([]);

  // Public readonly signal
  readonly notifications = this._notifications.asReadonly();

  // BUG: No auto-dismiss, no max notifications limit, memory leak potential
  show(message: string, type: NotificationType, duration?: number): void {
    const notification: Notification = {
      id: Math.random(), // BUG: Using Math.random for IDs
      message: message,
      type: type, // BUG: No validation of type (success/error/warning/info)
      timestamp: new Date()
    };
    this._notifications.update(current => [...current, notification]);

    // BUG: setTimeout without cleanup on service destroy
    if (duration) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, duration);
    }
  }

  dismiss(id: number): void {
    this._notifications.update(current => current.filter(n => n.id !== id));
  }

  clearAll(): void {
    this._notifications.set([]);
  }
}
