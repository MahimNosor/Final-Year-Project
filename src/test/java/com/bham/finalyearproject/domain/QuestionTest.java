package com.bham.finalyearproject.domain;

import static com.bham.finalyearproject.domain.QuestionTestSamples.*;
import static com.bham.finalyearproject.domain.StudentClassTestSamples.*;
import static com.bham.finalyearproject.domain.StudentTestSamples.*;
import static com.bham.finalyearproject.domain.TeacherTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.bham.finalyearproject.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class QuestionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Question.class);
        Question question1 = getQuestionSample1();
        Question question2 = new Question();
        assertThat(question1).isNotEqualTo(question2);

        question2.setId(question1.getId());
        assertThat(question1).isEqualTo(question2);

        question2 = getQuestionSample2();
        assertThat(question1).isNotEqualTo(question2);
    }

    @Test
    void teacherTest() {
        Question question = getQuestionRandomSampleGenerator();
        Teacher teacherBack = getTeacherRandomSampleGenerator();

        question.setTeacher(teacherBack);
        assertThat(question.getTeacher()).isEqualTo(teacherBack);

        question.teacher(null);
        assertThat(question.getTeacher()).isNull();
    }

    @Test
    void studentClassTest() {
        Question question = getQuestionRandomSampleGenerator();
        StudentClass studentClassBack = getStudentClassRandomSampleGenerator();

        question.setStudentClass(studentClassBack);
        assertThat(question.getStudentClass()).isEqualTo(studentClassBack);

        question.studentClass(null);
        assertThat(question.getStudentClass()).isNull();
    }

    @Test
    void studentsTest() {
        Question question = getQuestionRandomSampleGenerator();
        Student studentBack = getStudentRandomSampleGenerator();

        question.addStudents(studentBack);
        assertThat(question.getStudents()).containsOnly(studentBack);
        assertThat(studentBack.getQuestions()).containsOnly(question);

        question.removeStudents(studentBack);
        assertThat(question.getStudents()).doesNotContain(studentBack);
        assertThat(studentBack.getQuestions()).doesNotContain(question);

        question.students(new HashSet<>(Set.of(studentBack)));
        assertThat(question.getStudents()).containsOnly(studentBack);
        assertThat(studentBack.getQuestions()).containsOnly(question);

        question.setStudents(new HashSet<>());
        assertThat(question.getStudents()).doesNotContain(studentBack);
        assertThat(studentBack.getQuestions()).doesNotContain(question);
    }
}
