package com.cinewood.controller;

import com.cinewood.dto.FeedbackDto;
import com.cinewood.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<FeedbackDto.FeedbackResponse> submitFeedback(
            @RequestBody FeedbackDto.FeedbackRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feedbackService.submitFeedback(request));
    }

    @GetMapping("/media/{mediaId}")
    public ResponseEntity<List<FeedbackDto.FeedbackResponse>> getMediaFeedback(@PathVariable Long mediaId) {
        return ResponseEntity.ok(feedbackService.getMediaFeedback(mediaId));
    }
}
