import { Navigate, useLocation } from "react-router";
import { useAdminAuth } from "../context/AdminContext";

const AdminRoute = ({ children }) => {
  const { user, authReady } = useAdminAuth();
  const location = useLocation();

  if (!authReady) return null; // Wait for context to load

  // Allow admin login page without auth
  if (location.pathname === "/admin" || location.pathname === "/admin/") {
    return children;
  }

  // Block if not logged in
  if (!user?.token) return <Navigate to="/admin" replace />;

  // Block if logged in user is NOT an admin
  if (user.user.role !== "admin") return <Navigate to="/admin" replace />;

  // User is admin, allow access
  return children;
};

export default AdminRoute;
