// ==========================================================================
// Confirmation Dialog Service (Promise-based)
// ==========================================================================

import { modal } from './modal.js';

export function confirmDialog({
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true
}) {
  return new Promise((resolve) => {
    const iconClass = isDestructive ? 'confirm-icon-danger' : 'confirm-icon-warning';
    const btnClass = isDestructive ? 'btn-danger' : 'btn-primary';
    const iconSvg = isDestructive
      ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`
      : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

    const content = `
      <div style="text-align: center; padding: 1rem 0;">
        <div class="confirm-icon-box ${iconClass}" style="margin: 0 auto 1.25rem;">
          ${iconSvg}
        </div>
        <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.5;">${message}</p>
      </div>
    `;

    const footer = `
      <button class="btn btn-secondary" id="confirm-cancel-btn">${cancelText}</button>
      <button class="btn ${btnClass}" id="confirm-proceed-btn">${confirmText}</button>
    `;

    modal.openModal({
      title,
      content,
      footer,
      maxWidth: '440px',
      onOpen: (overlay) => {
        const cancelBtn = overlay.querySelector('#confirm-cancel-btn');
        const proceedBtn = overlay.querySelector('#confirm-proceed-btn');

        cancelBtn.addEventListener('click', () => {
          modal.closeModal();
          resolve(false);
        });

        proceedBtn.addEventListener('click', () => {
          modal.closeModal();
          resolve(true);
        });
      }
    });
  });
}
