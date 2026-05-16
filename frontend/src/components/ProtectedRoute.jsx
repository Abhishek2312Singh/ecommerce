import { Navigate, useLocation } from "react-router-dom";

function getRole() {
  return localStorage.getItem("sph_role") || "";
}

export default function ProtectedRoute({ allow, children }) {
  const role     = getRole();
  const location = useLocation();

  if (!allow.includes(role)) {
    let fallback = "/login";
    if (role === "SUPER_ADMIN") fallback = "/superadmin";
    else if (role === "ADMIN")   fallback = "/admin";
    else if (role)               fallback = "/app";
    else if (location.pathname.startsWith("/superadmin")) fallback = "/superadmin/login";
    else if (location.pathname.startsWith("/admin"))      fallback = "/admin/login";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
