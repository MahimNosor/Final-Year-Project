package com.bham.finalyearproject.domain;

import static com.bham.finalyearproject.domain.ClassLeaderboardTestSamples.*;
import static com.bham.finalyearproject.domain.StudentClassTestSamples.*;
import static com.bham.finalyearproject.domain.StudentTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.bham.finalyearproject.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ClassLeaderboardTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ClassLeaderboard.class);
        ClassLeaderboard classLeaderboard1 = getClassLeaderboardSample1();
        ClassLeaderboard classLeaderboard2 = new ClassLeaderboard();
        assertThat(classLeaderboard1).isNotEqualTo(classLeaderboard2);

        classLeaderboard2.setId(classLeaderboard1.getId());
        assertThat(classLeaderboard1).isEqualTo(classLeaderboard2);

        classLeaderboard2 = getClassLeaderboardSample2();
        assertThat(classLeaderboard1).isNotEqualTo(classLeaderboard2);
    }

    @Test
    void studentTest() {
        ClassLeaderboard classLeaderboard = getClassLeaderboardRandomSampleGenerator();
        Student studentBack = getStudentRandomSampleGenerator();

        classLeaderboard.setStudent(studentBack);
        assertThat(classLeaderboard.getStudent()).isEqualTo(studentBack);

        classLeaderboard.student(null);
        assertThat(classLeaderboard.getStudent()).isNull();
    }

    @Test
    void studentClassTest() {
        ClassLeaderboard classLeaderboard = getClassLeaderboardRandomSampleGenerator();
        StudentClass studentClassBack = getStudentClassRandomSampleGenerator();

        classLeaderboard.setStudentClass(studentClassBack);
        assertThat(classLeaderboard.getStudentClass()).isEqualTo(studentClassBack);

        classLeaderboard.studentClass(null);
        assertThat(classLeaderboard.getStudentClass()).isNull();
    }
}
