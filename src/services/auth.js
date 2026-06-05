const SESSION_KEY = 'pf_session';

export function saveSession(user) {
  const { password: removedPassword, ...safeUser } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated() {
  return !!getSession();
}

export function isManager() {
  const session = getSession();
  return session?.role === 'manager';
}

export function isCollaborator() {
  const session = getSession();
  return session?.role === 'collaborator';
}
