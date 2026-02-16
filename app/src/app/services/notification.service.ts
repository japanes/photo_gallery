import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  // Private mutable signal
  private _notifications = signal<any[]>([]);

  // Public readonly signal
  readonly notifications = this._notifications.asReadonly();

  // BUG: No auto-dismiss, no max notifications limit, memory leak potential
  show(message: any, type: any, duration?: any) {
    const notification = {
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

  dismiss(id: any) {
    this._notifications.update(current => current.filter(n => n.id !== id));
  }

  clearAll() {
    this._notifications.set([]);
  }
}
