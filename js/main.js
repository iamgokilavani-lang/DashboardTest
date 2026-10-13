// ==========================================================================
// Application Core Orchestrator & Router
// ==========================================================================

import { state } from './state.js';
import { store } from './data.js';
import { toast } from './toast.js';
import { modal } from './modal.js';
import { renderOverview } from './views/overview.js';
import { renderUsers } from './views/users.js';
import { renderSubscriptions } from './views/subscriptions.js';
import { renderPlans } from './views/plans.js';
import { renderUsage } from './views/usage.js';
import { renderRevenue } from './views/revenue.js';
import { renderCustomers } from './views/customers.js';

class App {
  constructor() {
    this.contentEl = document.getElementById('app-content');
    this.sidebarEl = document.getElementById('sidebar');
    this.views = {
      overview: renderOverview,
      users: renderUsers,
      subscriptions: renderSubscriptions,
      plans: renderPlans,
      usage: renderUsage,
      revenue: renderRevenue,
      customers: renderCustomers
    };
  }

  init() {
    // 1. Initialize Theme
    this.initTheme();

    // 2. Setup Routing & Navigation
    this.initNavigation();

    // 3. Setup Global Controls (Date range, Compare, Quick search)
    this.initGlobalControls();

    // 4. Update sidebar badges
    this.updateBadges();

    // 5. Initial View Load
    const initialHash = window.location.hash.replace('#', '') || 'overview';
    this.navigate(initialHash in this.views ? initialHash : 'overview');

    // Welcome Toast
    setTimeout(() => {
      toast.success(
        'SaaSFortress Online',
        'Real-time subscription & unit economics metrics synced.'
      );
    }, 400);
  }

  initTheme() {
    const savedTheme = localStorage.getItem('saas_theme') || 'dark';
    state.setTheme(savedTheme);
    this.updateThemeIcons(savedTheme);

    const toggleBtn = document.getElementById('btn-theme-toggle');
    toggleBtn?.addEventListener('click', () => {
      state.toggleTheme();
      this.updateThemeIcons(state.theme);
      toast.info('Theme Changed', `Switched to ${state.theme} mode.`);
      // Re-render current view to re-theme Chart.js canvases
      this.renderCurrentView();
    });
  }

  updateThemeIcons(theme) {
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    if (theme === 'light') {
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
    } else {
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
    }
  }

