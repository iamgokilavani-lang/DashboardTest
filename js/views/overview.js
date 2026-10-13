// ==========================================================================
// View: Dashboard Overview (Executive Summary & Comparison Analytics)
// ==========================================================================

import { store } from '../data.js';
import { state } from '../state.js';
import { formatCurrency, formatNumber } from '../utils.js';
import { renderRevenueComparisonChart, renderSubDistributionChart } from '../charts.js';
import { exportToCSV } from '../utils.js';
import { toast } from '../toast.js';

export function renderOverview(container) {
  const users = store.getUsers();
  const subs = store.getSubscriptions();
  const plans = store.getPlans();
  const isCompare = state.comparisonMode;

  // Calculate high-level KPIs
  const totalMRR = subs.reduce((acc, s) => acc + (s.status === 'Active' ? s.mrr : 0), 0) + 74000;
  const activeSubs = subs.filter(s => s.status === 'Active').length + 1475;
  const totalUsers = users.length + 8900;
  const arpu = totalMRR / activeSubs;

  container.innerHTML = `
    <div class="page-header animate-fade-in">
      <div class="page-title-group">
        <h1>SaaS Executive Dashboard</h1>
        <p>Comprehensive overview of recurring revenue, subscription lifecycle, and customer growth.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" id="btn-export-overview">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Summary
        </button>
        <button class="btn btn-primary" id="btn-quick-new-user">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Invite User
        </button>
      </div>
    </div>

    <!-- Comparison Banner -->
    <div class="comparison-banner animate-fade-in">
      <div class="comparison-banner-info">
        <span class="comparison-pill-tag">Comparison Mode</span>
        <span style="font-size: 0.88rem; font-weight: 500; color: var(--text-primary);">
          ${isCompare ? 'Comparing selected period with Previous 30-Day Period' : 'Standard single-period view'}
        </span>
      </div>
      <button class="btn btn-sm btn-secondary" id="btn-toggle-comparison-banner">
        ${isCompare ? 'Disable Comparison' : 'Enable Dual Comparison'}
      </button>
    </div>

    <!-- Metric KPI Cards -->
    <div class="metrics-grid animate-fade-in">
      <div class="metric-card accent-primary">
        <div class="metric-header">
          <span class="metric-label">Monthly Recurring Revenue</span>
          <div class="metric-icon-box" style="background-color: var(--accent-primary-light); color: var(--accent-primary);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
        </div>
        <div class="metric-body">
          <div class="metric-value">${formatCurrency(totalMRR)}</div>
          <span class="delta-pill positive">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
            +14.8%
          </span>
        </div>
        <div class="metric-comparison">
          <span>vs ${formatCurrency(64700)} prior period</span>
        </div>
      </div>

      <div class="metric-card accent-emerald">
        <div class="metric-header">
          <span class="metric-label">Active Subscriptions</span>
          <div class="metric-icon-box" style="background-color: var(--accent-emerald-light); color: var(--accent-emerald);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
        </div>
        <div class="metric-body">
          <div class="metric-value">${formatNumber(activeSubs)}</div>
          <span class="delta-pill positive">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
            +8.2%
          </span>
        </div>
        <div class="metric-comparison">
          <span>Churn rate: <strong style="color: var(--accent-emerald);">1.4%</strong></span>
        </div>
      </div>

      <div class="metric-card accent-cyan">
        <div class="metric-header">
          <span class="metric-label">Active Platform Users</span>
          <div class="metric-icon-box" style="background-color: var(--accent-cyan-light); color: var(--accent-cyan);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
        </div>
        <div class="metric-body">
          <div class="metric-value">${formatNumber(totalUsers)}</div>
          <span class="delta-pill positive">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
            +12.5%
          </span>
        </div>
        <div class="metric-comparison">
          <span>DAU / MAU ratio: <strong>68.4%</strong></span>
        </div>
      </div>

      <div class="metric-card accent-violet">
        <div class="metric-header">
          <span class="metric-label">ARPU & Net Retention</span>
          <div class="metric-icon-box" style="background-color: var(--accent-violet-light); color: var(--accent-violet);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
        </div>
        <div class="metric-body">
          <div class="metric-value">${formatCurrency(arpu)}</div>
          <span class="delta-pill positive">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
            NRR 118%
          </span>
        </div>
        <div class="metric-comparison">
          <span>Customer LTV: <strong>$3,450</strong></span>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-grid animate-fade-in">
      <div class="card chart-card">
        <div class="card-header">
          <div class="card-title-group">
            <h3>Revenue Growth Trajectory</h3>
            <p>MRR progression comparing current period versus previous baseline</p>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-tertiary);">
            <span class="pulse-indicator pulse-emerald" style="margin-right: 6px;"></span>Live Data
          </div>
        </div>
        <div class="chart-canvas-wrapper">
          <canvas id="overview-revenue-chart"></canvas>
        </div>
      </div>

      <div class="card chart-card">
        <div class="card-header">
          <div class="card-title-group">
            <h3>Subscription Status Mix</h3>
            <p>Distribution of active, trialing, past due accounts</p>
          </div>
        </div>
        <div class="chart-canvas-wrapper">
          <canvas id="overview-sub-chart"></canvas>
        </div>
      </div>
    </div>

    <!-- Bottom Row: Plan Breakdown & Activity Feed -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem;" class="animate-fade-in">
      <!-- Plan Breakdown Card -->
      <div class="card">
        <div class="card-header">
          <div class="card-title-group">
            <h3>Plan Distribution</h3>
            <p>Subscribers and revenue generated per tier</p>
          </div>
          <button class="btn btn-sm btn-ghost" id="btn-view-all-plans">Manage Plans &rarr;</button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${plans.map(p => {
            const pct = Math.min(100, Math.round((p.subscribersCount / 1500) * 100));
            return `
              <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem; font-size: 0.88rem;">
                  <span class="table-primary-text">${p.name} Plan</span>
                  <span style="color: var(--text-secondary);">${p.subscribersCount} subs &bull; <strong>$${p.monthlyPrice}/mo</strong></span>
                </div>
                <div class="usage-progress-bar">
                  <div class="usage-progress-fill" style="width: ${pct}%;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Recent Audit & Activities -->
      <div class="card">
        <div class="card-header">
          <div class="card-title-group">
            <h3>Recent Platform Activities</h3>
            <p>Real-time lifecycle and billing event log</p>
          </div>
        </div>
        <div class="activity-feed">
          ${store.data.activities.map(act => `
            <div class="activity-item">
              <div class="activity-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="activity-details">
                <div class="activity-title">${act.title}</div>
                <div class="activity-time">${act.description} &bull; ${act.timestamp}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Attach event handlers
  document.getElementById('btn-toggle-comparison-banner')?.addEventListener('click', () => {
    state.toggleComparison();
  });

  document.getElementById('btn-view-all-plans')?.addEventListener('click', () => {
    state.setView('plans');
  });

  document.getElementById('btn-quick-new-user')?.addEventListener('click', () => {
    state.setView('users');
    setTimeout(() => {
      document.getElementById('btn-add-user')?.click();
    }, 150);
  });

  document.getElementById('btn-export-overview')?.addEventListener('click', () => {
    exportToCSV('saas_executive_summary', [
      { Metric: 'MRR', Value: totalMRR, PriorPeriod: 64700, Delta: '+14.8%' },
      { Metric: 'Active Subscriptions', Value: activeSubs, PriorPeriod: 1362, Delta: '+8.2%' },
      { Metric: 'Total Platform Users', Value: totalUsers, PriorPeriod: 7910, Delta: '+12.5%' },
      { Metric: 'ARPU', Value: arpu.toFixed(2), PriorPeriod: 47.50, Delta: '+9.3%' }
    ]);
    toast.success('Report Exported', 'Executive summary CSV has been downloaded.');
  });

  // Render Charts
  setTimeout(() => {
    renderRevenueComparisonChart('overview-revenue-chart', state.comparisonMode);
    renderSubDistributionChart('overview-sub-chart', subs);
  }, 50);
}
