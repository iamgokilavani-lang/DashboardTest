# SaaSFortress &bull; Enterprise SaaS & Subscription Management Dashboard

A production-style SaaS management frontend with subscription analytics, user administration, pricing tier configuration, resource usage monitoring, and revenue analytics.

---

## 🌟 Key Features

### 1. 📊 Executive SaaS Overview
- **Core KPI Metrics**: Real-time cards for **MRR** ($74,280/mo), **Active Subscriptions** (1,482), **Active Platform Users** (8,920), and **ARPU / Net Retention** ($112.50 / 118% NRR).
- **Comparison Analytics Engine**: Toggleable dual-period comparison mode displaying current vs. prior period curves on charts and delta pills (+14.8%, +8.2%).
- **Interactive Visualizations**:
  - Dual-line Revenue Growth comparison chart with soft gradient fills.
  - Subscription Status Mix doughnut chart (Active, Trialing, Past Due, Paused/Canceled).
- **Recent Platform Activities Feed**: Live audit log of upgrade events, invite sends, and invoice settlements.

### 2. 👥 User Management
- **Directory Table**: Full user listing with avatar badges, role tags, organizations, MFA security status, and last active sessions.
- **Search & Advanced Filters**: Real-time debounced search, filtering by **Role** (*Owner, Admin, Member, Billing, Viewer*), **Status** (*Active, Invited, Suspended*), and **MFA**.
- **Sorting & Dynamic Pagination**: Sort by any column header; configurable rows per page (5, 8, 15, 25).
- **Add User Modal**: Full form validation (name length, work email regex, role assignment, invitation email toggle).
- **Edit User Modal**: Update roles, account status, and MFA policies.
- **User Details Slide-out Drawer**: Deep-dive profile view with permissions matrix, session details, and activity timeline.
- **Confirmation Dialogs**: Destructive confirmation modal with danger styling for deleting users.

### 3. 💳 Subscription Management
- **Subscription Lifecycle Monitoring**: Track subscriptions across **Active**, **Trialing**, **Past Due**, **Paused**, and **Canceled** states with animated pulse status indicators.
- **Filters & Search**: Multi-criteria filtering by Plan, Billing Cycle (*Monthly vs Annual*), and Status.
- **Plan Migration Modal**: Change / upgrade / downgrade customer plans with instant MRR adjustment and prorated billing preview.
- **Lifecycle Actions**: Pause / resume subscriptions and cancel subscriptions with confirmation dialog.

### 4. 🏷️ Pricing Plan Management
- **Interactive Pricing Matrix**: Switch between Monthly and Annual billing cycles with an automatic *Save ~20%* discount calculator.
- **Visual Tier Cards**: Highlighting popular plans, subscriber counts, estimated tier MRR, quota limits (*Seats, API requests, Storage, Webhooks*), and feature checklists.
- **Add New Plan Modal**: Inline form validation for plan name, slug generation, numeric pricing, resource quotas, and dynamic feature bullet lists.
- **Edit Plan Modal**: Update prices, limits, and featured status.
- **Delete Plan**: Safety checks and confirmation dialog for plan removal.
- **Plan Details Drawer**: Comprehensive breakdown of assigned customer accounts and quota entitlements.

### 5. 📈 Usage Analytics & Telemetry
- **Resource Consumption Meters**: Visual gauges for API Request Volume (88%), Storage Capacity (92%), and Concurrent Team Seats (64%).
- **HTTP Traffic & Error Rates Chart**: 24-hour telemetry tracking 2xx Success vs 4xx Client and 5xx Server errors.
- **Top Endpoints Chart**: Horizontal bar chart profiling endpoint load.
- **Quota Overage Alerts Table**: Tenant workspaces exceeding 80% usage with instant *Notify Admin* and *Expand Quota* actions.

### 6. 💰 Revenue Analytics & Comparison Engine
- **Unit Economics Cards**: ARR Velocity ($891.4K), Net Revenue Retention (118.2%), LTV/CAC Ratio (8.2x), and Gross Margin (86.4%).
- **MRR Waterfall Breakdown**: Visualizing New MRR, Expansion, Contraction, Churned, and Net Growth.
- **Period-over-Period Financial Comparison Matrix**: Full comparison between current 30-day and prior 30-day metrics with relative percentage deltas.

### 7. 🏢 Customer Accounts (Tenants)
- **Tenant Management**: Organization table with domain namespaces, industries, assigned plans, MRR contribution, and customer health scores (*Good, At Risk, Churned*).
- **Customer Dossier Drawer**: Detailed drawer with executive contacts, linked workspace members, and billing details.

### 8. 🎨 Cross-Cutting UX Polish
- **Dark / Light Theme Toggle**: Seamless theme switching with persistent `localStorage` preference.
- **Accessible Modals & Drawers**: Native ESC key handling, backdrop overlay blur, outside-click dismiss, and focus retention.
- **Toast Notifications**: Stacked notifications with animated countdown progress timers for Success, Error, Warning, and Info alerts.
- **Loading & Empty States**: Shimmer skeleton loader simulation and custom empty states with search reset buttons.
- **Data Persistence & Export**: Built-in mock database saved to `localStorage` with a 1-click **Reset Demo Data** tool and **Export to CSV** buttons.

---

## 🚀 Running the Project

### Development Server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build:
```bash
npm run build
```
Creates an optimized, minified bundle in the `dist/` directory.
