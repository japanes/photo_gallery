import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
  pure: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, limit: number = 50, trail: string = '...'): string {
    if (value === null || value === undefined) {
      return '';
    }

    const str = String(value);

    if (str.length <= limit) {
      return str;
    }

    const truncated = str.substring(0, limit);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > limit * 0.3) {
      return truncated.substring(0, lastSpace) + trail;
    }

    return truncated + trail;
  }
}
