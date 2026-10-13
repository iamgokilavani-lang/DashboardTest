// ==========================================================================
// View: User Management (CRUD, Search, Advanced Filters, Sorting, Drawers)
// ==========================================================================

import { store } from '../data.js';
import { state } from '../state.js';
import { modal } from '../modal.js';
import { confirmDialog } from '../confirm.js';
import { toast } from '../toast.js';
import { exportToCSV, debounce } from '../utils.js';

export function renderUsers(container) {
  const users = store.getUsers();
  const filterState = state.filters.users;
  const sortState = state.sorting.users;
  const pageState = state.pagination.users;

  // 1. Filter dataset
  let filtered = users.filter(user => {
    if (filterState.search) {
      const q = filterState.search.toLowerCase();
      const match =
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        (user.orgName && user.orgName.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (filterState.role !== 'all' && user.role.toLowerCase() !== filterState.role.toLowerCase()) {
      return false;
    }
    if (filterState.status !== 'all' && user.status.toLowerCase() !== filterState.status.toLowerCase()) {
      return false;
    }
    if (filterState.mfa !== 'all') {
      const isMfa = filterState.mfa === 'enabled';
      if (user.mfaEnabled !== isMfa) return false;
    }
    return true;
  });

  // 2. Sort dataset
  filtered.sort((a, b) => {
    let valA = a[sortState.column] || '';
    let valB = b[sortState.column] || '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortState.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortState.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // 3. Paginate
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageState.perPage) || 1;
  const currentPage = Math.min(pageState.page, totalPages);
  const startIndex = (currentPage - 1) * pageState.perPage;
  const paginatedUsers = filtered.slice(startIndex, startIndex + pageState.perPage);

  // Quick Stats
  const activeCount = users.filter(u => u.status === 'Active').length;
  const invitedCount = users.filter(u => u.status === 'Invited').length;
  const suspendedCount = users.filter(u => u.status === 'Suspended').length;

  container.innerHTML = `
    <div class="page-header animate-fade-in">
      <div class="page-title-group">
        <h1>User & Access Management</h1>
        <p>Manage team members, roles, security policies, and organizations.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" id="btn-export-users">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </button>
        <button class="btn btn-primary" id="btn-add-user">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add New User
        </button>
      </div>
    </div>

    <!-- Quick Stats Pills -->
    <div class="metrics-grid animate-fade-in" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 1.5rem;">
      <div class="metric-card accent-primary" style="padding: 1rem 1.25rem;">
        <span class="metric-label">Total Users</span>
        <div class="metric-value" style="font-size: 1.5rem; margin-top: 0.35rem;">${users.length}</div>
      </div>
      <div class="metric-card accent-emerald" style="padding: 1rem 1.25rem;">
        <span class="metric-label">Active Accounts</span>
        <div class="metric-value" style="font-size: 1.5rem; margin-top: 0.35rem;">${activeCount}</div>
      </div>
      <div class="metric-card accent-violet" style="padding: 1rem 1.25rem;">
        <span class="metric-label">Pending Invites</span>
        <div class="metric-value" style="font-size: 1.5rem; margin-top: 0.35rem;">${invitedCount}</div>
      </div>
      <div class="metric-card accent-rose" style="padding: 1rem 1.25rem;">
        <span class="metric-label">Suspended</span>
        <div class="metric-value" style="font-size: 1.5rem; margin-top: 0.35rem;">${suspendedCount}</div>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="filter-bar animate-fade-in">
      <div class="filter-group-left">
        <div class="filter-search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            class="filter-search-input"
            id="users-search-input"
            placeholder="Search by name, email, or company..."
            value="${filterState.search}"
          />
        </div>

        <select class="filter-select" id="users-role-select">
          <option value="all" ${filterState.role === 'all' ? 'selected' : ''}>All Roles</option>
          <option value="owner" ${filterState.role === 'owner' ? 'selected' : ''}>Owner</option>
          <option value="admin" ${filterState.role === 'admin' ? 'selected' : ''}>Admin</option>
          <option value="member" ${filterState.role === 'member' ? 'selected' : ''}>Member</option>
          <option value="billing" ${filterState.role === 'billing' ? 'selected' : ''}>Billing</option>
          <option value="viewer" ${filterState.role === 'viewer' ? 'selected' : ''}>Viewer</option>
        </select>

        <select class="filter-select" id="users-status-select">
          <option value="all" ${filterState.status === 'all' ? 'selected' : ''}>All Statuses</option>
          <option value="active" ${filterState.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="invited" ${filterState.status === 'invited' ? 'selected' : ''}>Invited</option>
          <option value="suspended" ${filterState.status === 'suspended' ? 'selected' : ''}>Suspended</option>
        </select>

        <select class="filter-select" id="users-mfa-select">
          <option value="all" ${filterState.mfa === 'all' ? 'selected' : ''}>MFA (All)</option>
          <option value="enabled" ${filterState.mfa === 'enabled' ? 'selected' : ''}>MFA Enabled</option>
          <option value="disabled" ${filterState.mfa === 'disabled' ? 'selected' : ''}>MFA Disabled</option>
        </select>

        ${(filterState.search || filterState.role !== 'all' || filterState.status !== 'all' || filterState.mfa !== 'all') ? `
          <button class="btn btn-sm btn-ghost" id="btn-reset-user-filters" style="color: var(--accent-rose);">
            Clear Filters
          </button>
        ` : ''}
      </div>

      <div style="font-size: 0.82rem; color: var(--text-tertiary);">
        Showing <strong>${totalItems}</strong> matching users
      </div>
    </div>

    <!-- Data Table Container -->
    <div class="table-container animate-fade-in">
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th class="sortable" data-sort="name">
                <span class="th-content">User ${renderSortIcon('name', sortState)}</span>
              </th>
              <th class="sortable" data-sort="role">
                <span class="th-content">Role ${renderSortIcon('role', sortState)}</span>
              </th>
              <th class="sortable" data-sort="orgName">
                <span class="th-content">Organization ${renderSortIcon('orgName', sortState)}</span>
              </th>
              <th class="sortable" data-sort="status">
                <span class="th-content">Status ${renderSortIcon('status', sortState)}</span>
              </th>
              <th>MFA Security</th>
              <th class="sortable" data-sort="lastActive">
                <span class="th-content">Last Active ${renderSortIcon('lastActive', sortState)}</span>
              </th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${paginatedUsers.length > 0 ? paginatedUsers.map(u => `
              <tr data-user-id="${u.id}">
                <td>
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div class="avatar" style="background-color: ${u.avatarColor};">
                      ${u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div class="table-primary-text">${u.name}</div>
                      <div class="table-secondary-text">${u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge ${getRoleBadge(u.role)}">${u.role}</span>
                </td>
                <td>
                  <span class="table-primary-text">${u.orgName || 'Internal'}</span>
                </td>
                <td>
                  <span class="badge ${getStatusBadge(u.status)}">
                    <span class="badge-dot"></span>
                    ${u.status}
                  </span>
                </td>
                <td>
                  ${u.mfaEnabled ? `
                    <span style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; color: var(--accent-emerald);">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Verified
                    </span>
                  ` : `
                    <span style="font-size: 0.8rem; color: var(--text-tertiary);">Off</span>
                  `}
                </td>
                <td>
                  <span style="font-size: 0.84rem; color: var(--text-secondary);">${u.lastActive}</span>
                </td>
                <td>
                  <div class="table-actions" style="justify-content: flex-end;">
                    <button class="table-action-btn action-view-user" title="View Details" data-id="${u.id}">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button class="table-action-btn action-edit-user" title="Edit User" data-id="${u.id}">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                    </button>
                    <button class="table-action-btn danger action-delete-user" title="Delete User" data-id="${u.id}">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="7">
                  <div class="empty-state">
                    <div class="empty-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                    <h3>No users found</h3>
                    <p>No user accounts matched your search keywords or filter criteria.</p>
                    <button class="btn btn-secondary" id="empty-clear-users-btn">Clear All Filters</button>
                  </div>
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      ${totalItems > 0 ? `
        <div class="pagination-bar">
          <div class="pagination-info">
            <span>Showing <strong>${startIndex + 1}</strong> to <strong>${Math.min(startIndex + pageState.perPage, totalItems)}</strong> of <strong>${totalItems}</strong> entries</span>
            <select class="filter-select" id="users-per-page-select" style="height: 30px; padding-top: 0; padding-bottom: 0;">
              <option value="5" ${pageState.perPage === 5 ? 'selected' : ''}>5 per page</option>
              <option value="8" ${pageState.perPage === 8 ? 'selected' : ''}>8 per page</option>
              <option value="15" ${pageState.perPage === 15 ? 'selected' : ''}>15 per page</option>
              <option value="25" ${pageState.perPage === 25 ? 'selected' : ''}>25 per page</option>
            </select>
          </div>
          <div class="pagination-pages">
            <button class="page-btn" id="users-page-prev" ${currentPage <= 1 ? 'disabled' : ''}>&larr;</button>
            ${renderPageNumbers(currentPage, totalPages)}
            <button class="page-btn" id="users-page-next" ${currentPage >= totalPages ? 'disabled' : ''}>&rarr;</button>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  // Attach Table Listeners
  attachUserEvents(container);
}

function renderSortIcon(column, sortState) {
  if (sortState.column !== column) {
    return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.3;"><polyline points="7 13 12 18 17 13"/><polyline points="7 11 12 6 17 11"/></svg>`;
  }
  return sortState.direction === 'asc'
    ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>`
    : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`;
}

function renderPageNumbers(currentPage, totalPages) {
  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  return html;
}

function getRoleBadge(role) {
  switch (role) {
    case 'Owner': return 'badge-primary';
    case 'Admin': return 'badge-cyan';
    case 'Billing': return 'badge-warning';
    default: return 'badge-neutral';
  }
}

function getStatusBadge(status) {
  switch (status) {
    case 'Active': return 'badge-success';
    case 'Invited': return 'badge-warning';
    case 'Suspended': return 'badge-danger';
    default: return 'badge-neutral';
  }
}

function attachUserEvents(container) {
  // Search
  const searchInput = container.querySelector('#users-search-input');
  searchInput?.addEventListener('input', debounce((e) => {
    state.setFilter('users', 'search', e.target.value.trim());
    renderUsers(container);
  }, 250));

  // Dropdown filters
  container.querySelector('#users-role-select')?.addEventListener('change', (e) => {
    state.setFilter('users', 'role', e.target.value);
    renderUsers(container);
  });

  container.querySelector('#users-status-select')?.addEventListener('change', (e) => {
    state.setFilter('users', 'status', e.target.value);
    renderUsers(container);
  });

  container.querySelector('#users-mfa-select')?.addEventListener('change', (e) => {
    state.setFilter('users', 'mfa', e.target.value);
    renderUsers(container);
  });

  // Clear filters
  container.querySelector('#btn-reset-user-filters')?.addEventListener('click', () => {
    state.resetFilters('users');
    renderUsers(container);
  });

  container.querySelector('#empty-clear-users-btn')?.addEventListener('click', () => {
    state.resetFilters('users');
    renderUsers(container);
  });

  // Sorting
  container.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.getAttribute('data-sort');
      state.setSorting('users', col);
      renderUsers(container);
    });
  });

  // Pagination
  container.querySelector('#users-page-prev')?.addEventListener('click', () => {
    state.setPage('users', state.pagination.users.page - 1);
    renderUsers(container);
  });

  container.querySelector('#users-page-next')?.addEventListener('click', () => {
    state.setPage('users', state.pagination.users.page + 1);
    renderUsers(container);
  });

  container.querySelectorAll('.pagination-pages .page-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.setPage('users', Number(btn.getAttribute('data-page')));
      renderUsers(container);
    });
  });

  container.querySelector('#users-per-page-select')?.addEventListener('change', (e) => {
    state.setPerPage('users', e.target.value);
    renderUsers(container);
  });

  // Export
  container.querySelector('#btn-export-users')?.addEventListener('click', () => {
    const list = store.getUsers();
    exportToCSV('saas_users_export', list);
    toast.success('Export Ready', `Downloaded ${list.length} user records.`);
  });

  // Add User Modal
  container.querySelector('#btn-add-user')?.addEventListener('click', () => {
    openAddUserModal(container);
  });

  // Row Action buttons
  container.querySelectorAll('.action-view-user').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const user = store.getUsers().find(u => u.id === id);
      if (user) openUserDetailsDrawer(user, container);
    });
  });

  container.querySelectorAll('.action-edit-user').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const user = store.getUsers().find(u => u.id === id);
      if (user) openEditUserModal(user, container);
    });
  });

  container.querySelectorAll('.action-delete-user').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const user = store.getUsers().find(u => u.id === id);
      if (!user) return;

      const confirmed = await confirmDialog({
        title: 'Delete User Account',
        message: `Are you sure you want to permanently delete <strong>${user.name}</strong> (${user.email})? This user will lose access to all workspaces immediately.`,
        confirmText: 'Delete User',
        isDestructive: true
      });

      if (confirmed) {
        store.deleteUser(id);
        toast.success('User Deleted', `${user.name} has been removed.`);
        renderUsers(container);
      }
    });
  });
}

