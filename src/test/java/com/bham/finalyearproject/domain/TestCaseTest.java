package com.bham.finalyearproject.domain;

import static com.bham.finalyearproject.domain.QuestionTestSamples.*;
import static com.bham.finalyearproject.domain.TestCaseTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.bham.finalyearproject.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class TestCaseTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(TestCase.class);
        TestCase testCase1 = getTestCaseSample1();
        TestCase testCase2 = new TestCase();
        assertThat(testCase1).isNotEqualTo(testCase2);

        testCase2.setId(testCase1.getId());
        assertThat(testCase1).isEqualTo(testCase2);

        testCase2 = getTestCaseSample2();
        assertThat(testCase1).isNotEqualTo(testCase2);
    }

    @Test
    void questionTest() {
        TestCase testCase = getTestCaseRandomSampleGenerator();
        Question questionBack = getQuestionRandomSampleGenerator();

        testCase.setQuestion(questionBack);
        assertThat(testCase.getQuestion()).isEqualTo(questionBack);

        testCase.question(null);
        assertThat(testCase.getQuestion()).isNull();
    }
}
