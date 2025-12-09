import { createContext, useContext, useState, useEffect } from "react";
import api from "../utility/Axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load stored user
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
    setAuthReady(true);
  }, []);

  // Save or remove user
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const updatePendingRegistration = (data) =>
    setPendingRegistration((prev) => ({ ...prev, ...data }));

  // SIGNUP
  const signup = async (signupData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post("/auth/sign-up", signupData);

      const extractedUser = {
        user: response.data.data.user,
        token: response.data.data.token,
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

      const response = await api.post("/auth/sign-in", loginData);

      const extractedUser = {
        user: response.data.data.user,
        token: response.data.data.token,
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signup,
        login,
        logout,
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
