export function statusBadge(status) {
  const statusClassMap = {
    'Active': 'status-active',
    'In Progress': 'status-in-progress',
    'Completed': 'status-completed',
    'On Hold': 'status-on-hold',
  };
  const badgeClass = statusClassMap[status] || 'status-on-hold';
  return `<span class="status-badge ${badgeClass}">${status}</span>`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function initials(name = '') {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
}

export function statusOptions() {
  return ['Active', 'In Progress', 'Completed', 'On Hold'];
}
