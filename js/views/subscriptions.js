// ==========================================================================
// View: Subscription Management (Lifecycle, Status, Upgrade, Pause, Cancel)
// ==========================================================================

import { store } from '../data.js';
import { state } from '../state.js';
import { modal } from '../modal.js';
import { confirmDialog } from '../confirm.js';
import { toast } from '../toast.js';
import { formatCurrency, exportToCSV, debounce } from '../utils.js';

export function renderSubscriptions(container) {
  const subs = store.getSubscriptions();
  const plans = store.getPlans();
  const filterState = state.filters.subscriptions;
  const sortState = state.sorting.subscriptions;
  const pageState = state.pagination.subscriptions;

  // 1. Filter
  let filtered = subs.filter(sub => {
    if (filterState.search) {
      const q = filterState.search.toLowerCase();
      const match =
        sub.customerName.toLowerCase().includes(q) ||
        sub.id.toLowerCase().includes(q) ||
        sub.planName.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterState.status !== 'all' && sub.status.toLowerCase() !== filterState.status.toLowerCase()) {
      return false;
    }
    if (filterState.plan !== 'all' && sub.planId.toLowerCase() !== filterState.plan.toLowerCase()) {
      return false;
    }
    if (filterState.interval !== 'all' && sub.billingInterval.toLowerCase() !== filterState.interval.toLowerCase()) {
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
  const paginatedSubs = filtered.slice(startIndex, startIndex + pageState.perPage);

  // Quick summaries
  const activeMrr = subs.reduce((acc, s) => acc + (s.status === 'Active' ? s.mrr : 0), 0);
  const trialingCount = subs.filter(s => s.status === 'Trialing').length;
  const pastDueCount = subs.filter(s => s.status === 'Past Due').length;

  container.innerHTML = `
    <div class="page-header animate-fade-in">
      <div class="page-title-group">
        <h1>Subscription Management</h1>
        <p>Monitor recurring billings, lifecycle state machines, proration, and churn prevention.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" id="btn-export-subs">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </button>
      </div>
    </div>

    <!-- Quick Metric Cards -->
    <div class="metrics-grid animate-fade-in" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 1.5rem;">
      <div class="metric-card accent-primary" style="padding: 1rem 1.25rem;">
        <span class="metric-label">Sample Subscriptions MRR</span>
        <div class="metric-value" style="font-size: 1.5rem; margin-top: 0.35rem;">${formatCurrency(activeMrr)}</div>
      </div>
      <div class="metric-card accent-violet" style="padding: 1rem 1.25rem;">
        <span class="metric-label">Active Trials</span>
        <div class="metric-value" style="font-size: 1.5rem; margin-top: 0.35rem;">${trialingCount} In Progress</div>
      </div>
      <div class="metric-card accent-rose" style="padding: 1rem 1.25rem;">
        <span class="metric-label">Payment Delinquency</span>
        <div class="metric-value" style="font-size: 1.5rem; margin-top: 0.35rem;">${pastDueCount} Past Due</div>
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
            id="subs-search-input"
            placeholder="Search by customer or subscription ID..."
            value="${filterState.search}"
          />
        </div>

        <select class="filter-select" id="subs-status-select">
          <option value="all" ${filterState.status === 'all' ? 'selected' : ''}>All Statuses</option>
          <option value="active" ${filterState.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="trialing" ${filterState.status === 'trialing' ? 'selected' : ''}>Trialing</option>
          <option value="past due" ${filterState.status === 'past due' ? 'selected' : ''}>Past Due</option>
          <option value="paused" ${filterState.status === 'paused' ? 'selected' : ''}>Paused</option>
          <option value="canceled" ${filterState.status === 'canceled' ? 'selected' : ''}>Canceled</option>
        </select>

        <select class="filter-select" id="subs-plan-select">
          <option value="all" ${filterState.plan === 'all' ? 'selected' : ''}>All Plans</option>
          ${plans.map(p => `
            <option value="${p.id}" ${filterState.plan === p.id ? 'selected' : ''}>${p.name}</option>
          `).join('')}
        </select>

        <select class="filter-select" id="subs-interval-select">
          <option value="all" ${filterState.interval === 'all' ? 'selected' : ''}>Billing Cycle (All)</option>
          <option value="monthly" ${filterState.interval === 'monthly' ? 'selected' : ''}>Monthly</option>
          <option value="annual" ${filterState.interval === 'annual' ? 'selected' : ''}>Annual</option>
        </select>

        ${(filterState.search || filterState.status !== 'all' || filterState.plan !== 'all' || filterState.interval !== 'all') ? `
          <button class="btn btn-sm btn-ghost" id="btn-reset-sub-filters" style="color: var(--accent-rose);">
            Clear Filters
          </button>
        ` : ''}
      </div>

      <div style="font-size: 0.82rem; color: var(--text-tertiary);">
        Showing <strong>${totalItems}</strong> subscriptions
      </div>
    </div>

    <!-- Table -->
    <div class="table-container animate-fade-in">
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th class="sortable" data-sort="customerName">
                <span class="th-content">Customer ${renderSortIcon('customerName', sortState)}</span>
              </th>
              <th class="sortable" data-sort="planName">
                <span class="th-content">Plan ${renderSortIcon('planName', sortState)}</span>
              </th>
              <th class="sortable" data-sort="billingInterval">
                <span class="th-content">Interval ${renderSortIcon('billingInterval', sortState)}</span>
              </th>
              <th class="sortable" data-sort="status">
                <span class="th-content">Status ${renderSortIcon('status', sortState)}</span>
              </th>
              <th class="sortable" data-sort="mrr">
                <span class="th-content">MRR Contribution ${renderSortIcon('mrr', sortState)}</span>
              </th>
              <th class="sortable" data-sort="currentPeriodEnd">
                <span class="th-content">Next Renewal ${renderSortIcon('currentPeriodEnd', sortState)}</span>
              </th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${paginatedSubs.length > 0 ? paginatedSubs.map(s => `
              <tr data-sub-id="${s.id}">
                <td>
                  <div>
                    <div class="table-primary-text">${s.customerName}</div>
                    <div class="table-secondary-text" style="font-family: var(--font-mono);">${s.id} &bull; ${s.paymentMethod}</div>
                  </div>
                </td>
                <td>
                  <span class="table-primary-text">${s.planName}</span>
                </td>
                <td>
                  <span class="badge ${s.billingInterval === 'Annual' ? 'badge-primary' : 'badge-neutral'}">
                    ${s.billingInterval}
                  </span>
                </td>
                <td>
                  <span class="badge ${getSubStatusBadge(s.status)}">
                    <span class="pulse-indicator ${getSubStatusPulse(s.status)}" style="width: 6px; height: 6px;"></span>
                    ${s.status}
                  </span>
                </td>
                <td>
                  <span class="table-primary-text" style="font-size: 0.95rem;">${formatCurrency(s.mrr)}</span>
                  <div class="table-secondary-text">Billed: ${formatCurrency(s.amount)}</div>
                </td>
                <td>
                  <span style="font-size: 0.85rem; color: var(--text-secondary);">${s.currentPeriodEnd}</span>
                  <div class="table-secondary-text">${s.autoRenew ? 'Auto-renew ON' : 'Expires on period end'}</div>
                </td>
                <td>
                  <div class="table-actions" style="justify-content: flex-end;">
                    <button class="btn btn-sm btn-secondary action-upgrade-sub" data-id="${s.id}">Change Plan</button>
                    <button class="table-action-btn action-toggle-sub" data-id="${s.id}" title="${s.status === 'Paused' ? 'Resume Subscription' : 'Pause Subscription'}">
                      ${s.status === 'Paused' ? `
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      ` : `
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                      `}
                    </button>
                    <button class="table-action-btn danger action-cancel-sub" data-id="${s.id}" title="Cancel Subscription">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="7">
                  <div class="empty-state">
                    <div class="empty-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/></svg>
                    </div>
                    <h3>No subscriptions found</h3>
                    <p>No subscription records matched your active filter selections.</p>
                    <button class="btn btn-secondary" id="empty-clear-subs-btn">Reset Filters</button>
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
            <button class="page-btn" id="subs-page-prev" ${currentPage <= 1 ? 'disabled' : ''}>&larr;</button>
            ${renderPageNumbers(currentPage, totalPages)}
            <button class="page-btn" id="subs-page-next" ${currentPage >= totalPages ? 'disabled' : ''}>&rarr;</button>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  attachSubEvents(container);
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

function getSubStatusBadge(status) {
  switch (status) {
    case 'Active': return 'badge-success';
    case 'Trialing': return 'badge-primary';
    case 'Past Due': return 'badge-danger';
    case 'Paused': return 'badge-warning';
    case 'Canceled': return 'badge-neutral';
    default: return 'badge-neutral';
  }
}

function getSubStatusPulse(status) {
  switch (status) {
    case 'Active': return 'pulse-emerald';
    case 'Trialing': return 'pulse-primary';
    case 'Past Due': return 'pulse-rose';
    case 'Paused': return 'pulse-amber';
    default: return 'pulse-primary';
  }
}

function attachSubEvents(container) {
  // Search
  container.querySelector('#subs-search-input')?.addEventListener('input', debounce((e) => {
    state.setFilter('subscriptions', 'search', e.target.value.trim());
    renderSubscriptions(container);
  }, 250));

  // Select Filters
  container.querySelector('#subs-status-select')?.addEventListener('change', (e) => {
    state.setFilter('subscriptions', 'status', e.target.value);
    renderSubscriptions(container);
  });

  container.querySelector('#subs-plan-select')?.addEventListener('change', (e) => {
    state.setFilter('subscriptions', 'plan', e.target.value);
    renderSubscriptions(container);
  });

  container.querySelector('#subs-interval-select')?.addEventListener('change', (e) => {
    state.setFilter('subscriptions', 'interval', e.target.value);
    renderSubscriptions(container);
  });

  container.querySelector('#btn-reset-sub-filters')?.addEventListener('click', () => {
    state.resetFilters('subscriptions');
    renderSubscriptions(container);
  });

  container.querySelector('#empty-clear-subs-btn')?.addEventListener('click', () => {
    state.resetFilters('subscriptions');
    renderSubscriptions(container);
  });

  // Sorting
  container.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.getAttribute('data-sort');
      state.setSorting('subscriptions', col);
      renderSubscriptions(container);
    });
  });

  // Pagination
  container.querySelector('#subs-page-prev')?.addEventListener('click', () => {
    state.setPage('subscriptions', state.pagination.subscriptions.page - 1);
    renderSubscriptions(container);
  });

  container.querySelector('#subs-page-next')?.addEventListener('click', () => {
    state.setPage('subscriptions', state.pagination.subscriptions.page + 1);
    renderSubscriptions(container);
  });

  container.querySelectorAll('.pagination-pages .page-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.setPage('subscriptions', Number(btn.getAttribute('data-page')));
      renderSubscriptions(container);
    });
  });

  // Export
  container.querySelector('#btn-export-subs')?.addEventListener('click', () => {
    const list = store.getSubscriptions();
    exportToCSV('saas_subscriptions_export', list);
    toast.success('Subscriptions Exported', `Downloaded ${list.length} subscription records.`);
  });

  // Upgrade / Change Plan Modal
  container.querySelectorAll('.action-upgrade-sub').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const sub = store.getSubscriptions().find(s => s.id === id);
      if (sub) openChangePlanModal(sub, container);
    });
  });

  // Pause / Resume Toggle
  container.querySelectorAll('.action-toggle-sub').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const sub = store.getSubscriptions().find(s => s.id === id);
      if (!sub) return;

      const newStatus = sub.status === 'Paused' ? 'Active' : 'Paused';
      const newMrr = newStatus === 'Active' ? (sub.planId === 'plan_pro' ? 79 : 199) : 0;
      store.updateSubscription(id, { status: newStatus, mrr: newMrr });
      toast.info('Subscription Status Changed', `${sub.customerName} subscription is now ${newStatus}.`);
      renderSubscriptions(container);
    });
  });

  // Cancel Subscription
  container.querySelectorAll('.action-cancel-sub').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const sub = store.getSubscriptions().find(s => s.id === id);
      if (!sub) return;

      const confirmed = await confirmDialog({
        title: 'Cancel Subscription',
        message: `Are you sure you want to cancel the subscription for <strong>${sub.customerName}</strong>? The customer will retain access until the end of the billing period (${sub.currentPeriodEnd}).`,
        confirmText: 'Cancel Subscription',
        isDestructive: true
      });

      if (confirmed) {
        store.updateSubscription(id, { status: 'Canceled', autoRenew: false, mrr: 0 });
        toast.warning('Subscription Canceled', `Subscription for ${sub.customerName} has been canceled.`);
        renderSubscriptions(container);
      }
    });
  });
}

