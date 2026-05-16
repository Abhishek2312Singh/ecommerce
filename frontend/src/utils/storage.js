const USERS_KEY = "sph_users";

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function getUsers() {
  const users = safeParse(localStorage.getItem(USERS_KEY), []);
  return Array.isArray(users) ? users : [];
}

export function setUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function addUser(user) {
  const next = [{ id: makeId(), createdAt: Date.now(), ...user }, ...getUsers()];
  setUsers(next);
  return next[0];
}

export function updateUser(id, updates) {
  const next = getUsers().map((u) => (u.id === id ? { ...u, ...updates } : u));
  setUsers(next);
  return next.find((u) => u.id === id) || null;
}

export function deleteUser(id) {
  const next = getUsers().filter((u) => u.id !== id);
  setUsers(next);
}

