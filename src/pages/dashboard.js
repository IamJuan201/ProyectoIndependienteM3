import { getSession } from '@services/auth.js';
import { getProjects, updateProject } from '@services/api.js';
import { renderSidebar, bindSidebarEvents } from '@components/sidebar.js';
import { statusBadge, formatDate, statusOptions } from '@utils/helpers.js';
import { showToast } from '@utils/toast.js';

export async function renderDashboard(app) {
  const currentUser = getSession();

  app.innerHTML = `
    <div class="app-layout">
      ${renderSidebar('dashboard')}
      <main class="main-content">
        <div class="loading"><div class="spinner"></div> Loading dashboard...</div>
      </main>
    </div>
  `;

  bindSidebarEvents();

  try {
    const allProjects = await getProjects();
    const mainContainer = app.querySelector('.main-content');

    if (currentUser.role === 'manager') {
      renderManagerDashboard(mainContainer, allProjects, currentUser);
    } else {
      renderCollaboratorDashboard(mainContainer, allProjects, currentUser);
    }
  } catch (error) {
    app.querySelector('.main-content').innerHTML = `
      <div class="alert alert-error">Failed to load dashboard: ${error.message}</div>
    `;
  }
}

function renderManagerDashboard(mainContainer, projects, currentUser) {
  const totalCount = projects.length;
  const activeCount = projects.filter(p => p.status === 'Active').length;
  const inProgressCount = projects.filter(p => p.status === 'In Progress').length;
  const completedCount = projects.filter(p => p.status === 'Completed').length;

  mainContainer.innerHTML = `
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Welcome back, ${currentUser.name}. Here's your project overview.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card accent">
        <div class="stat-icon accent">[T]</div>
        <div class="stat-value">${totalCount}</div>
        <div class="stat-label">Total Projects</div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon success">[A]</div>
        <div class="stat-value">${activeCount}</div>
        <div class="stat-label">Active</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon warning">[P]</div>
        <div class="stat-value">${inProgressCount}</div>
        <div class="stat-label">In Progress</div>
      </div>
      <div class="stat-card info">
        <div class="stat-icon info">[C]</div>
        <div class="stat-value">${completedCount}</div>
        <div class="stat-label">Completed</div>
      </div>
    </div>

    <div class="section-header">
      <h2>Recent Projects</h2>
    </div>

    ${projects.length === 0
      ? '<div class="empty-state"><h3>No projects yet</h3><p>Create your first project from the Projects page.</p></div>'
      : `
        <div class="projects-table-wrap">
          <table class="projects-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              ${projects.slice(0, 5).map(p => `
                <tr>
                  <td class="project-name">${p.name}</td>
                  <td class="project-desc">${p.description || '—'}</td>
                  <td>${statusBadge(p.status)}</td>
                  <td style="color:var(--text-muted);font-size:0.8rem">${formatDate(p.createdAt)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `
    }
  `;
}

function renderCollaboratorDashboard(mainContainer, allProjects, currentUser) {
  const assignedProjects = allProjects.filter(p => p.assignedTo == currentUser.id);
  const statuses = statusOptions();

  mainContainer.innerHTML = `
    <div class="page-header">
      <h1>My Projects</h1>
      <p>Welcome, ${currentUser.name}. Here are your assigned projects.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card accent">
        <div class="stat-icon accent">[A]</div>
        <div class="stat-value">${assignedProjects.length}</div>
        <div class="stat-label">Assigned Projects</div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon success">[C]</div>
        <div class="stat-value">${assignedProjects.filter(p => p.status === 'Completed').length}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon warning">[P]</div>
        <div class="stat-value">${assignedProjects.filter(p => p.status === 'In Progress').length}</div>
        <div class="stat-label">In Progress</div>
      </div>
    </div>

    ${assignedProjects.length === 0
      ? '<div class="empty-state"><h3>No projects assigned</h3><p>Your manager has not assigned any projects yet.</p></div>'
      : `
        <div class="section-header"><h2>Project Status</h2></div>
        <div class="project-cards-grid" id="collab-cards">
          ${assignedProjects.map(p => `
            <div class="project-card" data-id="${p.id}">
              <div class="project-card-header">
                <h3>${p.name}</h3>
                ${statusBadge(p.status)}
              </div>
              <p>${p.description || 'No description provided.'}</p>
              <div class="project-card-footer">
                <span>${formatDate(p.createdAt)}</span>
                <select class="status-select" data-proj-id="${p.id}">
                  ${statuses.map(s => `<option value="${s}" ${p.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </div>
            </div>
          `).join('')}
        </div>
      `
    }
  `;

  mainContainer.querySelectorAll('.status-select').forEach(selectEl => {
    selectEl.addEventListener('change', async () => {
      const projectId = selectEl.dataset.projId;
      const newStatus = selectEl.value;
      try {
        await updateProject(projectId, { status: newStatus });
        showToast('Status updated!', 'success');
        const projectCard = mainContainer.querySelector(`.project-card[data-id="${projectId}"]`);
        if (projectCard) {
          const cardHeader = projectCard.querySelector('.project-card-header');
          const existingBadge = cardHeader.querySelector('.status-badge');
          if (existingBadge) existingBadge.outerHTML = statusBadge(newStatus);
        }
      } catch (error) {
        showToast('Failed to update status.', 'error');
        console.error(error);
      }
    });
  });
}
