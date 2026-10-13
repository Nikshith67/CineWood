package com.cinewood.service;

import com.cinewood.dto.AuthDto;
import com.cinewood.entity.Profile;
import com.cinewood.entity.User;
import com.cinewood.repository.UserRepository;
import com.cinewood.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthDto.AuthResponse signup(AuthDto.SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return AuthDto.AuthResponse.builder()
                    .message("Email already registered")
                    .build();
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .subscriptionTier("STANDARD")
                .role("ROLE_USER")
                .build();

        // Create a default profile
        String profileName = request.getProfileName() != null ? request.getProfileName() : "User";
        Profile defaultProfile = Profile.builder()
                .user(user)
                .profileName(profileName)
                .avatarUrl("")
                .isKids(false)
                .build();
        user.getProfiles().add(defaultProfile);

        userRepository.save(user);

        String token = jwtTokenProvider.generateTokenFromEmail(user.getEmail());

        return AuthDto.AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .userId(user.getId())
                .role(user.getRole())
                .subscriptionTier(user.getSubscriptionTier())
                .message("Account created successfully")
                .build();
    }

    public AuthDto.AuthResponse signin(AuthDto.SigninRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = jwtTokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return AuthDto.AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .userId(user.getId())
                .role(user.getRole())
                .subscriptionTier(user.getSubscriptionTier())
                .message("Login successful")
                .build();
    }
}
