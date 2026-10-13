package com.cinewood.repository;

import com.cinewood.entity.WatchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface WatchHistoryRepository extends JpaRepository<WatchHistory, Long> {
    @Query("SELECT w FROM WatchHistory w JOIN FETCH w.mediaItem WHERE w.profile.id = :profileId ORDER BY w.lastWatchedAt DESC")
    List<WatchHistory> findByProfileIdOrderByLastWatchedAtDesc(@Param("profileId") Long profileId);

    Optional<WatchHistory> findByProfileIdAndMediaItemId(Long profileId, Long mediaItemId);

    @Query("SELECT w FROM WatchHistory w JOIN FETCH w.mediaItem WHERE w.profile.id = :profileId AND w.completed = false ORDER BY w.lastWatchedAt DESC")
    List<WatchHistory> findByProfileIdAndCompletedFalseOrderByLastWatchedAtDesc(@Param("profileId") Long profileId);
}
