package com.cinewood.controller;

import com.cinewood.dto.WatchHistoryDto;
import com.cinewood.service.WatchHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/watch")
@RequiredArgsConstructor
public class WatchHistoryController {

    private final WatchHistoryService watchHistoryService;

    @GetMapping("/continue/{profileId}")
    public ResponseEntity<List<WatchHistoryDto.WatchProgressResponse>> getContinueWatching(
            @PathVariable Long profileId) {
        return ResponseEntity.ok(watchHistoryService.getContinueWatching(profileId));
    }

    @GetMapping("/history/{profileId}")
    public ResponseEntity<List<WatchHistoryDto.WatchProgressResponse>> getHistory(
            @PathVariable Long profileId) {
        return ResponseEntity.ok(watchHistoryService.getWatchHistory(profileId));
    }

    @PostMapping("/progress")
    public ResponseEntity<WatchHistoryDto.WatchProgressResponse> updateProgress(
            @RequestBody WatchHistoryDto.WatchProgressRequest request) {
        return ResponseEntity.ok(watchHistoryService.updateProgress(request));
    }
}
