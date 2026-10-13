package com.cinewood.service;

import com.cinewood.dto.FeedbackDto;
import com.cinewood.entity.MediaItem;
import com.cinewood.entity.Profile;
import com.cinewood.entity.Rating;
import com.cinewood.repository.MediaItemRepository;
import com.cinewood.repository.ProfileRepository;
import com.cinewood.repository.RatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final RatingRepository ratingRepository;
    private final ProfileRepository profileRepository;
    private final MediaItemRepository mediaItemRepository;

    @Transactional
    public FeedbackDto.FeedbackResponse submitFeedback(FeedbackDto.FeedbackRequest request) {
        Profile profile = profileRepository.findById(request.getProfileId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        MediaItem media = mediaItemRepository.findById(request.getMediaId())
                .orElseThrow(() -> new RuntimeException("Media not found"));

        // Update existing or create new rating
        Rating rating = ratingRepository
                .findByProfileIdAndMediaItemId(request.getProfileId(), request.getMediaId())
                .orElse(Rating.builder()
                        .profile(profile)
                        .mediaItem(media)
                        .build());

        rating.setRating(request.getRating());
        rating.setReviewTags(request.getReviewTags() != null ? String.join(",", request.getReviewTags()) : "");
        rating.setComment(request.getComment());

        Rating saved = ratingRepository.save(rating);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<FeedbackDto.FeedbackResponse> getMediaFeedback(Long mediaId) {
        return ratingRepository.findByMediaItemId(mediaId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private FeedbackDto.FeedbackResponse toResponse(Rating rating) {
        List<String> tags = rating.getReviewTags() != null && !rating.getReviewTags().isEmpty()
                ? List.of(rating.getReviewTags().split(","))
                : List.of();

        return FeedbackDto.FeedbackResponse.builder()
                .id(rating.getId())
                .mediaId(rating.getMediaItem().getId())
                .rating(rating.getRating())
                .reviewTags(tags)
                .comment(rating.getComment())
                .createdAt(rating.getCreatedAt().toString())
                .build();
    }
}
