package com.cinewood.repository;

import com.cinewood.entity.MediaItem;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface MediaItemRepository extends JpaRepository<MediaItem, Long> {

    @EntityGraph(attributePaths = "genres")
    List<MediaItem> findByLanguageIgnoreCase(String language);

    @EntityGraph(attributePaths = "genres")
    List<MediaItem> findByIsFeaturedTrue();

    @EntityGraph(attributePaths = "genres")
    List<MediaItem> findByIsTrendingTrueOrderByViewCountDesc();

    @EntityGraph(attributePaths = "genres")
    @Query("SELECT m FROM MediaItem m ORDER BY m.viewCount DESC LIMIT 10")
    List<MediaItem> findTop10();

    @EntityGraph(attributePaths = "genres")
    @Query("SELECT m FROM MediaItem m WHERE LOWER(m.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<MediaItem> searchByTitleOrDescription(@Param("query") String query);

    @EntityGraph(attributePaths = "genres")
    @Query("SELECT m FROM MediaItem m JOIN m.genres g WHERE g.name = :genreName")
    List<MediaItem> findByGenreName(@Param("genreName") String genreName);

    @Query("SELECT m FROM MediaItem m WHERE m.language = :language AND :genreName MEMBER OF m.genres")
    List<MediaItem> findByLanguageAndGenre(@Param("language") String language, @Param("genreName") String genreName);

    @EntityGraph(attributePaths = "genres")
    @Query("SELECT m FROM MediaItem m ORDER BY m.createdAt DESC LIMIT 20")
    List<MediaItem> findRecentlyAdded();

    @EntityGraph(attributePaths = "genres")
    @Override
    Optional<MediaItem> findById(Long id);
}
