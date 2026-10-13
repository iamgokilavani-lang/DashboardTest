// ==========================================================================
// Modal & Slide-out Drawer Controller
// ==========================================================================

class ModalManager {
  constructor() {
    this.activeModal = null;
    this.activeDrawer = null;
    this.initGlobalListeners();
  }

  initGlobalListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.activeModal) this.closeModal();
        if (this.activeDrawer) this.closeDrawer();
      }
    });
  }

  openModal({ id, title, content, footer, maxWidth = '560px', onOpen }) {
    this.closeModal(); // close any existing

    let overlay = document.getElementById('global-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'global-modal-overlay';
      overlay.className = 'modal-overlay';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="modal-card" style="max-width: ${maxWidth};">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close-btn" id="modal-close-x" aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body" id="modal-content-body">
          ${content || ''}
        </div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    `;

    overlay.classList.add('active');
    this.activeModal = overlay;

    // Overlay click dismiss
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeModal();
    });

    const closeBtn = overlay.querySelector('#modal-close-x');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());

    if (onOpen) onOpen(overlay);
  }

  closeModal() {
    const overlay = document.getElementById('global-modal-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => {
        if (overlay.parentNode) overlay.innerHTML = '';
      }, 200);
    }
    this.activeModal = null;
  }

  openDrawer({ title, subtitle, content, footer, onOpen }) {
    this.closeDrawer();

    let overlay = document.getElementById('global-drawer-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'global-drawer-overlay';
      overlay.className = 'drawer-overlay';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="drawer-panel">
        <div class="drawer-header">
          <div>
            <h3>${title}</h3>
            ${subtitle ? `<p class="form-hint">${subtitle}</p>` : ''}
          </div>
          <button class="modal-close-btn" id="drawer-close-x" aria-label="Close drawer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="drawer-body" id="drawer-content-body">
          ${content || ''}
        </div>
        ${footer ? `<div class="drawer-footer">${footer}</div>` : ''}
      </div>
    `;

    overlay.classList.add('active');
    this.activeDrawer = overlay;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeDrawer();
    });

    const closeBtn = overlay.querySelector('#drawer-close-x');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeDrawer());

    if (onOpen) onOpen(overlay);
  }

  closeDrawer() {
    const overlay = document.getElementById('global-drawer-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => {
        if (overlay.parentNode) overlay.innerHTML = '';
      }, 250);
    }
    this.activeDrawer = null;
  }
}

export const modal = new ModalManager();
