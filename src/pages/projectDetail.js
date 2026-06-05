import { getSession } from '@services/auth.js';
import { getProjectById, getUserById, updateProject } from '@services/api.js';
import { renderSidebar, bindSidebarEvents } from '@components/sidebar.js';
import { renderProjectModal } from '@components/projectModal.js';
import { statusBadge, formatDate, statusOptions } from '@utils/helpers.js';
import { showToast } from '@utils/toast.js';
import { navigate } from '../router.js';

export async function renderProjectDetail(app, params) {
  const { id } = params;
  const currentUser = getSession();

  if (!id) {
    navigate('/dashboard');
    return;
  }

  const activeSidebarPage = currentUser.role === 'manager' ? 'projects' : 'dashboard';

  app.innerHTML = `
    <div class="app-layout">
      ${renderSidebar(activeSidebarPage)}
      <main class="main-content">
        <div class="loading"><div class="spinner"></div> Loading project...</div>
      </main>
    </div>
  `;

  bindSidebarEvents();

  const mainContainer = app.querySelector('.main-content');

  try {
    const project = await getProjectById(id);
    let assignedUser = null;
    try { assignedUser = await getUserById(project.assignedTo); } catch {}

    if (currentUser.role === 'collaborator' && project.assignedTo != currentUser.id) {
      mainContainer.innerHTML = `
        <div class="alert alert-error">You don't have permission to view this project.</div>
        <button class="btn btn-secondary" onclick="history.back()">Go Back</button>
      `;
      return;
    }

    renderDetail(mainContainer, project, assignedUser, currentUser, id);
  } catch (error) {
    mainContainer.innerHTML = `<div class="alert alert-error">Failed to load project: ${error.message}</div>`;
  }
}

function renderDetail(mainContainer, project, assignedUser, currentUser, projectId) {
  const userIsManager = currentUser.role === 'manager';
  const statuses = statusOptions();

  mainContainer.innerHTML = `
    <div class="page-header">
      <button class="btn btn-secondary btn-sm" id="back-btn" style="margin-bottom:1rem">Back</button>
      <h1>${project.name}</h1>
      <p>${project.description || 'No description provided.'}</p>
    </div>

    <div class="detail-card">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
        <div style="display:flex;align-items:center;gap:0.75rem">
          ${statusBadge(project.status)}
          <span style="font-size:0.8rem;color:var(--text-muted)">Created ${formatDate(project.createdAt)}</span>
        </div>
        <div style="display:flex;gap:0.75rem">
          ${userIsManager
            ? `<button class="btn btn-success btn-sm" id="edit-btn">Edit Project</button>`
            : `
              <select class="status-select" id="collab-status-sel" style="padding:0.5rem 0.75rem;font-size:0.85rem">
                ${statuses.map(s => `<option value="${s}" ${project.status === s ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
              <button class="btn btn-success btn-sm" id="save-status-btn">Save Status</button>
            `
          }
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-item">
          <label>Assigned To</label>
          <p>${assignedUser?.name || '—'} <span style="color:var(--text-muted);font-size:0.8rem">(${assignedUser?.role || ''})</span></p>
        </div>
        <div class="detail-item">
          <label>Email</label>
          <p style="color:var(--text-secondary)">${assignedUser?.email || '—'}</p>
        </div>
        <div class="detail-item">
          <label>Current Status</label>
          <p id="current-status">${project.status}</p>
        </div>
        <div class="detail-item">
          <label>Project ID</label>
          <p style="color:var(--text-muted);font-family:monospace">#${project.id}</p>
        </div>
      </div>
    </div>

    ${project.description ? `
      <div class="detail-card">
        <h3 style="font-family:var(--font-display);font-size:1rem;margin-bottom:0.75rem">Description</h3>
        <p style="color:var(--text-secondary);line-height:1.7;font-size:0.9rem">${project.description}</p>
      </div>
    ` : ''}
  `;

  document.getElementById('back-btn').addEventListener('click', () => {
    if (userIsManager) navigate('/projects');
    else navigate('/dashboard');
  });

  if (userIsManager) {
    document.getElementById('edit-btn').addEventListener('click', () => {
      renderProjectModal({
        title: 'Edit Project',
        project,
        onSubmit: async (data) => {
          await updateProject(projectId, data);
          showToast('Project updated!', 'success');
          const updatedProject = await getProjectById(projectId);
          let refreshedUser = null;
          try { refreshedUser = await getUserById(updatedProject.assignedTo); } catch {}
          renderDetail(mainContainer, updatedProject, refreshedUser, currentUser, projectId);
        },
      });
    });
  } else {
    document.getElementById('save-status-btn').addEventListener('click', async () => {
      const selectedStatus = document.getElementById('collab-status-sel').value;
      try {
        await updateProject(projectId, { status: selectedStatus });
        document.getElementById('current-status').textContent = selectedStatus;
        showToast('Status updated!', 'success');
      } catch {
        showToast('Failed to update status.', 'error');
      }
    });
  }
}
