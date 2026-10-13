package com.cinewood.controller;

import com.cinewood.entity.User;
import com.cinewood.repository.UserRepository;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class UserResponse {
        private Long id;
        private String email;
        private String role;
        private String subscriptionTier;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class SubscriptionUpdateRequest {
        private String subscriptionTier;
    }

    @GetMapping("/{userId}")
    @Transactional(readOnly = true)
    public ResponseEntity<UserResponse> getUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        return ResponseEntity.ok(UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .subscriptionTier(user.getSubscriptionTier())
                .build());
    }

    @PutMapping("/{userId}/subscription")
    @Transactional
    public ResponseEntity<UserResponse> updateSubscription(
            @PathVariable Long userId,
            @RequestBody SubscriptionUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (request.getSubscriptionTier() != null && !request.getSubscriptionTier().isBlank()) {
            user.setSubscriptionTier(request.getSubscriptionTier().trim());
            userRepository.save(user);
        }

        return ResponseEntity.ok(UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .subscriptionTier(user.getSubscriptionTier())
                .build());
    }
}
