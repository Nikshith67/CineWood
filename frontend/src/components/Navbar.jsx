import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SubscriptionModal, { normalizeTier } from './SubscriptionModal';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Movies', path: '/movies' },
  { label: 'Languages', path: '/languages' },
  { label: 'Top 10 Movies', path: '/top-10' },
  { label: 'My List', path: '/my-list' },
];

export default function Navbar({ onSearch }) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { user, activeProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Arrival: Devara: Part 1',
      description: 'Jr. NTR\'s blockbuster action spectacle is now streaming in 4K Ultra HD & Dolby Atmos.',
      time: '15m ago',
      unread: true,
      image: 'https://image.tmdb.org/t/p/w500/lQfuaXjANoTsdx5iS0gCXlK9D2L.jpg',
      path: '/',
    },
    {
      id: 2,
      title: 'Trending #1 in India: RRR',
      description: 'S.S. Rajamouli\'s Oscar-winning epic is the most watched movie today.',
      time: '2h ago',
      unread: true,
      image: 'https://image.tmdb.org/t/p/w500/u0XUBNQWlOvrh0Gd97ARGpIkL0.jpg',
      path: '/top-10',
    },
    {
      id: 3,
      title: 'Now Streaming: Pushpa: The Rise',
      description: 'Allu Arjun\'s iconic action drama is now available in high definition.',
      time: '1d ago',
      unread: true,
      image: 'https://image.tmdb.org/t/p/w500/jQIcn51nsvMrpB9NFwEOb9QHhFt.jpg',
      path: '/movies',
    },
    {
      id: 4,
      title: 'Explore Indian Languages',
      description: 'Stream top content in Telugu, Tamil, Hindi, Malayalam, and Kannada.',
      time: '2d ago',
      unread: false,
      icon: 'translate',
      path: '/languages',
    },
    {
      id: 5,
      title: 'Account Update: Ultra 4K Active',
      description: 'Your subscription tier supports streaming on up to 4 screens with spatial audio.',
      time: '3d ago',
      unread: false,
      icon: 'workspace_premium',
      path: '/settings',
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (item) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    setShowNotifications(false);
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-header' : 'bg-gradient-to-b from-[#0B0B0B]/95 via-[#0B0B0B]/70 to-transparent'
      }`}
      style={{ borderBottom: scrolled ? '1px solid rgba(32,31,31,0.6)' : 'none' }}
    >
      <div className="h-16 w-full px-6 md:px-14 flex items-center justify-between">
        {/* Left: Logo + Navigation */}
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-2 shrink-0 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <span className="text-headline-sm tracking-wider uppercase font-black">
              <span style={{ color: '#E50914' }}>CINE</span>
              <span className="text-white">WOOD</span>
            </span>
          </div>

          <nav className="hidden xl:flex items-center gap-4 text-label-lg">
            {NAV_LINKS.map((link) => (
              <a
                key={link.path}
                onClick={(e) => { e.preventDefault(); navigate(link.path); }}
                href={link.path}
                className={`transition-colors cursor-pointer ${
                  location.pathname === link.path
                    ? 'text-white font-bold'
                    : 'text-[#B3B3B3] hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Right: Search + Notifications + Profile */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex items-center">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Titles, people, genres"
                  className="w-48 md:w-64 px-4 py-1.5 text-body-md text-white placeholder-[#808080] border border-white rounded-sm"
                  style={{ background: 'rgba(0,0,0,0.75)' }}
                  onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  className="ml-2 text-white hover:text-[#B3B3B3] transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-1 text-white hover:text-[#B3B3B3] transition-colors cursor-pointer"
                title="Search"
              >
                <span className="material-symbols-outlined">search</span>
              </button>
            )}
          </div>

          {/* Subscription Plans / Admin Console Button */}
          {user?.role === 'ROLE_ADMIN' ? (
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
              style={{
                background: 'linear-gradient(135deg, rgba(229,9,20,0.95) 0%, rgba(147,0,7,0.95) 100%)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
              title="Open Admin Console"
            >
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1", color: '#FFD700' }}>
                admin_panel_settings
              </span>
              <span>Admin Console</span>
            </button>
          ) : (
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
              style={{
                background: 'linear-gradient(135deg, rgba(229,9,20,0.95) 0%, rgba(147,0,7,0.95) 100%)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
              title="Subscription Plans"
            >
              <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1", color: '#FFD700' }}>
                workspace_premium
              </span>
              <span>Plans</span>
            </button>
          )}

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowDropdown(false);
              }}
              className="relative p-1 text-white hover:text-[#B3B3B3] transition-colors cursor-pointer"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[24px]">notifications</span>
              {unreadCount > 0 && (
                <span
                  className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-[#E50914] ring-2 ring-[#0B0B0B]"
                />
              )}
            </button>

            {showNotifications && (
              <div
                className="absolute right-0 top-12 rounded-xl shadow-2xl overflow-hidden animate-slide-up"
                style={{
                  width: 'clamp(300px, 90vw, 380px)',
                  background: 'rgba(18, 18, 18, 0.97)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
                  zIndex: 60,
                }}
              >
                {/* Header */}
                <div
                  className="px-4 py-3 border-b border-white/10 flex items-center justify-between"
                  style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-headline-sm text-white font-bold" style={{ fontSize: '15px' }}>
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span
                        className="text-label-badge px-2 py-0.5 rounded-full font-bold"
                        style={{ background: '#E50914', color: '#fff', fontSize: '11px' }}
                      >
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-label-md text-[#B3B3B3] hover:text-white transition-colors cursor-pointer"
                      style={{ fontSize: '12px' }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className="p-3.5 flex gap-3 items-start hover:bg-white/[0.06] transition-colors cursor-pointer group"
                      style={{
                        background: item.unread ? 'rgba(229, 9, 20, 0.05)' : 'transparent',
                      }}
                    >
                      {/* Thumbnail / Icon */}
                      <div className="shrink-0 relative">
                        {item.image ? (
                          <div className="w-13 h-16 rounded overflow-hidden bg-[#2a2a2a] border border-white/10">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100&auto=format&fit=crop&q=80';
                              }}
                            />
                          </div>
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              background: 'linear-gradient(135deg, #E50914 0%, #930007 100%)',
                              color: '#fff',
                            }}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {item.icon || 'notifications'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <p className="text-body-sm font-semibold text-white truncate group-hover:text-[#E50914] transition-colors">
                            {item.title}
                          </p>
                          {item.unread && (
                            <span className="w-2 h-2 rounded-full bg-[#E50914] shrink-0" />
                          )}
                        </div>
                        <p className="text-body-sm text-[#A0A0A0] line-clamp-2 leading-snug" style={{ fontSize: '12px' }}>
                          {item.description}
                        </p>
                        <span className="text-label-md text-[#707070] mt-1.5 block" style={{ fontSize: '11px' }}>
                          {item.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div
                  className="px-4 py-2.5 border-t border-white/10 text-center"
                  style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                >
                  <p className="text-label-md text-[#808080]" style={{ fontSize: '11px' }}>
                    You are up to date with CineWood releases
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          {user && (
            <div className="relative" ref={profileRef}>
              <div
                className="flex items-center gap-1 cursor-pointer group"
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  setShowNotifications(false);
                }}
              >
                <div className="w-8 h-8 rounded overflow-hidden ring-1 ring-[#E50914]/40">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E50914] to-[#930007] flex items-center justify-center text-white text-label-lg font-bold">
                    {(activeProfile?.profileName || user.email)?.[0]?.toUpperCase()}
                  </div>
                </div>
                <span
                  className={`material-symbols-outlined text-[14px] text-white transition-transform duration-200 ${
                    showDropdown ? 'rotate-180' : ''
                  }`}
                >
                  arrow_drop_down
                </span>
              </div>

              {showDropdown && (
                <div
                  className="absolute right-0 top-12 w-52 rounded-lg py-2 shadow-2xl animate-slide-up"
                  style={{ background: 'rgba(20,20,20,0.96)', border: '1px solid rgba(255,255,255,0.15)', zIndex: 60 }}
                >
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-label-md text-[#B3B3B3]">Signed in as</p>
                    <p className="text-body-sm text-white truncate">{user.email}</p>
                  </div>
                  {activeProfile && (
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-label-md text-[#B3B3B3]">Profile</p>
                      <p className="text-body-sm text-white">{activeProfile.profileName}</p>
                    </div>
                  )}
                  <button
                    onClick={() => { navigate('/settings'); setShowDropdown(false); }}
                    className="w-full px-4 py-2 text-left text-body-sm text-[#B3B3B3] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Account Settings
                  </button>
                  {user.role === 'ROLE_ADMIN' ? (
                    <button
                      onClick={() => { navigate('/admin'); setShowDropdown(false); }}
                      className="w-full px-4 py-2 text-left text-body-sm text-[#E50914] font-semibold hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                      Admin Console
                    </button>
                  ) : (
                    <button
                      onClick={() => { setShowSubscriptionModal(true); setShowDropdown(false); }}
                      className="w-full px-4 py-2 text-left text-body-sm text-[#FFD700] hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                      Subscription Plans
                    </button>
                  )}
                  <div className="border-t border-white/10 mt-1">
                    <button
                      onClick={() => { logout(); navigate('/auth'); setShowDropdown(false); }}
                      className="w-full px-4 py-2 text-left text-body-sm text-[#B3B3B3] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </header>
  );
}
