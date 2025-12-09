import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, authReady } = useAuth();

  if (!authReady) return null;

  // Not logged in → send to admin login
  if (!user) return <Navigate to="/admin" />;

  // If user is NOT admin → kick out
  if (user.role !== "admin") return <Navigate to="/home" />;

  return children;
};

export default AdminRoute;