// Add User Modal with Validation
function openAddUserModal(mainContainer) {
  const content = `
    <form id="add-user-form" novalidate>
      <div class="form-group" id="group-user-name">
        <label class="form-label" for="new-user-name">Full Name <span class="required">*</span></label>
        <input type="text" class="form-control" id="new-user-name" placeholder="e.g. Gokilavani" required />
        <div class="form-error">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>
          Please provide a valid full name (at least 2 letters).
        </div>
      </div>

      <div class="form-group" id="group-user-email">
        <label class="form-label" for="new-user-email">Work Email <span class="required">*</span></label>
        <input type="email" class="form-control" id="new-user-email" placeholder="gokilavani@company.com" required />
        <div class="form-error">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>
          Please enter a valid work email address.
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="new-user-org">Organization / Customer Account</label>
        <select class="form-control" id="new-user-org">
          ${store.getCustomers().map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
          <option value="Internal Operations">Internal Operations</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label" for="new-user-role">Role & Permissions</label>
        <select class="form-control" id="new-user-role">
          <option value="Member">Member (Standard Workspace Access)</option>
          <option value="Admin">Admin (Full Team & API Management)</option>
          <option value="Billing">Billing (Invoices & Subscription Access)</option>
          <option value="Viewer">Viewer (Read-only access)</option>
          <option value="Owner">Owner (Primary Organization Owner)</option>
        </select>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-top: 1px solid var(--border-subtle); margin-top: 0.5rem;">
        <div>
          <div style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary);">Send Invitation Email</div>
          <div class="form-hint">User will receive a secure magic link to set up their password</div>
        </div>
        <label class="switch">
          <input type="checkbox" id="new-user-send-invite" checked />
          <span class="switch-slider"></span>
        </label>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-secondary" id="btn-cancel-add-user">Cancel</button>
    <button class="btn btn-primary" id="btn-submit-add-user">Create User</button>
  `;

  modal.openModal({
    title: 'Invite New User',
    content,
    footer,
    onOpen: (overlay) => {
      overlay.querySelector('#btn-cancel-add-user')?.addEventListener('click', () => modal.closeModal());

      const form = overlay.querySelector('#add-user-form');
      const submitBtn = overlay.querySelector('#btn-submit-add-user');

      submitBtn?.addEventListener('click', () => {
        const nameInput = overlay.querySelector('#new-user-name');
        const emailInput = overlay.querySelector('#new-user-email');
        const orgInput = overlay.querySelector('#new-user-org');
        const roleInput = overlay.querySelector('#new-user-role');

        let isValid = true;

        // Name validation
        if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
          overlay.querySelector('#group-user-name').classList.add('has-error');
          isValid = false;
        } else {
          overlay.querySelector('#group-user-name').classList.remove('has-error');
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
          overlay.querySelector('#group-user-email').classList.add('has-error');
          isValid = false;
        } else {
          overlay.querySelector('#group-user-email').classList.remove('has-error');
        }

        if (!isValid) return;

        // Create user
        const newUser = store.addUser({
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          role: roleInput.value,
          orgName: orgInput.value,
          status: 'Active',
          mfaEnabled: false
        });

        modal.closeModal();
        toast.success('User Invited', `${newUser.name} has been added successfully.`);
        renderUsers(mainContainer);
      });
    }
  });
}

