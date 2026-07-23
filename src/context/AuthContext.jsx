import { createContext, useContext, useState, useEffect } from "react";
import api from "../utility/axios";
import {
  AUTH_SESSION_EVENT,
  clearStoredAuth,
  getStoredAuthForRole,
  persistStoredValue,
} from "../utility/authSession";
import {
  getRandomProfileBgTone,
  getRandomProfilePresetId,
  normalizeImagePreset,
  normalizeProfileBgTone,
  preloadProfilePresets,
} from "../utility/profilePresets";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredAuthForRole("user"));
  const [authReady, setAuthReady] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load stored user
  useEffect(() => {
    preloadProfilePresets();
    setUser(getStoredAuthForRole("user"));
    setAuthReady(true);

    const syncSession = (event) => {
      if (event?.detail?.role && event.detail.role !== "user") return;
      setUser(getStoredAuthForRole("user"));
    };

    window.addEventListener(AUTH_SESSION_EVENT, syncSession);

    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, syncSession);
    };
  }, []);

  const updateUserSession = (nextUser) => {
    setUser(nextUser);
  };

  // Save or remove user
  useEffect(() => {
    persistStoredValue("user", user);
  }, [user]);

  const updatePendingRegistration = (data) =>
    setPendingRegistration((prev) => ({ ...prev, ...data }));

  // SIGNUP
  const signup = async (signupData) => {
    try {
      setLoading(true);
      setError(null);

      const imagePreset =
        signupData?.imagePreset || getRandomProfilePresetId();
      const response = await api.post("/api/v1/auth/sign-up", {
        ...signupData,
        imagePreset,
      });


      const extractedUser = {
        user: {
          ...response.data.data.user,
          imagePreset: normalizeImagePreset(
            response.data.data.user?.imagePreset || imagePreset,
          ),
          avatarBgTone: normalizeProfileBgTone(getRandomProfileBgTone()),
        },
        token: response.data.data.token,
        refreshToken:
          response.data.data.refreshToken ?? response.data.refreshToken ?? null,
        refreshTokenExpiresAt:
          response.data.data.refreshTokenExpiresAt ??
          response.data.refreshTokenExpiresAt ??
          null,
        userData: response.data,
      };

      setUser(extractedUser);
      return extractedUser;

    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // LOGIN
  const login = async (loginData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post("/api/v1/auth/sign-in", loginData);

      const extractedUser = {
        user: {
          ...response.data.data.user,
          imagePreset: normalizeImagePreset(
            response.data.data.user?.imagePreset,
          ),
          avatarBgTone: normalizeProfileBgTone(getRandomProfileBgTone()),
        },
        token: response.data.data.token,
        refreshToken:
          response.data.data.refreshToken ?? response.data.refreshToken ?? null,
        refreshTokenExpiresAt:
          response.data.data.refreshTokenExpiresAt ??
          response.data.refreshTokenExpiresAt ??
          null,
        userData: response.data,
      };

      setUser(extractedUser);
      return extractedUser;

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const refreshToken = user?.refreshToken ?? null;

    try {
      if (refreshToken) {
        await api.post("/api/v1/auth/sign-out", { refreshToken }, {});
      }
    } catch {
      // Ignore sign-out failures and clear local session below.
    } finally {
      clearStoredAuth("user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signup,
        login,
        logout,
        updateUserSession,
        pendingRegistration,
        updatePendingRegistration,
        loading,
        error,
        authReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
