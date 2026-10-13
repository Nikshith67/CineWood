import axios from 'axios';

const API = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15s timeout
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('cinewood_token');
  if (token && typeof token === 'string' && token.length < 2048) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses — auto logout on token expiry
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid — clear auth state
      localStorage.removeItem('cinewood_token');
      localStorage.removeItem('cinewood_user');
      localStorage.removeItem('cinewood_profile');
      // Redirect to auth page if not already there
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

// === Auth APIs ===
export const signup = (email, password, profileName) =>
  API.post('/auth/signup', { email, password, profileName });

export const signin = (email, password) =>
  API.post('/auth/signin', { email, password });

// === Media APIs ===
export const browseCatalog = (language = 'all') =>
  API.get(`/media/browse?language=${encodeURIComponent(language)}`);

export const searchMedia = (query) =>
  API.get(`/media/search?query=${encodeURIComponent(query)}`);

export const getMediaById = (id) =>
  API.get(`/media/${id}`);

export const getByLanguage = (language) =>
  API.get(`/media/language/${encodeURIComponent(language)}`);

// === Profile APIs ===
export const getProfiles = (userId) =>
  API.get(`/profiles/user/${userId}`);

export const createProfile = (userId, data) =>
  API.post(`/profiles/user/${userId}`, data);

export const deleteProfile = (profileId) =>
  API.delete(`/profiles/${profileId}`);

// === Watch History APIs ===
export const getContinueWatching = (profileId) =>
  API.get(`/watch/continue/${profileId}`);

export const getWatchHistory = (profileId) =>
  API.get(`/watch/history/${profileId}`);

export const updateWatchProgress = (data) =>
  API.post('/watch/progress', data);

// === Feedback APIs ===
export const submitFeedback = (data) =>
  API.post('/feedback', data);

export const getMediaFeedback = (mediaId) =>
  API.get(`/feedback/media/${mediaId}`);

// === User & Subscription APIs ===
export const getUser = (userId) =>
  API.get(`/users/${userId}`);

export const updateUserSubscription = (userId, subscriptionTier) =>
  API.put(`/users/${userId}/subscription`, { subscriptionTier });

// === Admin APIs ===
export const adminGetAllMedia = () =>
  API.get('/admin/media');

export const adminCreateMedia = (data) =>
  API.post('/admin/media', data);

export const adminUpdateMedia = (id, data) =>
  API.put(`/admin/media/${id}`, data);

export const adminDeleteMedia = (id) =>
  API.delete(`/admin/media/${id}`);

export const adminGetAllUsers = () =>
  API.get('/admin/users');

// === Payment APIs (Razorpay) ===
export const createPaymentOrder = (planId) =>
  API.post('/payments/create-order', { planId });

export const verifyPayment = (orderId, paymentId, signature, planId) =>
  API.post('/payments/verify', { orderId, paymentId, signature, planId });

export const getPaymentTransactions = () =>
  API.get('/payments/transactions');

export default API;

