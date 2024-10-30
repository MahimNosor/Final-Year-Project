import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IStudent } from 'app/entities/student/student.model';
import { StudentService } from 'app/entities/student/service/student.service';
import { GlobalLeaderboardService } from '../service/global-leaderboard.service';
import { IGlobalLeaderboard } from '../global-leaderboard.model';
import { GlobalLeaderboardFormService } from './global-leaderboard-form.service';

import { GlobalLeaderboardUpdateComponent } from './global-leaderboard-update.component';

describe('GlobalLeaderboard Management Update Component', () => {
  let comp: GlobalLeaderboardUpdateComponent;
  let fixture: ComponentFixture<GlobalLeaderboardUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let globalLeaderboardFormService: GlobalLeaderboardFormService;
  let globalLeaderboardService: GlobalLeaderboardService;
  let studentService: StudentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GlobalLeaderboardUpdateComponent],
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
      .overrideTemplate(GlobalLeaderboardUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(GlobalLeaderboardUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    globalLeaderboardFormService = TestBed.inject(GlobalLeaderboardFormService);
    globalLeaderboardService = TestBed.inject(GlobalLeaderboardService);
    studentService = TestBed.inject(StudentService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Student query and add missing value', () => {
      const globalLeaderboard: IGlobalLeaderboard = { id: 456 };
      const student: IStudent = { id: 20848 };
      globalLeaderboard.student = student;

      const studentCollection: IStudent[] = [{ id: 7756 }];
      jest.spyOn(studentService, 'query').mockReturnValue(of(new HttpResponse({ body: studentCollection })));
      const additionalStudents = [student];
      const expectedCollection: IStudent[] = [...additionalStudents, ...studentCollection];
      jest.spyOn(studentService, 'addStudentToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ globalLeaderboard });
      comp.ngOnInit();

      expect(studentService.query).toHaveBeenCalled();
      expect(studentService.addStudentToCollectionIfMissing).toHaveBeenCalledWith(
        studentCollection,
        ...additionalStudents.map(expect.objectContaining),
      );
      expect(comp.studentsSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const globalLeaderboard: IGlobalLeaderboard = { id: 456 };
      const student: IStudent = { id: 4631 };
      globalLeaderboard.student = student;

      activatedRoute.data = of({ globalLeaderboard });
      comp.ngOnInit();

      expect(comp.studentsSharedCollection).toContain(student);
      expect(comp.globalLeaderboard).toEqual(globalLeaderboard);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IGlobalLeaderboard>>();
      const globalLeaderboard = { id: 123 };
      jest.spyOn(globalLeaderboardFormService, 'getGlobalLeaderboard').mockReturnValue(globalLeaderboard);
      jest.spyOn(globalLeaderboardService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ globalLeaderboard });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: globalLeaderboard }));
      saveSubject.complete();

      // THEN
      expect(globalLeaderboardFormService.getGlobalLeaderboard).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(globalLeaderboardService.update).toHaveBeenCalledWith(expect.objectContaining(globalLeaderboard));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IGlobalLeaderboard>>();
      const globalLeaderboard = { id: 123 };
      jest.spyOn(globalLeaderboardFormService, 'getGlobalLeaderboard').mockReturnValue({ id: null });
      jest.spyOn(globalLeaderboardService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ globalLeaderboard: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: globalLeaderboard }));
      saveSubject.complete();

      // THEN
      expect(globalLeaderboardFormService.getGlobalLeaderboard).toHaveBeenCalled();
      expect(globalLeaderboardService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IGlobalLeaderboard>>();
      const globalLeaderboard = { id: 123 };
      jest.spyOn(globalLeaderboardService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ globalLeaderboard });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(globalLeaderboardService.update).toHaveBeenCalled();
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
  });
});
