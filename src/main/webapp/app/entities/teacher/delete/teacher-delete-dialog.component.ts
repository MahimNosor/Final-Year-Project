import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ITeacher } from '../teacher.model';
import { TeacherService } from '../service/teacher.service';

@Component({
  standalone: true,
  templateUrl: './teacher-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class TeacherDeleteDialogComponent {
  teacher?: ITeacher;

  protected teacherService = inject(TeacherService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.teacherService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
