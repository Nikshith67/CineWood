package com.cinewood.dto;

import lombok.*;
import java.util.List;

public class MediaDto {

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class MediaResponse {
        private Long id;
        private String title;
        private String description;
        private String type;
        private Integer releaseYear;
        private String ageRating;
        private Integer durationMinutes;
        private String language;
        private String thumbnailUrl;
        private String bannerUrl;
        private String videoStreamUrl;
        private Boolean isFeatured;
        private Boolean isTrending;
        private Integer viewCount;
        private String matchPercentage;
        private String cast;
        private String director;
        private List<String> genres;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class MediaRequest {
        private String title;
        private String description;
        private String type; // MOVIE or SERIES
        private Integer releaseYear;
        private String ageRating;
        private Integer durationMinutes;
        private String language;
        private String thumbnailUrl;
        private String bannerUrl;
        private String videoStreamUrl;
        private Boolean isFeatured;
        private Boolean isTrending;
        private String matchPercentage;
        private String cast;
        private String director;
        private List<String> genreNames;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class BrowseResponse {
        private List<MediaResponse> featured;
        private List<MediaResponse> trending;
        private List<MediaResponse> top10;
        private List<MediaResponse> recentlyAdded;
        private List<CategoryRow> categoryRows;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class CategoryRow {
        private String title;
        private List<MediaResponse> items;
    }
}
