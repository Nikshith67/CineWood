package com.cinewood.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ErrorDto {

    private int status;
    private String message;
    private String timestamp;

    public static ErrorDto of(int status, String message) {
        return ErrorDto.builder()
                .status(status)
                .message(message)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }
}
