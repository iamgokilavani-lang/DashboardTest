// ==========================================================================
// Initial Seed Data & LocalStorage Store for Advanced SaaS Dashboard
// ==========================================================================

const STORAGE_KEY = 'saas_dashboard_data_v3';

export const initialData = {
  plans: [
    {
      id: 'plan_starter',
      slug: 'starter',
      name: 'Starter',
      description: 'Ideal for early-stage startups and small projects.',
      monthlyPrice: 29,
      annualPrice: 290,
      subscribersCount: 420,
      status: 'active',
      isPopular: false,
      limits: {
        seats: 5,
        apiRequests: '50,000 /mo',
        storage: '10 GB',
        webhooks: 3
      },
      features: [
        'Up to 5 team members',
        '50,000 API requests / month',
        '10 GB encrypted cloud storage',
        'Standard email support',
        'Community discord access'
      ]
    },
    {
      id: 'plan_pro',
      slug: 'pro',
      name: 'Professional',
      description: 'Built for scaling product teams requiring advanced integrations.',
      monthlyPrice: 79,
      annualPrice: 790,
      subscribersCount: 810,
      status: 'active',
      isPopular: true,
      limits: {
        seats: 25,
        apiRequests: '300,000 /mo',
        storage: '75 GB',
        webhooks: 20
      },
      features: [
        'Up to 25 team members',
        '300,000 API requests / month',
        '75 GB cloud storage',
        'Priority email & chat support',
        'Custom webhooks & integrations',
        'Granular role-based permissions',
        'Automated daily data backups'
      ]
    },
    {
      id: 'plan_enterprise',
      slug: 'enterprise',
      name: 'Enterprise',
      description: 'Enterprise-grade compliance, security and custom SLAs.',
      monthlyPrice: 199,
      annualPrice: 1990,
      subscribersCount: 220,
      status: 'active',
      isPopular: false,
      limits: {
        seats: 100,
        apiRequests: '2,000,000 /mo',
        storage: '500 GB',
        webhooks: 100
      },
      features: [
        'Up to 100 team members',
        '2,000,000 API requests / month',
        '500 GB dedicated storage',
        'SAML SSO & Okta directory sync',
        '99.99% uptime SLA guarantee',
        '24/7 dedicated support engineer',
        'Custom invoice billing & POs',
        'HIPAA & SOC 2 compliance report'
      ]
    },
    {
      id: 'plan_scale',
      slug: 'scale',
      name: 'Scale Unlimited',
      description: 'High-volume infrastructure for mission-critical operations.',
      monthlyPrice: 399,
      annualPrice: 3990,
      subscribersCount: 32,
      status: 'active',
      isPopular: false,
      limits: {
        seats: 500,
        apiRequests: '10,000,000 /mo',
        storage: '2 TB',
        webhooks: 500
      },
      features: [
        'Unlimited team members',
        '10,000,000 API requests / month',
        '2 TB multi-region NVMe storage',
        'Dedicated technical account manager',
        'Custom feature development',
        'Tailored security review & audits',
        'Real-time streaming webhook feeds'
      ]
    }
  ],

  customers: [
    {
      id: 'cust_01',
      name: 'Apex Technologies',
      domain: 'apextech.io',
      industry: 'FinTech',
      planId: 'plan_enterprise',
      mrr: 199,
      healthScore: 'Good',
      status: 'Active',
      seatsUsed: 78,
      contactName: 'Elena Rostova',
      contactEmail: 'elena@apextech.io',
      createdAt: '2024-03-15'
    },
    {
      id: 'cust_02',
      name: 'Nordic Cloud Labs',
      domain: 'nordiccloud.se',
      industry: 'DevTools',
      planId: 'plan_pro',
      mrr: 79,
      healthScore: 'Good',
      status: 'Active',
      seatsUsed: 18,
      contactName: 'Lukas Lindholm',
      contactEmail: 'lukas@nordiccloud.se',
      createdAt: '2024-05-20'
    },
    {
      id: 'cust_03',
      name: 'Vanguard Media Group',
      domain: 'vanguardmedia.com',
      industry: 'Media',
      planId: 'plan_scale',
      mrr: 399,
      healthScore: 'Good',
      status: 'Active',
      seatsUsed: 142,
      contactName: 'Marcus Bennett',
      contactEmail: 'marcus@vanguardmedia.com',
      createdAt: '2024-01-10'
    },
    {
      id: 'cust_04',
      name: 'BioGenix Diagnostics',
      domain: 'biogenix.org',
      industry: 'HealthTech',
      planId: 'plan_enterprise',
      mrr: 199,
      healthScore: 'At Risk',
      status: 'Active',
      seatsUsed: 45,
      contactName: 'Dr. Sarah Chen',
      contactEmail: 'schen@biogenix.org',
      createdAt: '2024-02-18'
    },
    {
      id: 'cust_05',
      name: 'HyperDrive Logistics',
      domain: 'hyperdrive.co',
      industry: 'Supply Chain',
      planId: 'plan_pro',
      mrr: 79,
      healthScore: 'Good',
      status: 'Active',
      seatsUsed: 14,
      contactName: 'Carlos Mendoza',
      contactEmail: 'carlos@hyperdrive.co',
      createdAt: '2024-06-01'
    },
    {
      id: 'cust_06',
      name: 'PulseFlow AI',
      domain: 'pulseflow.ai',
      industry: 'Artificial Intelligence',
      planId: 'plan_starter',
      mrr: 29,
      healthScore: 'Good',
      status: 'Active',
      seatsUsed: 4,
      contactName: 'Priya Sharma',
      contactEmail: 'priya@pulseflow.ai',
      createdAt: '2024-07-22'
    },
    {
      id: 'cust_07',
      name: 'Cobalt Robotics',
      domain: 'cobaltbot.com',
      industry: 'Robotics',
      planId: 'plan_pro',
      mrr: 79,
      healthScore: 'At Risk',
      status: 'Active',
      seatsUsed: 22,
      contactName: 'Thomas Wright',
      contactEmail: 'twright@cobaltbot.com',
      createdAt: '2024-04-12'
    },
    {
      id: 'cust_08',
      name: 'Quantum Logic Systems',
      domain: 'quantumlogic.net',
      industry: 'Cybersecurity',
      planId: 'plan_starter',
      mrr: 29,
      healthScore: 'Good',
      status: 'Active',
      seatsUsed: 3,
      contactName: 'Gokilavani',
      contactEmail: 'gokilavani@quantumlogic.net',
      createdAt: '2024-08-04'
    },
    {
      id: 'cust_09',
      name: 'Zion Retail Solutions',
      domain: 'zionretail.com',
      industry: 'E-Commerce',
      planId: 'plan_starter',
      mrr: 0,
      healthScore: 'Churned',
      status: 'Inactive',
      seatsUsed: 0,
      contactName: 'Hannah Davies',
      contactEmail: 'hdavies@zionretail.com',
      createdAt: '2023-11-05'
    }
  ],

  users: [
    {
      id: 'usr_101',
      name: 'Elena Rostova',
      email: 'elena@apextech.io',
      role: 'Owner',
      customerId: 'cust_01',
      orgName: 'Apex Technologies',
      status: 'Active',
      mfaEnabled: true,
      lastActive: '10 minutes ago',
      createdAt: '2024-03-15',
      avatarColor: '#6366f1'
    },
    {
      id: 'usr_102',
      name: 'Dmitri Pavlov',
      email: 'dpavlov@apextech.io',
      role: 'Admin',
      customerId: 'cust_01',
      orgName: 'Apex Technologies',
      status: 'Active',
      mfaEnabled: true,
      lastActive: '2 hours ago',
      createdAt: '2024-03-20',
      avatarColor: '#3b82f6'
    },
    {
      id: 'usr_103',
      name: 'Lukas Lindholm',
      email: 'lukas@nordiccloud.se',
      role: 'Owner',
      customerId: 'cust_02',
      orgName: 'Nordic Cloud Labs',
      status: 'Active',
      mfaEnabled: true,
      lastActive: 'Just now',
      createdAt: '2024-05-20',
      avatarColor: '#10b981'
    },
    {
      id: 'usr_104',
      name: 'Astrid Bergman',
      email: 'astrid@nordiccloud.se',
      role: 'Member',
      customerId: 'cust_02',
      orgName: 'Nordic Cloud Labs',
      status: 'Active',
      mfaEnabled: false,
      lastActive: '1 day ago',
      createdAt: '2024-05-25',
      avatarColor: '#06b6d4'
    },
    {
      id: 'usr_105',
      name: 'Marcus Bennett',
      email: 'marcus@vanguardmedia.com',
      role: 'Owner',
      customerId: 'cust_03',
      orgName: 'Vanguard Media Group',
      status: 'Active',
      mfaEnabled: true,
      lastActive: '25 minutes ago',
      createdAt: '2024-01-10',
      avatarColor: '#8b5cf6'
    },
    {
      id: 'usr_106',
      name: 'Claire Jenkins',
      email: 'cjenkins@vanguardmedia.com',
      role: 'Billing',
      customerId: 'cust_03',
      orgName: 'Vanguard Media Group',
      status: 'Active',
      mfaEnabled: true,
      lastActive: '3 hours ago',
      createdAt: '2024-01-15',
      avatarColor: '#ec4899'
    },
    {
      id: 'usr_107',
      name: 'Dr. Sarah Chen',
      email: 'schen@biogenix.org',
      role: 'Owner',
      customerId: 'cust_04',
      orgName: 'BioGenix Diagnostics',
      status: 'Active',
      mfaEnabled: true,
      lastActive: 'Yesterday',
      createdAt: '2024-02-18',
      avatarColor: '#f59e0b'
    },
    {
      id: 'usr_108',
      name: 'Carlos Mendoza',
      email: 'carlos@hyperdrive.co',
      role: 'Owner',
      customerId: 'cust_05',
      orgName: 'HyperDrive Logistics',
      status: 'Active',
      mfaEnabled: false,
      lastActive: '4 hours ago',
      createdAt: '2024-06-01',
      avatarColor: '#14b8a6'
    },
    {
      id: 'usr_109',
      name: 'Priya Sharma',
      email: 'priya@pulseflow.ai',
      role: 'Owner',
      customerId: 'cust_06',
      orgName: 'PulseFlow AI',
      status: 'Active',
      mfaEnabled: true,
      lastActive: '5 minutes ago',
      createdAt: '2024-07-22',
      avatarColor: '#f43f5e'
    },
    {
      id: 'usr_110',
      name: 'Thomas Wright',
      email: 'twright@cobaltbot.com',
      role: 'Admin',
      customerId: 'cust_07',
      orgName: 'Cobalt Robotics',
      status: 'Active',
      mfaEnabled: true,
      lastActive: '2 days ago',
      createdAt: '2024-04-12',
      avatarColor: '#64748b'
    },
    {
      id: 'usr_111',
      name: 'Kavita Patel',
      email: 'kpatel@cobaltbot.com',
      role: 'Member',
      customerId: 'cust_07',
      orgName: 'Cobalt Robotics',
      status: 'Invited',
      mfaEnabled: false,
      lastActive: 'Never',
      createdAt: '2024-09-02',
      avatarColor: '#a855f7'
    },
    {
      id: 'usr_112',
      name: 'Gokilavani',
      email: 'gokilavani@quantumlogic.net',
      role: 'Owner',
      customerId: 'cust_08',
      orgName: 'Quantum Logic Systems',
      status: 'Active',
      mfaEnabled: false,
      lastActive: '6 hours ago',
      createdAt: '2024-08-04',
      avatarColor: '#3b82f6'
    },
    {
      id: 'usr_113',
      name: 'Hannah Davies',
      email: 'hdavies@zionretail.com',
      role: 'Owner',
      customerId: 'cust_09',
      orgName: 'Zion Retail Solutions',
      status: 'Suspended',
      mfaEnabled: false,
      lastActive: '45 days ago',
      createdAt: '2023-11-05',
      avatarColor: '#ef4444'
    },
    {
      id: 'usr_114',
      name: 'Jordan Miller',
      email: 'jmiller@devflow.tech',
      role: 'Viewer',
      customerId: 'cust_02',
      orgName: 'Nordic Cloud Labs',
      status: 'Active',
      mfaEnabled: true,
      lastActive: '12 hours ago',
      createdAt: '2024-06-18',
      avatarColor: '#0284c7'
    },
    {
      id: 'usr_115',
      name: 'Sofia Al-Mansoor',
      email: 'sofia@apextech.io',
      role: 'Member',
      customerId: 'cust_01',
      orgName: 'Apex Technologies',
      status: 'Invited',
      mfaEnabled: false,
      lastActive: 'Never',
      createdAt: '2024-09-10',
      avatarColor: '#d946ef'
    }
  ],

  subscriptions: [
    {
      id: 'sub_8801',
      customerId: 'cust_01',
      customerName: 'Apex Technologies',
      planId: 'plan_enterprise',
      planName: 'Enterprise',
      billingInterval: 'Monthly',
      status: 'Active',
      mrr: 199,
      amount: 199,
      currency: 'USD',
      currentPeriodStart: '2024-09-15',
      currentPeriodEnd: '2024-10-15',
      autoRenew: true,
      paymentMethod: 'Visa •••• 4242',
      usagePct: 78
    },
    {
      id: 'sub_8802',
      customerId: 'cust_02',
      customerName: 'Nordic Cloud Labs',
      planId: 'plan_pro',
      planName: 'Professional',
      billingInterval: 'Annual',
      status: 'Active',
      mrr: 65.8,
      amount: 790,
      currency: 'USD',
      currentPeriodStart: '2024-05-20',
      currentPeriodEnd: '2025-05-20',
      autoRenew: true,
      paymentMethod: 'Mastercard •••• 5555',
      usagePct: 62
    },
    {
      id: 'sub_8803',
      customerId: 'cust_03',
      customerName: 'Vanguard Media Group',
      planId: 'plan_scale',
      planName: 'Scale Unlimited',
      billingInterval: 'Monthly',
      status: 'Active',
      mrr: 399,
      amount: 399,
      currency: 'USD',
      currentPeriodStart: '2024-09-10',
      currentPeriodEnd: '2024-10-10',
      autoRenew: true,
      paymentMethod: 'Amex •••• 8912',
      usagePct: 88
    },
    {
      id: 'sub_8804',
      customerId: 'cust_04',
      customerName: 'BioGenix Diagnostics',
      planId: 'plan_enterprise',
      planName: 'Enterprise',
      billingInterval: 'Monthly',
      status: 'Past Due',
      mrr: 199,
      amount: 199,
      currency: 'USD',
      currentPeriodStart: '2024-08-18',
      currentPeriodEnd: '2024-09-18',
      autoRenew: false,
      paymentMethod: 'Visa •••• 1004 (Expired)',
      usagePct: 45
    },
    {
      id: 'sub_8805',
      customerId: 'cust_05',
      customerName: 'HyperDrive Logistics',
      planId: 'plan_pro',
      planName: 'Professional',
      billingInterval: 'Monthly',
      status: 'Active',
      mrr: 79,
      amount: 79,
      currency: 'USD',
      currentPeriodStart: '2024-09-01',
      currentPeriodEnd: '2024-10-01',
      autoRenew: true,
      paymentMethod: 'Visa •••• 9832',
      usagePct: 56
    },
    {
      id: 'sub_8806',
      customerId: 'cust_06',
      customerName: 'PulseFlow AI',
      planId: 'plan_starter',
      planName: 'Starter',
      billingInterval: 'Monthly',
      status: 'Trialing',
      mrr: 0,
      amount: 29,
      currency: 'USD',
      currentPeriodStart: '2024-09-22',
      currentPeriodEnd: '2024-10-06',
      autoRenew: true,
      paymentMethod: 'Credit Card on file',
      usagePct: 24
    },
    {
      id: 'sub_8807',
      customerId: 'cust_07',
      customerName: 'Cobalt Robotics',
      planId: 'plan_pro',
      planName: 'Professional',
      billingInterval: 'Monthly',
      status: 'Paused',
      mrr: 0,
      amount: 79,
      currency: 'USD',
      currentPeriodStart: '2024-08-12',
      currentPeriodEnd: '2024-09-12',
      autoRenew: false,
      paymentMethod: 'Mastercard •••• 3311',
      usagePct: 15
    },
    {
      id: 'sub_8808',
      customerId: 'cust_08',
      customerName: 'Quantum Logic Systems',
      planId: 'plan_starter',
      planName: 'Starter',
      billingInterval: 'Annual',
      status: 'Active',
      mrr: 24.1,
      amount: 290,
      currency: 'USD',
      currentPeriodStart: '2024-08-04',
      currentPeriodEnd: '2025-08-04',
      autoRenew: true,
      paymentMethod: 'Visa •••• 7741',
      usagePct: 30
    },
    {
      id: 'sub_8809',
      customerId: 'cust_09',
      customerName: 'Zion Retail Solutions',
      planId: 'plan_starter',
      planName: 'Starter',
      billingInterval: 'Monthly',
      status: 'Canceled',
      mrr: 0,
      amount: 0,
      currency: 'USD',
      currentPeriodStart: '2024-06-05',
      currentPeriodEnd: '2024-07-05',
      autoRenew: false,
      paymentMethod: 'None',
      usagePct: 0
    }
  ],

  usageAlerts: [
    {
      id: 'alert_1',
      customerName: 'Vanguard Media Group',
      resource: 'API Requests',
      current: '8.8M / 10M',
      percent: 88,
      severity: 'warning'
    },
    {
      id: 'alert_2',
      customerName: 'Apex Technologies',
      resource: 'Storage Capacity',
      current: '462 GB / 500 GB',
      percent: 92,
      severity: 'critical'
    },
    {
      id: 'alert_3',
      customerName: 'HyperDrive Logistics',
      resource: 'Active Team Seats',
      current: '23 / 25',
      percent: 92,
      severity: 'warning'
    }
  ],

  activities: [
    {
      id: 'act_1',
      title: 'Vanguard Media upgraded to Scale Plan',
      description: 'MRR increased by +$200.00/mo',
      timestamp: '14 minutes ago',
      type: 'upgrade'
    },
    {
      id: 'act_2',
      title: 'New customer signed up: PulseFlow AI',
      description: 'Started 14-day Pro trial',
      timestamp: '1 hour ago',
      type: 'signup'
    },
    {
      id: 'act_3',
      title: 'Payment failed for BioGenix Diagnostics',
      description: 'Card expired; retry scheduled',
      timestamp: '3 hours ago',
      type: 'failed_payment'
    },
    {
      id: 'act_4',
      title: 'New team member invited to Apex Technologies',
      description: 'Sofia Al-Mansoor was sent an invite link',
      timestamp: '5 hours ago',
      type: 'team'
    },
    {
      id: 'act_5',
      title: 'Annual renewal processed: Nordic Cloud Labs',
      description: 'Invoice #INV-2024-089 paid ($790.00)',
      timestamp: 'Yesterday',
      type: 'invoice'
    }
  ]
};

