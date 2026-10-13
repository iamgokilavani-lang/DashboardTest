// ==========================================================================
// View: Pricing Plan Management (Add, Edit, Delete, Details Drawer)
// ==========================================================================

import { store } from '../data.js';
import { state } from '../state.js';
import { modal } from '../modal.js';
import { confirmDialog } from '../confirm.js';
import { toast } from '../toast.js';
import { formatCurrency } from '../utils.js';

export function renderPlans(container) {
  const plans = store.getPlans();
  const isAnnual = state.billingCycle === 'annual';

  container.innerHTML = `
    <div class="page-header animate-fade-in">
      <div class="page-title-group">
        <h1>Pricing Plan Architecture</h1>
        <p>Configure subscription tiers, quotas, feature sets, and price schedules.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" id="btn-create-plan">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add New Plan
        </button>
      </div>
    </div>

    <!-- Monthly / Annual Toggle Bar -->
    <div class="plans-billing-toggle animate-fade-in">
      <button class="billing-cycle-btn ${!isAnnual ? 'active' : ''}" id="btn-cycle-monthly">Monthly Billing</button>
      <button class="billing-cycle-btn ${isAnnual ? 'active' : ''}" id="btn-cycle-annual">
        Annual Billing
        <span class="discount-tag">Save ~20%</span>
      </button>
    </div>

    <!-- Plan Cards Grid -->
    <div class="plans-grid animate-fade-in">
      ${plans.map(p => {
        const price = isAnnual ? p.annualPrice : p.monthlyPrice;
        const periodText = isAnnual ? '/ year' : '/ month';
        const mrrContrib = (p.monthlyPrice * p.subscribersCount);

        return `
          <div class="plan-card ${p.isPopular ? 'featured' : ''}" data-plan-id="${p.id}">
            ${p.isPopular ? `<span class="plan-badge-top">Most Popular</span>` : ''}

            <div class="plan-header">
              <div class="plan-name-row">
                <h3 class="plan-name">${p.name}</h3>
                <span class="badge ${p.status === 'active' ? 'badge-success' : 'badge-neutral'}">
                  ${p.status}
                </span>
              </div>
              <p class="plan-desc">${p.description}</p>
            </div>

            <div class="plan-price-row">
              <span class="plan-price">$${price}</span>
              <span class="plan-period">${periodText}</span>
            </div>

            <div class="plan-stats-strip">
              <div class="plan-stats-item">
                <span class="plan-stats-label">Subscribers</span>
                <span class="plan-stats-val">${p.subscribersCount}</span>
              </div>
              <div class="plan-stats-item">
                <span class="plan-stats-label">Est. MRR</span>
                <span class="plan-stats-val">${formatCurrency(mrrContrib, true)}</span>
              </div>
              <div class="plan-stats-item">
                <span class="plan-stats-label">Seats Limit</span>
                <span class="plan-stats-val">${p.limits.seats}</span>
              </div>
            </div>

            <ul class="plan-features-list">
              <li class="plan-feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>${p.limits.apiRequests}</strong></span>
              </li>
              <li class="plan-feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>${p.limits.storage}</strong> dedicated storage</span>
              </li>
              ${p.features.map(f => `
                <li class="plan-feature-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>${f}</span>
                </li>
              `).join('')}
            </ul>

            <div class="plan-actions">
              <button class="btn btn-secondary action-plan-details" style="flex: 1;" data-id="${p.id}">
                Details
              </button>
              <button class="btn btn-secondary action-edit-plan" data-id="${p.id}" title="Edit Plan">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
              </button>
              <button class="btn btn-secondary danger action-delete-plan" data-id="${p.id}" title="Delete Plan">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  attachPlanEvents(container);
}

