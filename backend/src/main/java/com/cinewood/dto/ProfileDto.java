package com.cinewood.dto;

import lombok.*;

public class ProfileDto {

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class ProfileResponse {
        private Long id;
        private String profileName;
        private String avatarUrl;
        private Boolean isKids;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class ProfileRequest {
        private String profileName;
        private String avatarUrl;
        private Boolean isKids;
    }
}
