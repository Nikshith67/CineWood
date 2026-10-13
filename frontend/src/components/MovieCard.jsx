import { useWatchlist } from '../context/WatchlistContext';

export default function MovieCard({ movie, index, showRank, onPlay, onMoreInfo }) {
  const { isInList, toggleList, isLiked, toggleLike } = useWatchlist();
  const inList = isInList(movie?.id);
  const liked = isLiked(movie?.id);

  return (
    <div
      className="movie-card relative flex-shrink-0 rounded cursor-pointer overflow-hidden group"
      style={{ width: showRank ? '200px' : '230px' }}
      onClick={() => onMoreInfo?.(movie)}
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] overflow-hidden rounded bg-[#1F1F1F]">
        <img
          src={movie.thumbnailUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top 10 Rank Number */}
        {showRank && index !== undefined && (
          <div className="absolute bottom-0 left-0 text-[80px] font-black leading-none text-white/80 drop-shadow-2xl"
               style={{ fontFamily: "'Space Grotesk', sans-serif", WebkitTextStroke: '2px rgba(255,255,255,0.3)' }}>
            {index + 1}
          </div>
        )}

        {/* Trending Badge */}
        {movie.isTrending && !showRank && (
          <div className="absolute top-2 left-2">
            <span className="top-10-badge">TOP 10</span>
          </div>
        )}

        {/* Progress Bar for Continue Watching */}
        {movie.progress != null && movie.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/70 z-10">
            <div
              className="h-full bg-[#E50914] rounded-r-full transition-all"
              style={{ width: `${Math.min(100, Math.max(5, movie.progress))}%` }}
            />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-3">
            {/* Action Buttons */}
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-white text-[#0B0B0B] flex items-center justify-center hover:opacity-85 transition-all cursor-pointer shadow"
                onClick={(e) => { e.stopPropagation(); onPlay?.(movie); }}
                title="Play"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              </button>
              <button
                type="button"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  inList
                    ? 'bg-[#E50914] text-white shadow'
                    : 'border border-white/60 bg-black/40 text-white hover:border-white hover:bg-white/20'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleList(movie);
                }}
                title={inList ? 'Remove from My List' : 'Add to My List'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  {inList ? 'check' : 'add'}
                </span>
              </button>
              <button
                type="button"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  liked
                    ? 'border border-[#46D369] bg-[#46D369]/20 text-[#46D369]'
                    : 'border border-white/60 bg-black/40 text-white hover:border-white hover:bg-white/20'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(movie?.id);
                }}
                title={liked ? 'Liked' : 'Like'}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: '16px',
                    fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0",
                    color: liked ? '#46D369' : 'currentColor',
                  }}
                >
                  thumb_up
                </span>
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-full border border-white/50 bg-black/40 text-white flex items-center justify-center hover:border-white hover:bg-white/20 transition-all ml-auto cursor-pointer"
                onClick={(e) => { e.stopPropagation(); onMoreInfo?.(movie); }}
                title="More Details"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>expand_more</span>
              </button>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-2 flex-wrap">
              {movie.matchPercentage && (
                <span className="text-label-badge font-bold" style={{ color: '#46D369' }}>
                  {movie.matchPercentage}
                </span>
              )}
              {movie.ageRating && (
                <span className="maturity-tag text-[10px]">{movie.ageRating}</span>
              )}
              {movie.durationMinutes && (
                <span className="text-[10px] text-[#808080]">
                  {Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m
                </span>
              )}
            </div>
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex items-center gap-1 mt-1">
                {movie.genres.slice(0, 3).map((g, i) => (
                  <span key={g}>
                    <span className="text-[10px] text-white/80">{g}</span>
                    {i < Math.min(movie.genres.length, 3) - 1 && (
                      <span className="text-[10px] text-[#808080] mx-0.5">•</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title Below Card */}
      <p className="text-body-sm text-[#B3B3B3] mt-1.5 truncate">{movie.title}</p>
    </div>
  );
}