function attachPlanEvents(container) {
  // Billing cycle toggles
  container.querySelector('#btn-cycle-monthly')?.addEventListener('click', () => {
    state.setBillingCycle('monthly');
    renderPlans(container);
  });

  container.querySelector('#btn-cycle-annual')?.addEventListener('click', () => {
    state.setBillingCycle('annual');
    renderPlans(container);
  });

  // Add Plan button
  container.querySelector('#btn-create-plan')?.addEventListener('click', () => {
    openAddPlanModal(container);
  });

  // Action buttons
  container.querySelectorAll('.action-plan-details').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const plan = store.getPlans().find(p => p.id === id);
      if (plan) openPlanDetailsDrawer(plan, container);
    });
  });

  container.querySelectorAll('.action-edit-plan').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const plan = store.getPlans().find(p => p.id === id);
      if (plan) openEditPlanModal(plan, container);
    });
  });

  container.querySelectorAll('.action-delete-plan').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const plan = store.getPlans().find(p => p.id === id);
      if (!plan) return;

      const confirmed = await confirmDialog({
        title: 'Delete Pricing Plan',
        message: `Are you sure you want to delete the <strong>${plan.name}</strong> plan? ${plan.subscribersCount > 0 ? `<br><br><span style="color: var(--accent-rose); font-weight: 600;">Warning: ${plan.subscribersCount} active subscribers are currently tied to this plan!</span>` : ''}`,
        confirmText: 'Delete Plan',
        isDestructive: true
      });

      if (confirmed) {
        store.deletePlan(id);
        toast.success('Plan Deleted', `${plan.name} has been removed.`);
        renderPlans(container);
      }
    });
  });
}

// Add Plan Modal
function openAddPlanModal(mainContainer) {
  const content = `
    <form id="add-plan-form" novalidate>
      <div class="form-group" id="group-plan-name">
        <label class="form-label" for="new-plan-name">Plan Name <span class="required">*</span></label>
        <input type="text" class="form-control" id="new-plan-name" placeholder="e.g. Growth" required />
        <div class="form-error">Plan name is required (minimum 2 characters).</div>
      </div>

      <div class="form-group">
        <label class="form-label" for="new-plan-desc">Description</label>
        <textarea class="form-control" id="new-plan-desc" rows="2" placeholder="Brief summary of who this plan is intended for..."></textarea>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group" id="group-plan-monthly">
          <label class="form-label" for="new-plan-monthly">Monthly Price ($) <span class="required">*</span></label>
          <input type="number" class="form-control" id="new-plan-monthly" placeholder="49" min="0" required />
          <div class="form-error">Please enter a valid price >= 0.</div>
        </div>

        <div class="form-group" id="group-plan-annual">
          <label class="form-label" for="new-plan-annual">Annual Price ($) <span class="required">*</span></label>
          <input type="number" class="form-control" id="new-plan-annual" placeholder="490" min="0" required />
          <div class="form-error">Please enter a valid price >= 0.</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group">
          <label class="form-label" for="new-plan-seats">Seats Limit</label>
          <input type="number" class="form-control" id="new-plan-seats" value="10" min="1" />
        </div>

        <div class="form-group">
          <label class="form-label" for="new-plan-storage">Storage Quota</label>
          <input type="text" class="form-control" id="new-plan-storage" value="50 GB" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="new-plan-api">API Request Allowance</label>
        <input type="text" class="form-control" id="new-plan-api" value="100,000 /mo" />
      </div>

      <div class="form-group">
        <label class="form-label" for="new-plan-features">Features (One per line)</label>
        <textarea class="form-control" id="new-plan-features" rows="3" placeholder="Priority customer support&#10;Custom webhook endpoints&#10;Audit logs"></textarea>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 0.5rem;">
        <div>
          <div style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary);">Feature as "Most Popular"</div>
          <div class="form-hint">Highlight this plan in checkout with a glow border</div>
        </div>
        <label class="switch">
          <input type="checkbox" id="new-plan-popular" />
          <span class="switch-slider"></span>
        </label>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-secondary" id="btn-cancel-add-plan">Cancel</button>
    <button class="btn btn-primary" id="btn-submit-add-plan">Save New Plan</button>
  `;

  modal.openModal({
    title: 'Create Pricing Tier',
    content,
    footer,
    maxWidth: '620px',
    onOpen: (overlay) => {
      overlay.querySelector('#btn-cancel-add-plan')?.addEventListener('click', () => modal.closeModal());
      overlay.querySelector('#btn-submit-add-plan')?.addEventListener('click', () => {
        const nameVal = overlay.querySelector('#new-plan-name').value.trim();
        const descVal = overlay.querySelector('#new-plan-desc').value.trim();
        const monthlyVal = parseFloat(overlay.querySelector('#new-plan-monthly').value);
        const annualVal = parseFloat(overlay.querySelector('#new-plan-annual').value);
        const seatsVal = parseInt(overlay.querySelector('#new-plan-seats').value, 10) || 5;
        const storageVal = overlay.querySelector('#new-plan-storage').value.trim() || '10 GB';
        const apiVal = overlay.querySelector('#new-plan-api').value.trim() || '50,000 /mo';
        const featuresRaw = overlay.querySelector('#new-plan-features').value.trim();
        const popularVal = overlay.querySelector('#new-plan-popular').checked;

        let isValid = true;
        if (!nameVal || nameVal.length < 2) {
          overlay.querySelector('#group-plan-name').classList.add('has-error');
          isValid = false;
        } else {
          overlay.querySelector('#group-plan-name').classList.remove('has-error');
        }

        if (isNaN(monthlyVal) || monthlyVal < 0) {
          overlay.querySelector('#group-plan-monthly').classList.add('has-error');
          isValid = false;
        } else {
          overlay.querySelector('#group-plan-monthly').classList.remove('has-error');
        }

        if (isNaN(annualVal) || annualVal < 0) {
          overlay.querySelector('#group-plan-annual').classList.add('has-error');
          isValid = false;
        } else {
          overlay.querySelector('#group-plan-annual').classList.remove('has-error');
        }

        if (!isValid) return;

        const featuresList = featuresRaw
          ? featuresRaw.split('\n').map(s => s.trim()).filter(Boolean)
          : ['Standard email support', 'Community discord access'];

        const slug = nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const newPlan = store.addPlan({
          name: nameVal,
          slug,
          description: descVal || 'Tailored tier for emerging companies.',
          monthlyPrice: monthlyVal,
          annualPrice: annualVal,
          isPopular: popularVal,
          status: 'active',
          limits: {
            seats: seatsVal,
            apiRequests: apiVal,
            storage: storageVal,
            webhooks: 5
          },
          features: featuresList
        });

        modal.closeModal();
        toast.success('Plan Created', `${newPlan.name} plan is now active.`);
        renderPlans(mainContainer);
      });
    }
  });
}

