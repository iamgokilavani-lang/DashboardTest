// ==========================================================================
// View: Revenue Analytics & Comparison Engine
// ==========================================================================

import { formatCurrency, exportToCSV } from '../utils.js';
import { toast } from '../toast.js';
import { renderMRRWaterfallChart, renderRevenueComparisonChart } from '../charts.js';

export function renderRevenue(container) {
  // Financial Comparison Matrix
  const metricsComparison = [
    { name: 'Monthly Recurring Revenue (MRR)', current: 74280, previous: 64700, delta: '+14.8%', isPositive: true },
    { name: 'Annual Run Rate (ARR)', current: 891360, previous: 776400, delta: '+14.8%', isPositive: true },
    { name: 'Net New Added MRR', current: 15500, previous: 11200, delta: '+38.4%', isPositive: true },
    { name: 'Expansion MRR', current: 6800, previous: 4900, delta: '+38.8%', isPositive: true },
    { name: 'Gross Revenue Churn', current: 2500, previous: 3100, delta: '-19.4%', isPositive: true }, // lower churn is positive
    { name: 'Average Revenue Per Account (ARPA)', current: 112.50, previous: 102.80, delta: '+9.4%', isPositive: true },
    { name: 'Customer Acquisition Cost (CAC)', current: 420, previous: 450, delta: '-6.7%', isPositive: true },
    { name: 'Customer Lifetime Value (LTV)', current: 3450, previous: 3100, delta: '+11.3%', isPositive: true }
  ];

  container.innerHTML = `
    <div class="page-header animate-fade-in">
      <div class="page-title-group">
        <h1>Revenue & Unit Economics Analytics</h1>
        <p>In-depth recurring revenue waterfall, customer cohort retention, and comparative period analysis.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" id="btn-export-revenue-matrix">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Financial Model
        </button>
      </div>
    </div>

    <!-- Unit Economics Cards -->
    <div class="metrics-grid animate-fade-in">
      <div class="metric-card accent-primary">
        <div class="metric-header">
          <span class="metric-label">ARR Velocity</span>
        </div>
        <div class="metric-body">
          <div class="metric-value">$891.4K</div>
          <span class="delta-pill positive">+14.8%</span>
        </div>
        <div class="metric-comparison">Run-rate extrapolated from active MRR</div>
      </div>

      <div class="metric-card accent-emerald">
        <div class="metric-header">
          <span class="metric-label">Net Retention (NRR)</span>
        </div>
        <div class="metric-body">
          <div class="metric-value">118.2%</div>
          <span class="delta-pill positive">+3.4%</span>
        </div>
        <div class="metric-comparison">Healthy expansion outpacing churn</div>
      </div>

      <div class="metric-card accent-cyan">
        <div class="metric-header">
          <span class="metric-label">LTV / CAC Ratio</span>
        </div>
        <div class="metric-body">
          <div class="metric-value">8.2x</div>
          <span class="delta-pill positive">Elite</span>
        </div>
        <div class="metric-comparison">LTV: $3,450 &bull; CAC: $420</div>
      </div>

      <div class="metric-card accent-violet">
        <div class="metric-header">
          <span class="metric-label">Gross Margin</span>
        </div>
        <div class="metric-body">
          <div class="metric-value">86.4%</div>
          <span class="delta-pill positive">+1.2%</span>
        </div>
        <div class="metric-comparison">Hosting & infrastructure COGS subtracted</div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-grid animate-fade-in">
      <div class="card chart-card">
        <div class="card-header">
          <div class="card-title-group">
            <h3>MRR Flow Waterfall Breakdown</h3>
            <p>Components of recurring revenue expansion and contraction this period</p>
          </div>
        </div>
        <div class="chart-canvas-wrapper">
          <canvas id="revenue-waterfall-chart"></canvas>
        </div>
      </div>

      <div class="card chart-card">
        <div class="card-header">
          <div class="card-title-group">
            <h3>Period Growth Trajectory</h3>
            <p>MRR pacing comparison</p>
          </div>
        </div>
        <div class="chart-canvas-wrapper">
          <canvas id="revenue-dual-chart"></canvas>
        </div>
      </div>
    </div>

    <!-- Detailed Comparison Matrix Table -->
    <div class="card animate-fade-in" style="margin-top: 1.5rem;">
      <div class="card-header">
        <div class="card-title-group">
          <h3>Period-over-Period Financial Comparison Matrix</h3>
          <p>Comparison between Current 30-Day Period vs Prior 30-Day Period</p>
        </div>
      </div>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Financial KPI Metric</th>
              <th>Current Period</th>
              <th>Prior Period</th>
              <th>Variance ($ / Amount)</th>
              <th style="text-align: right;">Relative % Delta</th>
            </tr>
          </thead>
          <tbody>
            ${metricsComparison.map(m => {
              const variance = m.current - m.previous;
              return `
                <tr>
                  <td>
                    <span class="table-primary-text">${m.name}</span>
                  </td>
                  <td>
                    <strong>${typeof m.current === 'number' && m.current > 50 ? formatCurrency(m.current) : m.current}</strong>
                  </td>
                  <td>
                    <span style="color: var(--text-tertiary);">${typeof m.previous === 'number' && m.previous > 50 ? formatCurrency(m.previous) : m.previous}</span>
                  </td>
                  <td>
                    <span style="color: ${m.isPositive ? 'var(--accent-emerald)' : 'var(--accent-rose)'}; font-weight: 600;">
                      ${variance >= 0 ? '+' : ''}${typeof variance === 'number' && Math.abs(variance) > 50 ? formatCurrency(variance) : variance.toFixed(1)}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <span class="delta-pill ${m.isPositive ? 'positive' : 'negative'}">
                      ${m.delta}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Attach export
  container.querySelector('#btn-export-revenue-matrix')?.addEventListener('click', () => {
    exportToCSV('saas_revenue_comparison_matrix', metricsComparison);
    toast.success('Financial Report Exported', 'Downloaded complete revenue comparison matrix.');
  });

  // Render Charts
  setTimeout(() => {
    renderMRRWaterfallChart('revenue-waterfall-chart');
    renderRevenueComparisonChart('revenue-dual-chart', true);
  }, 50);
}
