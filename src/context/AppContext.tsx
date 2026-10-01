import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  User, 
  UserRole, 
  Client, 
  Package, 
  MonthlyQuota, 
  ContentItem, 
  ContentStatus,
  Task, 
  TaskStatus,
  Campaign, 
  Invoice, 
  Payment, 
  Expense, 
  MediaItem, 
  ActivityLog, 
  Notification 
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_PACKAGES, 
  INITIAL_CLIENTS, 
  INITIAL_MONTHLY_QUOTAS, 
  INITIAL_CONTENT, 
  INITIAL_TASKS, 
  INITIAL_CAMPAIGNS, 
  INITIAL_INVOICES, 
  INITIAL_PAYMENTS, 
  INITIAL_EXPENSES, 
  INITIAL_MEDIA, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_ACTIVITY_LOGS 
} from '../constants/seedData';
import {
  clientService,
  teamService,
  packageService,
  contentService,
  taskService,
  campaignService,
  financeService,
  mediaService,
  notificationService,
  settingService,
  authService
} from '../services';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'danger' | 'info' | 'warning';
}

interface AppContextType {
  currentUser: User;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  // Authentication State
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;

  isDark: boolean;
  toggleDarkMode: () => void;
  isLoading: boolean;
  apiError: string | null;
  refreshData: () => Promise<void>;

  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  archiveClient: (id: string) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  // Packages
  packages: Package[];
  addPackage: (pkg: Omit<Package, 'id'>) => Promise<void>;
  updatePackage: (id: string, updates: Partial<Package>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;

  // Monthly Quota
  monthlyQuotas: MonthlyQuota[];
  updateQuotaNumbers: (quotaId: string, itemType: 'videos' | 'reels' | 'posters' | 'photos' | 'stories', allocated: number, completed: number) => Promise<void>;
  generateNewMonthQuota: (monthKey: string, monthName: string) => Promise<void>;

  // Content
  contents: ContentItem[];
  addContent: (content: Omit<ContentItem, 'id' | 'createdAt'>) => Promise<void>;
  updateContent: (id: string, updates: Partial<ContentItem>) => Promise<void>;
  updateContentStatus: (id: string, status: ContentStatus) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Campaigns
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, 'id'>) => Promise<void>;
  updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>;

  // Finance
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
  markInvoicePaid: (invoiceId: string, paymentMethod?: string) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Media
  mediaItems: MediaItem[];
  addMediaItem: (media: Omit<MediaItem, 'id' | 'uploadedAt'>) => Promise<void>;
  deleteMediaItem: (id: string) => Promise<void>;

  // Notifications
  notifications: Notification[];
  unreadNotifsCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Activity Logs
  activityLogs: ActivityLog[];
  addLog: (action: string, target: string, type?: ActivityLog['type']) => void;

  // Global Command Palette
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;

