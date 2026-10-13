package com.cinewood.controller;

import com.cinewood.dto.MediaDto;
import com.cinewood.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @GetMapping("/browse")
    public ResponseEntity<MediaDto.BrowseResponse> browse(
            @RequestParam(required = false, defaultValue = "all") String language) {
        return ResponseEntity.ok(mediaService.getBrowseData(language));
    }

    @GetMapping("/search")
    public ResponseEntity<List<MediaDto.MediaResponse>> search(@RequestParam String query) {
        return ResponseEntity.ok(mediaService.searchMedia(query));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MediaDto.MediaResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(mediaService.getMediaById(id));
    }

    @GetMapping("/language/{language}")
    public ResponseEntity<List<MediaDto.MediaResponse>> getByLanguage(@PathVariable String language) {
        return ResponseEntity.ok(mediaService.getByLanguage(language));
    }
}
