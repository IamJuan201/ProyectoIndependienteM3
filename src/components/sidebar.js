import { getSession, clearSession } from '@services/auth.js';
import { navigate } from '../router.js';
import { initials } from '@utils/helpers.js';

export function renderSidebar(activePage) {
  const currentUser = getSession();
  const userIsManager = currentUser?.role === 'manager';

  const managerLinks = `
    <div class="sidebar-section">
      <div class="sidebar-section-title">Management</div>
      <button class="nav-link ${activePage === 'projects' ? 'active' : ''}" data-nav="/projects">
        <span class="nav-icon">[P]</span> All Projects
      </button>
    </div>
  `;

  return `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-text">Project<span>Flow</span></div>
        <div class="logo-sub">Internal Manager</div>
      </div>

      <div class="sidebar-section">
        <div class="sidebar-section-title">Overview</div>
        <button class="nav-link ${activePage === 'dashboard' ? 'active' : ''}" data-nav="/dashboard">
          <span class="nav-icon">[D]</span> Dashboard
        </button>
      </div>

      ${userIsManager ? managerLinks : ''}

      <div class="sidebar-user">
        <div class="user-info">
          <div class="user-avatar">${initials(currentUser?.name)}</div>
          <div class="user-details">
            <div class="user-name">${currentUser?.name || 'User'}</div>
            <span class="badge-role ${currentUser?.role}">${currentUser?.role || ''}</span>
          </div>
        </div>
        <button class="btn-logout" id="logout-btn">
          Sign Out
        </button>
      </div>
    </aside>
  `;
}

export function bindSidebarEvents() {
  document.querySelectorAll('[data-nav]').forEach(navButton => {
    navButton.addEventListener('click', () => navigate(navButton.dataset.nav));
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    clearSession();
    navigate('/login');
  });
}
