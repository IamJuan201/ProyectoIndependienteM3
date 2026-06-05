import { getSession } from '@services/auth.js';
import { getProjects, createProject, updateProject, deleteProject, getUserById } from '@services/api.js';
import { renderSidebar, bindSidebarEvents } from '@components/sidebar.js';
import { renderProjectModal, renderConfirmModal } from '@components/projectModal.js';
import { statusBadge, formatDate } from '@utils/helpers.js';
import { showToast } from '@utils/toast.js';
import { navigate } from '../router.js';

export async function renderProjects(app) {
  const currentUser = getSession();

  if (currentUser?.role !== 'manager') {
    navigate('/dashboard');
    return;
  }

  app.innerHTML = `
    <div class="app-layout">
      ${renderSidebar('projects')}
      <main class="main-content">
        <div class="loading"><div class="spinner"></div> Loading projects...</div>
      </main>
    </div>
  `;

  bindSidebarEvents();
  await loadProjects(app.querySelector('.main-content'));
}

async function loadProjects(mainContainer) {
  try {
    const projects = await getProjects();

    const enrichedProjects = await Promise.all(projects.map(async project => {
      try {
        const assignedUser = await getUserById(project.assignedTo);
        return { ...project, assignedName: assignedUser?.name || '—' };
      } catch {
        return { ...project, assignedName: '—' };
      }
    }));

    renderProjectsTable(mainContainer, enrichedProjects);
  } catch (error) {
    mainContainer.innerHTML = `<div class="alert alert-error">Failed to load projects: ${error.message}</div>`;
  }
}

function renderProjectsTable(mainContainer, projects) {
  mainContainer.innerHTML = `
    <div class="page-header">
      <h1>All Projects</h1>
      <p>Manage and track all company projects.</p>
    </div>

    <div class="section-header">
      <h2>${projects.length} project${projects.length !== 1 ? 's' : ''}</h2>
      <button class="btn btn-primary btn-sm" id="new-project-btn">+ New Project</button>
    </div>

    ${projects.length === 0
      ? `<div class="empty-state">
          <h3>No projects yet</h3>
          <p>Click "New Project" to create your first one.</p>
        </div>`
      : `
        <div class="projects-table-wrap">
          <table class="projects-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="projects-tbody">
              ${projects.map(p => `
                <tr data-id="${p.id}">
                  <td class="project-name">${p.name}</td>
                  <td class="project-desc">${p.description || '—'}</td>
                  <td>${statusBadge(p.status)}</td>
                  <td style="font-size:0.85rem;color:var(--text-secondary)">${p.assignedName}</td>
                  <td style="color:var(--text-muted);font-size:0.8rem">${formatDate(p.createdAt)}</td>
                  <td>
                    <div class="actions-cell">
                      <button class="btn btn-secondary btn-sm btn-icon detail-btn" title="View details" data-id="${p.id}">View</button>
                      <button class="btn btn-secondary btn-sm btn-icon edit-btn" title="Edit" data-id="${p.id}">Edit</button>
                      <button class="btn btn-danger btn-sm btn-icon delete-btn" title="Delete" data-id="${p.id}">Delete</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `
    }
  `;

  document.getElementById('new-project-btn').addEventListener('click', () => {
    renderProjectModal({
      title: 'Create New Project',
      onSubmit: async (data) => {
        const newProject = { ...data, createdAt: new Date().toISOString().split('T')[0] };
        await createProject(newProject);
        showToast('Project created!', 'success');
        await loadProjects(mainContainer);
      },
    });
  });

  mainContainer.querySelectorAll('.detail-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate('/project', { id: btn.dataset.id }));
  });

  mainContainer.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const projectId = btn.dataset.id;
      const targetProject = projects.find(p => p.id == projectId);
      if (!targetProject) return;
      renderProjectModal({
        title: 'Edit Project',
        project: targetProject,
        onSubmit: async (data) => {
          await updateProject(projectId, data);
          showToast('Project updated!', 'success');
          await loadProjects(mainContainer);
        },
      });
    });
  });

  mainContainer.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const projectId = btn.dataset.id;
      const targetProject = projects.find(p => p.id == projectId);
      renderConfirmModal({
        message: `Are you sure you want to delete "<strong>${targetProject?.name}</strong>"? This action cannot be undone.`,
        onConfirm: async () => {
          await deleteProject(projectId);
          showToast('Project deleted.', 'info');
          await loadProjects(mainContainer);
        },
      });
    });
  });
}
