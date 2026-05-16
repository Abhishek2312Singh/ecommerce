import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public
import Landing          from "./pages/Landing.jsx";
import Login            from "./pages/Login.jsx";
import AdminLogin       from "./pages/AdminLogin.jsx";
import SuperAdminLogin  from "./pages/SuperAdminLogin.jsx";

// Protected
import ProtectedRoute   from "./components/ProtectedRoute.jsx";
import UserDashboard    from "./pages/UserDashboard.jsx";
import VisitorPass      from "./pages/VisitorPass.jsx";

// Admin pages
import AdminDashboard   from "./pages/AdminDashboard.jsx";
import ManageUsers      from "./pages/admin/ManageUsers.jsx";
import Slots            from "./pages/admin/Slots.jsx";
import Logs             from "./pages/admin/Logs.jsx";

// Super Admin pages
import SuperAdminOverview  from "./pages/superadmin/Overview.jsx";
import SuperAdminCampuses  from "./pages/superadmin/Campuses.jsx";
import SuperAdminAdmins    from "./pages/superadmin/Admins.jsx";

const ADMIN_ROLES       = ["ADMIN"];
const SUPER_ADMIN_ROLES = ["SUPER_ADMIN"];
const USER_ROLES        = ["STUDENT", "FACULTY", "STAFF"];

function AdminGuard({ children }) {
  return <ProtectedRoute allow={ADMIN_ROLES}>{children}</ProtectedRoute>;
}

function SuperAdminGuard({ children }) {
  return <ProtectedRoute allow={SUPER_ADMIN_ROLES}>{children}</ProtectedRoute>;
}

function UserGuard({ children }) {
  return <ProtectedRoute allow={USER_ROLES}>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route path="/"                 element={<Landing />} />
        <Route path="/login"            element={<Login />} />
        <Route path="/admin/login"      element={<AdminLogin />} />
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />

        {/* ── User ── */}
        <Route path="/app"     element={<UserGuard><UserDashboard /></UserGuard>} />
        <Route path="/visitor" element={<AdminGuard><VisitorPass /></AdminGuard>} />

        {/* ── Campus Admin ── */}
        <Route path="/admin"              element={<AdminGuard><AdminDashboard /></AdminGuard>} />
        <Route path="/admin/users"        element={<AdminGuard><ManageUsers /></AdminGuard>} />
        <Route path="/admin/visitor-pass" element={<AdminGuard><VisitorPass /></AdminGuard>} />
        <Route path="/admin/slots"        element={<AdminGuard><Slots /></AdminGuard>} />
        <Route path="/admin/logs"         element={<AdminGuard><Logs /></AdminGuard>} />

        {/* ── Super Admin ── */}
        <Route path="/superadmin"          element={<SuperAdminGuard><SuperAdminOverview /></SuperAdminGuard>} />
        <Route path="/superadmin/campuses" element={<SuperAdminGuard><SuperAdminCampuses /></SuperAdminGuard>} />
        <Route path="/superadmin/admins"   element={<SuperAdminGuard><SuperAdminAdmins /></SuperAdminGuard>} />
        {/* Slots & Logs — super admin sees all data; backend scopes by JWT role */}
        <Route path="/superadmin/slots"    element={<SuperAdminGuard><Slots /></SuperAdminGuard>} />
        <Route path="/superadmin/logs"     element={<SuperAdminGuard><Logs /></SuperAdminGuard>} />

        {/* ── Redirects ── */}
        <Route path="/dashboard" element={<Navigate to="/app" replace />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
