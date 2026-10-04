import { ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

let memoryToken: string | null = null;

export function setClientToken(token: string | null) {
  memoryToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }
}

export function getClientToken(): string | null {
  if (memoryToken) return memoryToken;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

// Endpoints that must never trigger the refresh-and-retry path
const NO_REFRESH_RETRY = ['/auth/login', '/auth/refresh', '/auth/register'];

let refreshRequest: Promise<boolean> | null = null;

/**
 * Renews the 15-minute access token from the HttpOnly refresh_token cookie.
 * Single-flight: concurrent 401s share one network call.
 */
async function refreshAccessToken(): Promise<boolean> {
  if (!refreshRequest) {
    refreshRequest = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        });

        if (!response.ok) {
          setClientToken(null);
          return false;
        }

        const payload = await response.json().catch(() => null);
        const accessToken = payload?.data?.accessToken;
        if (!accessToken) {
          setClientToken(null);
          return false;
        }

        setClientToken(accessToken);
        return true;
      } catch {
        setClientToken(null);
        return false;
      }
    })().finally(() => {
      refreshRequest = null;
    });
  }

  return refreshRequest;
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {},
  isRetryAfterRefresh = false
): Promise<ApiResponse<T>> {
  const { params, headers, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = getClientToken();
  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };

  if (!(customConfig.body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers: requestHeaders,
      credentials: 'include', // Ensures HttpOnly cookies are passed
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // Expired access token: renew once via the HttpOnly refresh cookie, then replay the request
      if (
        response.status === 401 &&
        !isRetryAfterRefresh &&
        token &&
        !NO_REFRESH_RETRY.includes(endpoint.split('?')[0])
      ) {
        const renewed = await refreshAccessToken();
        if (renewed) {
          return apiClient<T>(endpoint, options, true);
        }
      }

      const errorMessage = data?.message || `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || 'فشل الاتصال بالخادم، يرجى المحاولة لاحقًا', 0);
  }
}
