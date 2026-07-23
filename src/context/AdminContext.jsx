import { createContext, useContext, useState, useEffect } from "react";
import api from "../utility/axios";
import {
  AUTH_SESSION_EVENT,
  clearStoredAuth,
  getStoredAuthForRole,
  persistStoredValue,
} from "../utility/authSession";
import { preloadProfilePresets } from "../utility/profilePresets";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredAuthForRole("admin")); 
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load admin user
  useEffect(() => {
    preloadProfilePresets();
    setUser(getStoredAuthForRole("admin"));
    setAuthReady(true);

    const syncSession = (event) => {
      if (event?.detail?.role && event.detail.role !== "admin") return;
      setUser(getStoredAuthForRole("admin"));
    };

    window.addEventListener(AUTH_SESSION_EVENT, syncSession);

    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, syncSession);
    };
  }, []);

  const updateUserSession = (nextUser) => {
    setUser(nextUser);
  };

  // Save admin user to localStorage
  useEffect(() => {
    persistStoredValue("admin", user);
  }, [user]);

  // LOGIN FUNCTION
  const login = async (loginData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post("/api/v1/auth/sign-in", loginData);

      //     // Role validation
      // if (response.data.data.role !== "admin") {
      //   throw new Error("This account is not an admin");
      // }

      const extractedUser = {
        user: response.data.data.user,
        token: response.data.data.token,
        refreshToken:
          response.data.data.refreshToken ?? response.data.refreshToken ?? null,
        refreshTokenExpiresAt:
          response.data.data.refreshTokenExpiresAt ??
          response.data.refreshTokenExpiresAt ??
          null,
        adminData: response.data, // return here to match your Login.jsx
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
      clearStoredAuth("admin");
      setUser(null);
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
    }
  };

  return (
    <AdminContext.Provider
      value={{
        user,
        login,
        logout,
        updateUserSession,
        loading,
        error,
        authReady,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminContext);
