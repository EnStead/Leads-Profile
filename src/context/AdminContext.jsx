import { createContext, useContext, useState, useEffect } from "react";
import api from "../utility/Axios";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load admin user
  useEffect(() => {
    const saved = localStorage.getItem("admin");
    if (saved) setUser(JSON.parse(saved));
    setAuthReady(true);
  }, []);

  // Save admin user to localStorage
  useEffect(() => {
    if (user) localStorage.setItem("admin", JSON.stringify(user));
    else localStorage.removeItem("admin");
  }, [user]);

  // LOGIN FUNCTION
  const login = async (loginData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post("/auth/sign-in", loginData);

      //     // Role validation
      // if (response.data.data.role !== "admin") {
      //   throw new Error("This account is not an admin");
      // }

      const extractedUser = {
        user: response.data.data.user,
        token: response.data.data.token,
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem("admin");
  };

  return (
    <AdminContext.Provider
      value={{
        user,
        login,
        logout,
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
