import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfiles, createProfile } from '../services/api';

const AVATAR_COLORS = [
  'linear-gradient(135deg, #E50914 0%, #930007 100%)',
  'linear-gradient(135deg, #1DB954 0%, #0d8a3e 100%)',
  'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
  'linear-gradient(135deg, #06B6D4 0%, #0E7490 100%)',
];

export default function ProfilesPage() {
  const { user, selectProfile, activeProfile } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [isKids, setIsKids] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      loadProfiles();
    }
  }, [user]);

  const loadProfiles = async () => {
    try {
      const res = await getProfiles(user.userId);
      setProfiles(res.data);
    } catch (err) {
      console.error('Failed to load profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = (profile) => {
    selectProfile(profile);
    navigate('/', { replace: true });
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createProfile(user.userId, {
        profileName: newName.trim(),
        isKids,
      });
      setNewName('');
      setIsKids(false);
      setShowCreate(false);
      await loadProfiles();
    } catch (err) {
      console.error('Failed to create profile:', err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0B0B0B' }}>
        <div className="w-10 h-10 border-3 border-[#E50914] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4"
      style={{ background: '#0B0B0B' }}>

      {/* Title */}
      <h1 className="text-headline-lg md:text-display-hero-mobile text-white mb-2 animate-fade-in">
        Who's Watching?
      </h1>
      <p className="text-body-md text-[#808080] mb-12 animate-fade-in">
        Select your profile to continue
      </p>

      {/* Profile Grid */}
      <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
        {profiles.map((profile, index) => (
          <button
            key={profile.id}
            onClick={() => handleSelectProfile(profile)}
            className="group flex flex-col items-center gap-3 transition-transform hover:scale-105 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Avatar */}
            <div className="relative">
              <div
                className="w-24 h-24 md:w-32 md:h-32 rounded-lg flex items-center justify-center text-white text-headline-lg font-bold shadow-lg transition-all group-hover:ring-2 group-hover:ring-white/60"
                style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
              >
                {profile.isKids ? (
                  <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>child_care</span>
                ) : (
                  <span className="text-3xl md:text-4xl">{profile.profileName?.[0]?.toUpperCase()}</span>
                )}
              </div>
              {/* Active indicator */}
              {activeProfile?.id === profile.id && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#E50914] flex items-center justify-center border-2 border-[#0B0B0B]">
                  <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </div>
              )}
            </div>
            {/* Name */}
            <span className="text-label-lg text-[#808080] group-hover:text-white transition-colors">
              {profile.profileName}
            </span>
            {profile.isKids && (
              <span className="text-label-badge text-[#46D369]">KIDS</span>
            )}
          </button>
        ))}

        {/* Add Profile Button */}
        {profiles.length < 5 && (
          <button
            onClick={() => setShowCreate(true)}
            className="group flex flex-col items-center gap-3 transition-transform hover:scale-105 animate-fade-in"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg flex items-center justify-center border-2 border-dashed border-[#808080] group-hover:border-white transition-colors">
              <span className="material-symbols-outlined text-5xl text-[#808080] group-hover:text-white transition-colors">add</span>
            </div>
            <span className="text-label-lg text-[#808080] group-hover:text-white transition-colors">Add Profile</span>
          </button>
        )}
      </div>

      {/* Manage / Admin Controls Link */}
      <button
        onClick={() => navigate(user?.role === 'ROLE_ADMIN' ? '/admin' : '/settings')}
        className="px-8 py-2.5 rounded text-label-lg text-[#B3B3B3] hover:text-white transition-colors cursor-pointer"
        style={{ border: '1px solid rgba(255,255,255,0.3)' }}
      >
        {user?.role === 'ROLE_ADMIN' ? 'Admin Controls' : 'Manage'}
      </button>

      {/* Create Profile Modal */}
      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div
            className="w-full max-w-md mx-4 rounded-xl p-8 animate-slide-up"
            style={{
              background: '#141414',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-headline-md text-white mb-6">Add Profile</h2>

            <form onSubmit={handleCreateProfile} className="flex flex-col gap-4">
              <div>
                <label className="text-label-md text-[#B3B3B3] block mb-1.5">Profile Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter a name"
                  maxLength={50}
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg text-body-md text-white placeholder-[#808080] outline-none focus:ring-2 focus:ring-[#E50914]/50"
                  style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                  style={{
                    background: isKids ? '#E50914' : '#2a2a2a',
                    border: isKids ? 'none' : '1px solid rgba(255,255,255,0.3)'
                  }}
                  onClick={() => setIsKids(!isKids)}
                >
                  {isKids && <span className="material-symbols-outlined text-white text-[16px]">check</span>}
                </div>
                <span className="text-body-md text-[#B3B3B3]">Kids profile</span>
              </label>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 rounded-lg text-label-lg font-bold text-white transition-all"
                  style={{
                    background: creating ? '#666' : '#E50914',
                    cursor: creating ? 'not-allowed' : 'pointer'
                  }}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 rounded-lg text-label-lg font-bold text-white transition-all"
                  style={{ background: '#2a2a2a' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
