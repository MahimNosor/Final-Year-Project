package com.bham.finalyearproject.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class ClassLeaderboardTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static ClassLeaderboard getClassLeaderboardSample1() {
        return new ClassLeaderboard().id(1L).rank(1).totalPoints(1);
    }

    public static ClassLeaderboard getClassLeaderboardSample2() {
        return new ClassLeaderboard().id(2L).rank(2).totalPoints(2);
    }

    public static ClassLeaderboard getClassLeaderboardRandomSampleGenerator() {
        return new ClassLeaderboard()
            .id(longCount.incrementAndGet())
            .rank(intCount.incrementAndGet())
            .totalPoints(intCount.incrementAndGet());
    }
}
