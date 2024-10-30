import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { IClassLeaderboard } from '../class-leaderboard.model';

@Component({
  standalone: true,
  selector: 'jhi-class-leaderboard-detail',
  templateUrl: './class-leaderboard-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class ClassLeaderboardDetailComponent {
  classLeaderboard = input<IClassLeaderboard | null>(null);

  previousState(): void {
    window.history.back();
  }
}
