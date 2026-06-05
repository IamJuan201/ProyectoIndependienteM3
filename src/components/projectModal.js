import { getUsers } from '@services/api.js';
import { statusOptions } from '@utils/helpers.js';

export async function renderProjectModal({ title, project = {}, onSubmit, onClose }) {
  const allUsers = await getUsers();
  const statuses = statusOptions();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'project-modal';

  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-header">
        <h3 id="modal-title">${title}</h3>
        <button class="modal-close" id="modal-close" aria-label="Close">&times;</button>
      </div>

      <div id="modal-alert"></div>

      <div class="form-group">
        <label for="proj-name">Project Name</label>
        <input type="text" id="proj-name" placeholder="e.g. Website Redesign" value="${project.name || ''}" />
      </div>
      <div class="form-group">
        <label for="proj-desc">Description</label>
        <textarea id="proj-desc" placeholder="Describe the project scope...">${project.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label for="proj-status">Status</label>
        <select id="proj-status">
          ${statuses.map(s => `<option value="${s}" ${project.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label for="proj-assigned">Assigned To</label>
        <select id="proj-assigned">
          ${allUsers.map(u => `<option value="${u.id}" ${project.assignedTo == u.id ? 'selected' : ''}>${u.name} (${u.role})</option>`).join('')}
        </select>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary" id="modal-submit">Save Project</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeModal = () => {
    overlay.remove();
    onClose?.();
  };

  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);

  document.getElementById('modal-submit').addEventListener('click', async () => {
    const alertContainer = document.getElementById('modal-alert');
    const projectName = document.getElementById('proj-name').value.trim();
    const projectDescription = document.getElementById('proj-desc').value.trim();
    const projectStatus = document.getElementById('proj-status').value;
    const assignedUserId = parseInt(document.getElementById('proj-assigned').value);

    if (!projectName) {
      alertContainer.innerHTML = `<div class="alert alert-error">Project name is required.</div>`;
      return;
    }

    const submitButton = document.getElementById('modal-submit');
    submitButton.textContent = 'Saving...';
    submitButton.disabled = true;

    try {
      await onSubmit({ name: projectName, description: projectDescription, status: projectStatus, assignedTo: assignedUserId });
      closeModal();
    } catch (error) {
      alertContainer.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
      submitButton.textContent = 'Save Project';
      submitButton.disabled = false;
    }
  });
}

export function renderConfirmModal({ message, onConfirm, onClose }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  overlay.innerHTML = `
    <div class="modal" style="max-width:380px">
      <div class="modal-header">
        <h3>Confirm Delete</h3>
        <button class="modal-close" id="confirm-close">&times;</button>
      </div>
      <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:0.5rem">${message}</p>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="confirm-cancel">Cancel</button>
        <button class="btn btn-danger" id="confirm-ok">Delete</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeModal = () => { overlay.remove(); onClose?.(); };

  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.getElementById('confirm-close').addEventListener('click', closeModal);
  document.getElementById('confirm-cancel').addEventListener('click', closeModal);
  document.getElementById('confirm-ok').addEventListener('click', async () => {
    await onConfirm();
    closeModal();
  });
}