// Edit Plan Modal
function openEditPlanModal(plan, mainContainer) {
  const content = `
    <form id="edit-plan-form">
      <div class="form-group">
        <label class="form-label" for="edit-plan-name">Plan Name</label>
        <input type="text" class="form-control" id="edit-plan-name" value="${plan.name}" required />
      </div>

      <div class="form-group">
        <label class="form-label" for="edit-plan-desc">Description</label>
        <textarea class="form-control" id="edit-plan-desc" rows="2">${plan.description}</textarea>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group">
          <label class="form-label" for="edit-plan-monthly">Monthly Price ($)</label>
          <input type="number" class="form-control" id="edit-plan-monthly" value="${plan.monthlyPrice}" min="0" required />
        </div>

        <div class="form-group">
          <label class="form-label" for="edit-plan-annual">Annual Price ($)</label>
          <input type="number" class="form-control" id="edit-plan-annual" value="${plan.annualPrice}" min="0" required />
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group">
          <label class="form-label" for="edit-plan-seats">Seats Limit</label>
          <input type="number" class="form-control" id="edit-plan-seats" value="${plan.limits.seats}" min="1" />
        </div>

        <div class="form-group">
          <label class="form-label" for="edit-plan-status">Status</label>
          <select class="form-control" id="edit-plan-status">
            <option value="active" ${plan.status === 'active' ? 'selected' : ''}>Active</option>
            <option value="archived" ${plan.status === 'archived' ? 'selected' : ''}>Archived</option>
          </select>
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 0.5rem;">
        <div>
          <div style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary);">Most Popular Badge</div>
          <div class="form-hint">Display prominent badge and glowing border</div>
        </div>
        <label class="switch">
          <input type="checkbox" id="edit-plan-popular" ${plan.isPopular ? 'checked' : ''} />
          <span class="switch-slider"></span>
        </label>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-secondary" id="btn-cancel-edit-plan">Cancel</button>
    <button class="btn btn-primary" id="btn-save-edit-plan">Save Changes</button>
  `;

  modal.openModal({
    title: `Edit Plan: ${plan.name}`,
    content,
    footer,
    maxWidth: '620px',
    onOpen: (overlay) => {
      overlay.querySelector('#btn-cancel-edit-plan')?.addEventListener('click', () => modal.closeModal());
      overlay.querySelector('#btn-save-edit-plan')?.addEventListener('click', () => {
        const nameVal = overlay.querySelector('#edit-plan-name').value.trim();
        const descVal = overlay.querySelector('#edit-plan-desc').value.trim();
        const monthlyVal = parseFloat(overlay.querySelector('#edit-plan-monthly').value);
        const annualVal = parseFloat(overlay.querySelector('#edit-plan-annual').value);
        const seatsVal = parseInt(overlay.querySelector('#edit-plan-seats').value, 10);
        const statusVal = overlay.querySelector('#edit-plan-status').value;
        const popularVal = overlay.querySelector('#edit-plan-popular').checked;

        store.updatePlan(plan.id, {
          name: nameVal,
          description: descVal,
          monthlyPrice: monthlyVal,
          annualPrice: annualVal,
          status: statusVal,
          isPopular: popularVal,
          limits: { ...plan.limits, seats: seatsVal }
        });

        modal.closeModal();
        toast.success('Plan Updated', `Changes to ${nameVal} have been saved.`);
        renderPlans(mainContainer);
      });
    }
  });
}

