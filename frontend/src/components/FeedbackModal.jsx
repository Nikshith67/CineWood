import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { submitFeedback } from '../services/api';

const REVIEW_TAGS = [
  '🔥 Gripping Action',
  '✨ VFX Masterpiece',
  '🎭 Outstanding Performance',
  '🎵 BGM & Sound Design',
  '🧠 Mind-Blowing Twists',
  '❤️ Emotional Story',
  '🎬 Masterclass Direction',
  '🍿 Edge of Seat Thriller',
  '😂 Comedy Gold',
  '🔁 Must Watch Again',
  '⚡ High Voltage Climax',
  '🌟 Visual Spectacle',
];

const RATING_DESCRIPTIONS = [
  '',
  '1 / 5 • Not for me 👎',
  '2 / 5 • Below Average 😐',
  '3 / 5 • Good Watch 👍',
  '4 / 5 • Great Movie 🌟',
  '5 / 5 • Absolute Masterpiece 🔥',
];

export default function FeedbackModal({ movie, profileId, onClose, onSubmitted }) {
  const { activeProfile } = useAuth();
  const effectiveProfileId = profileId || activeProfile?.id;
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!movie) return null;

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0 || !effectiveProfileId) return;
    setSubmitting(true);
    try {
      await submitFeedback({
        profileId: effectiveProfileId,
        mediaId: movie.id,
        rating,
        reviewTags: selectedTags,
        comment,
      });
      setSubmitted(true);
      setTimeout(() => {
        onSubmitted?.();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const activeRating = hoveredStar || rating;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 130 }}>
      <div
        className="w-full mx-4 rounded-2xl overflow-hidden animate-slide-up flex flex-col"
        style={{
          maxWidth: '820px',
          width: '100%',
          minHeight: '85vh',
          maxHeight: '92vh',
          background: '#121212',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 30px 100px rgba(0,0,0,0.95), 0 0 60px rgba(229,9,20,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ======================================================== */}
        {/* EXPANDED CINEMATIC BANNER HEADER (h-72 to h-80)           */}
        {/* ======================================================== */}
        <div className="relative h-64 sm:h-72 md:h-80 shrink-0 overflow-hidden">
          <img
            src={movie.bannerUrl || movie.thumbnailUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-center filter brightness-90 transition-transform duration-700 hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = movie.thumbnailUrl;
            }}
          />

          {/* Multi-stage Scrim Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/80 via-transparent to-[#121212]/40" />

          {/* Top Bar inside Banner */}
          <div className="absolute top-4 left-6 right-6 flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#E50914] text-white shadow-md">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Watch Complete
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold text-[#B3B3B3] bg-black/60 backdrop-blur-md border border-white/10">
                <span className="material-symbols-outlined text-[13px] text-[#46D369]">check_circle</span>
                Saved to History
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-black/70 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 backdrop-blur-md shadow-lg"
              title="Close"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Title & Metadata Overlay at Bottom of Banner */}
          <div className="absolute bottom-6 left-6 right-6 z-20 text-left">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#E50914] mb-1.5 block drop-shadow">
              CineWood Community Reviews
            </span>
            <h1 className="text-headline-lg md:text-display-hero-mobile text-white font-black drop-shadow-2xl mb-2 line-clamp-1">
              {movie.title}
            </h1>
            <div className="flex items-center gap-2.5 flex-wrap text-xs text-[#B3B3B3]">
              {movie.releaseYear && <span>{movie.releaseYear}</span>}
              {movie.releaseYear && <span>•</span>}
              {movie.language && (
                <span className="px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
                  {movie.language}
                </span>
              )}
              {movie.ageRating && (
                <span className="px-2 py-0.5 rounded border border-white/20 text-[#D4D4D4] font-bold">
                  {movie.ageRating}
                </span>
              )}
              {movie.durationMinutes && (
                <span>
                  {Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m
                </span>
              )}
              {movie.director && (
                <>
                  <span>•</span>
                  <span>Dir: {movie.director}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MODAL BODY (EXPANDED HEIGHT & LUXURIOUS PADDING)         */}
        {/* ======================================================== */}
        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-fade-in">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl"
              style={{
                background: 'rgba(70, 211, 105, 0.15)',
                border: '2px solid rgba(70, 211, 105, 0.4)',
              }}
            >
              <span
                className="material-symbols-outlined text-6xl"
                style={{ color: '#46D369', fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
            <h2 className="text-headline-lg text-white font-black mb-3">
              Thank You for Rating!
            </h2>
            <p className="text-body-lg text-[#B3B3B3] max-w-lg mb-8 leading-relaxed">
              Your feedback helps shape recommendation trends for Indian and international titles across CineWood.
            </p>
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#808080]">
              <span className="w-2 h-2 rounded-full bg-[#46D369] animate-ping" />
              Returning to CineWood browse...
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 md:p-10 flex flex-col gap-8 text-left">
            {/* 1. Star Rating Arena */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-headline-sm text-white font-bold mb-1">
                    How was your experience?
                  </h3>
                  <p className="text-body-sm text-[#808080]">
                    Select stars to rate this film
                  </p>
                </div>

                {activeRating > 0 && (
                  <span className="self-start sm:self-center text-sm font-bold text-white px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#E50914]/20 to-[#930007]/20 border border-[#E50914]/40 shadow-sm animate-fade-in">
                    {RATING_DESCRIPTIONS[activeRating]}
                  </span>
                )}
              </div>

              {/* Glowing Stars Row */}
              <div className="flex items-center gap-3 sm:gap-4 py-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= activeRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="p-1 cursor-pointer transition-all duration-200 transform hover:scale-125 active:scale-95 group focus:outline-none"
                      title={`Rate ${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <span
                        className="material-symbols-outlined select-none text-4xl sm:text-5xl md:text-6xl transition-all duration-200"
                        style={{
                          color: isFilled ? '#FFD700' : '#3A3A3A',
                          fontVariationSettings: isFilled ? "'FILL' 1" : "'FILL' 0",
                          filter: isFilled
                            ? 'drop-shadow(0 0 16px rgba(255, 215, 0, 0.45))'
                            : 'none',
                        }}
                      >
                        star
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Review Tags Section */}
            <div className="text-left">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-white uppercase tracking-wider block">
                  What stood out the most?
                </label>
                <span className="text-xs text-[#808080]">
                  {selectedTags.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {REVIEW_TAGS.map((tag) => {
                  const selected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                        selected
                          ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/30 scale-105 border border-[#ff4d58]'
                          : 'bg-[#1C1C1C] text-[#B3B3B3] hover:bg-[#282828] hover:text-white border border-white/5'
                      }`}
                    >
                      {selected && (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      )}
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Textual Review Comment */}
            <div className="text-left">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-white uppercase tracking-wider block">
                  Share Your Detailed Thoughts (Optional)
                </label>
                <span className="text-xs text-[#808080]">
                  {comment.length} / 500
                </span>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                rows={5}
                placeholder="What did you love about the performance, music, storyline, or climax? Share your review with fellow CineWood movie lovers..."
                className="w-full p-4 rounded-xl text-sm sm:text-base text-white placeholder-[#707070] resize-none outline-none focus:ring-2 focus:ring-[#E50914]/60 transition-all leading-relaxed"
                style={{
                  minHeight: '130px',
                  background: '#181818',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              />
            </div>

            {/* 4. Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={rating === 0 || submitting}
                className={`w-full sm:flex-1 py-4 rounded-xl text-base font-bold transition-all duration-200 cursor-pointer shadow-xl flex items-center justify-center gap-2 ${
                  rating > 0
                    ? 'bg-[#E50914] text-white hover:bg-[#f40d18] hover:shadow-2xl hover:shadow-[#E50914]/40 hover:-translate-y-0.5'
                    : 'bg-[#242424] text-[#707070] cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Review...</span>
                  </>
                ) : rating === 0 ? (
                  <span>Select a star rating to submit</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">send</span>
                    <span>Submit Rating & Review</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-[#B3B3B3] hover:text-white bg-[#202020] hover:bg-[#2a2a2a] transition-all cursor-pointer border border-white/5"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
