import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { ITeacher } from '../teacher.model';

@Component({
  standalone: true,
  selector: 'jhi-teacher-detail',
  templateUrl: './teacher-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class TeacherDetailComponent {
  teacher = input<ITeacher | null>(null);

  previousState(): void {
    window.history.back();
  }
}
