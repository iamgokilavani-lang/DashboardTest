// ==========================================================================
// View: Usage Analytics (API Traffic, Error Rates, Storage & Quota Alerts)
// ==========================================================================

import { store } from '../data.js';
import { toast } from '../toast.js';
import { renderUsageVolumeChart, renderEndpointUsageChart } from '../charts.js';

export function renderUsage(container) {
  const alerts = store.data.usageAlerts;

  container.innerHTML = `
    <div class="page-header animate-fade-in">
      <div class="page-title-group">
        <h1>Platform Usage & Quota Telemetry</h1>
        <p>Monitor distributed infrastructure utilization, API rate limits, and endpoint latency.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" id="btn-refresh-telemetry">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          Refresh Telemetry
        </button>
      </div>
    </div>

    <!-- Resource Gauges Grid -->
    <div class="usage-meters-grid animate-fade-in">
      <div class="usage-meter-card">
        <div class="meter-header">
          <div>
            <div style="font-weight: 600; color: var(--text-primary); font-size: 0.95rem;">API Request Volume</div>
            <div style="font-size: 0.75rem; color: var(--text-tertiary);">Monthly quota cycle</div>
          </div>
          <span class="badge badge-warning">88% Capacity</span>
        </div>
        <div class="meter-bar-track">
          <div class="meter-bar-fill" style="width: 88%; background: linear-gradient(90deg, var(--accent-primary), var(--accent-amber));"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-tertiary);">
          <span>8.8M requests used</span>
          <span>10.0M limit</span>
        </div>
      </div>

      <div class="usage-meter-card">
        <div class="meter-header">
          <div>
            <div style="font-weight: 600; color: var(--text-primary); font-size: 0.95rem;">Encrypted Storage</div>
            <div style="font-size: 0.75rem; color: var(--text-tertiary);">NVMe multi-region disk</div>
          </div>
          <span class="badge badge-danger">92% Capacity</span>
        </div>
        <div class="meter-bar-track">
          <div class="meter-bar-fill" style="width: 92%; background: linear-gradient(90deg, var(--accent-amber), var(--accent-rose));"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-tertiary);">
          <span>462 GB utilized</span>
          <span>500 GB limit</span>
        </div>
      </div>

      <div class="usage-meter-card">
        <div class="meter-header">
          <div>
            <div style="font-weight: 600; color: var(--text-primary); font-size: 0.95rem;">Concurrent Team Seats</div>
            <div style="font-size: 0.75rem; color: var(--text-tertiary);">Across all tenants</div>
          </div>
          <span class="badge badge-success">64% Capacity</span>
        </div>
        <div class="meter-bar-track">
          <div class="meter-bar-fill" style="width: 64%; background: linear-gradient(90deg, var(--accent-cyan), var(--accent-emerald));"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-tertiary);">
          <span>320 active seats</span>
          <span>500 pooled limit</span>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-grid animate-fade-in">
      <div class="card chart-card">
        <div class="card-header">
          <div class="card-title-group">
            <h3>HTTP Traffic & Error Rates</h3>
            <p>2xx Success versus 4xx Client and 5xx Server errors over 24 hours</p>
          </div>
          <div style="font-size: 0.8rem; color: var(--accent-emerald);">
            99.98% Healthy Requests
          </div>
        </div>
        <div class="chart-canvas-wrapper">
          <canvas id="usage-volume-chart"></canvas>
        </div>
      </div>

      <div class="card chart-card">
        <div class="card-header">
          <div class="card-title-group">
            <h3>Top API Endpoints</h3>
            <p>Request distribution by route</p>
          </div>
        </div>
        <div class="chart-canvas-wrapper">
          <canvas id="endpoint-usage-chart"></canvas>
        </div>
      </div>
    </div>

    <!-- Quota Alerts Table -->
    <div class="card animate-fade-in" style="margin-top: 1.5rem;">
      <div class="card-header">
        <div class="card-title-group">
          <h3>Threshold & Quota Overage Alerts</h3>
          <p>Tenant workspaces approaching or exceeding 80% consumption limits</p>
        </div>
      </div>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Customer Organization</th>
              <th>Resource Metric</th>
              <th>Consumption / Cap</th>
              <th>Threshold Status</th>
              <th style="text-align: right;">Mitigation Actions</th>
            </tr>
          </thead>
          <tbody>
            ${alerts.map(a => `
              <tr>
                <td>
                  <span class="table-primary-text">${a.customerName}</span>
                </td>
                <td>
                  <span>${a.resource}</span>
                </td>
                <td>
                  <strong>${a.current}</strong>
                </td>
                <td>
                  <span class="badge ${a.severity === 'critical' ? 'badge-danger' : 'badge-warning'}">
                    <span class="badge-dot"></span>
                    ${a.percent}% used
                  </span>
                </td>
                <td>
                  <div class="table-actions" style="justify-content: flex-end;">
                    <button class="btn btn-sm btn-secondary action-notify-tenant" data-org="${a.customerName}">
                      Notify Admin
                    </button>
                    <button class="btn btn-sm btn-primary action-expand-quota" data-org="${a.customerName}">
                      Expand Quota
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Attach events
  container.querySelector('#btn-refresh-telemetry')?.addEventListener('click', () => {
    toast.info('Telemetry Updated', 'Real-time infrastructure metrics refreshed from collector nodes.');
    renderUsage(container);
  });

  container.querySelectorAll('.action-notify-tenant').forEach(btn => {
    btn.addEventListener('click', () => {
      const org = btn.getAttribute('data-org');
      toast.success('Notification Sent', `Quota alert sent to billing contact at ${org}.`);
    });
  });

  container.querySelectorAll('.action-expand-quota').forEach(btn => {
    btn.addEventListener('click', () => {
      const org = btn.getAttribute('data-org');
      toast.success('Quota Expanded', `Temporary +20% buffer granted to ${org}.`);
    });
  });

  // Render Charts
  setTimeout(() => {
    renderUsageVolumeChart('usage-volume-chart');
    renderEndpointUsageChart('endpoint-usage-chart');
  }, 50);
}
