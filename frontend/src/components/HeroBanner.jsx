import { useState } from 'react';
import { useWatchlist } from '../context/WatchlistContext';

export default function HeroBanner({ movie, onPlay, onMoreInfo }) {
  const [imageError, setImageError] = useState(false);
  const { isInList, toggleList } = useWatchlist();
  const inList = isInList(movie?.id);
  if (!movie) return null;

  // Reliable fallback backdrop if external image fails
  const fallbackUrl = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80';
  const displayImage = imageError
    ? fallbackUrl
    : (movie.bannerUrl || movie.thumbnailUrl || fallbackUrl);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        position: 'relative',
        width: '100%',
        height: '82vh',
        minHeight: '520px',
        maxHeight: '820px',
        backgroundColor: '#0B0B0B',
      }}
    >
      {/* Background Image Container */}
      <div
        className="absolute inset-0"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          backgroundColor: '#121212',
        }}
      >
        <img
          src={displayImage}
          alt={movie.title}
          className="w-full h-full object-cover transition-opacity duration-700"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 20%',
          }}
          onError={(e) => {
            e.target.onerror = null; // PREVENT INFINITE ERROR LOOP
            if (!imageError) {
              setImageError(true);
            }
          }}
        />
      </div>

      {/* Ambient Radial Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 50% at 20% 50%, rgba(229, 9, 20, 0.18) 0%, transparent 70%)',
        }}
      />

      {/* Left Scrim Gradient for text readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          pointerEvents: 'none',
          background: 'linear-gradient(to right, rgba(11, 11, 11, 0.95) 0%, rgba(11, 11, 11, 0.78) 35%, rgba(11, 11, 11, 0.35) 65%, transparent 100%)',
        }}
      />

      {/* Bottom Scrim Gradient for seamless transition into movie rows */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          pointerEvents: 'none',
          background: 'linear-gradient(to top, #0B0B0B 0%, rgba(11, 11, 11, 0.88) 18%, rgba(11, 11, 11, 0.35) 45%, transparent 100%)',
        }}
      />

      {/* Hero Content */}
      <div
        className="absolute z-10 animate-slide-up"
        style={{
          position: 'absolute',
          bottom: '16%',
          left: 'clamp(24px, 4.5vw, 64px)',
          right: 'clamp(24px, 4.5vw, 64px)',
          maxWidth: '720px',
          zIndex: 10,
        }}
      >
        {/* Top 10 Badge */}
        {movie.isTrending && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span
              style={{
                backgroundColor: '#E50914',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '3px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              TOP 10
            </span>
            <span style={{ color: '#ffffff', fontSize: '15px', fontWeight: 600 }}>
              in India Today
            </span>
          </div>
        )}

        {/* Title */}
        <h1
          style={{
            color: '#FFFFFF',
            fontSize: 'clamp(32px, 5.5vw, 62px)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '14px',
            textShadow: '0 4px 24px rgba(0, 0, 0, 0.95)',
            letterSpacing: '-0.02em',
          }}
        >
          {movie.title}
        </h1>

        {/* Metadata Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}
        >
          {movie.matchPercentage && (
            <span style={{ color: '#46D369', fontWeight: 700, fontSize: '14px' }}>
              {movie.matchPercentage}
            </span>
          )}
          {movie.releaseYear && (
            <span style={{ color: '#B3B3B3', fontSize: '14px', fontWeight: 500 }}>
              {movie.releaseYear}
            </span>
          )}
          {movie.ageRating && (
            <span
              style={{
                border: '1px solid rgba(255, 255, 255, 0.4)',
                color: '#E0E0E0',
                padding: '1px 7px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '3px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}
            >
              {movie.ageRating}
            </span>
          )}
          {movie.durationMinutes && (
            <span style={{ color: '#B3B3B3', fontSize: '14px', fontWeight: 500 }}>
              {Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m
            </span>
          )}
          {movie.language && (
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.14)',
                color: '#ffffff',
                padding: '2px 10px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
              }}
            >
              {movie.language}
            </span>
          )}
          {movie.genres?.slice(0, 3).map((g) => (
            <span
              key={g}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                color: '#E0E0E0',
                padding: '2px 10px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {g}
            </span>
          ))}
        </div>

        {/* Description */}
        <p
          style={{
            color: '#D4D4D4',
            fontSize: '16px',
            lineHeight: 1.55,
            maxWidth: '620px',
            marginBottom: '24px',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.85)',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {movie.description}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn-play"
            onClick={() => onPlay?.(movie)}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#0B0B0B',
              padding: '10px 28px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 4px 16px rgba(255, 255, 255, 0.25)',
              transition: 'opacity 0.2s',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '26px', fontVariationSettings: "'FILL' 1" }}
            >
              play_arrow
            </span>
            Play
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => toggleList(movie)}
            style={{
              backgroundColor: inList ? '#E50914' : 'rgba(109, 109, 110, 0.7)',
              color: '#FFFFFF',
              padding: '10px 22px',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: 'none',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.2s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
              {inList ? 'check' : 'add'}
            </span>
            {inList ? 'In My List' : 'My List'}
          </button>

          <button
            className="btn-secondary"
            onClick={() => onMoreInfo?.(movie)}
            style={{
              backgroundColor: 'rgba(109, 109, 110, 0.7)',
              color: '#FFFFFF',
              padding: '10px 24px',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: 'none',
              backdropFilter: 'blur(12px)',
              transition: 'background-color 0.2s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
              info
            </span>
            More Info
          </button>
        </div>
      </div>
    </div>
  );
}
