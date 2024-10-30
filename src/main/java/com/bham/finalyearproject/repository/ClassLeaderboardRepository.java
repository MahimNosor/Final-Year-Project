package com.bham.finalyearproject.repository;

import com.bham.finalyearproject.domain.ClassLeaderboard;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ClassLeaderboard entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ClassLeaderboardRepository extends JpaRepository<ClassLeaderboard, Long> {}
