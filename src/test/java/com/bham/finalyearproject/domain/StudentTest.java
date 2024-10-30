package com.bham.finalyearproject.domain;

import static com.bham.finalyearproject.domain.QuestionTestSamples.*;
import static com.bham.finalyearproject.domain.StudentClassTestSamples.*;
import static com.bham.finalyearproject.domain.StudentTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.bham.finalyearproject.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class StudentTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Student.class);
        Student student1 = getStudentSample1();
        Student student2 = new Student();
        assertThat(student1).isNotEqualTo(student2);

        student2.setId(student1.getId());
        assertThat(student1).isEqualTo(student2);

        student2 = getStudentSample2();
        assertThat(student1).isNotEqualTo(student2);
    }

    @Test
    void questionsTest() {
        Student student = getStudentRandomSampleGenerator();
        Question questionBack = getQuestionRandomSampleGenerator();

        student.addQuestions(questionBack);
        assertThat(student.getQuestions()).containsOnly(questionBack);

        student.removeQuestions(questionBack);
        assertThat(student.getQuestions()).doesNotContain(questionBack);

        student.questions(new HashSet<>(Set.of(questionBack)));
        assertThat(student.getQuestions()).containsOnly(questionBack);

        student.setQuestions(new HashSet<>());
        assertThat(student.getQuestions()).doesNotContain(questionBack);
    }

    @Test
    void classesTest() {
        Student student = getStudentRandomSampleGenerator();
        StudentClass studentClassBack = getStudentClassRandomSampleGenerator();

        student.addClasses(studentClassBack);
        assertThat(student.getClasses()).containsOnly(studentClassBack);
        assertThat(studentClassBack.getStudents()).containsOnly(student);

        student.removeClasses(studentClassBack);
        assertThat(student.getClasses()).doesNotContain(studentClassBack);
        assertThat(studentClassBack.getStudents()).doesNotContain(student);

        student.classes(new HashSet<>(Set.of(studentClassBack)));
        assertThat(student.getClasses()).containsOnly(studentClassBack);
        assertThat(studentClassBack.getStudents()).containsOnly(student);

        student.setClasses(new HashSet<>());
        assertThat(student.getClasses()).doesNotContain(studentClassBack);
        assertThat(studentClassBack.getStudents()).doesNotContain(student);
    }
}
