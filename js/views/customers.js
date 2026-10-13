// ==========================================================================
// View: Customer Management (Accounts, Organizations, Health Scores, Drawers)
// ==========================================================================

import { store } from '../data.js';
import { state } from '../state.js';
import { modal } from '../modal.js';
import { toast } from '../toast.js';
import { formatCurrency, exportToCSV, debounce } from '../utils.js';

export function renderCustomers(container) {
  const customers = store.getCustomers();
  const plans = store.getPlans();
  const filterState = state.filters.customers;
  const sortState = state.sorting.customers;
  const pageState = state.pagination.customers;

  // 1. Filter
  let filtered = customers.filter(c => {
    if (filterState.search) {
      const q = filterState.search.toLowerCase();
      const match =
        c.name.toLowerCase().includes(q) ||
        c.domain.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.contactEmail.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterState.health !== 'all' && c.healthScore.toLowerCase() !== filterState.health.toLowerCase()) {
      return false;
    }
    if (filterState.status !== 'all' && c.status.toLowerCase() !== filterState.status.toLowerCase()) {
      return false;
    }
    return true;
  });

  // 2. Sort
  filtered.sort((a, b) => {
    let valA = a[sortState.column] ?? '';
    let valB = b[sortState.column] ?? '';
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
  const paginated = filtered.slice(startIndex, startIndex + pageState.perPage);

  container.innerHTML = `
    <div class="page-header animate-fade-in">
      <div class="page-title-group">
        <h1>Customer Accounts & Organizations</h1>
        <p>Enterprise accounts, domain namespaces, account health indicators, and contract values.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" id="btn-export-customers">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar animate-fade-in">
      <div class="filter-group-left">
        <div class="filter-search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            class="filter-search-input"
            id="customers-search-input"
            placeholder="Search by company, domain, or contact..."
            value="${filterState.search}"
          />
        </div>

        <select class="filter-select" id="customers-health-select">
          <option value="all" ${filterState.health === 'all' ? 'selected' : ''}>Health Score (All)</option>
          <option value="good" ${filterState.health === 'good' ? 'selected' : ''}>Good</option>
          <option value="at risk" ${filterState.health === 'at risk' ? 'selected' : ''}>At Risk</option>
          <option value="churned" ${filterState.health === 'churned' ? 'selected' : ''}>Churned</option>
        </select>

        <select class="filter-select" id="customers-status-select">
          <option value="all" ${filterState.status === 'all' ? 'selected' : ''}>All Statuses</option>
          <option value="active" ${filterState.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="inactive" ${filterState.status === 'inactive' ? 'selected' : ''}>Inactive</option>
        </select>

        ${(filterState.search || filterState.health !== 'all' || filterState.status !== 'all') ? `
          <button class="btn btn-sm btn-ghost" id="btn-reset-customer-filters" style="color: var(--accent-rose);">
            Clear Filters
          </button>
        ` : ''}
      </div>

      <div style="font-size: 0.82rem; color: var(--text-tertiary);">
        Showing <strong>${totalItems}</strong> customers
      </div>
    </div>

    <!-- Table -->
    <div class="table-container animate-fade-in">
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th class="sortable" data-sort="name">
                <span class="th-content">Company Organization ${renderSortIcon('name', sortState)}</span>
              </th>
              <th class="sortable" data-sort="industry">
                <span class="th-content">Industry ${renderSortIcon('industry', sortState)}</span>
              </th>
              <th>Assigned Plan</th>
              <th class="sortable" data-sort="mrr">
                <span class="th-content">MRR ${renderSortIcon('mrr', sortState)}</span>
              </th>
              <th class="sortable" data-sort="healthScore">
                <span class="th-content">Health Score ${renderSortIcon('healthScore', sortState)}</span>
              </th>
              <th>Primary Contact</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${paginated.length > 0 ? paginated.map(c => {
              const plan = plans.find(p => p.id === c.planId);
              return `
                <tr data-cust-id="${c.id}">
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <div class="avatar" style="background: linear-gradient(135deg, var(--accent-primary), var(--accent-cyan)); font-size: 0.8rem;">
                        ${c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div class="table-primary-text">${c.name}</div>
                        <div class="table-secondary-text">${c.domain}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span>${c.industry}</span>
                  </td>
                  <td>
                    <span class="badge badge-primary">${plan ? plan.name : 'Custom'}</span>
                  </td>
                  <td>
                    <span class="table-primary-text">${formatCurrency(c.mrr)}</span>
                  </td>
                  <td>
                    <span class="badge ${getHealthBadge(c.healthScore)}">
                      <span class="badge-dot"></span>
                      ${c.healthScore}
                    </span>
                  </td>
                  <td>
                    <div>
                      <div style="font-size: 0.85rem; color: var(--text-primary);">${c.contactName}</div>
                      <div class="table-secondary-text">${c.contactEmail}</div>
                    </div>
                  </td>
                  <td>
                    <div class="table-actions" style="justify-content: flex-end;">
                      <button class="btn btn-sm btn-secondary action-view-customer" data-id="${c.id}">
                        View Profile
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('') : `
              <tr>
                <td colspan="7">
                  <div class="empty-state">
                    <div class="empty-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    </div>
                    <h3>No customers found</h3>
                    <p>No customer accounts matched your search keywords or filter criteria.</p>
                    <button class="btn btn-secondary" id="empty-clear-customers-btn">Clear Filters</button>
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
          </div>
          <div class="pagination-pages">
            <button class="page-btn" id="cust-page-prev" ${currentPage <= 1 ? 'disabled' : ''}>&larr;</button>
            ${renderPageNumbers(currentPage, totalPages)}
            <button class="page-btn" id="cust-page-next" ${currentPage >= totalPages ? 'disabled' : ''}>&rarr;</button>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  attachCustomerEvents(container);
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

function getHealthBadge(score) {
  switch (score) {
    case 'Good': return 'badge-success';
    case 'At Risk': return 'badge-warning';
    case 'Churned': return 'badge-danger';
    default: return 'badge-neutral';
  }
}

function attachCustomerEvents(container) {
  // Search
  container.querySelector('#customers-search-input')?.addEventListener('input', debounce((e) => {
    state.setFilter('customers', 'search', e.target.value.trim());
    renderCustomers(container);
  }, 250));

  // Health Filter
  container.querySelector('#customers-health-select')?.addEventListener('change', (e) => {
    state.setFilter('customers', 'health', e.target.value);
    renderCustomers(container);
  });

  // Status Filter
  container.querySelector('#customers-status-select')?.addEventListener('change', (e) => {
    state.setFilter('customers', 'status', e.target.value);
    renderCustomers(container);
  });

  container.querySelector('#btn-reset-customer-filters')?.addEventListener('click', () => {
    state.resetFilters('customers');
    renderCustomers(container);
  });

  container.querySelector('#empty-clear-customers-btn')?.addEventListener('click', () => {
    state.resetFilters('customers');
    renderCustomers(container);
  });

  // Sorting
  container.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.getAttribute('data-sort');
      state.setSorting('customers', col);
      renderCustomers(container);
    });
  });

  // Pagination
  container.querySelector('#cust-page-prev')?.addEventListener('click', () => {
    state.setPage('customers', state.pagination.customers.page - 1);
    renderCustomers(container);
  });

  container.querySelector('#cust-page-next')?.addEventListener('click', () => {
    state.setPage('customers', state.pagination.customers.page + 1);
    renderCustomers(container);
  });

  container.querySelectorAll('.pagination-pages .page-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.setPage('customers', Number(btn.getAttribute('data-page')));
      renderCustomers(container);
    });
  });

  // Export
  container.querySelector('#btn-export-customers')?.addEventListener('click', () => {
    const list = store.getCustomers();
    exportToCSV('saas_customers_export', list);
    toast.success('Customers Exported', `Downloaded ${list.length} customer records.`);
  });

  // View Customer Profile Drawer
  container.querySelectorAll('.action-view-customer').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const cust = store.getCustomers().find(c => c.id === id);
      if (cust) openCustomerDrawer(cust, container);
    });
  });
}

function openCustomerDrawer(cust, mainContainer) {
  const users = store.getUsers().filter(u => u.customerId === cust.id);
  const plan = store.getPlans().find(p => p.id === cust.planId);

  const content = `
    <div class="drawer-profile-header">
      <div class="drawer-avatar-lg" style="background: linear-gradient(135deg, var(--accent-primary), var(--accent-cyan));">
        ${cust.name.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <h3 style="font-size: 1.25rem;">${cust.name}</h3>
        <p style="color: var(--text-secondary); margin-bottom: 0.35rem;">${cust.domain} &bull; ${cust.industry}</p>
        <div style="display: flex; gap: 0.5rem;">
          <span class="badge ${getHealthBadge(cust.healthScore)}"><span class="badge-dot"></span>Health: ${cust.healthScore}</span>
          <span class="badge badge-primary">${plan ? plan.name : 'Custom'} Plan</span>
        </div>
      </div>
    </div>

    <div class="drawer-details-grid">
      <div class="drawer-detail-item">
        <div class="drawer-detail-label">Monthly Value (MRR)</div>
        <div class="drawer-detail-value">${formatCurrency(cust.mrr)}</div>
      </div>
      <div class="drawer-detail-item">
        <div class="drawer-detail-label">Active Team Seats</div>
        <div class="drawer-detail-value">${cust.seatsUsed} seats occupied</div>
      </div>
      <div class="drawer-detail-item">
        <div class="drawer-detail-label">Primary Executive Contact</div>
        <div class="drawer-detail-value">${cust.contactName}</div>
      </div>
      <div class="drawer-detail-item">
        <div class="drawer-detail-label">Customer Since</div>
        <div class="drawer-detail-value">${cust.createdAt}</div>
      </div>
    </div>

    <h4 style="margin-bottom: 0.75rem; font-size: 0.95rem;">Assigned Workspace Users (${users.length})</h4>
    <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem;">
      ${users.length > 0 ? users.map(u => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.85rem; background-color: var(--bg-tertiary); border-radius: var(--radius-sm); font-size: 0.85rem;">
          <div>
            <div style="font-weight: 600; color: var(--text-primary);">${u.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-tertiary);">${u.email}</div>
          </div>
          <span class="badge badge-neutral">${u.role}</span>
        </div>
      `).join('') : `
        <div style="color: var(--text-tertiary); font-size: 0.85rem; padding: 0.5rem 0;">No individual team users linked to this tenant.</div>
      `}
    </div>

    <h4 style="margin-bottom: 0.75rem; font-size: 0.95rem;">Contract & Billing</h4>
    <div style="background-color: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.5rem;">
      <div style="display: flex; justify-content: space-between;">
        <span style="color: var(--text-secondary);">Billing Contact:</span>
        <strong>${cust.contactEmail}</strong>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: var(--text-secondary);">Currency:</span>
        <strong>USD ($)</strong>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: var(--text-secondary);">Tax ID / VAT:</span>
        <span style="font-family: var(--font-mono);">US-8921-994</span>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-secondary" id="drawer-btn-close-cust">Close</button>
  `;

  modal.openDrawer({
    title: 'Customer Account Dossier',
    subtitle: `Inspection for ${cust.name}`,
    content,
    footer,
    onOpen: (overlay) => {
      overlay.querySelector('#drawer-btn-close-cust')?.addEventListener('click', () => modal.closeDrawer());
    }
  });
}
