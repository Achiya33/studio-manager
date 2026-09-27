import { auth, isFirebaseAvailable } from './firebase';

/**
 * Authenticated fetch wrapper.
 * Automatically attaches the Firebase ID token as a Bearer token
 * to every API request. This ensures the backend can verify the
 * user's identity on each call.
 */
export async function authFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // If Firebase is available and user is logged in, attach the auth token
  if (isFirebaseAvailable && auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      // Don't block the request — the backend will reject it if auth is required
    }
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Convenience methods
 */
export const api = {
  get: (url) => authFetch(url),

  post: (url, data) => authFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  put: (url, data) => authFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (url) => authFetch(url, {
    method: 'DELETE',
  }),
};
