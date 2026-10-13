package com.cinewood.controller;

import com.cinewood.dto.AdminUserDto;
import com.cinewood.dto.MediaDto;
import com.cinewood.entity.User;
import com.cinewood.repository.UserRepository;
import com.cinewood.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final MediaService mediaService;
    private final UserRepository userRepository;

    // ===== Media CRUD =====

    @GetMapping("/media")
    public ResponseEntity<List<MediaDto.MediaResponse>> getAllMedia() {
        return ResponseEntity.ok(mediaService.getAllMedia());
    }

    @PostMapping("/media")
    public ResponseEntity<MediaDto.MediaResponse> createMedia(@RequestBody MediaDto.MediaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mediaService.createMedia(request));
    }

    @PutMapping("/media/{id}")
    public ResponseEntity<MediaDto.MediaResponse> updateMedia(
            @PathVariable Long id,
            @RequestBody MediaDto.MediaRequest request) {
        return ResponseEntity.ok(mediaService.updateMedia(id, request));
    }

    @DeleteMapping("/media/{id}")
    public ResponseEntity<Void> deleteMedia(@PathVariable Long id) {
        mediaService.deleteMedia(id);
        return ResponseEntity.noContent().build();
    }

    // ===== User Management =====

    @GetMapping("/users")
    @Transactional(readOnly = true)
    public ResponseEntity<List<AdminUserDto>> getAllUsers() {
        List<AdminUserDto> users = userRepository.findAll().stream()
                .map(user -> AdminUserDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .subscriptionTier(user.getSubscriptionTier())
                        .profileCount(user.getProfiles().size())
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}
