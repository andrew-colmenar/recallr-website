import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, isValid }) {
  const { loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  // Redirect to login if not authenticated or session invalid
  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated and session valid
  return children;
}

export default ProtectedRoute;
