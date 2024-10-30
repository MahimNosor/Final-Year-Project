package com.bham.finalyearproject.domain;

import static com.bham.finalyearproject.domain.GlobalLeaderboardTestSamples.*;
import static com.bham.finalyearproject.domain.StudentTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.bham.finalyearproject.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class GlobalLeaderboardTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(GlobalLeaderboard.class);
        GlobalLeaderboard globalLeaderboard1 = getGlobalLeaderboardSample1();
        GlobalLeaderboard globalLeaderboard2 = new GlobalLeaderboard();
        assertThat(globalLeaderboard1).isNotEqualTo(globalLeaderboard2);

        globalLeaderboard2.setId(globalLeaderboard1.getId());
        assertThat(globalLeaderboard1).isEqualTo(globalLeaderboard2);

        globalLeaderboard2 = getGlobalLeaderboardSample2();
        assertThat(globalLeaderboard1).isNotEqualTo(globalLeaderboard2);
    }

    @Test
    void studentTest() {
        GlobalLeaderboard globalLeaderboard = getGlobalLeaderboardRandomSampleGenerator();
        Student studentBack = getStudentRandomSampleGenerator();

        globalLeaderboard.setStudent(studentBack);
        assertThat(globalLeaderboard.getStudent()).isEqualTo(studentBack);

        globalLeaderboard.student(null);
        assertThat(globalLeaderboard.getStudent()).isNull();
    }
}
