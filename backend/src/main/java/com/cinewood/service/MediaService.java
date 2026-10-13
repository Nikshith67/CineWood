package com.cinewood.service;

import com.cinewood.dto.MediaDto;
import com.cinewood.entity.Genre;
import com.cinewood.entity.MediaItem;
import com.cinewood.repository.GenreRepository;
import com.cinewood.repository.MediaItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MediaService {

    private final MediaItemRepository mediaItemRepository;
    private final GenreRepository genreRepository;

    @Cacheable(value = "browseData", key = "#language")
    @Transactional(readOnly = true)
    public MediaDto.BrowseResponse getBrowseData(String language) {
        List<MediaItem> featured = mediaItemRepository.findByIsFeaturedTrue();
        List<MediaItem> trending = mediaItemRepository.findByIsTrendingTrueOrderByViewCountDesc();
        List<MediaItem> top10 = mediaItemRepository.findTop10();
        List<MediaItem> recentlyAdded = mediaItemRepository.findRecentlyAdded();

        // Build genre-based category rows
        List<MediaDto.CategoryRow> categoryRows = new ArrayList<>();
        List<Genre> genres = genreRepository.findAll();

        for (Genre genre : genres) {
            List<MediaItem> genreItems;
            if (language != null && !language.equalsIgnoreCase("all")) {
                genreItems = mediaItemRepository.findByLanguageIgnoreCase(language).stream()
                        .filter(m -> m.getGenres().contains(genre))
                        .collect(Collectors.toList());
            } else {
                genreItems = mediaItemRepository.findByGenreName(genre.getName());
            }
            if (!genreItems.isEmpty()) {
                categoryRows.add(MediaDto.CategoryRow.builder()
                        .title(genre.getName() + " Movies")
                        .items(genreItems.stream().map(this::toResponse).collect(Collectors.toList()))
                        .build());
            }
        }

        // If language filter is active, also filter featured/trending/top10
        if (language != null && !language.equalsIgnoreCase("all")) {
            featured = featured.stream()
                    .filter(m -> m.getLanguage().equalsIgnoreCase(language))
                    .collect(Collectors.toList());
            trending = trending.stream()
                    .filter(m -> m.getLanguage().equalsIgnoreCase(language))
                    .collect(Collectors.toList());
        }

        return MediaDto.BrowseResponse.builder()
                .featured(featured.stream().map(this::toResponse).collect(Collectors.toList()))
                .trending(trending.stream().map(this::toResponse).collect(Collectors.toList()))
                .top10(top10.stream().map(this::toResponse).collect(Collectors.toList()))
                .recentlyAdded(recentlyAdded.stream().map(this::toResponse).collect(Collectors.toList()))
                .categoryRows(categoryRows)
                .build();
    }

    @Cacheable(value = "searchResults", key = "#query")
    @Transactional(readOnly = true)
    public List<MediaDto.MediaResponse> searchMedia(String query) {
        return mediaItemRepository.searchByTitleOrDescription(query)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MediaDto.MediaResponse getMediaById(Long id) {
        MediaItem item = mediaItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Media not found with id: " + id));
        return toResponse(item);
    }

    @Transactional(readOnly = true)
    public List<MediaDto.MediaResponse> getByLanguage(String language) {
        return mediaItemRepository.findByLanguageIgnoreCase(language)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @CacheEvict(value = {"browseData", "searchResults"}, allEntries = true)
    @Transactional
    public MediaDto.MediaResponse createMedia(MediaDto.MediaRequest request) {
        MediaItem item = MediaItem.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(MediaItem.MediaType.valueOf(request.getType()))
                .releaseYear(request.getReleaseYear())
                .ageRating(request.getAgeRating())
                .durationMinutes(request.getDurationMinutes())
                .language(request.getLanguage())
                .thumbnailUrl(request.getThumbnailUrl())
                .bannerUrl(request.getBannerUrl())
                .videoStreamUrl(request.getVideoStreamUrl())
                .isFeatured(request.getIsFeatured() != null && request.getIsFeatured())
                .isTrending(request.getIsTrending() != null && request.getIsTrending())
                .matchPercentage(request.getMatchPercentage())
                .cast(request.getCast())
                .director(request.getDirector())
                .build();

        // Link genres
        if (request.getGenreNames() != null) {
            for (String genreName : request.getGenreNames()) {
                genreRepository.findByName(genreName).ifPresent(g -> item.getGenres().add(g));
            }
        }

        MediaItem saved = mediaItemRepository.save(item);
        return toResponse(saved);
    }

    @CacheEvict(value = {"browseData", "searchResults"}, allEntries = true)
    @Transactional
    public MediaDto.MediaResponse updateMedia(Long id, MediaDto.MediaRequest request) {
        MediaItem item = mediaItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Media not found with id: " + id));

        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setType(MediaItem.MediaType.valueOf(request.getType()));
        item.setReleaseYear(request.getReleaseYear());
        item.setAgeRating(request.getAgeRating());
        item.setDurationMinutes(request.getDurationMinutes());
        item.setLanguage(request.getLanguage());
        item.setThumbnailUrl(request.getThumbnailUrl());
        item.setBannerUrl(request.getBannerUrl());
        item.setVideoStreamUrl(request.getVideoStreamUrl());
        item.setIsFeatured(request.getIsFeatured() != null && request.getIsFeatured());
        item.setIsTrending(request.getIsTrending() != null && request.getIsTrending());
        item.setMatchPercentage(request.getMatchPercentage());
        item.setCast(request.getCast());
        item.setDirector(request.getDirector());

        // Update genres
        item.getGenres().clear();
        if (request.getGenreNames() != null) {
            for (String genreName : request.getGenreNames()) {
                genreRepository.findByName(genreName).ifPresent(g -> item.getGenres().add(g));
            }
        }

        MediaItem saved = mediaItemRepository.save(item);
        return toResponse(saved);
    }

    @CacheEvict(value = {"browseData", "searchResults"}, allEntries = true)
    @Transactional
    public void deleteMedia(Long id) {
        if (!mediaItemRepository.existsById(id)) {
            throw new RuntimeException("Media not found with id: " + id);
        }
        mediaItemRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<MediaDto.MediaResponse> getAllMedia() {
        return mediaItemRepository.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private MediaDto.MediaResponse toResponse(MediaItem item) {
        return MediaDto.MediaResponse.builder()
                .id(item.getId())
                .title(item.getTitle())
                .description(item.getDescription())
                .type(item.getType().name())
                .releaseYear(item.getReleaseYear())
                .ageRating(item.getAgeRating())
                .durationMinutes(item.getDurationMinutes())
                .language(item.getLanguage())
                .thumbnailUrl(item.getThumbnailUrl())
                .bannerUrl(item.getBannerUrl())
                .videoStreamUrl(item.getVideoStreamUrl())
                .isFeatured(item.getIsFeatured())
                .isTrending(item.getIsTrending())
                .viewCount(item.getViewCount())
                .matchPercentage(item.getMatchPercentage())
                .cast(item.getCast())
                .director(item.getDirector())
                .genres(item.getGenres().stream().map(Genre::getName).collect(Collectors.toList()))
                .build();
    }
}
