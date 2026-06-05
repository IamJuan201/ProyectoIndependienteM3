import { isAuthenticated } from '@services/auth.js';
import { renderLogin } from '@pages/login.js';
import { renderDashboard } from '@pages/dashboard.js';
import { renderProjects } from '@pages/projects.js';
import { renderProjectDetail } from '@pages/projectDetail.js';

const routes = {
  '/login': { render: renderLogin, public: true },
  '/dashboard': { render: renderDashboard, private: true },
  '/projects': { render: renderProjects, private: true },
  '/project': { render: renderProjectDetail, private: true },
};

export function navigate(path, params = {}) {
  const url = params.id ? `${path}?id=${params.id}` : path;
  history.pushState({ path, params }, '', url);
  handleRoute(path, params);
}

export function initRouter() {
  window.addEventListener('popstate', () => {
    const currentPath = window.location.pathname || '/';
    const currentParams = Object.fromEntries(new URLSearchParams(window.location.search));
    handleRoute(currentPath, currentParams);
  });

  const initialPath = window.location.pathname || '/';
  const initialParams = Object.fromEntries(new URLSearchParams(window.location.search));
  handleRoute(initialPath, initialParams);
}

function handleRoute(path, params = {}) {
  const appContainer = document.getElementById('app');

  if (path === '/' || path === '') {
    return navigate(isAuthenticated() ? '/dashboard' : '/login');
  }

  const matchedRoute = routes[path];

  if (!matchedRoute) {
    return navigate(isAuthenticated() ? '/dashboard' : '/login');
  }

  if (matchedRoute.private && !isAuthenticated()) {
    return navigate('/login');
  }

  if (matchedRoute.public && isAuthenticated()) {
    return navigate('/dashboard');
  }

  matchedRoute.render(appContainer, params);
}
