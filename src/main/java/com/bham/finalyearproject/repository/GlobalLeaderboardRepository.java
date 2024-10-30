package com.bham.finalyearproject.repository;

import com.bham.finalyearproject.domain.GlobalLeaderboard;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the GlobalLeaderboard entity.
 */
@SuppressWarnings("unused")
@Repository
public interface GlobalLeaderboardRepository extends JpaRepository<GlobalLeaderboard, Long> {}
