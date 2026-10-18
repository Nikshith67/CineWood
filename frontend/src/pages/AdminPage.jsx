import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  adminGetAllMedia, adminCreateMedia, adminUpdateMedia, adminDeleteMedia,
  adminGetAllUsers, getPaymentTransactions,
} from '../services/api';

const EMPTY_FORM = {
  title: '', description: '', type: 'MOVIE', releaseYear: 2024, ageRating: 'UA 13+',
  durationMinutes: 120, language: 'Telugu', thumbnailUrl: '', bannerUrl: '',
  videoStreamUrl: '', isFeatured: false, isTrending: false, matchPercentage: '90% Match',
  cast: '', director: '', genreNames: [],
};

const GENRE_OPTIONS = ['Action', 'Drama', 'Thriller', 'Romance', 'Comedy', 'Sci-Fi', 'Horror', 'Documentary', 'Fantasy', 'Crime', 'Adventure', 'Animation'];
const LANGUAGE_OPTIONS = ['Telugu', 'Tamil', 'Kannada', 'Hindi', 'English', 'Malayalam'];
const AGE_OPTIONS = ['U', 'U/A', 'UA 7+', 'UA 13+', 'UA 16+', 'A'];

const NAV_SECTIONS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'movies', label: 'Movies', icon: 'movie' },
  { key: 'users', label: 'Users', icon: 'group' },
  { key: 'payments', label: 'Payments', icon: 'receipt_long' },
];

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('dashboard');
  const [media, setMedia] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formError, setFormError] = useState('');
  const [movieSearch, setMovieSearch] = useState('');
  const [movieLangFilter, setMovieLangFilter] = useState('ALL');
  const [movieTypeFilter, setMovieTypeFilter] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [transactions, setTransactions] = useState([]);

  const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminGetAllMedia();
      setMedia(res.data);
    } catch {
      // Failed to load media
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await adminGetAllUsers();
      setUsers(res.data);
    } catch {
      // Failed to load users
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      const res = await getPaymentTransactions();
      setTransactions(res.data || []);
    } catch {
      // Failed to load transactions
    }
  }, []);

  useEffect(() => {
    loadMedia();
    loadUsers();
    loadTransactions();
  }, [loadMedia, loadUsers, loadTransactions]);

  const handleCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditing(item.id);
    setForm({
      title: item.title || '',
      description: item.description || '',
      type: item.type || 'MOVIE',
      releaseYear: item.releaseYear || 2024,
      ageRating: item.ageRating || 'UA 13+',
      durationMinutes: item.durationMinutes || 120,
      language: item.language || 'Telugu',
      thumbnailUrl: item.thumbnailUrl || '',
      bannerUrl: item.bannerUrl || '',
      videoStreamUrl: item.videoStreamUrl || '',
      isFeatured: item.isFeatured || false,
      isTrending: item.isTrending || false,
      matchPercentage: item.matchPercentage || '90% Match',
      cast: item.cast || '',
      director: item.director || '',
      genreNames: item.genres || [],
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editing) {
        await adminUpdateMedia(editing, form);
      } else {
        await adminCreateMedia(form);
      }
      setShowForm(false);
      setForm({ ...EMPTY_FORM });
      setEditing(null);
      await loadMedia();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to save. Please try again.';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminDeleteMedia(id);
      setDeleteConfirm(null);
      await loadMedia();
    } catch {
      // Failed to delete media
    }
  };

  const toggleGenre = (genre) => {
    setForm(prev => ({
      ...prev,
      genreNames: prev.genreNames.includes(genre)
        ? prev.genreNames.filter(g => g !== genre)
        : [...prev.genreNames, genre],
    }));
  };

  // =================== CALCULATED METRICS ===================
  const totalViews = media.reduce((acc, m) => acc + (m.viewCount || 0), 0);
  const moviesCount = media.filter(m => m.type === 'MOVIE').length;
  const seriesCount = media.filter(m => m.type === 'SERIES').length;

  const adminUsers = users.filter(u => u.role === 'ROLE_ADMIN');
  const regularUsers = users.filter(u => u.role !== 'ROLE_ADMIN');
  const monthlySubs = regularUsers.filter(u => (u.subscriptionTier || '').toUpperCase() === 'MONTHLY');
  const annualSubs = regularUsers.filter(u => (u.subscriptionTier || '').toUpperCase() === 'ANNUAL');
  const freeUsers = regularUsers.filter(u => {
    const tier = (u.subscriptionTier || '').toUpperCase();
    return tier === 'FREE' || tier === 'GENERAL' || !tier;
  });

  const estMonthlyRev = (monthlySubs.length * 199) + Math.round((annualSubs.length * 1299) / 12);

  const langCounts = LANGUAGE_OPTIONS.reduce((acc, lang) => {
    acc[lang] = media.filter(m => (m.language || '').toLowerCase() === lang.toLowerCase()).length;
    return acc;
  }, {});

  const topContent = [...media].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5);

  const filteredMedia = media.filter(item => {
    const matchesSearch = !movieSearch || 
      item.title?.toLowerCase().includes(movieSearch.toLowerCase()) ||
      item.cast?.toLowerCase().includes(movieSearch.toLowerCase()) ||
      item.director?.toLowerCase().includes(movieSearch.toLowerCase());
    const matchesLang = movieLangFilter === 'ALL' || (item.language || '').toLowerCase() === movieLangFilter.toLowerCase();
    const matchesType = movieTypeFilter === 'ALL' || item.type === movieTypeFilter;
    return matchesSearch && matchesLang && matchesType;
  });

  const filteredUsers = users.filter(u => {
    const matchesSearch = !userSearch ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      String(u.id).includes(userSearch);
    const matchesRole = userRoleFilter === 'ALL' ||
      (userRoleFilter === 'ROLE_ADMIN' && u.role === 'ROLE_ADMIN') ||
      (userRoleFilter === 'ROLE_USER' && u.role !== 'ROLE_ADMIN') ||
      (userRoleFilter === 'SUBSCRIBER' && u.role !== 'ROLE_ADMIN' && ['MONTHLY', 'ANNUAL'].includes((u.subscriptionTier || '').toUpperCase())) ||
      (userRoleFilter === 'FREE' && u.role !== 'ROLE_ADMIN' && !['MONTHLY', 'ANNUAL'].includes((u.subscriptionTier || '').toUpperCase()));
    return matchesSearch && matchesRole;
  });

  // =================== RENDER SECTIONS ===================

  const renderDashboard = () => (
    <>
      {/* Clean & Minimal Header */}
      <div className="admin-page-header mb-6">
        <div>
          <h1 className="admin-page-title">Dashboard Overview</h1>
          <p className="text-xs text-[#808080] mt-1">
            Administrator: <strong className="text-white">{user?.email}</strong> • Full Access
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreate}
            className="admin-add-btn"
          >
            <span className="material-symbols-outlined">add</span>
            Add Media
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-[#CCCCCC] hover:text-white transition-all cursor-pointer flex items-center gap-1.5 border border-white/10 hover:border-white/20"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            Back to Browse
          </button>
        </div>
      </div>

      {/* Clean 4 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Content', value: media.length, sub: `${moviesCount} Movies • ${seriesCount} Series`, icon: 'movie', color: '#E50914' },
          { label: 'Platform Users', value: users.length, sub: `${adminUsers.length} Admin • ${regularUsers.length} Standard`, icon: 'group', color: '#3B82F6' },
          { label: 'Paid Subscribers', value: monthlySubs.length + annualSubs.length, sub: `${monthlySubs.length} Monthly • ${annualSubs.length} Annual`, icon: 'workspace_premium', color: '#FFD700' },
          { label: 'Total Stream Views', value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews, sub: 'Across all titles', icon: 'play_circle', color: '#46D369' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-xl border flex flex-col justify-between transition-all hover:border-white/20"
            style={{ background: '#141414', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#808080] uppercase tracking-wider">{stat.label}</span>
              <span className="material-symbols-outlined text-[22px]" style={{ color: stat.color, fontVariationSettings: "'FILL' 1" }}>
                {stat.icon}
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {stat.value}
              </div>
              <div className="text-xs text-[#808080] mt-1 truncate">{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>



      {/* Top Performing Content Leaderboard */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="admin-page-title" style={{ fontSize: '20px' }}>Top Performing Content</h2>
        <button
          onClick={() => setSection('movies')}
          className="text-xs text-[#E50914] hover:underline font-bold cursor-pointer"
        >
          View Full Catalog →
        </button>
      </div>

      <div className="admin-table-wrap mb-6">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Poster</th>
                <th>Title</th>
                <th>Language</th>
                <th>Type</th>
                <th>Match</th>
                <th>Plays / Views</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {topContent.map(item => (
                <tr key={item.id}>
                  <td><img src={item.thumbnailUrl} alt="" className="admin-table-poster" /></td>
                  <td>
                    <div className="admin-table-title">{item.title}</div>
                    <div className="admin-table-sub">{item.genres?.slice(0, 3).join(', ')}</div>
                  </td>
                  <td><span className="pill-badge">{item.language}</span></td>
                  <td><span className="pill-badge">{item.type}</span></td>
                  <td><span className="text-xs font-bold text-[#46D369]">{item.matchPercentage || '95% Match'}</span></td>
                  <td><span className="text-sm font-bold text-white">{item.viewCount != null ? `${(item.viewCount / 1000).toFixed(0)}K` : '—'}</span></td>
                  <td>
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderMovies = () => (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Content & Catalog Management</h1>
          <p className="text-xs text-[#808080] mt-1">Manage movies, streaming sources, metadata, and age ratings</p>
        </div>
        <button onClick={handleCreate} className="admin-add-btn">
          <span className="material-symbols-outlined">add</span>
          Add Media
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 rounded-xl bg-[#141414] border border-white/5">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <span className="material-symbols-outlined text-[#808080]">search</span>
          <input
            type="text"
            placeholder="Search by title, cast, or director..."
            value={movieSearch}
            onChange={(e) => setMovieSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-[#808080] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Type Filter */}
          <select
            value={movieTypeFilter}
            onChange={(e) => setMovieTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#222] text-white border border-white/10 outline-none cursor-pointer"
          >
            <option value="ALL">All Formats</option>
            <option value="MOVIE">Movies Only</option>
            <option value="SERIES">Series Only</option>
          </select>

          {/* Language Filter */}
          <select
            value={movieLangFilter}
            onChange={(e) => setMovieLangFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#222] text-white border border-white/10 outline-none cursor-pointer"
          >
            <option value="ALL">All Languages</option>
            {LANGUAGE_OPTIONS.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          {(movieSearch || movieLangFilter !== 'ALL' || movieTypeFilter !== 'ALL') && (
            <button
              onClick={() => { setMovieSearch(''); setMovieLangFilter('ALL'); setMovieTypeFilter('ALL'); }}
              className="text-xs text-[#E50914] hover:underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div className="auth-spinner-icon" style={{ width: '32px', height: '32px', borderColor: '#E50914', borderTopColor: 'transparent' }} />
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#141414] border border-white/5">
          <p className="text-white text-base font-semibold">No media titles found</p>
          <p className="text-xs text-[#808080] mt-1">Try modifying your search or language filter</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Poster</th>
                  <th>Title</th>
                  <th>Language</th>
                  <th>Year</th>
                  <th>Type</th>
                  <th>Age</th>
                  <th>Featured</th>
                  <th>Trending</th>
                  <th>Views</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedia.map(item => (
                  <tr key={item.id}>
                    <td><img src={item.thumbnailUrl} alt="" className="admin-table-poster" /></td>
                    <td>
                      <div className="admin-table-title">{item.title}</div>
                      <div className="admin-table-sub">{item.genres?.join(', ')}</div>
                    </td>
                    <td><span className="pill-badge">{item.language}</span></td>
                    <td>{item.releaseYear}</td>
                    <td><span className="pill-badge">{item.type}</span></td>
                    <td><span className="maturity-tag">{item.ageRating}</span></td>
                    <td>
                      <span className="material-symbols-outlined" style={{
                        fontSize: '18px',
                        color: item.isFeatured ? '#46D369' : '#555',
                        fontVariationSettings: "'FILL' 1",
                      }}>
                        {item.isFeatured ? 'check_circle' : 'cancel'}
                      </span>
                    </td>
                    <td>
                      <span className="material-symbols-outlined" style={{
                        fontSize: '18px',
                        color: item.isTrending ? '#46D369' : '#555',
                        fontVariationSettings: "'FILL' 1",
                      }}>
                        {item.isTrending ? 'check_circle' : 'cancel'}
                      </span>
                    </td>
                    <td>{item.viewCount != null ? `${(item.viewCount / 1000).toFixed(0)}K` : '—'}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button onClick={() => handleEdit(item)} className="admin-action-btn" title="Edit">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button onClick={() => setDeleteConfirm(item.id)} className="admin-action-btn danger" title="Delete">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );

  const renderUsers = () => (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">User & Account Management</h1>
          <p className="text-xs text-[#808080] mt-1">Review user roles, subscription tiers, and system access rights</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 rounded-xl bg-[#141414] border border-white/5">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <span className="material-symbols-outlined text-[#808080]">search</span>
          <input
            type="text"
            placeholder="Search users by email or ID..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-[#808080] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'ALL', label: `All (${users.length})` },
            { id: 'ROLE_ADMIN', label: `Admins (${adminUsers.length})` },
            { id: 'SUBSCRIBER', label: `Paid (${monthlySubs.length + annualSubs.length})` },
            { id: 'FREE', label: `Free (${freeUsers.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setUserRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                userRoleFilter === tab.id
                  ? 'bg-[#E50914] text-white shadow'
                  : 'bg-[#222] text-[#B3B3B3] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Subscription Status</th>
                <th>Profiles</th>
                <th>Account Status</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => {
                const isAdmin = u.role === 'ROLE_ADMIN';
                const subTier = (u.subscriptionTier || '').toUpperCase();

                return (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow"
                          style={{
                            background: isAdmin
                              ? 'linear-gradient(135deg, #E50914 0%, #930007 100%)'
                              : 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                          }}
                        >
                          {u.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{u.email}</div>
                          <div className="text-[11px] text-[#808080]">User ID: #{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {isAdmin ? (
                        <span className="pill-badge" style={{ background: '#E50914', color: '#FFFFFF', fontWeight: 800 }}>
                          👑 ADMIN (ROOT)
                        </span>
                      ) : (
                        <span className="pill-badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                          STANDARD USER
                        </span>
                      )}
                    </td>
                    <td>
                      {isAdmin ? (
                        <span
                          className="pill-badge"
                          style={{
                            background: 'linear-gradient(135deg, rgba(229,9,20,0.2) 0%, rgba(229,9,20,0.4) 100%)',
                            color: '#FFAAAA',
                            border: '1px solid rgba(229,9,20,0.5)',
                            fontWeight: 700,
                          }}
                        >
                          FULL ACCESS • NO PLAN NEEDED
                        </span>
                      ) : subTier === 'ANNUAL' ? (
                        <span
                          className="pill-badge"
                          style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#DDD6FE', border: '1px solid rgba(168, 85, 247, 0.4)', fontWeight: 600 }}
                        >
                          Annual VIP (₹1299)
                        </span>
                      ) : subTier === 'MONTHLY' ? (
                        <span
                          className="pill-badge"
                          style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93C5FD', border: '1px solid rgba(59, 130, 246, 0.4)', fontWeight: 600 }}
                        >
                          Monthly (₹199)
                        </span>
                      ) : (
                        <span
                          className="pill-badge"
                          style={{ background: 'rgba(107, 114, 128, 0.2)', color: '#9CA3AF', border: '1px solid rgba(107, 114, 128, 0.3)' }}
                        >
                          General Free Tier
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-white">
                        {u.profileCount || 1} Profile{(u.profileCount || 1) !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-[#46D369] font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#46D369]" />
                        Active
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-[#808080]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderPayments = () => (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Payment & Subscription Transactions</h1>
          <p className="text-xs text-[#808080] mt-1">Audit log of Razorpay subscription payments, order IDs, and bank settlement status</p>
        </div>
        <button
          onClick={loadTransactions}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#222] hover:bg-[#333] text-white border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Refresh
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#141414] border border-white/5">
          <span className="material-symbols-outlined text-4xl text-[#808080] mb-2">receipt_long</span>
          <p className="text-white text-base font-semibold">No payment transactions recorded yet</p>
          <p className="text-xs text-[#808080] mt-1">When users subscribe to Monthly (₹199) or Annual (₹1299) plans, verified transactions will appear here.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Email</th>
                  <th>Plan Tier</th>
                  <th>Amount</th>
                  <th>Payment ID</th>
                  <th>Status</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id || tx.orderId}>
                    <td>
                      <span className="font-mono text-xs text-white">{tx.orderId}</span>
                    </td>
                    <td>
                      <span className="text-sm font-semibold text-white">{tx.userEmail}</span>
                    </td>
                    <td>
                      <span
                        className="pill-badge"
                        style={{
                          background: tx.planId === 'ANNUAL' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                          color: tx.planId === 'ANNUAL' ? '#DDD6FE' : '#93C5FD',
                          border: tx.planId === 'ANNUAL' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(59, 130, 246, 0.4)',
                          fontWeight: 600,
                        }}
                      >
                        {tx.planId === 'ANNUAL' ? 'Annual VIP (₹1299)' : 'Monthly (₹199)'}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm font-bold text-white">₹{tx.amount?.toFixed(2)}</span>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-[#808080]">{tx.paymentId || '—'}</span>
                    </td>
                    <td>
                      <span
                        className="pill-badge"
                        style={{
                          background: tx.status === 'SUCCESS' ? 'rgba(70, 211, 105, 0.15)' : 'rgba(229, 9, 20, 0.15)',
                          color: tx.status === 'SUCCESS' ? '#46D369' : '#E50914',
                          border: tx.status === 'SUCCESS' ? '1px solid rgba(70, 211, 105, 0.3)' : '1px solid rgba(229, 9, 20, 0.3)',
                          fontWeight: 700,
                        }}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-[#808080]">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );

  // =================== MAIN RETURN ===================

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <span className="text-headline-sm" style={{ letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 900 }}>
            <span style={{ color: '#E50914' }}>CINE</span>
            <span style={{ color: '#FFFFFF' }}>WOOD</span>
          </span>
          <span className="admin-sidebar-badge">Admin</span>
        </div>

        <nav className="admin-sidebar-nav">
          {NAV_SECTIONS.map(s => (
            <button
              key={s.key}
              className={`admin-nav-item ${section === s.key ? 'active' : ''}`}
              onClick={() => setSection(s.key)}
            >
              <span className="material-symbols-outlined">{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={() => navigate('/')} className="admin-browse-link">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
            <span>Back to Browse</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {section === 'dashboard' && renderDashboard()}
        {section === 'movies' && renderMovies()}
        {section === 'users' && renderUsers()}
        {section === 'payments' && renderPayments()}
      </main>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div
            className="animate-slide-up"
            style={{
              width: '100%',
              maxWidth: '672px',
              margin: '0 16px',
              borderRadius: '12px',
              overflow: 'hidden',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#141414',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '24px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 className="text-headline-md" style={{ color: '#FFFFFF' }}>{editing ? 'Edit Media' : 'Add New Media'}</h2>
                <button onClick={() => setShowForm(false)} style={{ color: '#808080', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {formError && (
                <div className="auth-error" style={{ marginBottom: '16px' }}>
                  <span className="material-symbols-outlined">error</span>
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Title */}
                <div>
                  <label className="text-label-md text-[#B3B3B3] block mb-1">Title *</label>
                  <input type="text" value={form.title} onChange={(e) => setForm(p => ({...p, title: e.target.value}))} required
                    className="w-full px-4 py-2.5 rounded-lg text-body-md text-white placeholder-[#808080] outline-none focus:ring-2 focus:ring-[#E50914]/50"
                    style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>

                {/* Description */}
                <div>
                  <label className="text-label-md text-[#B3B3B3] block mb-1">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm(p => ({...p, description: e.target.value}))} rows={3}
                    className="w-full px-4 py-2.5 rounded-lg text-body-md text-white placeholder-[#808080] outline-none resize-none focus:ring-2 focus:ring-[#E50914]/50"
                    style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>

                {/* Row: Type, Language, Year */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-label-md text-[#B3B3B3] block mb-1">Type</label>
                    <select value={form.type} onChange={(e) => setForm(p => ({...p, type: e.target.value}))}
                      className="w-full px-3 py-2.5 rounded-lg text-body-md text-white outline-none"
                      style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <option value="MOVIE">Movie</option>
                      <option value="SERIES">Series</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-label-md text-[#B3B3B3] block mb-1">Language</label>
                    <select value={form.language} onChange={(e) => setForm(p => ({...p, language: e.target.value}))}
                      className="w-full px-3 py-2.5 rounded-lg text-body-md text-white outline-none"
                      style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {LANGUAGE_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-label-md text-[#B3B3B3] block mb-1">Year</label>
                    <input type="number" value={form.releaseYear} onChange={(e) => setForm(p => ({...p, releaseYear: parseInt(e.target.value) || 2024}))}
                      className="w-full px-3 py-2.5 rounded-lg text-body-md text-white outline-none"
                      style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                </div>

                {/* Row: Age Rating, Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-label-md text-[#B3B3B3] block mb-1">Age Rating</label>
                    <select value={form.ageRating} onChange={(e) => setForm(p => ({...p, ageRating: e.target.value}))}
                      className="w-full px-3 py-2.5 rounded-lg text-body-md text-white outline-none"
                      style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {AGE_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-label-md text-[#B3B3B3] block mb-1">Duration (min)</label>
                    <input type="number" value={form.durationMinutes} onChange={(e) => setForm(p => ({...p, durationMinutes: parseInt(e.target.value) || 120}))}
                      className="w-full px-3 py-2.5 rounded-lg text-body-md text-white outline-none"
                      style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                </div>

                {/* URLs */}
                <div>
                  <label className="text-label-md text-[#B3B3B3] block mb-1">Poster / Thumbnail URL</label>
                  <input type="url" value={form.thumbnailUrl} onChange={(e) => setForm(p => ({...p, thumbnailUrl: e.target.value}))}
                    placeholder="https://image.tmdb.org/t/p/w500/..."
                    className="w-full px-4 py-2.5 rounded-lg text-body-md text-white placeholder-[#808080] outline-none"
                    style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div>
                  <label className="text-label-md text-[#B3B3B3] block mb-1">Banner URL</label>
                  <input type="url" value={form.bannerUrl} onChange={(e) => setForm(p => ({...p, bannerUrl: e.target.value}))}
                    placeholder="https://image.tmdb.org/t/p/original/..."
                    className="w-full px-4 py-2.5 rounded-lg text-body-md text-white placeholder-[#808080] outline-none"
                    style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div>
                  <label className="text-label-md text-[#B3B3B3] block mb-1">Video Stream URL</label>
                  <input type="url" value={form.videoStreamUrl} onChange={(e) => setForm(p => ({...p, videoStreamUrl: e.target.value}))}
                    placeholder="https://...m3u8 or .mp4"
                    className="w-full px-4 py-2.5 rounded-lg text-body-md text-white placeholder-[#808080] outline-none"
                    style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>

                {/* Cast & Director */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-label-md text-[#B3B3B3] block mb-1">Cast</label>
                    <input type="text" value={form.cast} onChange={(e) => setForm(p => ({...p, cast: e.target.value}))}
                      placeholder="Actor 1, Actor 2"
                      className="w-full px-4 py-2.5 rounded-lg text-body-md text-white placeholder-[#808080] outline-none"
                      style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                  <div>
                    <label className="text-label-md text-[#B3B3B3] block mb-1">Director</label>
                    <input type="text" value={form.director} onChange={(e) => setForm(p => ({...p, director: e.target.value}))}
                      className="w-full px-4 py-2.5 rounded-lg text-body-md text-white placeholder-[#808080] outline-none"
                      style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="w-5 h-5 rounded flex items-center justify-center"
                      style={{ background: form.isFeatured ? '#E50914' : '#2a2a2a', border: form.isFeatured ? 'none' : '1px solid rgba(255,255,255,0.3)' }}
                      onClick={() => setForm(p => ({...p, isFeatured: !p.isFeatured}))}>
                      {form.isFeatured && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                    </div>
                    <span className="text-body-sm text-[#B3B3B3]">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="w-5 h-5 rounded flex items-center justify-center"
                      style={{ background: form.isTrending ? '#E50914' : '#2a2a2a', border: form.isTrending ? 'none' : '1px solid rgba(255,255,255,0.3)' }}
                      onClick={() => setForm(p => ({...p, isTrending: !p.isTrending}))}>
                      {form.isTrending && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                    </div>
                    <span className="text-body-sm text-[#B3B3B3]">Trending</span>
                  </label>
                </div>

                {/* Genres */}
                <div>
                  <label className="text-label-md text-[#B3B3B3] block mb-2">Genres</label>
                  <div className="flex flex-wrap gap-2">
                    {GENRE_OPTIONS.map(g => (
                      <button key={g} type="button" onClick={() => toggleGenre(g)}
                        className={`px-3 py-1.5 rounded-full text-label-md transition-all ${
                          form.genreNames.includes(g) ? 'bg-[#E50914] text-white' : 'bg-[#2a2a2a] text-[#B3B3B3] hover:bg-[#353534]'
                        }`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 mt-2">
                  <button type="submit" disabled={saving}
                    className="flex-1 py-3 rounded-lg text-label-lg font-bold text-white"
                    style={{ background: saving ? '#666' : '#E50914', cursor: saving ? 'not-allowed' : 'pointer' }}>
                    {saving ? 'Saving...' : (editing ? 'Update Media' : 'Create Media')}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-3 rounded-lg text-label-lg font-bold text-white" style={{ background: '#2a2a2a' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div
            style={{
              width: '100%',
              maxWidth: '384px',
              margin: '0 16px',
              borderRadius: '12px',
              padding: '24px',
              background: '#141414',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            }}
            className="animate-slide-up"
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '30px', color: '#E50914' }}>warning</span>
              <h3 className="text-headline-sm" style={{ color: '#FFFFFF' }}>Delete Media?</h3>
            </div>
            <p className="text-body-md" style={{ color: '#B3B3B3', marginBottom: '24px' }}>This action cannot be undone. The media item will be permanently removed.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="text-label-lg"
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: '8px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  background: '#E50914',
                  border: 'none',
                  cursor: 'pointer',
                }}>
                Delete
              </button>
              <button onClick={() => setDeleteConfirm(null)}
                className="text-label-lg"
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: '8px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  background: '#2a2a2a',
                  border: 'none',
                  cursor: 'pointer',
                }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
