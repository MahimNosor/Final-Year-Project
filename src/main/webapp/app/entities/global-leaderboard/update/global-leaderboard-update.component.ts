import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IStudent } from 'app/entities/student/student.model';
import { StudentService } from 'app/entities/student/service/student.service';
import { IGlobalLeaderboard } from '../global-leaderboard.model';
import { GlobalLeaderboardService } from '../service/global-leaderboard.service';
import { GlobalLeaderboardFormGroup, GlobalLeaderboardFormService } from './global-leaderboard-form.service';

@Component({
  standalone: true,
  selector: 'jhi-global-leaderboard-update',
  templateUrl: './global-leaderboard-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class GlobalLeaderboardUpdateComponent implements OnInit {
  isSaving = false;
  globalLeaderboard: IGlobalLeaderboard | null = null;

  studentsSharedCollection: IStudent[] = [];

  protected globalLeaderboardService = inject(GlobalLeaderboardService);
  protected globalLeaderboardFormService = inject(GlobalLeaderboardFormService);
  protected studentService = inject(StudentService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: GlobalLeaderboardFormGroup = this.globalLeaderboardFormService.createGlobalLeaderboardFormGroup();

  compareStudent = (o1: IStudent | null, o2: IStudent | null): boolean => this.studentService.compareStudent(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ globalLeaderboard }) => {
      this.globalLeaderboard = globalLeaderboard;
      if (globalLeaderboard) {
        this.updateForm(globalLeaderboard);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const globalLeaderboard = this.globalLeaderboardFormService.getGlobalLeaderboard(this.editForm);
    if (globalLeaderboard.id !== null) {
      this.subscribeToSaveResponse(this.globalLeaderboardService.update(globalLeaderboard));
    } else {
      this.subscribeToSaveResponse(this.globalLeaderboardService.create(globalLeaderboard));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IGlobalLeaderboard>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(globalLeaderboard: IGlobalLeaderboard): void {
    this.globalLeaderboard = globalLeaderboard;
    this.globalLeaderboardFormService.resetForm(this.editForm, globalLeaderboard);

    this.studentsSharedCollection = this.studentService.addStudentToCollectionIfMissing<IStudent>(
      this.studentsSharedCollection,
      globalLeaderboard.student,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.studentService
      .query()
      .pipe(map((res: HttpResponse<IStudent[]>) => res.body ?? []))
      .pipe(
        map((students: IStudent[]) =>
          this.studentService.addStudentToCollectionIfMissing<IStudent>(students, this.globalLeaderboard?.student),
        ),
      )
      .subscribe((students: IStudent[]) => (this.studentsSharedCollection = students));
  }
}