  // Toast
  toasts: ToastMessage[];
  showToast: (title: string, message?: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;

  // Permissions
  hasAccess: (module: 'clients' | 'packages' | 'content' | 'calendar' | 'tasks' | 'campaigns' | 'finance' | 'media' | 'team' | 'reports' | 'settings') => boolean;

  // Clear data
  clearAllData: () => void;
}

const STORAGE_VERSION = 'getup_v4_mgmt';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('getup_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('getup_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('getup_theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(prev => !prev);

  // Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('getup_token');
  });
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Users & Role state
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('getup_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [currentRole, setCurrentRole] = useState<UserRole>('Super Admin');
  const [currentUser, setCurrentUser] = useState<User>(() => users.find(u => u.role === currentRole) || users[0]);

  // Toast dispatch
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = useCallback((title: string, message?: string, type: ToastMessage['type'] = 'success') => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Core entities state
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('getup_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [packages, setPackages] = useState<Package[]>(() => {
    const saved = localStorage.getItem('getup_packages');
    return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
  });

  const [monthlyQuotas, setMonthlyQuotas] = useState<MonthlyQuota[]>(() => {
    const saved = localStorage.getItem('getup_quotas');
    return saved ? JSON.parse(saved) : INITIAL_MONTHLY_QUOTAS;
  });

  const [contents, setContents] = useState<ContentItem[]>(() => {
    const saved = localStorage.getItem('getup_contents');
    return saved ? JSON.parse(saved) : INITIAL_CONTENT;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('getup_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('getup_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('getup_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('getup_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('getup_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('getup_media');
    return saved ? JSON.parse(saved) : INITIAL_MEDIA;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('getup_notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('getup_logs');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Activity logger
  const addLog = useCallback((action: string, target: string, type: ActivityLog['type'] = 'system') => {
    const newLog: ActivityLog = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userName: currentUser.name,
      userRole: currentRole,
      action,
      target,
      timestamp: 'Just now',
      type
    };
    setActivityLogs(prev => [newLog, ...prev]);
  }, [currentUser.name, currentRole]);

  // Centralized Backend Data Fetching
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const [
        clientsRes,
        usersRes,
        packagesRes,
        quotasRes,
        contentsRes,
        tasksRes,
        campaignsRes,
        invoicesRes,
        paymentsRes,
        expensesRes,
        mediaRes,
        notifsRes,
        activityRes
      ] = await Promise.allSettled([
        clientService.getAll(),
        teamService.getAll(),
        packageService.getAll(),
        packageService.getQuotas(),
        contentService.getAll(),
        taskService.getAll(),
        campaignService.getAll(),
        financeService.getInvoices(),
        financeService.getPayments(),
        financeService.getExpenses(),
        mediaService.getAll(),
        notificationService.getAll(),
        settingService.getActivityLogs()
      ]);

      if (clientsRes.status === 'fulfilled') setClients(clientsRes.value);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value);
      if (packagesRes.status === 'fulfilled') setPackages(packagesRes.value);
      if (quotasRes.status === 'fulfilled') setMonthlyQuotas(quotasRes.value);
      if (contentsRes.status === 'fulfilled') setContents(contentsRes.value);
      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value);
      if (campaignsRes.status === 'fulfilled') setCampaigns(campaignsRes.value);
      if (invoicesRes.status === 'fulfilled') setInvoices(invoicesRes.value);
      if (paymentsRes.status === 'fulfilled') setPayments(paymentsRes.value);
      if (expensesRes.status === 'fulfilled') setExpenses(expensesRes.value);
      if (mediaRes.status === 'fulfilled') setMediaItems(mediaRes.value);
      if (notifsRes.status === 'fulfilled') setNotifications(notifsRes.value.notifications);
      if (activityRes.status === 'fulfilled') setActivityLogs(activityRes.value);
    } catch (err: any) {
      console.warn('Backend API connection warning:', err);
      setApiError(err.message || 'Failed to sync with backend server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth session on startup
  useEffect(() => {
    const verifySession = async () => {
      setIsAuthLoading(true);
      const token = localStorage.getItem('getup_token');

      if (!token) {
        setIsAuthenticated(false);
        setIsAuthLoading(false);
        return;
      }

      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setCurrentRole(user.role);
          setIsAuthenticated(true);
          refreshData();
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.warn('Session verification failed:', err);
        localStorage.removeItem('getup_token');
        setIsAuthenticated(false);
      } finally {
        setIsAuthLoading(false);
      }
    };

    verifySession();

    // Listen for unauthorized events from api interceptor
    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      localStorage.removeItem('getup_token');
      showToast('Session Expired', 'Please sign in to continue.', 'warning');
    };

    window.addEventListener('getup:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('getup:unauthorized', handleUnauthorized);
  }, [refreshData, showToast]);

  // Auth: Login function
  const login = async (email: string, password?: string, role?: UserRole) => {
    const data = await authService.login(email, password, role);
    // Fetch /api/auth/me to load fresh user profile
    const profile = await authService.getCurrentUser();
    const activeUser = profile || data.user;
    setCurrentUser(activeUser);
    setCurrentRole(activeUser.role);
    setIsAuthenticated(true);
    await refreshData();
    showToast('Signed In', `Welcome back, ${activeUser.name}!`);
  };

  // Auth: Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout API warning:', err);
    } finally {
      localStorage.removeItem('getup_token');
      setIsAuthenticated(false);
      showToast('Signed Out', 'You have been safely signed out.');
    }
  };

  // Role Switcher for preview
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    const matching = users.find(u => u.role === role);
    if (matching) {
      setCurrentUser(matching);
    }
  };

  // Permission Checker
  const hasAccess = (module: 'clients' | 'packages' | 'content' | 'calendar' | 'tasks' | 'campaigns' | 'finance' | 'media' | 'team' | 'reports' | 'settings'): boolean => {
    if (currentRole === 'Super Admin') return true;
    if (currentRole === 'Admin') return true;
    if (currentRole === 'Digital Marketer') {
      return ['clients', 'content', 'calendar', 'tasks', 'campaigns', 'reports', 'media'].includes(module);
    }
    if (currentRole === 'Designer') {
      return ['content', 'calendar', 'tasks', 'media'].includes(module);
    }
    if (currentRole === 'Video Editor') {
      return ['content', 'calendar', 'tasks', 'media'].includes(module);
    }
    return false;
  };

  // Client Operations
  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    try {
      const newClient = await clientService.create(clientData);
      setClients(prev => [newClient, ...prev]);
      packageService.getQuotas().then(setMonthlyQuotas).catch(() => {});
      addLog('Created client', clientData.businessName, 'client');
      showToast('Client added', `${clientData.businessName} has been successfully added.`);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to add client', 'danger');
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const updated = await clientService.update(id, updates);
      setClients(prev => prev.map(c => c.id === id ? updated : c));
      addLog('Updated client profile', updates.businessName || 'Client ID: ' + id, 'client');
      showToast('Client updated', 'Changes have been saved.');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update client', 'danger');
    }
  };

