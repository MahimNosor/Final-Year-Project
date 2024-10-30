import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ITeacher } from 'app/entities/teacher/teacher.model';
import { TeacherService } from 'app/entities/teacher/service/teacher.service';
import { IStudent } from 'app/entities/student/student.model';
import { StudentService } from 'app/entities/student/service/student.service';
import { IStudentClass } from '../student-class.model';
import { StudentClassService } from '../service/student-class.service';
import { StudentClassFormService } from './student-class-form.service';

import { StudentClassUpdateComponent } from './student-class-update.component';

describe('StudentClass Management Update Component', () => {
  let comp: StudentClassUpdateComponent;
  let fixture: ComponentFixture<StudentClassUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let studentClassFormService: StudentClassFormService;
  let studentClassService: StudentClassService;
  let teacherService: TeacherService;
  let studentService: StudentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StudentClassUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(StudentClassUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(StudentClassUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    studentClassFormService = TestBed.inject(StudentClassFormService);
    studentClassService = TestBed.inject(StudentClassService);
    teacherService = TestBed.inject(TeacherService);
    studentService = TestBed.inject(StudentService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Teacher query and add missing value', () => {
      const studentClass: IStudentClass = { id: 456 };
      const teacher: ITeacher = { id: 16197 };
      studentClass.teacher = teacher;

      const teacherCollection: ITeacher[] = [{ id: 26301 }];
      jest.spyOn(teacherService, 'query').mockReturnValue(of(new HttpResponse({ body: teacherCollection })));
      const additionalTeachers = [teacher];
      const expectedCollection: ITeacher[] = [...additionalTeachers, ...teacherCollection];
      jest.spyOn(teacherService, 'addTeacherToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ studentClass });
      comp.ngOnInit();

      expect(teacherService.query).toHaveBeenCalled();
      expect(teacherService.addTeacherToCollectionIfMissing).toHaveBeenCalledWith(
        teacherCollection,
        ...additionalTeachers.map(expect.objectContaining),
      );
      expect(comp.teachersSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Student query and add missing value', () => {
      const studentClass: IStudentClass = { id: 456 };
      const students: IStudent[] = [{ id: 20860 }];
      studentClass.students = students;

      const studentCollection: IStudent[] = [{ id: 3652 }];
      jest.spyOn(studentService, 'query').mockReturnValue(of(new HttpResponse({ body: studentCollection })));
      const additionalStudents = [...students];
      const expectedCollection: IStudent[] = [...additionalStudents, ...studentCollection];
      jest.spyOn(studentService, 'addStudentToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ studentClass });
      comp.ngOnInit();

      expect(studentService.query).toHaveBeenCalled();
      expect(studentService.addStudentToCollectionIfMissing).toHaveBeenCalledWith(
        studentCollection,
        ...additionalStudents.map(expect.objectContaining),
      );
      expect(comp.studentsSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const studentClass: IStudentClass = { id: 456 };
      const teacher: ITeacher = { id: 631 };
      studentClass.teacher = teacher;
      const students: IStudent = { id: 21873 };
      studentClass.students = [students];

      activatedRoute.data = of({ studentClass });
      comp.ngOnInit();

      expect(comp.teachersSharedCollection).toContain(teacher);
      expect(comp.studentsSharedCollection).toContain(students);
      expect(comp.studentClass).toEqual(studentClass);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IStudentClass>>();
      const studentClass = { id: 123 };
      jest.spyOn(studentClassFormService, 'getStudentClass').mockReturnValue(studentClass);
      jest.spyOn(studentClassService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ studentClass });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: studentClass }));
      saveSubject.complete();

      // THEN
      expect(studentClassFormService.getStudentClass).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(studentClassService.update).toHaveBeenCalledWith(expect.objectContaining(studentClass));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IStudentClass>>();
      const studentClass = { id: 123 };
      jest.spyOn(studentClassFormService, 'getStudentClass').mockReturnValue({ id: null });
      jest.spyOn(studentClassService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ studentClass: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: studentClass }));
      saveSubject.complete();

      // THEN
      expect(studentClassFormService.getStudentClass).toHaveBeenCalled();
      expect(studentClassService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IStudentClass>>();
      const studentClass = { id: 123 };
      jest.spyOn(studentClassService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ studentClass });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(studentClassService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareTeacher', () => {
      it('Should forward to teacherService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(teacherService, 'compareTeacher');
        comp.compareTeacher(entity, entity2);
        expect(teacherService.compareTeacher).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareStudent', () => {
      it('Should forward to studentService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(studentService, 'compareStudent');
        comp.compareStudent(entity, entity2);
        expect(studentService.compareStudent).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
