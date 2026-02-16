import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TruncatePipe } from '../pipes/truncate.pipe';
import { FileSizePipe } from '../pipes/file-size.pipe';
import { TimeAgoPipe } from '../pipes/time-ago.pipe';

// PROBLEM: Legacy SharedModule pattern - should use standalone components
// PROBLEM: Re-exports everything, no tree shaking
@NgModule({
  declarations: [
    TruncatePipe,
    FileSizePipe,
    TimeAgoPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TruncatePipe,
    FileSizePipe,
    TimeAgoPipe,
  ]
})
export class SharedModule { }
