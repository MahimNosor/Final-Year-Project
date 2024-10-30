import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ITeacher } from 'app/entities/teacher/teacher.model';
import { TeacherService } from 'app/entities/teacher/service/teacher.service';
import { IStudent } from 'app/entities/student/student.model';
import { StudentService } from 'app/entities/student/service/student.service';
import { StudentClassService } from '../service/student-class.service';
import { IStudentClass } from '../student-class.model';
import { StudentClassFormGroup, StudentClassFormService } from './student-class-form.service';

@Component({
  standalone: true,
  selector: 'jhi-student-class-update',
  templateUrl: './student-class-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class StudentClassUpdateComponent implements OnInit {
  isSaving = false;
  studentClass: IStudentClass | null = null;

  teachersSharedCollection: ITeacher[] = [];
  studentsSharedCollection: IStudent[] = [];

  protected studentClassService = inject(StudentClassService);
  protected studentClassFormService = inject(StudentClassFormService);
  protected teacherService = inject(TeacherService);
  protected studentService = inject(StudentService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: StudentClassFormGroup = this.studentClassFormService.createStudentClassFormGroup();

  compareTeacher = (o1: ITeacher | null, o2: ITeacher | null): boolean => this.teacherService.compareTeacher(o1, o2);

  compareStudent = (o1: IStudent | null, o2: IStudent | null): boolean => this.studentService.compareStudent(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ studentClass }) => {
      this.studentClass = studentClass;
      if (studentClass) {
        this.updateForm(studentClass);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const studentClass = this.studentClassFormService.getStudentClass(this.editForm);
    if (studentClass.id !== null) {
      this.subscribeToSaveResponse(this.studentClassService.update(studentClass));
    } else {
      this.subscribeToSaveResponse(this.studentClassService.create(studentClass));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IStudentClass>>): void {
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

  protected updateForm(studentClass: IStudentClass): void {
    this.studentClass = studentClass;
    this.studentClassFormService.resetForm(this.editForm, studentClass);

    this.teachersSharedCollection = this.teacherService.addTeacherToCollectionIfMissing<ITeacher>(
      this.teachersSharedCollection,
      studentClass.teacher,
    );
    this.studentsSharedCollection = this.studentService.addStudentToCollectionIfMissing<IStudent>(
      this.studentsSharedCollection,
      ...(studentClass.students ?? []),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.teacherService
      .query()
      .pipe(map((res: HttpResponse<ITeacher[]>) => res.body ?? []))
      .pipe(
        map((teachers: ITeacher[]) => this.teacherService.addTeacherToCollectionIfMissing<ITeacher>(teachers, this.studentClass?.teacher)),
      )
      .subscribe((teachers: ITeacher[]) => (this.teachersSharedCollection = teachers));

    this.studentService
      .query()
      .pipe(map((res: HttpResponse<IStudent[]>) => res.body ?? []))
      .pipe(
        map((students: IStudent[]) =>
          this.studentService.addStudentToCollectionIfMissing<IStudent>(students, ...(this.studentClass?.students ?? [])),
        ),
      )
      .subscribe((students: IStudent[]) => (this.studentsSharedCollection = students));
  }
}
