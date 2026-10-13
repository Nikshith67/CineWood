package com.cinewood.service;

import com.cinewood.dto.ProfileDto;
import com.cinewood.entity.Profile;
import com.cinewood.entity.User;
import com.cinewood.repository.ProfileRepository;
import com.cinewood.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    public List<ProfileDto.ProfileResponse> getProfilesByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProfileDto.ProfileResponse createProfile(Long userId, ProfileDto.ProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Profile profile = Profile.builder()
                .user(user)
                .profileName(request.getProfileName())
                .avatarUrl(request.getAvatarUrl() != null ? request.getAvatarUrl() : "")
                .isKids(request.getIsKids() != null && request.getIsKids())
                .build();

        Profile saved = profileRepository.save(profile);
        return toResponse(saved);
    }

    @Transactional
    public void deleteProfile(Long profileId) {
        profileRepository.deleteById(profileId);
    }

    private ProfileDto.ProfileResponse toResponse(Profile profile) {
        return ProfileDto.ProfileResponse.builder()
                .id(profile.getId())
                .profileName(profile.getProfileName())
                .avatarUrl(profile.getAvatarUrl())
                .isKids(profile.getIsKids())
                .build();
    }
}
