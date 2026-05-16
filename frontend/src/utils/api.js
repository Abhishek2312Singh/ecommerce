// ─────────────────────────────────────────────────────────────────────────────
// api.js — All backend API calls for SmartParkHub
// Base URL: http://localhost:8080
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_API_BASE = "http://localhost:8080";
export const API_BASE = (import.meta.env.VITE_API_BASE || DEFAULT_API_BASE).replace(/\/$/, "");

// ── Helpers ───────────────────────────────────────────────────────────────────

async function req(url, options = {}) {
  const token = localStorage.getItem("sph_token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });

  if (res.status === 204) return null; // no content

  if (res.status === 401) {
    // POST /login returning 401 = wrong credentials — let the form handle it,
    // do NOT wipe the session or redirect (there is no session yet during login).
    if (url === "/login") {
      throw new Error("Invalid email or password. Please try again.");
    }

    // For all other 401s — the session token expired or was rejected.
    // Read role BEFORE clearing so we can redirect to the correct login portal.
    const role = localStorage.getItem("sph_role");
    localStorage.removeItem("sph_token");
    localStorage.removeItem("sph_user");
    localStorage.removeItem("sph_role");

    if (role === "SUPER_ADMIN") {
      window.location.href = "/superadmin/login";
    } else if (role === "ADMIN") {
      window.location.href = "/admin/login";
    } else {
      window.location.href = "/login";
    }
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    let msg = `Request failed: ${res.status}`;
    try { const t = await res.text(); if (t) msg = t; } catch { /* ignore */ }
    throw new Error(msg);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// ── Auth ──────────────────────────────────────────────────────────────────────

/** POST /login → User { id, name, email, role, campus, ... } */
export async function apiLogin(email, password) {
  return req("/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

// ── User ──────────────────────────────────────────────────────────────────────

/** GET /users/:id → User (safe — no password) */
export async function apiGetUser(id) {
  return req(`/users/${id}`);
}

/** PUT /users/:id/change-password → string */
export async function apiChangePassword(id, oldPassword, newPassword) {
  return req(`/users/${id}/change-password`, {
    method: "PUT",
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

/**
 * PUT /users/:id/toggle-parking → updated User map (with isParked)
 * Temporary self-reported parking toggle until QR scanning is live.
 */
export async function apiToggleParking(id) {
  return req(`/users/${id}/toggle-parking`, { method: "PUT" });
}

// ── Admin — User Management ───────────────────────────────────────────────────

/** GET /admin/allUsers → User[] */
export async function apiGetAllUsers() {
  return req("/admin/allUsers");
}

/** GET /admin/users/campus/:key → User[] (users for a specific campus) */
export async function apiGetUsersByCampus(campusKey) {
  return req(`/admin/users/campus/${campusKey}`);
}

/** POST /admin/create-user → User */
export async function apiCreateUser(dto) {
  return req("/admin/create-user", { method: "POST", body: JSON.stringify(dto) });
}

/** PUT /admin/users/:id → User (edit user details) */
export async function apiUpdateUser(id, dto) {
  return req(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(dto) });
}

/** DELETE /admin/users/:id → null */
export async function apiDeleteUser(id) {
  return req(`/admin/users/${id}`, { method: "DELETE" });
}

/** PUT /admin/users/:id/reset-password → string */
export async function apiResetUserPassword(id, newPassword) {
  return req(`/admin/users/${id}/reset-password`, {
    method: "PUT",
    body: JSON.stringify({ newPassword }),
  });
}

// ── Super Admin — Campus Admin Management ─────────────────────────────────────

/** GET /superadmin/admins → User[] (ADMIN-role users) */
export async function apiGetAdmins() {
  return req("/superadmin/admins");
}

/** POST /superadmin/admins → User */
export async function apiCreateAdmin(dto) {
  return req("/superadmin/admins", { method: "POST", body: JSON.stringify(dto) });
}

/** PUT /superadmin/admins/:id → User */
export async function apiUpdateAdmin(id, dto) {
  return req(`/superadmin/admins/${id}`, { method: "PUT", body: JSON.stringify(dto) });
}

/** DELETE /superadmin/admins/:id → null */
export async function apiDeleteAdmin(id) {
  return req(`/superadmin/admins/${id}`, { method: "DELETE" });
}

/** PUT /superadmin/admins/:id/reset-password → string */
export async function apiResetAdminPassword(id, newPassword) {
  return req(`/superadmin/admins/${id}/reset-password`, {
    method: "PUT",
    body: JSON.stringify({ newPassword }),
  });
}

/** GET /superadmin/stats → { campusCount, adminCount, totalUsers, superAdminCount } */
export async function apiGetSuperAdminStats() {
  return req("/superadmin/stats");
}

/** GET /superadmin/campuses/summary → CampusSummary[] */
export async function apiGetCampusSummary() {
  return req("/superadmin/campuses/summary");
}

// ── Campus ────────────────────────────────────────────────────────────────────

/** GET /campuses → Campus[] */
export async function apiGetCampuses() {
  return req("/campuses");
}

/** GET /campuses/:id → Campus */
export async function apiGetCampus(id) {
  return req(`/campuses/${id}`);
}

/** POST /superadmin/campuses → Campus */
export async function apiCreateCampus(dto) {
  return req("/superadmin/campuses", { method: "POST", body: JSON.stringify(dto) });
}

/** PUT /superadmin/campuses/:id → Campus */
export async function apiUpdateCampus(id, dto) {
  return req(`/superadmin/campuses/${id}`, { method: "PUT", body: JSON.stringify(dto) });
}

/** DELETE /superadmin/campuses/:id → null */
export async function apiDeleteCampus(id) {
  return req(`/superadmin/campuses/${id}`, { method: "DELETE" });
}

// ── Slots ─────────────────────────────────────────────────────────────────────

/** GET /slots → Slot[] (all, system-wide — super admin) */
export async function apiGetAllSlots() {
  return req("/slots");
}

/** GET /slots/campus/:campusKey → Slot[] (campus-scoped) */
export async function apiGetSlotsByCampus(campusKey) {
  return req(`/slots/campus/${campusKey}`);
}

/** POST /slots/campus/:campusKey/seed?count=N&zone=A&type=STUDENT → Slot[] */
export async function apiSeedCampusSlots(campusKey, { count = 10, zone = "A", type = "STUDENT" } = {}) {
  return req(`/slots/campus/${campusKey}/seed?count=${count}&zone=${zone}&type=${type}`, { method: "POST" });
}

/** DELETE /slots/campus/:campusKey → { deleted: N } */
export async function apiDeleteCampusSlots(campusKey) {
  return req(`/slots/campus/${campusKey}`, { method: "DELETE" });
}

/** GET /slots/available → Long */
export async function apiGetAvailableCount() {
  return req("/slots/available");
}

/** GET /slots/occupied → Long */
export async function apiGetOccupiedCount() {
  return req("/slots/occupied");
}

/** GET /slots/zone/:zone → Slot[] */
export async function apiGetSlotsByZone(zone) {
  return req(`/slots/zone/${zone}`);
}

/** GET /slots/type/:type → Slot[] */
export async function apiGetSlotsByType(type) {
  return req(`/slots/type/${type}`);
}

/** PUT /slots/:id → Slot */
export async function apiUpdateSlot(id, occupied) {
  return req(`/slots/${id}`, { method: "PUT", body: JSON.stringify(occupied) });
}

/** POST /slots/create → Slot */
export async function apiCreateSlot(slot) {
  return req("/slots/create", { method: "POST", body: JSON.stringify(slot) });
}

// ── Parking Records ───────────────────────────────────────────────────────────

/** GET /parking/user/:userId → ParkingRecord[] */
export async function apiGetUserParkingHistory(userId) {
  return req(`/parking/user/${userId}`);
}

/** GET /parking/active → ParkingRecord[] */
export async function apiGetActiveParking() {
  return req("/parking/active");
}

/** GET /parking/logs?limit=N → ParkingRecord[] */
export async function apiGetRecentLogs(limit = 10) {
  return req(`/parking/logs?limit=${limit}`);
}

/** GET /visitor-passes/active → long */
export async function apiGetActiveVisitorCount() {
  return req("/visitor-passes/active");
}

export async function apiCreateVisitorPass(pass) {
  return req("/visitor-passes", { method: "POST", body: JSON.stringify(pass) });
}

export async function apiGetVisitorDailyCount(date) {
  return req(`/visitor-passes/daily-count${date ? `?date=${date}` : ""}`);
}

export async function apiGetVisitorPassLogs() {
  return req("/visitor-passes/logs");
}