// Plan Details Drawer
function openPlanDetailsDrawer(plan, mainContainer) {
  const subscribers = store.getSubscriptions().filter(s => s.planId === plan.id);
  const mrr = plan.monthlyPrice * plan.subscribersCount;

  const content = `
    <div style="margin-bottom: 1.5rem;">
      <h3 style="font-size: 1.35rem; margin-bottom: 0.35rem;">${plan.name} Tier</h3>
      <p style="color: var(--text-secondary);">${plan.description}</p>
    </div>

    <div class="drawer-details-grid">
      <div class="drawer-detail-item">
        <div class="drawer-detail-label">Monthly Rate</div>
        <div class="drawer-detail-value">$${plan.monthlyPrice} / mo</div>
      </div>
      <div class="drawer-detail-item">
        <div class="drawer-detail-label">Annual Rate</div>
        <div class="drawer-detail-value">$${plan.annualPrice} / yr</div>
      </div>
      <div class="drawer-detail-item">
        <div class="drawer-detail-label">Active Subscribers</div>
        <div class="drawer-detail-value">${plan.subscribersCount} accounts</div>
      </div>
      <div class="drawer-detail-item">
        <div class="drawer-detail-label">Total Tier MRR</div>
        <div class="drawer-detail-value">${formatCurrency(mrr)}</div>
      </div>
    </div>

    <h4 style="margin-bottom: 0.75rem; font-size: 0.95rem;">Quotas & Resource Entitlements</h4>
    <div style="background-color: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem;">
      <div style="display: flex; justify-content: space-between;">
        <span style="color: var(--text-secondary);">Seat Allowance:</span>
        <strong>${plan.limits.seats} seats</strong>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: var(--text-secondary);">Monthly API Quota:</span>
        <strong>${plan.limits.apiRequests}</strong>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: var(--text-secondary);">Dedicated Storage:</span>
        <strong>${plan.limits.storage}</strong>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: var(--text-secondary);">Custom Webhooks:</span>
        <strong>${plan.limits.webhooks || 5} endpoints</strong>
      </div>
    </div>

    <h4 style="margin-bottom: 0.75rem; font-size: 0.95rem;">Assigned Sample Accounts (${subscribers.length})</h4>
    <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem;">
      ${subscribers.length > 0 ? subscribers.map(s => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.85rem; background-color: var(--bg-tertiary); border-radius: var(--radius-sm); font-size: 0.85rem;">
          <div>
            <div style="font-weight: 600; color: var(--text-primary);">${s.customerName}</div>
            <div style="font-size: 0.75rem; color: var(--text-tertiary);">${s.billingInterval} &bull; ${s.status}</div>
          </div>
          <div style="font-weight: 700; color: var(--text-primary);">${formatCurrency(s.mrr)}/mo</div>
        </div>
      `).join('') : `
        <div style="color: var(--text-tertiary); font-size: 0.85rem; padding: 0.5rem 0;">No test accounts currently linked to this plan.</div>
      `}
    </div>
  `;

  const footer = `
    <button class="btn btn-secondary" id="drawer-btn-edit-plan">Edit Plan</button>
    <button class="btn btn-ghost" id="drawer-btn-close-plan">Close</button>
  `;

  modal.openDrawer({
    title: 'Plan Tier Specifications',
    subtitle: `Inspection for ${plan.name}`,
    content,
    footer,
    onOpen: (overlay) => {
      overlay.querySelector('#drawer-btn-close-plan')?.addEventListener('click', () => modal.closeDrawer());
      overlay.querySelector('#drawer-btn-edit-plan')?.addEventListener('click', () => {
        modal.closeDrawer();
        openEditPlanModal(plan, mainContainer);
      });
    }
  });
}
