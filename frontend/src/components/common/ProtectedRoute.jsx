import { Navigate, useLocation } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log("🔐 ProtectedRoute Check:");
  console.log("   - Loading:", loading);
  console.log("   - Authenticated:", isAuthenticated);
  console.log("   - User:", user);
  console.log("   - Required roles:", roles);
  console.log("   - User role:", user?.role);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log("❌ Not authenticated - redirecting to /login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    console.log(
      "❌ Role mismatch - required:",
      roles,
      "but user has:",
      user.role
    );
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("✅ Access granted");
  return children;
};

export default ProtectedRoute;