  const archiveClient = async (id: string) => {
    try {
      const target = clients.find(c => c.id === id);
      const updated = await clientService.update(id, { status: 'archived' });
      setClients(prev => prev.map(c => c.id === id ? updated : c));
      if (target) {
        addLog('Archived client', target.businessName, 'client');
        showToast('Client archived', `${target.businessName} is moved to archive.`);
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to archive client', 'danger');
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const target = clients.find(c => c.id === id);
      await clientService.delete(id);
      setClients(prev => prev.filter(c => c.id !== id));
      setMonthlyQuotas(prev => prev.filter(q => q.clientId !== id));
      if (target) {
        addLog('Deleted client record', target.businessName, 'client');
        showToast('Client removed', `${target.businessName} deleted permanently.`);
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to delete client', 'danger');
    }
  };

  // User / Team Member Operations
  const addUser = async (userData: Omit<User, 'id'>) => {
    try {
      const newUser = await teamService.create(userData);
      setUsers(prev => [...prev, newUser]);
      addLog('Added team member', `${newUser.name} (${newUser.role})`, 'system');
      showToast('Team member added', `${newUser.name} joined the agency.`);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to add team member', 'danger');
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const updated = await teamService.update(id, updates);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
      addLog('Updated team member', updates.name || id, 'system');
      showToast('Team member updated', 'Profile details updated.');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update member', 'danger');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      if (users.length <= 1) {
        showToast('Cannot delete', 'At least one team member must remain.', 'warning');
        return;
      }
      const target = users.find(u => u.id === id);
      await teamService.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      if (target) {
        addLog('Deleted team member', target.name, 'system');
        showToast('Team member removed', `${target.name} deleted.`);
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to remove member', 'danger');
    }
  };

  // Package Operations
  const addPackage = async (pkgData: Omit<Package, 'id'>) => {
    try {
      const newPkg = await packageService.create(pkgData);
      setPackages(prev => [...prev, newPkg]);
      addLog('Created package', pkgData.name, 'package');
      showToast('Package created', `${pkgData.name} package tier added.`);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to add package', 'danger');
    }
  };

  const updatePackage = async (id: string, updates: Partial<Package>) => {
    try {
      const updated = await packageService.update(id, updates);
      setPackages(prev => prev.map(p => p.id === id ? updated : p));
      addLog('Updated package tier', updates.name || id, 'package');
      showToast('Package updated', 'Tier details updated.');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update package', 'danger');
    }
  };

  const deletePackage = async (id: string) => {
    try {
      const target = packages.find(p => p.id === id);
      await packageService.delete(id);
      setPackages(prev => prev.filter(p => p.id !== id));
      if (target) {
        addLog('Deleted package tier', target.name, 'package');
        showToast('Package removed', `${target.name} tier deleted.`);
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to delete package', 'danger');
    }
  };

  // Monthly Quota Operations
  const updateQuotaNumbers = async (
    quotaId: string, 
    itemType: 'videos' | 'reels' | 'posters' | 'photos' | 'stories', 
    allocated: number, 
    completed: number
  ) => {
    try {
      const updated = await packageService.updateQuota(quotaId, itemType, allocated, completed);
      setMonthlyQuotas(prev => prev.map(q => q.id === quotaId ? updated : q));
      showToast('Quota updated', 'Content quota successfully recalculated.');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to recalculate quota', 'danger');
    }
  };

  const generateNewMonthQuota = async (monthKey: string, monthName: string) => {
    try {
      const generated = await packageService.generateMonth(monthKey, monthName);
      setMonthlyQuotas(prev => [...generated, ...prev]);
      addLog('System generated monthly quota', `${monthName} for all active clients`, 'system');
      showToast('New Month Initialized', `Generated monthly quotas for ${monthName}.`);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to initialize month', 'danger');
    }
  };

  // Content Operations
  const addContent = async (contentData: Omit<ContentItem, 'id' | 'createdAt'>) => {
    try {
      const newContent = await contentService.create(contentData);
      setContents(prev => [newContent, ...prev]);
      packageService.getQuotas().then(setMonthlyQuotas).catch(() => {});
      addLog('Created content', `${contentData.contentType}: ${contentData.title}`, 'content');
      showToast('Content created', `${contentData.title} added to schedule.`);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to add content', 'danger');
    }
  };

  const updateContent = async (id: string, updates: Partial<ContentItem>) => {
    try {
      const updated = await contentService.update(id, updates);
      setContents(prev => prev.map(c => c.id === id ? updated : c));
      packageService.getQuotas().then(setMonthlyQuotas).catch(() => {});
      showToast('Content updated', 'Changes have been saved.');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update content', 'danger');
    }
  };

  const updateContentStatus = async (id: string, newStatus: ContentStatus) => {
    try {
      const target = contents.find(c => c.id === id);
      const updated = await contentService.updateStatus(id, newStatus);
      setContents(prev => prev.map(c => c.id === id ? updated : c));
      packageService.getQuotas().then(setMonthlyQuotas).catch(() => {});
      if (target) {
        addLog('Updated content status', `${target.title} -> ${newStatus}`, 'content');
        showToast('Status updated', `${target.title} is now ${newStatus}`);
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to change status', 'danger');
    }
  };

  const deleteContent = async (id: string) => {
    try {
      await contentService.delete(id);
      setContents(prev => prev.filter(c => c.id !== id));
      packageService.getQuotas().then(setMonthlyQuotas).catch(() => {});
      showToast('Content removed', 'Item was deleted.');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to delete content', 'danger');
    }
  };

  // Task Operations
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const newTask = await taskService.create(taskData);
      setTasks(prev => [newTask, ...prev]);
      addLog('Created task', `${taskData.title} assigned to ${taskData.assignedToName}`, 'task');
      showToast('Task created', `${taskData.title} added.`);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to create task', 'danger');
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updated = await taskService.update(id, updates);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      showToast('Task updated', 'Task details updated.');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update task', 'danger');
    }
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    try {
      const target = tasks.find(t => t.id === id);
      const updated = await taskService.updateStatus(id, status);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      if (target) {
        addLog('Updated task status', `${target.title} moved to ${status}`, 'task');
        showToast('Task updated', `Moved to ${status}`);
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to move task', 'danger');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskService.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      showToast('Task deleted', 'Task removed.');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to delete task', 'danger');
    }
  };

  // Campaign Operations
  const addCampaign = async (campaignData: Omit<Campaign, 'id'>) => {
    try {
      const newCamp = await campaignService.create(campaignData);
      setCampaigns(prev => [newCamp, ...prev]);
      addLog('Created campaign', `${campaignData.name} for ${campaignData.clientName}`, 'system');
      showToast('Campaign launched', `${campaignData.name} saved.`);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to launch campaign', 'danger');
    }
  };

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    try {
      const updated = await campaignService.update(id, updates);
      setCampaigns(prev => prev.map(c => c.id === id ? updated : c));
      showToast('Campaign updated', 'Metrics updated.');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update campaign', 'danger');
    }
  };

  // Finance Operations
  const addInvoice = async (invoiceData: Omit<Invoice, 'id'>) => {
    try {
      const newInvoice = await financeService.createInvoice(invoiceData);
      setInvoices(prev => [newInvoice, ...prev]);
      financeService.getPayments().then(setPayments).catch(() => {});
      clientService.getAll().then(setClients).catch(() => {});

      const docType = newInvoice.documentType || 'Invoice';
      addLog(`Generated ${docType.toLowerCase()}`, `${newInvoice.invoiceNumber} for ${newInvoice.clientName} (₹${newInvoice.total.toLocaleString()})`, 'finance');
      showToast(`${docType} created`, `${newInvoice.invoiceNumber} generated.`);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to create invoice', 'danger');
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const target = invoices.find(i => i.id === id);
      await financeService.deleteInvoice(id);
      setInvoices(prev => prev.filter(i => i.id !== id));
      if (target) {
        addLog(`Deleted ${target.documentType || 'invoice'}`, target.invoiceNumber, 'finance');
        showToast('Invoice removed', `${target.invoiceNumber} deleted.`);
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to delete invoice', 'danger');
    }
  };

  const markInvoicePaid = async (invoiceId: string, paymentMethod = 'Bank Transfer') => {
    try {
      const invoice = invoices.find(i => i.id === invoiceId);
      if (!invoice) return;

      await financeService.markInvoicePaid(invoiceId, paymentMethod);
      financeService.getInvoices().then(setInvoices).catch(() => {});
      financeService.getPayments().then(setPayments).catch(() => {});
      clientService.getAll().then(setClients).catch(() => {});

      addLog('Recorded payment', `Full payment received for ${invoice.invoiceNumber}`, 'finance');
      showToast('Payment recorded', `Invoice ${invoice.invoiceNumber} marked as fully paid.`);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to mark invoice as paid', 'danger');
    }
  };

  const addPayment = async (paymentData: Omit<Payment, 'id'>) => {
    try {
      const newPayment = await financeService.createPayment(paymentData);
      setPayments(prev => [newPayment, ...prev]);
      financeService.getInvoices().then(setInvoices).catch(() => {});
      clientService.getAll().then(setClients).catch(() => {});

      addLog('Recorded payment', `₹${paymentData.amount.toLocaleString()} from ${paymentData.clientName}`, 'finance');
      showToast('Payment saved', `Payment of ₹${paymentData.amount.toLocaleString()} recorded.`);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to record payment', 'danger');
    }
  };

  const deletePayment = async (id: string) => {
    try {
      const target = payments.find(p => p.id === id);
      await financeService.deletePayment(id);
      setPayments(prev => prev.filter(p => p.id !== id));
      financeService.getInvoices().then(setInvoices).catch(() => {});

      if (target) {
        addLog('Voided payment receipt', `₹${target.amount.toLocaleString()} for ${target.clientName}`, 'finance');
        showToast('Payment deleted', 'Payment record deleted and invoice balance reverted.');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to void payment', 'danger');
    }
  };

  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    try {
      const newExpense = await financeService.createExpense(expenseData);
      setExpenses(prev => [newExpense, ...prev]);
      addLog('Added agency expense', `${expenseData.title} (₹${expenseData.amount.toLocaleString()})`, 'finance');
      showToast('Expense recorded', `₹${expenseData.amount.toLocaleString()} added to expenses.`);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to record expense', 'danger');
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await financeService.deleteExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
      showToast('Expense removed', 'Record deleted.');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to delete expense', 'danger');
    }
  };

  // Media Operations
  const addMediaItem = async (mediaData: Omit<MediaItem, 'id' | 'uploadedAt'>) => {
    try {
      const newMedia = await mediaService.create(mediaData);
      setMediaItems(prev => [newMedia, ...prev]);
      addLog('Uploaded media asset', `${mediaData.fileName} for ${mediaData.clientName}`, 'content');
      showToast('Media uploaded', `${mediaData.fileName} added.`);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to upload media', 'danger');
    }
  };

  const deleteMediaItem = async (id: string) => {
    try {
      await mediaService.delete(id);
      setMediaItems(prev => prev.filter(m => m.id !== id));
      showToast('File deleted', 'Media item removed.');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to remove media', 'danger');
    }
  };

  // Notification Operations
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const markNotificationRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err: any) {
      console.warn('Mark notification read error:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showToast('Notifications marked read', 'All notifications cleared.');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to clear notifications', 'danger');
    }
  };

