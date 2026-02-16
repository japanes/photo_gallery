import { Pipe, PipeTransform } from '@angular/core';

// BUG: Not standalone, declared in SharedModule
// BUG: Not marked as pure (default is pure, but implementation has side effects potential)
@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  // BUG: No null/undefined handling, will throw on null values
  transform(value: string, limit: number = 50, trail: string = '...'): string {
    // BUG: No type checking - will crash if value is not a string
    if (value.length <= limit) {
      return value;
    }
    // BUG: Cuts in the middle of words
    return value.substring(0, limit) + trail;
  }
}
