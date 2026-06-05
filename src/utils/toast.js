export function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const iconMap = { success: '[ok]', error: '[x]', info: '[i]' };
  const toastElement = document.createElement('div');
  toastElement.className = `toast ${type}`;
  toastElement.textContent = `${iconMap[type] || ''} ${message}`;
  toastContainer.appendChild(toastElement);

  setTimeout(() => {
    toastElement.style.opacity = '0';
    toastElement.style.transform = 'translateX(20px)';
    toastElement.style.transition = 'all 0.3s ease';
    setTimeout(() => toastElement.remove(), 300);
  }, 3000);
}
