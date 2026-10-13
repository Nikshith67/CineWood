package com.cinewood.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AdminUserDto {
    private Long id;
    private String email;
    private String role;
    private String subscriptionTier;
    private int profileCount;
    private LocalDateTime createdAt;
}
