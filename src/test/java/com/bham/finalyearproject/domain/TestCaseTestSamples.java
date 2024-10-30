package com.bham.finalyearproject.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class TestCaseTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static TestCase getTestCaseSample1() {
        return new TestCase().id(1L).input("input1").expectedOutput("expectedOutput1").description("description1");
    }

    public static TestCase getTestCaseSample2() {
        return new TestCase().id(2L).input("input2").expectedOutput("expectedOutput2").description("description2");
    }

    public static TestCase getTestCaseRandomSampleGenerator() {
        return new TestCase()
            .id(longCount.incrementAndGet())
            .input(UUID.randomUUID().toString())
            .expectedOutput(UUID.randomUUID().toString())
            .description(UUID.randomUUID().toString());
    }
}
