import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IStudent } from 'app/entities/student/student.model';
import { StudentService } from 'app/entities/student/service/student.service';
import { IStudentClass } from 'app/entities/student-class/student-class.model';
import { StudentClassService } from 'app/entities/student-class/service/student-class.service';
import { ClassLeaderboardService } from '../service/class-leaderboard.service';
import { IClassLeaderboard } from '../class-leaderboard.model';
import { ClassLeaderboardFormGroup, ClassLeaderboardFormService } from './class-leaderboard-form.service';

@Component({
  standalone: true,
  selector: 'jhi-class-leaderboard-update',
  templateUrl: './class-leaderboard-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class ClassLeaderboardUpdateComponent implements OnInit {
  isSaving = false;
  classLeaderboard: IClassLeaderboard | null = null;

  studentsSharedCollection: IStudent[] = [];
  studentClassesSharedCollection: IStudentClass[] = [];

  protected classLeaderboardService = inject(ClassLeaderboardService);
  protected classLeaderboardFormService = inject(ClassLeaderboardFormService);
  protected studentService = inject(StudentService);
  protected studentClassService = inject(StudentClassService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ClassLeaderboardFormGroup = this.classLeaderboardFormService.createClassLeaderboardFormGroup();

  compareStudent = (o1: IStudent | null, o2: IStudent | null): boolean => this.studentService.compareStudent(o1, o2);

  compareStudentClass = (o1: IStudentClass | null, o2: IStudentClass | null): boolean =>
    this.studentClassService.compareStudentClass(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ classLeaderboard }) => {
      this.classLeaderboard = classLeaderboard;
      if (classLeaderboard) {
        this.updateForm(classLeaderboard);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const classLeaderboard = this.classLeaderboardFormService.getClassLeaderboard(this.editForm);
    if (classLeaderboard.id !== null) {
      this.subscribeToSaveResponse(this.classLeaderboardService.update(classLeaderboard));
    } else {
      this.subscribeToSaveResponse(this.classLeaderboardService.create(classLeaderboard));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IClassLeaderboard>>): void {
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

  protected updateForm(classLeaderboard: IClassLeaderboard): void {
    this.classLeaderboard = classLeaderboard;
    this.classLeaderboardFormService.resetForm(this.editForm, classLeaderboard);

    this.studentsSharedCollection = this.studentService.addStudentToCollectionIfMissing<IStudent>(
      this.studentsSharedCollection,
      classLeaderboard.student,
    );
    this.studentClassesSharedCollection = this.studentClassService.addStudentClassToCollectionIfMissing<IStudentClass>(
      this.studentClassesSharedCollection,
      classLeaderboard.studentClass,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.studentService
      .query()
      .pipe(map((res: HttpResponse<IStudent[]>) => res.body ?? []))
      .pipe(
        map((students: IStudent[]) =>
          this.studentService.addStudentToCollectionIfMissing<IStudent>(students, this.classLeaderboard?.student),
        ),
      )
      .subscribe((students: IStudent[]) => (this.studentsSharedCollection = students));

    this.studentClassService
      .query()
      .pipe(map((res: HttpResponse<IStudentClass[]>) => res.body ?? []))
      .pipe(
        map((studentClasses: IStudentClass[]) =>
          this.studentClassService.addStudentClassToCollectionIfMissing<IStudentClass>(studentClasses, this.classLeaderboard?.studentClass),
        ),
      )
      .subscribe((studentClasses: IStudentClass[]) => (this.studentClassesSharedCollection = studentClasses));
  }
}
