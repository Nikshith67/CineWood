package com.cinewood.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory rate limiter for authentication endpoints.
 * Limits each IP to a configurable number of requests per time window.
 * Uses ConcurrentHashMap with periodic cleanup to prevent memory leaks.
 */
@Component
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS = 10;
    private static final long WINDOW_MS = 60_000; // 1 minute
    private static final long CLEANUP_INTERVAL_MS = 300_000; // 5 minutes

    private final Map<String, RateLimitEntry> requestCounts = new ConcurrentHashMap<>();
    private volatile long lastCleanup = System.currentTimeMillis();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Only rate-limit authentication endpoints
        String path = request.getRequestURI();
        return !path.startsWith("/api/v1/auth/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        cleanupIfNeeded();

        String clientIp = getClientIp(request);
        RateLimitEntry entry = requestCounts.computeIfAbsent(clientIp, k -> new RateLimitEntry());

        if (entry.isExpired()) {
            entry.reset();
        }

        if (entry.incrementAndGet() > MAX_REQUESTS) {
            log.warn("Rate limit exceeded for IP: {}", clientIp);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"status\":429,\"message\":\"Too many requests. Please try again later.\",\"timestamp\":\"" +
                    java.time.LocalDateTime.now() + "\"}"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // Take only the first IP (actual client) to prevent spoofing
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void cleanupIfNeeded() {
        long now = System.currentTimeMillis();
        if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
            lastCleanup = now;
            requestCounts.entrySet().removeIf(e -> e.getValue().isExpired());
        }
    }

    private static class RateLimitEntry {
        private final AtomicInteger count = new AtomicInteger(0);
        private volatile long windowStart = System.currentTimeMillis();

        boolean isExpired() {
            return System.currentTimeMillis() - windowStart > WINDOW_MS;
        }

        void reset() {
            count.set(0);
            windowStart = System.currentTimeMillis();
        }

        int incrementAndGet() {
            return count.incrementAndGet();
        }
    }
}
