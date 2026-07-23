const CUSTOMER_STORAGE_KEY = "user";
const ADMIN_STORAGE_KEY = "admin";
const AUTH_SESSION_EVENT = "auth:session-updated";

const getStorageKey = (role) =>
  role === "admin" ? ADMIN_STORAGE_KEY : CUSTOMER_STORAGE_KEY;

const readStoredValue = (role) => {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(getStorageKey(role));
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writeStoredValue = (role, value) => {
  if (typeof window === "undefined") return;

  const storageKey = getStorageKey(role);
  if (value) {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } else {
    localStorage.removeItem(storageKey);
  }

  window.dispatchEvent(
    new CustomEvent(AUTH_SESSION_EVENT, {
      detail: { role, value },
    }),
  );
};

const persistStoredValue = (role, value) => {
  if (typeof window === "undefined") return;

  const storageKey = getStorageKey(role);
  if (value) {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } else {
    localStorage.removeItem(storageKey);
  }
};

const updateStoredTokens = (role, tokens = {}) => {
  const current = readStoredValue(role);
  if (!current) return null;

  const next = {
    ...current,
    previousToken: current.token ?? current.previousToken ?? null,
    token: tokens.token ?? current.token ?? null,
    refreshToken: tokens.refreshToken ?? current.refreshToken ?? null,
    refreshTokenExpiresAt:
      tokens.refreshTokenExpiresAt ??
      current.refreshTokenExpiresAt ??
      null,
  };

  writeStoredValue(role, next);
  return next;
};

const clearStoredAuth = (role) => {
  writeStoredValue(role, null);
};

const getAuthRoleByAccessToken = (token) => {
  if (!token) return null;

  const customer = readStoredValue("user");
  if (
    (customer?.token && String(customer.token) === String(token)) ||
    (customer?.previousToken && String(customer.previousToken) === String(token))
  ) {
    return "user";
  }

  const admin = readStoredValue("admin");
  if (
    (admin?.token && String(admin.token) === String(token)) ||
    (admin?.previousToken && String(admin.previousToken) === String(token))
  ) {
    return "admin";
  }

  return null;
};

const getRefreshTokenForRole = (role) => {
  const stored = readStoredValue(role);
  return stored?.refreshToken ?? null;
};

const getStoredAuthForRole = (role) => readStoredValue(role);

export {
  AUTH_SESSION_EVENT,
  clearStoredAuth,
  getAuthRoleByAccessToken,
  getRefreshTokenForRole,
  getStoredAuthForRole,
  persistStoredValue,
  updateStoredTokens,
  writeStoredValue,
};
