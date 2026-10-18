import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfiles, deleteProfile } from '../services/api';
import SubscriptionModal, { PLANS, normalizeTier } from '../components/SubscriptionModal';

export default function SettingsPage() {
  const { user, activeProfile, logout, selectProfile } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      loadProfiles();
    }
  }, [user]);

  const loadProfiles = async () => {
    try {
      const res = await getProfiles(user.userId);
      setProfiles(res.data);
    } catch {
      // Failed to load profiles
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId) => {
    try {
      await deleteProfile(profileId);
      setDeleteConfirm(null);
      // If we deleted the active profile, clear it
      if (activeProfile?.id === profileId) {
        selectProfile(null);
      }
      await loadProfiles();
    } catch {
      // Failed to delete profile
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/auth', { replace: true });
  };

  const normalizedTier = normalizeTier(user?.subscriptionTier);
  const currentPlan = PLANS.find((p) => p.id === normalizedTier) || PLANS[0];

  return (
    <div style={{ minHeight: '100vh', background: '#0B0B0B' }}>
      {/* Header */}
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          height: '64px', padding: '0 56px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
        className="glass-header"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="text-headline-sm" style={{ letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 900, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <span style={{ color: '#E50914' }}>CINE</span>
            <span style={{ color: '#FFFFFF' }}>WOOD</span>
          </span>
        </div>
        <button onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#B3B3B3', fontSize: '14px', fontWeight: 600,
          }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Back to Browse
        </button>
      </header>

      <div style={{ paddingTop: '100px', paddingBottom: '64px', paddingLeft: '56px', paddingRight: '56px', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 className="text-headline-lg animate-fade-in" style={{ color: '#FFFFFF', marginBottom: '36px' }}>Account Settings</h1>

        {/* Account Info Card */}
        <div className="animate-fade-in"
          style={{
            borderRadius: '12px', padding: '32px 40px', marginBottom: '28px',
            background: '#141414', border: '1px solid rgba(255,255,255,0.06)',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#E50914' }}>person</span>
            <h2 className="text-headline-sm" style={{ color: '#FFFFFF' }}>Account</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 40px' }}>
            <div>
              <p className="text-label-md" style={{ color: '#808080', marginBottom: '6px' }}>Email</p>
              <p className="text-body-md" style={{ color: '#FFFFFF' }}>{user?.email}</p>
            </div>
            <div>
              <p className="text-label-md" style={{ color: '#808080', marginBottom: '6px' }}>Role</p>
              <p className="text-body-md" style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {user?.role === 'ROLE_ADMIN' ? (
                  <>
                    <span className="text-label-badge" style={{ background: '#E50914', color: '#fff', padding: '2px 10px', borderRadius: '4px' }}>ADMIN</span>
                    Administrator
                  </>
                ) : 'Standard User'}
              </p>
            </div>
            <div>
              <p className="text-label-md" style={{ color: '#808080', marginBottom: '6px' }}>User ID</p>
              <p className="text-body-md" style={{ color: '#B3B3B3' }}>#{user?.userId}</p>
            </div>
            <div>
              <p className="text-label-md" style={{ color: '#808080', marginBottom: '6px' }}>Active Profile</p>
              <p className="text-body-md" style={{ color: '#FFFFFF' }}>{activeProfile?.profileName || 'None selected'}</p>
            </div>
          </div>
        </div>

        {/* Subscription / Admin Privileges Card */}
        {user?.role === 'ROLE_ADMIN' ? (
          <div className="animate-fade-in"
            style={{
              borderRadius: '12px', padding: '32px 40px', marginBottom: '28px',
              background: 'linear-gradient(135deg, rgba(229,9,20,0.12) 0%, rgba(20,20,20,0.95) 100%)',
              border: '1px solid rgba(229,9,20,0.4)',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#E50914', fontVariationSettings: "'FILL' 1" }}>
                  admin_panel_settings
                </span>
                <div>
                  <h2 className="text-headline-sm" style={{ color: '#FFFFFF' }}>Platform Administrator Access</h2>
                  <p className="text-body-sm text-[#B3B3B3]">System owner privileges — no subscription plan required</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="text-label-lg" style={{
                  fontWeight: 800, padding: '6px 18px', borderRadius: '9999px',
                  background: '#E50914', color: '#FFFFFF',
                  letterSpacing: '0.05em',
                  boxShadow: '0 4px 14px rgba(229,9,20,0.4)'
                }}>
                  FULL ACCESS • UNLIMITED
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 shadow"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  <span className="material-symbols-outlined text-[16px]">dashboard</span>
                  Open Admin Console
                </button>
              </div>
            </div>
            <p className="text-body-sm text-[#CCCCCC] mb-4">
              As platform administrator, your account is exempt from paywalls and plan limits. You have unrestricted 4K Ultra HD streaming, multi-screen access, full catalog management, and user oversight.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              {['Unlimited 4K Ultra HD + HDR', 'Unlimited Screens & Profiles', 'Full Content & Media Management', 'User & Membership Analytics', 'System Configuration Control'].map(feat => (
                <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#E50914', fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="text-body-sm" style={{ color: '#E0E0E0' }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-fade-in"
            style={{
              borderRadius: '12px', padding: '32px 40px', marginBottom: '28px',
              background: '#141414', border: `1px solid ${currentPlan.color}40`,
            }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: currentPlan.color, fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                <div>
                  <h2 className="text-headline-sm" style={{ color: '#FFFFFF' }}>Subscription Plan</h2>
                  <p className="text-body-sm text-[#808080]">Manage your membership tier and streaming quality</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="text-label-lg" style={{
                  fontWeight: 700, padding: '4px 16px', borderRadius: '9999px',
                  background: `${currentPlan.color}20`, color: currentPlan.color,
                  border: `1px solid ${currentPlan.color}50`
                }}>
                  {currentPlan.name} • {currentPlan.price}
                </span>
                <button
                  type="button"
                  onClick={() => setShowSubscriptionModal(true)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 shadow"
                  style={{ backgroundColor: '#E50914' }}
                >
                  <span className="material-symbols-outlined text-[16px]">upgrade</span>
                  Change Plan
                </button>
              </div>
            </div>
            <p className="text-body-sm text-[#B3B3B3] mb-4">{currentPlan.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              {currentPlan.features.map(feat => (
                <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: currentPlan.color, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="text-body-sm" style={{ color: '#B3B3B3' }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profiles Card */}
        <div className="animate-fade-in"
          style={{
            borderRadius: '12px', padding: '32px 40px', marginBottom: '28px',
            background: '#141414', border: '1px solid rgba(255,255,255,0.06)',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#6366F1' }}>group</span>
              <h2 className="text-headline-sm" style={{ color: '#FFFFFF' }}>Profiles</h2>
            </div>
            {user?.role === 'ROLE_ADMIN' && (
              <button
                onClick={() => navigate('/admin')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E50914', fontSize: '13px', fontWeight: 600 }}
              >
                Admin Controls
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
              <div style={{ width: '24px', height: '24px', border: '2px solid #E50914', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {profiles.map(profile => (
                <div key={profile.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px', borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background 0.15s',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#FFFFFF', fontWeight: 700,
                      background: 'linear-gradient(135deg, #E50914 0%, #930007 100%)',
                    }}>
                      {profile.isKids ? (
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>child_care</span>
                      ) : (
                        profile.profileName?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-body-sm" style={{ color: '#FFFFFF' }}>{profile.profileName}</p>
                      {profile.isKids && <span className="text-label-badge" style={{ color: '#46D369' }}>KIDS</span>}
                    </div>
                    {activeProfile?.id === profile.id && (
                      <span className="text-label-badge" style={{
                        padding: '2px 10px', borderRadius: '4px',
                        background: 'rgba(70,211,105,0.15)', color: '#46D369',
                      }}>ACTIVE</span>
                    )}
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(profile.id)}
                    style={{
                      padding: '8px', borderRadius: '6px', background: 'none', border: 'none',
                      cursor: 'pointer', color: '#808080', display: 'flex', alignItems: 'center',
                    }}
                    title="Delete Profile"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sign Out */}
        <div className="animate-fade-in"
          style={{
            borderRadius: '12px', padding: '32px 40px',
            background: '#141414', border: '1px solid rgba(255,255,255,0.06)',
          }}>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%', padding: '14px 0', borderRadius: '8px',
              fontSize: '14px', fontWeight: 700, color: '#FFFFFF',
              background: '#E50914', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
            Sign Out of CineWood
          </button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div
            className="animate-slide-up"
            style={{
              width: '100%', maxWidth: '400px', margin: '0 16px',
              borderRadius: '12px', padding: '28px',
              background: '#141414', border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            }}
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-headline-sm" style={{ color: '#FFFFFF', marginBottom: '12px' }}>Delete Profile?</h3>
            <p className="text-body-md" style={{ color: '#B3B3B3', marginBottom: '24px' }}>This will remove the profile and all its watch history.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => handleDeleteProfile(deleteConfirm)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: '8px',
                  fontWeight: 700, color: '#FFFFFF', background: '#E50914',
                  border: 'none', cursor: 'pointer',
                }}>Delete</button>
              <button onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: '8px',
                  fontWeight: 700, color: '#FFFFFF', background: '#2a2a2a',
                  border: 'none', cursor: 'pointer',
                }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </div>
  );
}
