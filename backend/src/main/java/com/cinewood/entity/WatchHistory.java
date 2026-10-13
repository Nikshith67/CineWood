package com.cinewood.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "watch_history")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class WatchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_id", nullable = false)
    private MediaItem mediaItem;

    @Builder.Default
    private Integer watchedDurationSeconds = 0;

    @Builder.Default
    private Boolean completed = false;

    @Builder.Default
    private LocalDateTime lastWatchedAt = LocalDateTime.now();
}
