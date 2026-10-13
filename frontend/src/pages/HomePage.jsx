import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { browseCatalog, searchMedia, updateWatchProgress, getContinueWatching } from '../services/api';
import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';
import MovieCard from '../components/MovieCard';
import LanguageFilter from '../components/LanguageFilter';
import VideoPlayer from '../components/VideoPlayer';
import FeedbackModal from '../components/FeedbackModal';
import MovieDetailModal from './MovieDetailModal';

export default function HomePage() {
  const { activeProfile } = useAuth();
  const { myList } = useWatchlist();
  const location = useLocation();
  const navigate = useNavigate();

  const [browseData, setBrowseData] = useState(null);
  const [continueWatching, setContinueWatching] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState('all');
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  // Modal states
  const [playingMovie, setPlayingMovie] = useState(null);
  const [detailMovie, setDetailMovie] = useState(null);
  const [feedbackMovie, setFeedbackMovie] = useState(null);

  const heroInterval = useRef(null);
  const currentPath = location.pathname;

  // Load browse data
  const loadBrowseData = useCallback(async (language) => {
    try {
      setLoading(true);
      const res = await browseCatalog(language);
      setBrowseData(res.data);
    } catch (err) {
      console.error('Failed to load browse data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load continue watching
  const loadContinueWatching = useCallback(async () => {
    if (!activeProfile?.id) return;
    try {
      const res = await getContinueWatching(activeProfile.id);
      setContinueWatching(res.data);
    } catch (err) {
      // Silently fail for optional feature
    }
  }, [activeProfile]);

  useEffect(() => {
    loadBrowseData(activeLanguage);
  }, [activeLanguage, loadBrowseData]);

  useEffect(() => {
    loadContinueWatching();
  }, [loadContinueWatching]);

  // Reset search results on path change
  useEffect(() => {
    setSearchResults(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPath]);

  // Auto-rotate hero banner every 8 seconds
  useEffect(() => {
    const featured = browseData?.featured;
    if (!featured || featured.length <= 1) return;

    heroInterval.current = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % featured.length);
    }, 8000);

    return () => clearInterval(heroInterval.current);
  }, [browseData?.featured]);

  // Aggregate all unique movies
  const allMovies = useMemo(() => {
    if (!browseData) return [];
    const map = new Map();
    [
      ...(browseData.featured || []),
      ...(browseData.trending || []),
      ...(browseData.top10 || []),
      ...(browseData.recentlyAdded || []),
      ...(browseData.categoryRows || []).flatMap((r) => r.items || []),
    ].forEach((m) => {
      if (m && m.id && !map.has(m.id)) {
        map.set(m.id, m);
      }
    });
    return Array.from(map.values());
  }, [browseData]);

  // Language-grouped sections
  const languageSections = useMemo(() => {
    const langs = [
      { name: 'Telugu', label: 'Telugu Blockbusters & Cinema' },
      { name: 'Tamil', label: 'Tamil Cinema & Hits' },
      { name: 'Hindi', label: 'Hindi Bollywood Favourites' },
      { name: 'Malayalam', label: 'Malayalam Cinematic Gems' },
      { name: 'Kannada', label: 'Kannada Power Hits' },
      { name: 'English', label: 'English & International Cinema' },
    ];

    return langs
      .map(({ name, label }) => {
        const items = allMovies.filter(
          (m) => m.language && m.language.toLowerCase() === name.toLowerCase()
        );
        return { language: name, title: label, items };
      })
      .filter((row) => row.items.length > 0);
  }, [allMovies]);

  // Handlers
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const res = await searchMedia(query);
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  }, []);

  const handleLanguageChange = useCallback((lang) => {
    setActiveLanguage(lang);
    setHeroIndex(0);
    setSearchResults(null);
  }, []);

  const handlePlay = useCallback((movie) => {
    setDetailMovie(null);
    setPlayingMovie(movie);
  }, []);

  const handleMoreInfo = useCallback((movie) => {
    setDetailMovie(movie);
  }, []);

  const handleVideoClose = useCallback(
    (currentTime = 0) => {
      const movie = playingMovie;
      if (activeProfile?.id && movie?.id && currentTime > 5) {
        updateWatchProgress({
          profileId: activeProfile.id,
          mediaId: movie.id,
          watchedDurationSeconds: Math.floor(currentTime),
          completed: false,
        })
          .then(() => loadContinueWatching())
          .catch(() => {});
      }
      setPlayingMovie(null);
    },
    [playingMovie, activeProfile, loadContinueWatching]
  );

  const handleVideoComplete = useCallback(
    async (movie) => {
      if (activeProfile?.id && movie?.id) {
        try {
          await updateWatchProgress({
            profileId: activeProfile.id,
            mediaId: movie.id,
            watchedDurationSeconds: (movie.durationMinutes || 120) * 60,
            completed: true,
          });
          loadContinueWatching();
        } catch (err) {
          // Silently fail
        }
      }
      setPlayingMovie(null);
      setFeedbackMovie(movie);
    },
    [activeProfile, loadContinueWatching]
  );

  const handleFeedbackOpen = useCallback((movie) => {
    setDetailMovie(null);
    setFeedbackMovie(movie);
  }, []);

  const featuredList =
    browseData?.featured && browseData.featured.length > 0
      ? browseData.featured
      : browseData?.trending || [];
  const featuredMovie =
    featuredList.length > 0 ? featuredList[heroIndex % featuredList.length] : null;

  if (loading && !browseData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0B0B0B' }}>
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <span className="text-headline-lg tracking-wider uppercase font-black">
            <span style={{ color: '#E50914' }}>CINE</span>
            <span className="text-white">WOOD</span>
          </span>
          <div className="w-10 h-10 border-3 border-[#E50914] border-t-transparent rounded-full animate-spin" />
          <p className="text-body-sm text-[#808080]">Loading your cinematic experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0B0B0B' }}>
      {/* Navbar */}
      <Navbar onSearch={handleSearch} />

      {/* Search Results Mode */}
      {searchResults ? (
        <div className="pt-24 px-6 md:px-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-headline-md text-white">
              Search Results
              <span className="text-body-md text-[#808080] ml-3">({searchResults.length} found)</span>
            </h2>
            <button
              onClick={() => setSearchResults(null)}
              className="text-label-lg text-[#E50914] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
              Clear
            </button>
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-14">
              {searchResults.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onPlay={handlePlay}
                  onMoreInfo={handleMoreInfo}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="material-symbols-outlined text-6xl text-[#808080] mb-4">search_off</span>
              <p className="text-headline-sm text-[#B3B3B3]">No results found</p>
              <p className="text-body-md text-[#808080] mt-2">Try different keywords or browse categories below</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* ======================================================== */}
          {/* SECTION 1: MY LIST (/my-list) */}
          {/* ======================================================== */}
          {currentPath === '/my-list' ? (
            <div className="pt-24 px-6 md:px-14 min-h-[75vh]">
              {/* My List Header */}
              <div className="mb-8 border-b border-white/10 pb-5 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[#E50914] text-[28px]">
                      bookmark
                    </span>
                    <h1 className="text-headline-lg text-white font-black">My List</h1>
                  </div>
                  <p className="text-body-sm text-[#B3B3B3]">
                    {myList.length === 0
                      ? 'Your saved movies and watchlist'
                      : `${myList.length} ${myList.length === 1 ? 'title' : 'titles'} saved for later`}
                  </p>
                </div>
              </div>

              {myList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 pb-16">
                  {myList.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onPlay={handlePlay}
                      onMoreInfo={handleMoreInfo}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                    style={{ background: 'rgba(229, 9, 20, 0.1)', border: '1px solid rgba(229, 9, 20, 0.3)' }}
                  >
                    <span className="material-symbols-outlined text-4xl" style={{ color: '#E50914' }}>
                      playlist_add
                    </span>
                  </div>
                  <h3 className="text-headline-md text-white font-bold mb-2">
                    Your List is Empty
                  </h3>
                  <p
                    className="text-body-md text-[#808080] mb-6 text-center"
                    style={{ maxWidth: '480px', width: '100%', margin: '0 auto 24px auto', lineHeight: '1.6', textAlign: 'center' }}
                  >
                    Never lose track of what you want to watch next. Click the <strong className="text-white">+</strong> button on any movie card or detail page to add it here.
                  </p>
                  <button
                    onClick={() => navigate('/movies')}
                    className="btn-brand px-6 py-2.5 rounded-lg text-sm font-bold text-white shadow-lg cursor-pointer"
                  >
                    Explore Movies
                  </button>
                </div>
              )}
            </div>
          ) : currentPath === '/languages' ? (
            /* ======================================================== */
            /* SECTION 2: LANGUAGES (/languages) */
            /* ======================================================== */
            <div>
              {/* Languages Header Banner */}
              <div
                className="relative pt-28 pb-10 px-6 md:px-14 border-b border-white/10"
                style={{
                  background: 'linear-gradient(180deg, rgba(229,9,20,0.18) 0%, rgba(11,11,11,0.95) 100%)',
                }}
              >
                <div className="max-w-3xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-[#E50914] text-white">
                      Multilingual Hub
                    </span>
                  </div>
                  <h1 className="text-display-hero-mobile md:text-headline-lg text-white font-black mb-3">
                    Explore Movies by Language
                  </h1>
                  <p className="text-body-md text-[#C4C4C4] leading-relaxed">
                    Dive into Indian cinema’s rich diversity. Stream blockbusters and award-winning stories across Telugu, Tamil, Hindi, Malayalam, Kannada, and English.
                  </p>
                </div>

                {/* Language Filter */}
                <div className="mt-6">
                  <LanguageFilter
                    activeLanguage={activeLanguage}
                    onLanguageChange={handleLanguageChange}
                  />
                </div>
              </div>

              {/* Language Categorized Rows */}
              <div className="pb-16 pt-6">
                {activeLanguage === 'all' ? (
                  <>
                    {languageSections.map((sec) => (
                      <MovieRow
                        key={sec.language}
                        title={`🎬 ${sec.title}`}
                        movies={sec.items}
                        onPlay={handlePlay}
                        onMoreInfo={handleMoreInfo}
                      />
                    ))}
                  </>
                ) : (
                  <>
                    {/* Filtered view for selected language */}
                    <div className="px-6 md:px-14 mb-6">
                      <h2 className="text-headline-sm text-white flex items-center gap-2">
                        <span>Showing All</span>
                        <span className="text-[#E50914] font-bold">{activeLanguage}</span>
                        <span>Movies</span>
                      </h2>
                    </div>

                    {browseData?.categoryRows && browseData.categoryRows.length > 0 ? (
                      browseData.categoryRows.map((row) => (
                        <MovieRow
                          key={row.title}
                          title={row.title}
                          movies={row.items}
                          onPlay={handlePlay}
                          onMoreInfo={handleMoreInfo}
                        />
                      ))
                    ) : (
                      <div className="px-6 md:px-14">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                          {allMovies
                            .filter(
                              (m) =>
                                m.language &&
                                m.language.toLowerCase() === activeLanguage.toLowerCase()
                            )
                            .map((movie) => (
                              <MovieCard
                                key={movie.id}
                                movie={movie}
                                onPlay={handlePlay}
                                onMoreInfo={handleMoreInfo}
                              />
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : currentPath === '/top-10' ? (
            /* ======================================================== */
            /* SECTION 3: TOP 10 MOVIES (/top-10) */
            /* ======================================================== */
            <div>
              {/* Top 10 Header Banner */}
              <div
                className="relative pt-28 pb-10 px-6 md:px-14 border-b border-white/10"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,215,0,0.12) 0%, rgba(11,11,11,0.95) 100%)',
                }}
              >
                <div className="max-w-3xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded text-black flex items-center gap-1"
                      style={{ background: '#FFD700' }}
                    >
                      <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                      Top 10 India
                    </span>
                    <span className="text-xs text-[#A0A0A0]">Updated Daily</span>
                  </div>
                  <h1 className="text-display-hero-mobile md:text-headline-lg text-white font-black mb-3">
                    Top 10 Movies in India Today
                  </h1>
                  <p className="text-body-md text-[#C4C4C4] leading-relaxed">
                    The ten most-watched movies right now across the country. Ranked by viewer ratings, watch hours, and trending sentiment.
                  </p>
                </div>
              </div>

              <div className="pb-16 pt-8">
                {/* Top 10 Ranked Row */}
                {browseData?.top10?.length > 0 && (
                  <div className="mb-10">
                    <MovieRow
                      title="🏆 Official Top 10 Leaderboard"
                      movies={browseData.top10}
                      showRank
                      onPlay={handlePlay}
                      onMoreInfo={handleMoreInfo}
                    />
                  </div>
                )}

                {/* Ranked Showcase Cards Grid */}
                {browseData?.top10?.length > 0 && (
                  <div className="px-6 md:px-14 mb-12">
                    <h2 className="text-headline-sm text-white mb-5 flex items-center gap-2">
                      <span>Top 10 Movies Ranked Showcase</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {browseData.top10.slice(0, 6).map((movie, idx) => (
                        <div
                          key={movie.id}
                          onClick={() => handleMoreInfo(movie)}
                          className="flex gap-4 p-4 rounded-xl cursor-pointer transition-all hover:bg-white/5 border border-white/5 group"
                          style={{ background: '#161616' }}
                        >
                          {/* Rank Badge */}
                          <div className="text-4xl font-black text-[#FFD700] shrink-0 w-8 flex items-center justify-center">
                            #{idx + 1}
                          </div>
                          {/* Poster */}
                          <div className="w-20 aspect-[2/3] rounded overflow-hidden shrink-0 bg-[#222]">
                            <img
                              src={movie.thumbnailUrl}
                              alt={movie.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="text-white font-bold text-base truncate group-hover:text-[#E50914] transition-colors">
                              {movie.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-[#808080]">
                              {movie.matchPercentage && (
                                <span className="text-[#46D369] font-bold">{movie.matchPercentage}</span>
                              )}
                              <span>{movie.releaseYear}</span>
                              <span>•</span>
                              <span>{movie.language}</span>
                            </div>
                            <p className="text-xs text-[#A0A0A0] line-clamp-2 mt-2 leading-relaxed">
                              {movie.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Now */}
                {browseData?.trending?.length > 0 && (
                  <MovieRow
                    title="🔥 More Trending Blockbusters"
                    movies={browseData.trending}
                    onPlay={handlePlay}
                    onMoreInfo={handleMoreInfo}
                  />
                )}
              </div>
            </div>
          ) : currentPath === '/movies' ? (
            /* ======================================================== */
            /* SECTION 4: MOVIES (/movies) */
            /* ======================================================== */
            <div>
              {/* Hero Banner */}
              {featuredMovie && (
                <HeroBanner
                  movie={featuredMovie}
                  onPlay={handlePlay}
                  onMoreInfo={handleMoreInfo}
                />
              )}

              {/* Language Filter */}
              <LanguageFilter
                activeLanguage={activeLanguage}
                onLanguageChange={handleLanguageChange}
              />

              <div className="pb-16 mt-4">
                {/* Genre Category Rows */}
                {browseData?.categoryRows?.map((row) => (
                  <MovieRow
                    key={row.title}
                    title={row.title}
                    movies={row.items}
                    onPlay={handlePlay}
                    onMoreInfo={handleMoreInfo}
                  />
                ))}

                {/* Trending Movies */}
                {browseData?.trending?.length > 0 && (
                  <MovieRow
                    title="🔥 High-Octane Popular Movies"
                    movies={browseData.trending}
                    onPlay={handlePlay}
                    onMoreInfo={handleMoreInfo}
                  />
                )}
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* SECTION 5: DEFAULT HOME (/) */
            /* ======================================================== */
            <>
              {/* Hero Banner */}
              {featuredMovie && (
                <HeroBanner
                  movie={featuredMovie}
                  onPlay={handlePlay}
                  onMoreInfo={handleMoreInfo}
                />
              )}

              {/* Hero Carousel Dots */}
              {featuredList.length > 1 && (
                <div className="flex items-center justify-center gap-2 -mt-8 mb-4 relative z-10">
                  {featuredList.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroIndex(idx)}
                      className="transition-all duration-300"
                      style={{
                        width: (heroIndex % featuredList.length) === idx ? '24px' : '8px',
                        height: '4px',
                        borderRadius: '2px',
                        background:
                          (heroIndex % featuredList.length) === idx
                            ? '#E50914'
                            : 'rgba(255,255,255,0.3)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Language Filter */}
              <LanguageFilter
                activeLanguage={activeLanguage}
                onLanguageChange={handleLanguageChange}
              />

              {/* Content Rows */}
              <div className="pb-16 mt-4">
                {/* Continue Watching */}
                {continueWatching.length > 0 && (
                  <MovieRow
                    title="Continue Watching"
                    movies={continueWatching.map((w) => ({
                      id: w.mediaId,
                      title: w.mediaTitle,
                      thumbnailUrl: w.thumbnailUrl,
                      progress:
                        w.totalDurationSeconds > 0
                          ? (w.watchedDurationSeconds / w.totalDurationSeconds) * 100
                          : 0,
                    }))}
                    onPlay={handlePlay}
                    onMoreInfo={handleMoreInfo}
                  />
                )}

                {/* Trending Now */}
                {browseData?.trending?.length > 0 && (
                  <MovieRow
                    title="🔥 Trending Now"
                    movies={browseData.trending}
                    onPlay={handlePlay}
                    onMoreInfo={handleMoreInfo}
                  />
                )}

                {/* Top 10 */}
                {browseData?.top10?.length > 0 && (
                  <MovieRow
                    title="Top 10 in India Today"
                    movies={browseData.top10}
                    showRank
                    onPlay={handlePlay}
                    onMoreInfo={handleMoreInfo}
                  />
                )}

                {/* Recently Added */}
                {browseData?.recentlyAdded?.length > 0 && (
                  <MovieRow
                    title="Recently Added"
                    movies={browseData.recentlyAdded}
                    onPlay={handlePlay}
                    onMoreInfo={handleMoreInfo}
                  />
                )}

                {/* Genre Category Rows */}
                {browseData?.categoryRows?.map((row) => (
                  <MovieRow
                    key={row.title}
                    title={row.title}
                    movies={row.items}
                    onPlay={handlePlay}
                    onMoreInfo={handleMoreInfo}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Footer */}
      <footer className="px-6 md:px-14 py-10 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-body-sm text-[#808080]">
          © 2024 CineWood Entertainment. Stream the best of Indian & International cinema.
        </p>
      </footer>

      {/* Video Player Modal */}
      {playingMovie && (
        <VideoPlayer
          movie={playingMovie}
          onClose={handleVideoClose}
          onComplete={handleVideoComplete}
          profileId={activeProfile?.id}
        />
      )}

      {/* Movie Detail Modal */}
      {detailMovie && (
        <MovieDetailModal
          movie={detailMovie}
          onClose={() => setDetailMovie(null)}
          onPlay={handlePlay}
          onFeedback={handleFeedbackOpen}
        />
      )}

      {/* Feedback Modal */}
      {feedbackMovie && (
        <FeedbackModal
          movie={feedbackMovie}
          profileId={activeProfile?.id}
          onClose={() => setFeedbackMovie(null)}
          onSubmitted={() => setFeedbackMovie(null)}
        />
      )}
    </div>
  );
}
