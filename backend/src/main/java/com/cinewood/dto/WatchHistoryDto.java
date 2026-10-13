package com.cinewood.dto;

import lombok.*;

public class WatchHistoryDto {

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class WatchProgressRequest {
        private Long profileId;
        private Long mediaId;
        private Integer watchedDurationSeconds;
        private Boolean completed;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class WatchProgressResponse {
        private Long id;
        private Long mediaId;
        private String mediaTitle;
        private String thumbnailUrl;
        private Integer watchedDurationSeconds;
        private Integer totalDurationSeconds;
        private Boolean completed;
        private String lastWatchedAt;
    }
}
