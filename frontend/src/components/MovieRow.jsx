import { useRef } from 'react';
import MovieCard from './MovieCard';

export default function MovieRow({ title, movies, showRank, onPlay, onMoreInfo }) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="mb-8 px-6 md:px-14 group/row">
      {/* Row Title */}
      <h2 className="text-headline-sm text-white mb-3 flex items-center gap-2">
        {title}
        <span className="text-[#E50914] opacity-0 group-hover/row:opacity-100 transition-opacity text-label-md cursor-pointer flex items-center">
          Explore All
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </span>
      </h2>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-8 z-10 w-12 flex items-center justify-center bg-gradient-to-r from-[#0B0B0B] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <span className="material-symbols-outlined text-white text-3xl">chevron_left</span>
        </button>

        {/* Cards Row */}
        <div ref={rowRef} className="carousel-row">
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              index={index}
              showRank={showRank}
              onPlay={onPlay}
              onMoreInfo={onMoreInfo}
            />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-8 z-10 w-12 flex items-center justify-center bg-gradient-to-l from-[#0B0B0B] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <span className="material-symbols-outlined text-white text-3xl">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
