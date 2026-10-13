package com.cinewood.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions", indexes = {
    @Index(name = "idx_payment_order_id", columnList = "orderId"),
    @Index(name = "idx_payment_user_id", columnList = "userId"),
    @Index(name = "idx_payment_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String userEmail;

    @Column(nullable = false, unique = true)
    private String orderId;

    private String paymentId;

    private String signature;

    @Column(nullable = false)
    private Double amount; // In INR (e.g. 199.00, 1299.00)

    @Column(nullable = false)
    private String currency; // "INR"

    @Column(nullable = false)
    private String planId; // "MONTHLY", "ANNUAL"

    @Column(nullable = false)
    private String status; // "CREATED", "SUCCESS", "FAILED"

    private String failureReason;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime completedAt;
}