function openChangePlanModal(sub, mainContainer) {
  const plans = store.getPlans();
  const currentPlan = plans.find(p => p.id === sub.planId);

  const content = `
    <div style="margin-bottom: 1.25rem;">
      <p style="font-size: 0.88rem; color: var(--text-secondary);">
        Select a new pricing tier for <strong>${sub.customerName}</strong>. Prorated adjustments will be calculated for the current cycle.
      </p>
    </div>

    <form id="change-plan-form">
      <div class="form-group">
        <label class="form-label">Available Plans</label>
        <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.25rem;">
          ${plans.map(p => `
            <label style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0.85rem 1rem;
              background-color: var(--bg-tertiary);
              border: 1px solid ${p.id === sub.planId ? 'var(--accent-primary)' : 'var(--border-subtle)'};
              border-radius: var(--radius-md);
              cursor: pointer;
            ">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <input type="radio" name="target-plan" value="${p.id}" ${p.id === sub.planId ? 'checked' : ''} />
                <div>
                  <div style="font-weight: 600; color: var(--text-primary);">${p.name} Plan</div>
                  <div style="font-size: 0.78rem; color: var(--text-tertiary);">${p.limits.seats} seats &bull; ${p.limits.storage}</div>
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: 700; color: var(--text-primary);">$${p.monthlyPrice}/mo</div>
                <div style="font-size: 0.72rem; color: var(--text-tertiary);">$${p.annualPrice}/yr</div>
              </div>
            </label>
          `).join('')}
        </div>
      </div>

      <div class="form-group" style="margin-top: 1rem;">
        <label class="form-label">Billing Interval</label>
        <select class="form-control" id="change-interval-select">
          <option value="Monthly" ${sub.billingInterval === 'Monthly' ? 'selected' : ''}>Monthly Billing</option>
          <option value="Annual" ${sub.billingInterval === 'Annual' ? 'selected' : ''}>Annual Billing (Save ~20%)</option>
        </select>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-secondary" id="btn-cancel-change-plan">Cancel</button>
    <button class="btn btn-primary" id="btn-submit-change-plan">Confirm Plan Migration</button>
  `;

  modal.openModal({
    title: `Change Plan: ${sub.customerName}`,
    content,
    footer,
    onOpen: (overlay) => {
      overlay.querySelector('#btn-cancel-change-plan')?.addEventListener('click', () => modal.closeModal());
      overlay.querySelector('#btn-submit-change-plan')?.addEventListener('click', () => {
        const selectedPlanId = overlay.querySelector('input[name="target-plan"]:checked')?.value;
        const selectedInterval = overlay.querySelector('#change-interval-select')?.value;
        const targetPlan = plans.find(p => p.id === selectedPlanId);

        if (!targetPlan) return;

        const isAnnual = selectedInterval === 'Annual';
        const newAmount = isAnnual ? targetPlan.annualPrice : targetPlan.monthlyPrice;
        const newMrr = isAnnual ? Number((targetPlan.annualPrice / 12).toFixed(1)) : targetPlan.monthlyPrice;

        store.updateSubscription(sub.id, {
          planId: targetPlan.id,
          planName: targetPlan.name,
          billingInterval: selectedInterval,
          amount: newAmount,
          mrr: newMrr,
          status: 'Active'
        });

        modal.closeModal();
        toast.success('Plan Migrated', `${sub.customerName} successfully transitioned to ${targetPlan.name} Plan.`);
        renderSubscriptions(mainContainer);
      });
    }
  });
}