// Edit User Modal
function openEditUserModal(user, mainContainer) {
  const content = `
    <form id="edit-user-form">
      <div class="form-group">
        <label class="form-label" for="edit-user-name">Full Name</label>
        <input type="text" class="form-control" id="edit-user-name" value="${user.name}" required />
      </div>

      <div class="form-group">
        <label class="form-label" for="edit-user-email">Work Email</label>
        <input type="email" class="form-control" id="edit-user-email" value="${user.email}" disabled />
        <span class="form-hint">Email address cannot be changed directly for security.</span>
      </div>

      <div class="form-group">
        <label class="form-label" for="edit-user-role">Role</label>
        <select class="form-control" id="edit-user-role">
          <option value="Owner" ${user.role === 'Owner' ? 'selected' : ''}>Owner</option>
          <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
          <option value="Member" ${user.role === 'Member' ? 'selected' : ''}>Member</option>
          <option value="Billing" ${user.role === 'Billing' ? 'selected' : ''}>Billing</option>
          <option value="Viewer" ${user.role === 'Viewer' ? 'selected' : ''}>Viewer</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label" for="edit-user-status">Account Status</label>
        <select class="form-control" id="edit-user-status">
          <option value="Active" ${user.status === 'Active' ? 'selected' : ''}>Active</option>
          <option value="Invited" ${user.status === 'Invited' ? 'selected' : ''}>Invited</option>
          <option value="Suspended" ${user.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
        </select>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 0.5rem;">
        <div>
          <div style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary);">Two-Factor Authentication (MFA)</div>
          <div class="form-hint">Hardware token or Authenticator App</div>
        </div>
        <label class="switch">
          <input type="checkbox" id="edit-user-mfa" ${user.mfaEnabled ? 'checked' : ''} />
          <span class="switch-slider"></span>
        </label>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-secondary" id="btn-cancel-edit-user">Cancel</button>
    <button class="btn btn-primary" id="btn-save-edit-user">Save Changes</button>
  `;

  modal.openModal({
    title: `Edit ${user.name}`,
    content,
    footer,
    onOpen: (overlay) => {
      overlay.querySelector('#btn-cancel-edit-user')?.addEventListener('click', () => modal.closeModal());
      overlay.querySelector('#btn-save-edit-user')?.addEventListener('click', () => {
        const nameVal = overlay.querySelector('#edit-user-name').value.trim();
        const roleVal = overlay.querySelector('#edit-user-role').value;
        const statusVal = overlay.querySelector('#edit-user-status').value;
        const mfaVal = overlay.querySelector('#edit-user-mfa').checked;

        store.updateUser(user.id, {
          name: nameVal,
          role: roleVal,
          status: statusVal,
          mfaEnabled: mfaVal
        });

        modal.closeModal();
        toast.success('User Updated', `Changes for ${user.name} have been saved.`);
        renderUsers(mainContainer);
      });
    }
  });
}

