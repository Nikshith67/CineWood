import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfiles } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [activeProfile, setActiveProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check token expiry by decoding JWT payload
  const isTokenExpired = useCallback((token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // exp is in seconds, Date.now() in ms
      return payload.exp * 1000 < Date.now();
    } catch {
      return true; // Malformed token is treated as expired
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('cinewood_token');
    const savedUser = localStorage.getItem('cinewood_user');
    const savedProfile = localStorage.getItem('cinewood_profile');

    if (token && savedUser) {
      // Validate token hasn't expired
      if (isTokenExpired(token)) {
        // Token expired — clear everything
        localStorage.removeItem('cinewood_token');
        localStorage.removeItem('cinewood_user');
        localStorage.removeItem('cinewood_profile');
      } else {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          if (savedProfile) {
            try {
              setActiveProfile(JSON.parse(savedProfile));
            } catch {
              localStorage.removeItem('cinewood_profile');
            }
          } else {
            // Auto-fetch and select primary profile
            getProfiles(parsedUser.userId)
              .then((res) => {
                if (res.data && res.data.length > 0) {
                  localStorage.setItem('cinewood_profile', JSON.stringify(res.data[0]));
                  setActiveProfile(res.data[0]);
                }
              })
              .catch(() => {});
          }
        } catch {
          localStorage.removeItem('cinewood_user');
        }
      }
    }
    setLoading(false);
  }, [isTokenExpired]);

  const login = useCallback(async (userData, token) => {
    localStorage.setItem('cinewood_token', token);
    localStorage.setItem('cinewood_user', JSON.stringify(userData));
    setUser(userData);

    // Auto-select primary profile in the background
    try {
      const res = await getProfiles(userData.userId);
      const profiles = res.data;
      if (profiles && profiles.length > 0) {
        localStorage.setItem('cinewood_profile', JSON.stringify(profiles[0]));
        setActiveProfile(profiles[0]);
      } else {
        const fallback = {
          id: userData.userId,
          profileName: userData.email?.split('@')[0] || 'User',
          isKids: false,
        };
        localStorage.setItem('cinewood_profile', JSON.stringify(fallback));
        setActiveProfile(fallback);
      }
    } catch {
      const fallback = {
        id: userData.userId,
        profileName: userData.email?.split('@')[0] || 'User',
        isKids: false,
      };
      localStorage.setItem('cinewood_profile', JSON.stringify(fallback));
      setActiveProfile(fallback);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cinewood_token');
    localStorage.removeItem('cinewood_user');
    localStorage.removeItem('cinewood_profile');
    setUser(null);
    setActiveProfile(null);
  }, []);

  const selectProfile = useCallback((profile) => {
    localStorage.setItem('cinewood_profile', JSON.stringify(profile));
    setActiveProfile(profile);
  }, []);

  const updateSubscriptionTier = useCallback((tier) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, subscriptionTier: tier };
      localStorage.setItem('cinewood_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, activeProfile, loading, login, logout, selectProfile, updateSubscriptionTier }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
