import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// PROBLEM: Not provided in root
@Injectable()
export class NotificationService {
  // BUG: Using any[], no notification type/interface
  private notifications: any[] = [];
  public notifications$ = new Subject<any>();

  // BUG: No auto-dismiss, no max notifications limit, memory leak potential
  show(message: any, type: any, duration?: any) {
    const notification = {
      id: Math.random(), // BUG: Using Math.random for IDs
      message: message,
      type: type, // BUG: No validation of type (success/error/warning/info)
      timestamp: new Date()
    };
    this.notifications.push(notification);
    this.notifications$.next(this.notifications);

    // BUG: setTimeout without cleanup on service destroy
    if (duration) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, duration);
    }
  }

  dismiss(id: any) {
    // BUG: Using == instead of ===
    this.notifications = this.notifications.filter(n => n.id != id);
    this.notifications$.next(this.notifications);
  }

  // BUG: Clears array but doesn't notify subscribers
  clearAll() {
    this.notifications = [];
  }
}
