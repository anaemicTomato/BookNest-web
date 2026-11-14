import { Navigate } from "react-router-dom";
import { useAuth, HOME } from "./AuthContext";

export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={HOME[user.role]} replace />;
  return children;
}