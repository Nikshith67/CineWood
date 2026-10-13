package com.cinewood.service;

import com.cinewood.dto.WatchHistoryDto;
import com.cinewood.entity.MediaItem;
import com.cinewood.entity.Profile;
import com.cinewood.entity.WatchHistory;
import com.cinewood.repository.MediaItemRepository;
import com.cinewood.repository.ProfileRepository;
import com.cinewood.repository.WatchHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WatchHistoryService {

    private final WatchHistoryRepository watchHistoryRepository;
    private final ProfileRepository profileRepository;
    private final MediaItemRepository mediaItemRepository;

    @Transactional(readOnly = true)
    public List<WatchHistoryDto.WatchProgressResponse> getContinueWatching(Long profileId) {
        return watchHistoryRepository.findByProfileIdAndCompletedFalseOrderByLastWatchedAtDesc(profileId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WatchHistoryDto.WatchProgressResponse> getWatchHistory(Long profileId) {
        return watchHistoryRepository.findByProfileIdOrderByLastWatchedAtDesc(profileId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public WatchHistoryDto.WatchProgressResponse updateProgress(WatchHistoryDto.WatchProgressRequest request) {
        Profile profile = profileRepository.findById(request.getProfileId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        MediaItem media = mediaItemRepository.findById(request.getMediaId())
                .orElseThrow(() -> new RuntimeException("Media not found"));

        WatchHistory history = watchHistoryRepository
                .findByProfileIdAndMediaItemId(request.getProfileId(), request.getMediaId())
                .orElse(WatchHistory.builder()
                        .profile(profile)
                        .mediaItem(media)
                        .build());

        history.setWatchedDurationSeconds(request.getWatchedDurationSeconds());
        history.setCompleted(request.getCompleted() != null && request.getCompleted());
        history.setLastWatchedAt(LocalDateTime.now());

        // Increment view count on the media item
        if (history.getId() == null) {
            media.setViewCount(media.getViewCount() + 1);
            mediaItemRepository.save(media);
        }

        WatchHistory saved = watchHistoryRepository.save(history);
        return toResponse(saved);
    }

    private WatchHistoryDto.WatchProgressResponse toResponse(WatchHistory history) {
        return WatchHistoryDto.WatchProgressResponse.builder()
                .id(history.getId())
                .mediaId(history.getMediaItem().getId())
                .mediaTitle(history.getMediaItem().getTitle())
                .thumbnailUrl(history.getMediaItem().getThumbnailUrl())
                .watchedDurationSeconds(history.getWatchedDurationSeconds())
                .totalDurationSeconds(history.getMediaItem().getDurationMinutes() != null
                        ? history.getMediaItem().getDurationMinutes() * 60 : 0)
                .completed(history.getCompleted())
                .lastWatchedAt(history.getLastWatchedAt().toString())
                .build();
    }
}
