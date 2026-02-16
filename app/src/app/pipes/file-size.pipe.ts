import { Pipe, PipeTransform } from '@angular/core';

// BUG: Not standalone
@Pipe({
  name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {
  // BUG: Using 1000 instead of 1024 for binary file sizes
  // BUG: No handling for negative numbers or NaN
  transform(bytes: any, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1000; // BUG: Should be 1024 for binary
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }
}
