package com.cinewood.controller;
import com.cinewood.entity.PaymentTransaction;
import com.cinewood.entity.User;
import com.cinewood.repository.UserRepository;
import com.cinewood.service.PaymentService;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    public PaymentController(PaymentService paymentService, UserRepository userRepository) {
        this.paymentService = paymentService;
        this.userRepository = userRepository;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class CreateOrderRequest {
        private String planId; // "MONTHLY" or "ANNUAL"
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class VerifyPaymentRequest {
        private String orderId;
        private String paymentId;
        private String signature;
        private String planId;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + authentication.getName()));

        try {
            PaymentService.OrderResponse order = paymentService.createOrder(user, request.getPlanId());
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create payment order"));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody VerifyPaymentRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + authentication.getName()));

        boolean success = paymentService.verifyAndActivateSubscription(
                user,
                request.getOrderId(),
                request.getPaymentId(),
                request.getSignature(),
                request.getPlanId()
        );

        if (success) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Payment verified and subscription activated successfully!",
                    "subscriptionTier", request.getPlanId().toUpperCase(),
                    "email", user.getEmail()
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Payment signature verification failed. Transaction marked as invalid."
            ));
        }
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<PaymentTransaction>> getTransactions(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + authentication.getName()));

        if ("ROLE_ADMIN".equals(user.getRole())) {
            return ResponseEntity.ok(paymentService.getAllTransactions());
        } else {
            return ResponseEntity.ok(paymentService.getUserTransactions(user.getId()));
        }
    }
}
