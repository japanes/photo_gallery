import { Pipe, PipeTransform } from '@angular/core';

// BUG: Not standalone
// BUG: Impure pipe for time - will recalculate on every change detection
@Pipe({
  name: 'timeAgo',
  pure: false // BUG: Impure pipe causes performance issues
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: any): string {
    if (!value) return '';

    // BUG: No timezone handling
    const now = new Date();
    const date = new Date(value);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 2592000) return Math.floor(seconds / 86400) + ' days ago';
    // BUG: No handling for months/years, falls through to undefined
    if (seconds < 31536000) return Math.floor(seconds / 2592000) + ' months ago';

    // BUG: Returns nothing for dates older than a year (implicit undefined)
  }
}
