import { useWatchlist } from '../context/WatchlistContext';

export default function MovieDetailModal({ movie, onClose, onPlay, onFeedback }) {
  const { isInList, toggleList, isLiked, toggleLike } = useWatchlist();
  if (!movie) return null;

  const inList = isInList(movie?.id);
  const liked = isLiked(movie?.id);

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 110 }}>
      <div
        className="w-full max-w-3xl mx-4 rounded-xl overflow-hidden animate-slide-up max-h-[90vh] overflow-y-auto text-left"
        style={{
          background: '#181818',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.85)',
          textAlign: 'left',
          direction: 'ltr',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero Section */}
        <div className="relative h-72 md:h-96 overflow-hidden">
          <img
            src={movie.bannerUrl || movie.thumbnailUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = movie.thumbnailUrl; }}
          />
          <div className="hero-scrim absolute inset-0" />
          <div className="hero-scrim-left absolute inset-0" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer"
            style={{ background: 'rgba(20,20,20,0.8)' }}
            title="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {/* Content overlay */}
          <div className="absolute bottom-6 left-6 right-6 z-10 text-left">
            <h2 className="text-display-hero-mobile text-white mb-4 drop-shadow-2xl text-left">{movie.title}</h2>
            <div className="flex items-center gap-3 flex-wrap text-left">
              <button
                type="button"
                className="btn-play cursor-pointer"
                onClick={() => onPlay?.(movie)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                Play
              </button>
              <button
                type="button"
                className={`btn-icon cursor-pointer transition-all ${
                  inList ? 'bg-[#E50914] text-white border-none' : ''
                }`}
                onClick={() => toggleList(movie)}
                title={inList ? 'In My List (Click to remove)' : 'Add to My List'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  {inList ? 'check' : 'add'}
                </span>
              </button>
              <button
                type="button"
                className={`btn-icon cursor-pointer transition-all ${
                  liked ? 'text-[#46D369] border-[#46D369] bg-[#46D369]/20' : ''
                }`}
                onClick={() => toggleLike(movie?.id)}
                title={liked ? 'Liked' : 'Like'}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: '20px',
                    fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0",
                    color: liked ? '#46D369' : 'currentColor',
                  }}
                >
                  thumb_up
                </span>
              </button>
              <button
                type="button"
                className="btn-icon cursor-pointer hover:bg-white/20"
                onClick={() => onFeedback?.(movie)}
                title="Rate & Review"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>rate_review</span>
              </button>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6 md:p-8">
          {/* Metadata Row */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            {movie.matchPercentage && (
              <span className="text-label-lg font-bold" style={{ color: '#46D369' }}>
                {movie.matchPercentage}
              </span>
            )}
            {movie.releaseYear && (
              <span className="text-body-md text-[#B3B3B3]">{movie.releaseYear}</span>
            )}
            {movie.ageRating && (
              <span className="maturity-tag">{movie.ageRating}</span>
            )}
            {movie.durationMinutes && (
              <span className="text-body-md text-[#B3B3B3]">
                {Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m
              </span>
            )}
            <span className="pill-badge">{movie.type}</span>
            <span className="pill-badge">{movie.language}</span>
          </div>

          {/* Description */}
          <p className="text-body-lg text-[#B3B3B3] mb-6 leading-relaxed text-left">
            {movie.description}
          </p>

          {/* Rating Section - Normal Left Aligned */}
          <div
            className="mb-6 p-4 rounded-xl flex items-center justify-between flex-wrap gap-4 text-left"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="text-left">
              <p className="text-sm font-bold text-white mb-0.5 text-left">Rate this movie</p>
              <p className="text-xs text-[#A0A0A0] text-left">Give your rating and review to improve recommendations</p>
            </div>
            <button
              type="button"
              onClick={() => onFeedback?.(movie)}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:brightness-110 flex items-center gap-1.5 cursor-pointer shadow"
              style={{ background: '#E50914' }}
            >
              <span className="material-symbols-outlined text-[16px]">star</span>
              Rate & Review
            </button>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {movie.cast && (
              <div>
                <span className="text-label-md text-[#808080]">Cast: </span>
                <span className="text-body-sm text-[#B3B3B3]">{movie.cast}</span>
              </div>
            )}
            {movie.director && (
              <div>
                <span className="text-label-md text-[#808080]">Director: </span>
                <span className="text-body-sm text-[#B3B3B3]">{movie.director}</span>
              </div>
            )}
          </div>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="text-label-md text-[#808080] mr-1">Genres:</span>
              {movie.genres.map((g) => (
                <span key={g} className="pill-badge">{g}</span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {movie.viewCount != null && (
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#808080]">visibility</span>
                <span className="text-body-sm text-[#B3B3B3]">{(movie.viewCount / 1000).toFixed(0)}K views</span>
              </div>
            )}
            {movie.language && (
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#808080]">translate</span>
                <span className="text-body-sm text-[#B3B3B3]">{movie.language}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
