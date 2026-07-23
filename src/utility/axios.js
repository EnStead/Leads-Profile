import axios from "axios";
import {
  clearStoredAuth,
  getAuthRoleByAccessToken,
  getRefreshTokenForRole,
  getStoredAuthForRole,
  updateStoredTokens,
} from "./authSession";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const authClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshQueues = new Map();

const getBearerToken = (config) => {
  const header = config?.headers?.Authorization || config?.headers?.authorization;
  if (!header) return null;
  const value = Array.isArray(header) ? header[0] : header;
  const match = String(value).match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : String(value);
};

const getStoredAuthRoleFallback = () => {
  const pathname =
    typeof window !== "undefined" ? String(window.location?.pathname || "") : "";
  const adminStored = getStoredAuthForRole("admin");
  const userStored = getStoredAuthForRole("user");

  if (pathname.startsWith("/admin")) {
    return adminStored?.refreshToken ? "admin" : userStored?.refreshToken ? "user" : null;
  }

  return userStored?.refreshToken ? "user" : adminStored?.refreshToken ? "admin" : null;
};

const shouldSkipRefresh = (config) => {
  const url = String(config?.url || "");
  return (
    url.includes("/api/v1/auth/sign-in") ||
    url.includes("/api/v1/auth/sign-up") ||
    url.includes("/api/v1/auth/refresh") ||
    url.includes("/api/v1/auth/sign-out")
  );
};

const performRefresh = async (role) => {
  const refreshToken = getRefreshTokenForRole(role);
  if (!refreshToken) throw new Error("Missing refresh token");

  const response = await authClient.post("/api/v1/auth/refresh", {
    refreshToken,
  });

  const payload = response?.data?.data ?? response?.data ?? {};
  const nextToken = payload?.token ?? payload?.accessToken ?? null;
  const nextRefreshToken = payload?.refreshToken ?? refreshToken;

  if (!nextToken) throw new Error("Missing refreshed token");

  updateStoredTokens(role, {
    token: nextToken,
    refreshToken: nextRefreshToken,
    refreshTokenExpiresAt: payload?.refreshTokenExpiresAt,
  });

  return {
    token: nextToken,
    refreshToken: nextRefreshToken,
  };
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;

    if (!originalRequest || status !== 401 || shouldSkipRefresh(originalRequest)) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    const token = getBearerToken(originalRequest);
    const role = getAuthRoleByAccessToken(token) || getStoredAuthRoleFallback();
    if (!role) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshQueues.has(role)) {
        const queuedRefresh = performRefresh(role).finally(() => {
          refreshQueues.delete(role);
        });
        refreshQueues.set(role, queuedRefresh);
      }

      const refreshed = await refreshQueues.get(role);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${refreshed.token}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearStoredAuth(role);
      return Promise.reject(refreshError);
    }
  },
);

export default api;
