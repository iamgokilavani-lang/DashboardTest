// ==========================================================================
// Chart.js Manager & Interactive Visualizations
// ==========================================================================

import { Chart, registerables } from 'chart.js';
import { formatCurrency } from './utils.js';

Chart.register(...registerables);

// Chart registry to prevent memory leaks and duplicate canvas bindings
const chartInstances = new Map();

export function destroyChart(canvasId) {
  if (chartInstances.has(canvasId)) {
    chartInstances.get(canvasId).destroy();
    chartInstances.delete(canvasId);
  }
}

export function destroyAllCharts() {
  chartInstances.forEach(chart => chart.destroy());
  chartInstances.clear();
}

function getThemeColors() {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  return {
    isDark,
    textColor: isDark ? '#94a3b8' : '#475569',
    gridColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
    tooltipBg: isDark ? '#1e293b' : '#ffffff',
    tooltipText: isDark ? '#f8fafc' : '#0f172a',
    tooltipBorder: isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0'
  };
}

// 1. Overview Revenue Comparison Chart (Current vs Previous Period)
export function renderRevenueComparisonChart(canvasId, compare = true) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  destroyChart(canvasId);

  const colors = getThemeColors();
  const ctx = canvas.getContext('2d');

  // Gradient fills
  const gradCurrent = ctx.createLinearGradient(0, 0, 0, 300);
  gradCurrent.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
  gradCurrent.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

  const gradPrev = ctx.createLinearGradient(0, 0, 0, 300);
  gradPrev.addColorStop(0, 'rgba(148, 163, 184, 0.15)');
  gradPrev.addColorStop(1, 'rgba(148, 163, 184, 0.0)');

  const labels = ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'];
  const currentData = [58400, 61200, 64900, 68100, 71500, 72800, 74280];
  const prevData = [51200, 52800, 55100, 59400, 61300, 63000, 64700];

  const datasets = [
    {
      label: 'Current Period MRR',
      data: currentData,
      borderColor: '#6366f1',
      backgroundColor: gradCurrent,
      borderWidth: 2.5,
      tension: 0.35,
      fill: true,
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#ffffff',
      pointHoverRadius: 6
    }
  ];

  if (compare) {
    datasets.push({
      label: 'Previous Period MRR',
      data: prevData,
      borderColor: '#94a3b8',
      borderDash: [5, 5],
      backgroundColor: gradPrev,
      borderWidth: 2,
      tension: 0.35,
      fill: true,
      pointBackgroundColor: '#94a3b8',
      pointBorderColor: '#ffffff',
      pointHoverRadius: 5
    });
  }

  const chart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            color: colors.textColor,
            usePointStyle: true,
            boxWidth: 8,
            font: { family: 'Inter', size: 12 }
          }
        },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.tooltipText,
          bodyColor: colors.tooltipText,
          borderColor: colors.tooltipBorder,
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: colors.textColor, font: { family: 'Inter', size: 11 } }
        },
        y: {
          grid: { color: colors.gridColor },
          ticks: {
            color: colors.textColor,
            font: { family: 'Inter', size: 11 },
            callback: (v) => formatCurrency(v, true)
          }
        }
      }
    }
  });

  chartInstances.set(canvasId, chart);
  return chart;
}

// 2. Subscription Status Doughnut Chart
export function renderSubDistributionChart(canvasId, subs = []) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  destroyChart(canvasId);

  const colors = getThemeColors();
  const ctx = canvas.getContext('2d');

  let activeCount = subs.filter(s => s.status === 'Active').length || 5;
  let trialCount = subs.filter(s => s.status === 'Trialing').length || 1;
  let pastDueCount = subs.filter(s => s.status === 'Past Due').length || 1;
  let pausedCount = subs.filter(s => s.status === 'Paused' || s.status === 'Canceled').length || 2;

  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Active', 'Trialing', 'Past Due', 'Paused/Canceled'],
      datasets: [
        {
          data: [activeCount, trialCount, pastDueCount, pausedCount],
          backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#f43f5e'],
          borderColor: colors.isDark ? '#0f172a' : '#ffffff',
          borderWidth: 3,
          hoverOffset: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: colors.textColor,
            usePointStyle: true,
            boxWidth: 8,
            font: { family: 'Inter', size: 12 },
            padding: 14
          }
        },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.tooltipText,
          bodyColor: colors.tooltipText,
          borderColor: colors.tooltipBorder,
          borderWidth: 1,
          padding: 10
        }
      }
    }
  });

  chartInstances.set(canvasId, chart);
  return chart;
}

