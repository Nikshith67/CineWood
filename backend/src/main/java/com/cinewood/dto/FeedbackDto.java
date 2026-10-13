package com.cinewood.dto;

import lombok.*;
import java.util.List;

public class FeedbackDto {

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class FeedbackRequest {
        private Long profileId;
        private Long mediaId;
        private Integer rating; // 1-5
        private List<String> reviewTags;
        private String comment;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class FeedbackResponse {
        private Long id;
        private Long mediaId;
        private Integer rating;
        private List<String> reviewTags;
        private String comment;
        private String createdAt;
    }
}
