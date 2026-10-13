package com.cinewood.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "media_items")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MediaItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MediaType type = MediaType.MOVIE; // MOVIE, SERIES

    private Integer releaseYear;

    private String ageRating; // U, UA, A, U/A 7+, U/A 13+, U/A 16+

    private Integer durationMinutes;

    @Column(nullable = false)
    @Builder.Default
    private String language = "English";

    private String thumbnailUrl;    // Movie poster (portrait 2:3)
    private String bannerUrl;       // Widescreen backdrop (landscape 16:9)
    private String videoStreamUrl;  // HLS .m3u8 or MP4 URL

    @Builder.Default
    private Boolean isFeatured = false;

    @Builder.Default
    private Boolean isTrending = false;

    @Builder.Default
    private Integer viewCount = 0;

    private String matchPercentage; // "98% Match" style display

    private String cast; // Comma-separated cast names

    private String director;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "media_genres",
        joinColumns = @JoinColumn(name = "media_id"),
        inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    @Builder.Default
    private Set<Genre> genres = new HashSet<>();

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum MediaType {
        MOVIE, SERIES
    }
}