  // Clear all agency data
  const clearAllData = () => {
    setClients([]);
    setPackages([]);
    setMonthlyQuotas([]);
    setContents([]);
    setTasks([]);
    setCampaigns([]);
    setInvoices([]);
    setPayments([]);
    setExpenses([]);
    setMediaItems([]);
    setNotifications([]);
    setActivityLogs([]);
    setUsers(INITIAL_USERS);
    localStorage.removeItem('getup_users');
    localStorage.removeItem('getup_clients');
    localStorage.removeItem('getup_packages');
    localStorage.removeItem('getup_quotas');
    localStorage.removeItem('getup_contents');
    localStorage.removeItem('getup_tasks');
    localStorage.removeItem('getup_campaigns');
    localStorage.removeItem('getup_invoices');
    localStorage.removeItem('getup_payments');
    localStorage.removeItem('getup_expenses');
    localStorage.removeItem('getup_media');
    localStorage.removeItem('getup_notifs');
    localStorage.removeItem('getup_logs');
    showToast('Clean Slate Active', 'All dummy and sample agency data has been cleared.');
  };

  // Global Ctrl+K Command Palette listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser,
      currentRole,
      setCurrentRole: handleRoleChange,
      users,
      addUser,
      updateUser,
      deleteUser,
      isAuthenticated,
      isAuthLoading,
      login,
      logout,
      isDark,
      toggleDarkMode,
      isLoading,
      apiError,
      refreshData,
      clients,
      addClient,
      updateClient,
      archiveClient,
      deleteClient,
      packages,
      addPackage,
      updatePackage,
      deletePackage,
      monthlyQuotas,
      updateQuotaNumbers,
      generateNewMonthQuota,
      contents,
      addContent,
      updateContent,
      updateContentStatus,
      deleteContent,
      tasks,
      addTask,
      updateTask,
      updateTaskStatus,
      deleteTask,
      campaigns,
      addCampaign,
      updateCampaign,
      invoices,
      payments,
      expenses,
      addInvoice,
      deleteInvoice,
      markInvoicePaid,
      addPayment,
      deletePayment,
      addExpense,
      deleteExpense,
      mediaItems,
      addMediaItem,
      deleteMediaItem,
      notifications,
      unreadNotifsCount,
      markNotificationRead,
      markAllNotificationsRead,
      activityLogs,
      addLog,
      isCommandPaletteOpen,
      setIsCommandPaletteOpen,
      toasts,
      showToast,
      dismissToast,
      hasAccess,
      clearAllData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