// 3. MRR Waterfall Breakdown (New, Expansion, Contraction, Churn, Net)
export function renderMRRWaterfallChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  destroyChart(canvasId);

  const colors = getThemeColors();
  const ctx = canvas.getContext('2d');

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['New MRR', 'Expansion', 'Contraction', 'Churned', 'Net Growth'],
      datasets: [
        {
          label: 'Revenue Flow ($)',
          data: [12400, 6800, -1200, -2500, 15500],
          backgroundColor: [
            'rgba(16, 185, 129, 0.85)', // New (Emerald)
            'rgba(99, 102, 241, 0.85)', // Expansion (Indigo)
            'rgba(245, 158, 11, 0.85)', // Contraction (Amber)
            'rgba(244, 63, 94, 0.85)',  // Churned (Rose)
            'rgba(6, 182, 212, 0.85)'   // Net (Cyan)
          ],
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.tooltipText,
          bodyColor: colors.tooltipText,
          borderColor: colors.tooltipBorder,
          borderWidth: 1,
          callbacks: {
            label: (ctx) => formatCurrency(ctx.parsed.y)
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: colors.textColor, font: { family: 'Inter', size: 11 } }
        },
        y: {
          grid: { color: colors.gridColor },
          ticks: {
            color: colors.textColor,
            callback: (v) => formatCurrency(v, true)
          }
        }
      }
    }
  });

  chartInstances.set(canvasId, chart);
  return chart;
}

// 4. API Request Volume & Status Codes
export function renderUsageVolumeChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  destroyChart(canvasId);

  const colors = getThemeColors();
  const ctx = canvas.getContext('2d');

  const labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '2xx Success',
          data: [142000, 110000, 290000, 520000, 480000, 310000, 195000],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: '4xx Client Error',
          data: [1200, 800, 2400, 4100, 3900, 2100, 1400],
          borderColor: '#f59e0b',
          tension: 0.4
        },
        {
          label: '5xx Server Error',
          data: [140, 90, 210, 320, 290, 180, 120],
          borderColor: '#f43f5e',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          labels: { color: colors.textColor, usePointStyle: true }
        },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.tooltipText,
          bodyColor: colors.tooltipText,
          borderColor: colors.tooltipBorder,
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: colors.textColor }
        },
        y: {
          grid: { color: colors.gridColor },
          ticks: { color: colors.textColor }
        }
      }
    }
  });

  chartInstances.set(canvasId, chart);
  return chart;
}

// 5. Endpoint Breakdown (Horizontal Bar)
export function renderEndpointUsageChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  destroyChart(canvasId);

  const colors = getThemeColors();
  const ctx = canvas.getContext('2d');

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['POST /v1/chat', 'GET /v1/users', 'POST /v1/embeddings', 'GET /v1/subscriptions', 'POST /v1/webhooks'],
      datasets: [
        {
          label: 'Requests (Last 24h)',
          data: [1840000, 920000, 680000, 340000, 190000],
          backgroundColor: '#6366f1',
          borderRadius: 4
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.tooltipText,
          bodyColor: colors.tooltipText,
          borderColor: colors.tooltipBorder,
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: { color: colors.gridColor },
          ticks: { color: colors.textColor, callback: (v) => formatCurrency(v, true).replace('$', '') }
        },
        y: {
          grid: { display: false },
          ticks: { color: colors.textColor, font: { family: 'JetBrains Mono', size: 11 } }
        }
      }
    }
  });

  chartInstances.set(canvasId, chart);
  return chart;
}
