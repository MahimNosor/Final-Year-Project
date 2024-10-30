import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IStudent } from 'app/entities/student/student.model';
import { StudentService } from 'app/entities/student/service/student.service';
import { IStudentClass } from 'app/entities/student-class/student-class.model';
import { StudentClassService } from 'app/entities/student-class/service/student-class.service';
import { IClassLeaderboard } from '../class-leaderboard.model';
import { ClassLeaderboardService } from '../service/class-leaderboard.service';
import { ClassLeaderboardFormService } from './class-leaderboard-form.service';

import { ClassLeaderboardUpdateComponent } from './class-leaderboard-update.component';

describe('ClassLeaderboard Management Update Component', () => {
  let comp: ClassLeaderboardUpdateComponent;
  let fixture: ComponentFixture<ClassLeaderboardUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let classLeaderboardFormService: ClassLeaderboardFormService;
  let classLeaderboardService: ClassLeaderboardService;
  let studentService: StudentService;
  let studentClassService: StudentClassService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClassLeaderboardUpdateComponent],
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
      .overrideTemplate(ClassLeaderboardUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ClassLeaderboardUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    classLeaderboardFormService = TestBed.inject(ClassLeaderboardFormService);
    classLeaderboardService = TestBed.inject(ClassLeaderboardService);
    studentService = TestBed.inject(StudentService);
    studentClassService = TestBed.inject(StudentClassService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Student query and add missing value', () => {
      const classLeaderboard: IClassLeaderboard = { id: 456 };
      const student: IStudent = { id: 4798 };
      classLeaderboard.student = student;

      const studentCollection: IStudent[] = [{ id: 31457 }];
      jest.spyOn(studentService, 'query').mockReturnValue(of(new HttpResponse({ body: studentCollection })));
      const additionalStudents = [student];
      const expectedCollection: IStudent[] = [...additionalStudents, ...studentCollection];
      jest.spyOn(studentService, 'addStudentToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ classLeaderboard });
      comp.ngOnInit();

      expect(studentService.query).toHaveBeenCalled();
      expect(studentService.addStudentToCollectionIfMissing).toHaveBeenCalledWith(
        studentCollection,
        ...additionalStudents.map(expect.objectContaining),
      );
      expect(comp.studentsSharedCollection).toEqual(expectedCollection);
    });

    it('Should call StudentClass query and add missing value', () => {
      const classLeaderboard: IClassLeaderboard = { id: 456 };
      const studentClass: IStudentClass = { id: 15105 };
      classLeaderboard.studentClass = studentClass;

      const studentClassCollection: IStudentClass[] = [{ id: 21463 }];
      jest.spyOn(studentClassService, 'query').mockReturnValue(of(new HttpResponse({ body: studentClassCollection })));
      const additionalStudentClasses = [studentClass];
      const expectedCollection: IStudentClass[] = [...additionalStudentClasses, ...studentClassCollection];
      jest.spyOn(studentClassService, 'addStudentClassToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ classLeaderboard });
      comp.ngOnInit();

      expect(studentClassService.query).toHaveBeenCalled();
      expect(studentClassService.addStudentClassToCollectionIfMissing).toHaveBeenCalledWith(
        studentClassCollection,
        ...additionalStudentClasses.map(expect.objectContaining),
      );
      expect(comp.studentClassesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const classLeaderboard: IClassLeaderboard = { id: 456 };
      const student: IStudent = { id: 4020 };
      classLeaderboard.student = student;
      const studentClass: IStudentClass = { id: 12268 };
      classLeaderboard.studentClass = studentClass;

      activatedRoute.data = of({ classLeaderboard });
      comp.ngOnInit();

      expect(comp.studentsSharedCollection).toContain(student);
      expect(comp.studentClassesSharedCollection).toContain(studentClass);
      expect(comp.classLeaderboard).toEqual(classLeaderboard);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IClassLeaderboard>>();
      const classLeaderboard = { id: 123 };
      jest.spyOn(classLeaderboardFormService, 'getClassLeaderboard').mockReturnValue(classLeaderboard);
      jest.spyOn(classLeaderboardService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ classLeaderboard });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: classLeaderboard }));
      saveSubject.complete();

      // THEN
      expect(classLeaderboardFormService.getClassLeaderboard).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(classLeaderboardService.update).toHaveBeenCalledWith(expect.objectContaining(classLeaderboard));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IClassLeaderboard>>();
      const classLeaderboard = { id: 123 };
      jest.spyOn(classLeaderboardFormService, 'getClassLeaderboard').mockReturnValue({ id: null });
      jest.spyOn(classLeaderboardService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ classLeaderboard: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: classLeaderboard }));
      saveSubject.complete();

      // THEN
      expect(classLeaderboardFormService.getClassLeaderboard).toHaveBeenCalled();
      expect(classLeaderboardService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IClassLeaderboard>>();
      const classLeaderboard = { id: 123 };
      jest.spyOn(classLeaderboardService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ classLeaderboard });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(classLeaderboardService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareStudent', () => {
      it('Should forward to studentService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(studentService, 'compareStudent');
        comp.compareStudent(entity, entity2);
        expect(studentService.compareStudent).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareStudentClass', () => {
      it('Should forward to studentClassService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(studentClassService, 'compareStudentClass');
        comp.compareStudentClass(entity, entity2);
        expect(studentClassService.compareStudentClass).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
