// ==========================================================================
// Central State Management & Reactive Event Bus
// ==========================================================================

export class AppState {
  constructor() {
    this.currentView = 'overview';
    this.dateRange = '30d';
    this.comparisonMode = true; // Enabled comparison analytics by default
    this.billingCycle = 'monthly'; // 'monthly' | 'annual'
    this.theme = localStorage.getItem('saas_theme') || 'dark';
    this.isLoading = false;

    // Filters per view
    this.filters = {
      users: { search: '', role: 'all', status: 'all', mfa: 'all' },
      subscriptions: { search: '', status: 'all', plan: 'all', interval: 'all' },
      customers: { search: '', health: 'all', status: 'all' }
    };

    // Sorting per view
    this.sorting = {
      users: { column: 'name', direction: 'asc' },
      subscriptions: { column: 'mrr', direction: 'desc' },
      customers: { column: 'mrr', direction: 'desc' }
    };

    // Pagination per view
    this.pagination = {
      users: { page: 1, perPage: 8 },
      subscriptions: { page: 1, perPage: 8 },
      customers: { page: 1, perPage: 8 }
    };

    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      for (const cb of this.listeners.get(event)) {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in event listener for ${event}:`, e);
        }
      }
    }
  }

  setView(viewName) {
    if (this.currentView !== viewName) {
      this.currentView = viewName;
      this.emit('view:change', viewName);
    }
  }

  setDateRange(range) {
    this.dateRange = range;
    this.emit('dateRange:change', range);
  }

  toggleComparison() {
    this.comparisonMode = !this.comparisonMode;
    this.emit('comparison:change', this.comparisonMode);
  }

  setBillingCycle(cycle) {
    this.billingCycle = cycle;
    this.emit('billingCycle:change', cycle);
  }

  setTheme(theme) {
    this.theme = theme;
    localStorage.setItem('saas_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    this.emit('theme:change', theme);
  }

  toggleTheme() {
    const next = this.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  // Filter helpers
  setFilter(view, key, value) {
    if (this.filters[view]) {
      this.filters[view][key] = value;
      // Reset page to 1 on filter change
      if (this.pagination[view]) {
        this.pagination[view].page = 1;
      }
      this.emit(`filter:${view}`, this.filters[view]);
    }
  }

  resetFilters(view) {
    if (this.filters[view]) {
      Object.keys(this.filters[view]).forEach(k => {
        this.filters[view][k] = k === 'search' ? '' : 'all';
      });
      if (this.pagination[view]) {
        this.pagination[view].page = 1;
      }
      this.emit(`filter:${view}`, this.filters[view]);
    }
  }

  // Sorting helpers
  setSorting(view, column) {
    if (this.sorting[view]) {
      if (this.sorting[view].column === column) {
        this.sorting[view].direction = this.sorting[view].direction === 'asc' ? 'desc' : 'asc';
      } else {
        this.sorting[view].column = column;
        this.sorting[view].direction = 'asc';
      }
      this.emit(`sorting:${view}`, this.sorting[view]);
    }
  }

  // Pagination helpers
  setPage(view, page) {
    if (this.pagination[view]) {
      this.pagination[view].page = page;
      this.emit(`pagination:${view}`, this.pagination[view]);
    }
  }

  setPerPage(view, perPage) {
    if (this.pagination[view]) {
      this.pagination[view].perPage = Number(perPage);
      this.pagination[view].page = 1;
      this.emit(`pagination:${view}`, this.pagination[view]);
    }
  }
}

export const state = new AppState();
