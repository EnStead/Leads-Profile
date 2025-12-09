import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

const UserRoute = ({ children }) => {
  const { user, authReady } = useAuth();

  if (!authReady) return null;

  // Not logged in → send to user login
  if (!user) return <Navigate to="/" />;

  return children;
};

export default UserRoute;