// Data Store Manager
export class DataStore {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using initial mock data:', e);
    }
    this.save(initialData);
    return JSON.parse(JSON.stringify(initialData));
  }

  save(data = this.data) {
    try {
      this.data = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  reset() {
    const clone = JSON.parse(JSON.stringify(initialData));
    this.save(clone);
    return clone;
  }

  // Users CRUD
  getUsers() { return this.data.users; }
  addUser(user) {
    user.id = 'usr_' + Date.now();
    user.createdAt = new Date().toISOString().split('T')[0];
    user.lastActive = 'Just now';
    if (!user.avatarColor) user.avatarColor = '#6366f1';
    this.data.users.unshift(user);
    this.save();
    return user;
  }
  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }
  deleteUser(id) {
    this.data.users = this.data.users.filter(u => u.id !== id);
    this.save();
  }

  // Plans CRUD
  getPlans() { return this.data.plans; }
  addPlan(plan) {
    plan.id = 'plan_' + (plan.slug || Date.now());
    plan.subscribersCount = 0;
    plan.status = plan.status || 'active';
    this.data.plans.push(plan);
    this.save();
    return plan;
  }
  updatePlan(id, updates) {
    const idx = this.data.plans.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.plans[idx] = { ...this.data.plans[idx], ...updates };
      this.save();
      return this.data.plans[idx];
    }
    return null;
  }
  deletePlan(id) {
    this.data.plans = this.data.plans.filter(p => p.id !== id);
    this.save();
  }

  // Subscriptions CRUD
  getSubscriptions() { return this.data.subscriptions; }
  updateSubscription(id, updates) {
    const idx = this.data.subscriptions.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.subscriptions[idx] = { ...this.data.subscriptions[idx], ...updates };
      this.save();
      return this.data.subscriptions[idx];
    }
    return null;
  }
  deleteSubscription(id) {
    this.data.subscriptions = this.data.subscriptions.filter(s => s.id !== id);
    this.save();
  }

  // Customers
  getCustomers() { return this.data.customers; }
  updateCustomer(id, updates) {
    const idx = this.data.customers.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.customers[idx] = { ...this.data.customers[idx], ...updates };
      this.save();
      return this.data.customers[idx];
    }
    return null;
  }
}

export const store = new DataStore();
