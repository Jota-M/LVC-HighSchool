import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from '@/lib/tokenStorage';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api-highschool-5ujz.onrender.com',
  // baseURL: '/api-proxy',
  withCredentials: true,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshRequest: Promise<string | null> | null = null;

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const newToken = response.headers['x-access-token'];
    if (typeof newToken === 'string' && newToken) {
      setAccessToken(newToken);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const requestUrl = originalRequest?.url ?? '';

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshRequest ??= refreshAccessToken();
      const newAccessToken = await refreshRequest;

      if (!newAccessToken) {
        clearAuthTokens();
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearAuthTokens();
      return Promise.reject(refreshError);
    } finally {
      refreshRequest = null;
    }
  }
);

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  const headers: Record<string, string> = {};
  if (refreshToken) {
    headers['X-Refresh-Token'] = refreshToken;
  }

  const { data } = await api.post<{
    success: boolean;
    data?: { accessToken?: string; token?: string };
  }>('/auth/refresh', refreshToken ? { refreshToken } : {}, { headers });

  const accessToken = data?.data?.accessToken ?? data?.data?.token ?? null;
  if (accessToken) {
    setAccessToken(accessToken);
  }
  return accessToken;
}

export default api;
