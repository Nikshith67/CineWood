import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const { activeProfile, user } = useAuth();
  const [myList, setMyList] = useState([]);
  const [likedIds, setLikedIds] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Storage keys scoped to active profile (or user fallback)
  const profileKey = activeProfile?.id
    ? `cinewood_profile_${activeProfile.id}`
    : user?.userId
    ? `cinewood_user_${user.userId}`
    : 'cinewood_guest';

  // Load from localStorage when profile/user changes
  useEffect(() => {
    try {
      const savedList = localStorage.getItem(`${profileKey}_watchlist`);
      if (savedList) {
        setMyList(JSON.parse(savedList));
      } else {
        // Fallback default sample items if first time
        setMyList([]);
      }

      const savedLikes = localStorage.getItem(`${profileKey}_likes`);
      if (savedLikes) {
        setLikedIds(JSON.parse(savedLikes));
      } else {
        setLikedIds([]);
      }
    } catch (err) {
      console.error('Failed to load watchlist/likes:', err);
    }
  }, [profileKey]);

  // Show auto-dismissing toast
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2500);
  }, []);

  const isInList = useCallback(
    (movieId) => {
      if (!movieId) return false;
      return myList.some((item) => String(item.id) === String(movieId));
    },
    [myList]
  );

  const toggleList = useCallback(
    (movie) => {
      if (!movie || !movie.id) return false;
      const idStr = String(movie.id);
      let updated;
      let added = false;

      if (myList.some((item) => String(item.id) === idStr)) {
        updated = myList.filter((item) => String(item.id) !== idStr);
        showToast(`Removed "${movie.title || 'Movie'}" from My List`);
      } else {
        updated = [movie, ...myList];
        added = true;
        showToast(`Added "${movie.title || 'Movie'}" to My List`);
      }

      setMyList(updated);
      try {
        localStorage.setItem(`${profileKey}_watchlist`, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed saving watchlist:', e);
      }
      return added;
    },
    [myList, profileKey, showToast]
  );

  const removeFromList = useCallback(
    (movieId) => {
      if (!movieId) return;
      const idStr = String(movieId);
      const updated = myList.filter((item) => String(item.id) !== idStr);
      setMyList(updated);
      try {
        localStorage.setItem(`${profileKey}_watchlist`, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed saving watchlist:', e);
      }
      showToast('Removed from My List');
    },
    [myList, profileKey, showToast]
  );

  const isLiked = useCallback(
    (movieId) => {
      if (!movieId) return false;
      return likedIds.includes(String(movieId)) || likedIds.includes(Number(movieId));
    },
    [likedIds]
  );

  const toggleLike = useCallback(
    (movieOrId) => {
      const id = typeof movieOrId === 'object' ? movieOrId?.id : movieOrId;
      if (!id) return false;
      const idStr = String(id);
      let updated;
      let nowLiked = false;

      if (likedIds.map(String).includes(idStr)) {
        updated = likedIds.filter((x) => String(x) !== idStr);
        showToast('Removed like');
      } else {
        updated = [...likedIds, id];
        nowLiked = true;
        showToast('Added to Liked titles 👍');
      }

      setLikedIds(updated);
      try {
        localStorage.setItem(`${profileKey}_likes`, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed saving likes:', e);
      }
      return nowLiked;
    },
    [likedIds, profileKey, showToast]
  );

  return (
    <WatchlistContext.Provider
      value={{
        myList,
        isInList,
        toggleList,
        removeFromList,
        isLiked,
        toggleLike,
      }}
    >
      {children}

      {/* Floating Global Toast Notification */}
      {toastMessage && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-full flex items-center gap-2 shadow-2xl animate-slide-up pointer-events-none"
          style={{
            background: 'rgba(28, 28, 28, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 600,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
          }}
        >
          <span className="material-symbols-outlined text-[18px]" style={{ color: '#E50914' }}>
            info
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) throw new Error('useWatchlist must be used within WatchlistProvider');
  return context;
}
