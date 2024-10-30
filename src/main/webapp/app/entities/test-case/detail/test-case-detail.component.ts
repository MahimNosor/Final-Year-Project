import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { ITestCase } from '../test-case.model';

@Component({
  standalone: true,
  selector: 'jhi-test-case-detail',
  templateUrl: './test-case-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class TestCaseDetailComponent {
  testCase = input<ITestCase | null>(null);

  previousState(): void {
    window.history.back();
  }
}
