import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IClassLeaderboard } from '../class-leaderboard.model';
import { ClassLeaderboardService } from '../service/class-leaderboard.service';

@Component({
  standalone: true,
  templateUrl: './class-leaderboard-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ClassLeaderboardDeleteDialogComponent {
  classLeaderboard?: IClassLeaderboard;

  protected classLeaderboardService = inject(ClassLeaderboardService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.classLeaderboardService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
