import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Notification, NotificationType } from '../models/photo.model';

const MAX_NOTIFICATIONS = 50;
const DEFAULT_AUTO_DISMISS_MS = 5000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly activeTimers = new Set<ReturnType<typeof setTimeout>>();
  private nextId = 0;

  private readonly _notifications = signal<Notification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.activeTimers.forEach(timer => clearTimeout(timer));
      this.activeTimers.clear();
    });
  }

  show(message: string, type: NotificationType, duration: number = DEFAULT_AUTO_DISMISS_MS): void {
    const notification: Notification = {
      id: ++this.nextId,
      message,
      type,
      timestamp: new Date()
    };

    this._notifications.update(current => {
      const updated = [...current, notification];
      if (updated.length > MAX_NOTIFICATIONS) {
        return updated.slice(updated.length - MAX_NOTIFICATIONS);
      }
      return updated;
    });

    const timer = setTimeout(() => {
      this.dismiss(notification.id);
      this.activeTimers.delete(timer);
    }, duration);
    this.activeTimers.add(timer);
  }

  dismiss(id: number): void {
    this._notifications.update(current => current.filter(n => n.id !== id));
  }

  clearAll(): void {
    this.activeTimers.forEach(timer => clearTimeout(timer));
    this.activeTimers.clear();
    this._notifications.set([]);
  }
}
