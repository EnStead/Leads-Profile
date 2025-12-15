import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

const UserRoute = ({ children }) => {
  const { user, authReady } = useAuth();

  if (!authReady) return null; // Wait for context to load

  // Not logged in → send to user login
  if (!user?.token) return <Navigate to="/" replace />;

  // Block if logged-in user is not a client
  if (user.user.role !== "client") return <Navigate to="/" replace />;

  return children;
};

export default UserRoute;
