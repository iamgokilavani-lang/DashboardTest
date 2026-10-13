// ==========================================================================
// Toast Notification System
// ==========================================================================

class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    if (!document.querySelector('.toast-container')) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    } else {
      this.container = document.querySelector('.toast-container');
    }
  }

  show({ title, message, type = 'info', duration = 4000 }) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    } else {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-content">
        <div class="toast-title">${title || 'Notification'}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close" aria-label="Close notification">&times;</button>
      <div class="toast-progress"></div>
    `;

    this.container.appendChild(toast);

    const progressBar = toast.querySelector('.toast-progress');
    const closeBtn = toast.querySelector('.toast-close');

    // Animate progress bar
    progressBar.style.transition = `width ${duration}ms linear`;
    setTimeout(() => {
      progressBar.style.width = '0%';
    }, 10);

    let dismissTimer = setTimeout(() => {
      this.dismiss(toast);
    }, duration);

    closeBtn.addEventListener('click', () => {
      clearTimeout(dismissTimer);
      this.dismiss(toast);
    });

    toast.addEventListener('mouseenter', () => {
      clearTimeout(dismissTimer);
      progressBar.style.transition = 'none';
    });

    toast.addEventListener('mouseleave', () => {
      dismissTimer = setTimeout(() => {
        this.dismiss(toast);
      }, 1500);
    });
  }

  dismiss(toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  success(title, message) {
    this.show({ title, message, type: 'success' });
  }

  error(title, message) {
    this.show({ title, message, type: 'error' });
  }

  warning(title, message) {
    this.show({ title, message, type: 'warning' });
  }

  info(title, message) {
    this.show({ title, message, type: 'info' });
  }
}

export const toast = new ToastManager();