  initNavigation() {
    // Navigation Items
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        this.navigate(view);

        // Auto close mobile sidebar
        if (window.innerWidth <= 1024) {
          this.sidebarEl.classList.remove('open');
        }
      });
    });

    // Hash change listener
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash in this.views) {
        this.navigate(hash);
      }
    });

    // Mobile Hamburger
    const mobileBtn = document.getElementById('btn-toggle-sidebar');
    mobileBtn?.addEventListener('click', () => {
      this.sidebarEl.classList.toggle('open');
    });

    // State change listeners
    state.on('view:change', (view) => {
      this.updateActiveNav(view);
      this.renderCurrentView();
    });

    state.on('comparison:change', (isCompare) => {
      const compareBtn = document.getElementById('btn-toggle-comparison');
      if (compareBtn) {
        compareBtn.classList.toggle('active', isCompare);
      }
      toast.info('Comparison Analytics', isCompare ? 'Dual period comparison enabled.' : 'Standard single period view.');
      this.renderCurrentView();
    });

    state.on('dateRange:change', (range) => {
      toast.info('Date Range Filtered', `Analytics filtered for: ${range.toUpperCase()}`);
      this.renderCurrentView();
    });
  }

  initGlobalControls() {
    // Date preset select
    const dateSelect = document.getElementById('date-range-select');
    dateSelect?.addEventListener('change', (e) => {
      state.setDateRange(e.target.value);
    });

    // Compare toggle button
    const compareBtn = document.getElementById('btn-toggle-comparison');
    compareBtn?.addEventListener('click', () => {
      state.toggleComparison();
    });

    // Global Search
    const searchInput = document.getElementById('global-quick-search');
    searchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          state.setFilter('users', 'search', query);
          this.navigate('users');
        }
      }
    });

    // Keyboard shortcut '/' to focus search
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput && !document.querySelector('.modal-overlay.active')) {
        e.preventDefault();
        searchInput?.focus();
      }
    });

    // Simulate Network Delay / Loading Skeleton
    const loadBtn = document.getElementById('btn-simulate-loading');
    loadBtn?.addEventListener('click', () => {
      this.showLoadingSkeleton();
    });

    // Reset Demo Data
    const resetBtn = document.getElementById('btn-reset-demo');
    resetBtn?.addEventListener('click', () => {
      store.reset();
      this.updateBadges();
      this.renderCurrentView();
      toast.success('Demo Data Reset', 'Reset all users, subscriptions, and plans to initial mock defaults.');
    });

    // Notifications Button
    const notifBtn = document.getElementById('btn-notifications');
    notifBtn?.addEventListener('click', () => {
      toast.info('System Notifications', '3 active webhook retries and 1 failed invoice pending review.');
    });

    // User profile capsule in sidebar
    document.getElementById('current-user-capsule')?.addEventListener('click', () => {
      modal.openModal({
        title: 'System Operator Profile',
        content: `
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <div class="avatar" style="width: 50px; height: 50px; font-size: 1.1rem; background: linear-gradient(135deg, #4f46e5, #06b6d4);">GV</div>
            <div>
              <div style="font-weight: 700; color: var(--text-primary); font-size: 1.05rem;">Gokilavani</div>
              <div style="color: var(--text-secondary); font-size: 0.85rem;">gokilavani@saasfortress.io</div>
              <span class="badge badge-primary" style="margin-top: 4px;">Super Administrator</span>
            </div>
          </div>
          <div style="background-color: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Security Clearance:</span>
              <strong>Tier 4 Root Access</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Hardware Key (WebAuthn):</span>
              <span style="color: var(--accent-emerald);">YubiKey 5C NFC Connected</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Session Lifetime:</span>
              <span>8 hours remaining</span>
            </div>
          </div>
        `,
        footer: `<button class="btn btn-secondary" onclick="document.getElementById('global-modal-overlay').classList.remove('active')">Dismiss</button>`
      });
    });
  }

  showLoadingSkeleton() {
    this.contentEl.innerHTML = `
      <div class="page-header">
        <div style="width: 250px; height: 32px;" class="skeleton"></div>
      </div>
      <div class="metrics-grid">
        <div style="height: 120px;" class="skeleton"></div>
        <div style="height: 120px;" class="skeleton"></div>
        <div style="height: 120px;" class="skeleton"></div>
        <div style="height: 120px;" class="skeleton"></div>
      </div>
      <div class="charts-grid">
        <div style="height: 380px;" class="skeleton"></div>
        <div style="height: 380px;" class="skeleton"></div>
      </div>
    `;

    toast.info('Simulating Request', 'Simulating server latency & rendering shimmer skeletons...');
    setTimeout(() => {
      this.renderCurrentView();
      toast.success('Data Ready', 'Fresh payload retrieved successfully.');
    }, 600);
  }

  navigate(viewName) {
    if (this.views[viewName]) {
      window.location.hash = viewName;
      state.setView(viewName);
    }
  }

  updateActiveNav(viewName) {
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-view') === viewName);
    });
  }

  updateBadges() {
    const userBadge = document.getElementById('badge-users-count');
    const subBadge = document.getElementById('badge-subs-count');
    if (userBadge) userBadge.textContent = store.getUsers().length;
    if (subBadge) subBadge.textContent = store.getSubscriptions().length;
  }

  renderCurrentView() {
    const renderFn = this.views[state.currentView];
    if (renderFn && this.contentEl) {
      renderFn(this.contentEl);
      this.updateBadges();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

// Bootstrap Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
