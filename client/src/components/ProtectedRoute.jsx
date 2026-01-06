// src/components/ProtectedRoute.jsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
