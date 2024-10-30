package com.bham.finalyearproject.domain;

import static com.bham.finalyearproject.domain.StudentClassTestSamples.*;
import static com.bham.finalyearproject.domain.StudentTestSamples.*;
import static com.bham.finalyearproject.domain.TeacherTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.bham.finalyearproject.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class StudentClassTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(StudentClass.class);
        StudentClass studentClass1 = getStudentClassSample1();
        StudentClass studentClass2 = new StudentClass();
        assertThat(studentClass1).isNotEqualTo(studentClass2);

        studentClass2.setId(studentClass1.getId());
        assertThat(studentClass1).isEqualTo(studentClass2);

        studentClass2 = getStudentClassSample2();
        assertThat(studentClass1).isNotEqualTo(studentClass2);
    }

    @Test
    void teacherTest() {
        StudentClass studentClass = getStudentClassRandomSampleGenerator();
        Teacher teacherBack = getTeacherRandomSampleGenerator();

        studentClass.setTeacher(teacherBack);
        assertThat(studentClass.getTeacher()).isEqualTo(teacherBack);

        studentClass.teacher(null);
        assertThat(studentClass.getTeacher()).isNull();
    }

    @Test
    void studentsTest() {
        StudentClass studentClass = getStudentClassRandomSampleGenerator();
        Student studentBack = getStudentRandomSampleGenerator();

        studentClass.addStudents(studentBack);
        assertThat(studentClass.getStudents()).containsOnly(studentBack);

        studentClass.removeStudents(studentBack);
        assertThat(studentClass.getStudents()).doesNotContain(studentBack);

        studentClass.students(new HashSet<>(Set.of(studentBack)));
        assertThat(studentClass.getStudents()).containsOnly(studentBack);

        studentClass.setStudents(new HashSet<>());
        assertThat(studentClass.getStudents()).doesNotContain(studentBack);
    }
}
