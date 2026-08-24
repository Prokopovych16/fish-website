import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Access-токен живе лише 15 хв. Без цього перехоплювача будь-який запит
// після закінчення токена падав з 401, навіть якщо у користувача дійсний
// refresh-токен (cookie) — наприклад під час оформлення замовлення.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {}, { withCredentials: true })
      .then((res) => res.data?.accessToken ?? null)
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url ?? '';
    const isAuthRoute = url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/register');

    if (status === 401 && originalRequest && !originalRequest._retried && !isAuthRoute) {
      originalRequest._retried = true;
      const newToken = await refreshAccessToken();

      if (newToken) {
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${newToken}` };
        try {
          const { useAuthStore } = await import('./auth');
          useAuthStore.setState({ accessToken: newToken, isAuthenticated: true });
        } catch {}
        return api(originalRequest);
      }

      // Refresh теж не вдався — сесія дійсно закінчилась, скидаємо стан
      delete api.defaults.headers.common.Authorization;
      try {
        const { useAuthStore } = await import('./auth');
        useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false });
      } catch {}
    }

    return Promise.reject(error);
  },
);

export default api;
