import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IGlobalLeaderboard } from '../global-leaderboard.model';
import { GlobalLeaderboardService } from '../service/global-leaderboard.service';

@Component({
  standalone: true,
  templateUrl: './global-leaderboard-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class GlobalLeaderboardDeleteDialogComponent {
  globalLeaderboard?: IGlobalLeaderboard;

  protected globalLeaderboardService = inject(GlobalLeaderboardService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.globalLeaderboardService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
