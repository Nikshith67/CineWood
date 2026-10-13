import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signin, signup } from '../services/api';

// SVG icons for eye toggle (no external dependency needed)
const EyeIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// Checkmark SVG for password rules
const CheckSvg = () => (
  <svg viewBox="0 0 12 12">
    <polyline points="2 6 5 9 10 3" />
  </svg>
);

// Password validation rules
const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { key: 'number', label: 'At least one number', test: (pw) => /\d/.test(pw) },
  { key: 'special', label: 'At least one special character (!@#$%^&*)', test: (pw) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pw) },
];

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileName, setProfileName] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Live password validation state
  const pwValidation = useMemo(() => {
    return PASSWORD_RULES.map((rule) => ({
      ...rule,
      met: rule.test(password),
    }));
  }, [password]);

  const allPasswordRulesMet = pwValidation.every((r) => r.met);

  // Clear password error when user starts fixing it
  useEffect(() => {
    if (passwordError && allPasswordRulesMet) {
      setPasswordError('');
    }
  }, [allPasswordRulesMet, passwordError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordError('');

    // Frontend password validation for signup
    if (isSignUp && !allPasswordRulesMet) {
      setPasswordError('Password does not meet all requirements');
      return;
    }

    setLoading(true);

    try {
      let response;
      if (isSignUp) {
        response = await signup(email, password, profileName || 'User');
      } else {
        response = await signin(email, password);
      }

      const data = response.data;
      if (data.token) {
        await login(
          { email: data.email, userId: data.userId, role: data.role },
          data.token
        );
        navigate('/', { replace: true });
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      // Extract the most specific error message available
      const resp = err.response;
      if (resp) {
        // Backend returned a response — use it
        const data = resp.data;
        const msg = data?.message || data?.error || data?.errors?.[0] || `Request failed (${resp.status})`;
        setError(msg);
      } else if (err.request) {
        // Request was made but no response received — backend is down
        setError('Cannot connect to the server. Please make sure the backend is running and try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setPasswordError('');
    setShowPassword(false);
  };

  return (
    <div className="auth-page">

      {/* Cinematic Background Pattern */}
      <div className="auth-bg-pattern" />

      {/* Animated grain overlay */}
      <div className="auth-grain" />

      {/* Top Logo */}
      <div className="auth-logo">
        <span className="text-headline-lg" style={{ letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 900 }}>
          <span style={{ color: '#E50914' }}>CINE</span>
          <span style={{ color: '#FFFFFF' }}>WOOD</span>
        </span>
      </div>

      {/* Auth Card */}
      <div className="auth-card">
        <h1 className="auth-title">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h1>
        <p className="auth-subtitle">
          {isSignUp ? 'Join CineWood and start streaming' : 'Welcome back to CineWood'}
        </p>

        {/* Top-level Error Message */}
        {error && (
          <div className="auth-error">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-email">
              Email Address
            </label>
            <input
              className="auth-input"
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              maxLength={255}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-password">
              Password
            </label>
            <div className="auth-password-wrapper">
              <input
                className="auth-input"
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? 'Create a strong password' : 'Enter your password'}
                required
                minLength={isSignUp ? 8 : 1}
                maxLength={72}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                className="auth-eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* Inline password error */}
            {passwordError && (
              <div className="auth-field-error">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>warning</span>
                {passwordError}
              </div>
            )}

            {/* Password requirements checklist (signup only) */}
            {isSignUp && (
              <ul className="auth-pw-requirements">
                {pwValidation.map((rule) => (
                  <li key={rule.key} className={`auth-pw-rule ${rule.met ? 'met' : ''}`}>
                    <span className="auth-pw-check">
                      <CheckSvg />
                    </span>
                    {rule.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Profile Name (Signup only) */}
          {isSignUp && (
            <div className="auth-field animate-fade-in">
              <label className="auth-label" htmlFor="auth-profile-name">
                Profile Name
              </label>
              <input
                className="auth-input"
                id="auth-profile-name"
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Your display name"
                maxLength={50}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            className="auth-submit"
            id="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner">
                <span className="auth-spinner-icon" />
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </span>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        {/* Toggle Sign In / Sign Up */}
        <div className="auth-toggle">
          <p>
            {isSignUp ? 'Already have an account?' : 'New to CineWood?'}
            <button
              className="auth-toggle-btn"
              id="auth-toggle"
              onClick={handleToggle}
            >
              {isSignUp ? 'Sign In' : 'Sign Up Now'}
            </button>
          </p>
        </div>
      </div>

      {/* Bottom decorative bar */}
      <div className="auth-bottom-bar" />
    </div>
  );
}