// User Details Slide-out Drawer
function openUserDetailsDrawer(user, mainContainer) {
  const content = `
    <div class="drawer-profile-header">
      <div class="drawer-avatar-lg" style="background-color: ${user.avatarColor};">
        ${user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
      </div>
      <div>
        <h3 style="font-size: 1.25rem;">${user.name}</h3>
        <p style="color: var(--text-secondary); margin-bottom: 0.35rem;">${user.email}</p>
        <div style="display: flex; gap: 0.5rem;">
          <span class="badge ${getRoleBadge(user.role)}">${user.role}</span>
          <span class="badge ${getStatusBadge(user.status)}"><span class="badge-dot"></span>${user.status}</span>
        </div>
      </div>
    </div>

    <div class="drawer-details-grid">
      <div class="drawer-detail-item">
        <div class="drawer-detail-label">User ID</div>
        <div class="drawer-detail-value" style="font-family: var(--font-mono); font-size: 0.8rem;">${user.id}</div>
      </div>
      <div class="drawer-detail-item">
        <div class="drawer-detail-label">Organization</div>
        <div class="drawer-detail-value">${user.orgName || 'Internal'}</div>
      </div>
      <div class="drawer-detail-item">
        <div class="drawer-detail-label">Created Date</div>
        <div class="drawer-detail-value">${user.createdAt}</div>
      </div>
      <div class="drawer-detail-item">
        <div class="drawer-detail-label">Last Active Session</div>
        <div class="drawer-detail-value">${user.lastActive}</div>
      </div>
    </div>

    <h4 style="margin-bottom: 0.75rem; font-size: 0.95rem;">Security & Compliance</h4>
    <div style="background-color: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.65rem;">
      <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
        <span style="color: var(--text-secondary);">Two-Factor Authentication:</span>
        <strong>${user.mfaEnabled ? '<span style="color: var(--accent-emerald);">Active (TOTP)</span>' : '<span style="color: var(--accent-rose);">Disabled</span>'}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
        <span style="color: var(--text-secondary);">SSO Provider:</span>
        <span>Google Workspace / SAML</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
        <span style="color: var(--text-secondary);">IP Whitelist Policy:</span>
        <span>Enforced</span>
      </div>
    </div>

    <h4 style="margin-bottom: 0.75rem; font-size: 0.95rem;">Activity History</h4>
    <div class="activity-feed">
      <div class="activity-item">
        <div class="activity-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
        <div class="activity-details">
          <div class="activity-title">Logged in via SSO Web Client</div>
          <div class="activity-time">${user.lastActive} &bull; Chrome on Windows</div>
        </div>
      </div>
      <div class="activity-item">
        <div class="activity-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg></div>
        <div class="activity-details">
          <div class="activity-title">API Token Generated: prod_rw_89</div>
          <div class="activity-time">3 days ago</div>
        </div>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-secondary" id="drawer-btn-edit-user">Edit Profile</button>
    <button class="btn btn-ghost" id="drawer-btn-close">Close</button>
  `;

  modal.openDrawer({
    title: 'User Profile Details',
    subtitle: `Detailed inspection for ${user.name}`,
    content,
    footer,
    onOpen: (overlay) => {
      overlay.querySelector('#drawer-btn-close')?.addEventListener('click', () => modal.closeDrawer());
      overlay.querySelector('#drawer-btn-edit-user')?.addEventListener('click', () => {
        modal.closeDrawer();
        openEditUserModal(user, mainContainer);
      });
    }
  });
}
