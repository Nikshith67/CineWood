package com.cinewood.controller;

import com.cinewood.dto.ProfileDto;
import com.cinewood.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProfileDto.ProfileResponse>> getProfiles(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.getProfilesByUserId(userId));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<ProfileDto.ProfileResponse> createProfile(
            @PathVariable Long userId,
            @RequestBody ProfileDto.ProfileRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(profileService.createProfile(userId, request));
    }

    @DeleteMapping("/{profileId}")
    public ResponseEntity<Void> deleteProfile(@PathVariable Long profileId) {
        profileService.deleteProfile(profileId);
        return ResponseEntity.noContent().build();
    }
}
