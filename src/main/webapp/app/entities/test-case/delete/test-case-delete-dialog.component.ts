import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ITestCase } from '../test-case.model';
import { TestCaseService } from '../service/test-case.service';

@Component({
  standalone: true,
  templateUrl: './test-case-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class TestCaseDeleteDialogComponent {
  testCase?: ITestCase;

  protected testCaseService = inject(TestCaseService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.testCaseService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
