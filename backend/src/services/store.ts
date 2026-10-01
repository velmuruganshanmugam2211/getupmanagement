import fs from 'fs';
import path from 'path';
import { syncStoreToPostgres } from './dbSync';
import { 
  User, 
  Client, 
  Package, 
  MonthlyQuota, 
  ContentItem, 
  Task, 
  Campaign, 
  Invoice, 
  Payment, 
  Expense, 
  MediaItem, 
  ActivityLog, 
  Notification 
} from '../types';

interface StoreData {
  users: (User & { passwordHash?: string })[];
  clients: Client[];
  packages: Package[];
  quotas: MonthlyQuota[];
  contents: ContentItem[];
  tasks: Task[];
  campaigns: Campaign[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  media: MediaItem[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  settings: Record<string, any>;
}

const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

const INITIAL_DATA: StoreData = {
  users: [
    {
      id: 'usr-1',
      name: 'Velu',
      email: 'velu@getupdigital.com',
      phone: '+91 98401 23456',
      role: 'Super Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      assignedTasksCount: 0,
      completedTasksCount: 0,
      overdueTasksCount: 0,
      workload: 'Normal',
      passwordHash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW' // password123
    },
    {
      id: 'usr-2',
      name: 'Arun',
      email: 'arun@getupdigital.com',
      phone: '+91 98402 34567',
      role: 'Digital Marketer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      assignedTasksCount: 0,
      completedTasksCount: 0,
      overdueTasksCount: 0,
      workload: 'Normal',
      passwordHash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'
    },
    {
      id: 'usr-3',
      name: 'Karthik',
      email: 'karthik@getupdigital.com',
      phone: '+91 98403 45678',
      role: 'Video Editor',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      assignedTasksCount: 0,
      completedTasksCount: 0,
      overdueTasksCount: 0,
      workload: 'Normal',
      passwordHash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'
    },
    {
      id: 'usr-4',
      name: 'Priya',
      email: 'priya@getupdigital.com',
      phone: '+91 98404 56789',
      role: 'Designer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      assignedTasksCount: 0,
      completedTasksCount: 0,
      overdueTasksCount: 0,
      workload: 'Normal',
      passwordHash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'
    },
    {
      id: 'usr-5',
      name: 'Suresh',
      email: 'suresh@getupdigital.com',
      phone: '+91 98405 67890',
      role: 'Admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      assignedTasksCount: 0,
      completedTasksCount: 0,
      overdueTasksCount: 0,
      workload: 'Normal',
      passwordHash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'
    }
  ],
  packages: [
    {
      id: 'pkg-starter',
      name: 'Starter',
      description: 'Basic social media management, brand awareness posts, and short-form reels.',
      monthlyPrice: 20000,
      billingCycle: 'Monthly',
      status: 'active',
      quota: { videos: 0, reels: 15, posters: 15, photos: 0, stories: 0 },
      services: ['Social Media Management', 'Graphic Design', 'Video Editing']
    },
    {
      id: 'pkg-growth',
      name: 'Growth Pro',
      description: 'Full-funnel digital presence with high quality commercial videos and paid campaign management.',
      monthlyPrice: 35000,
      billingCycle: 'Monthly',
      status: 'active',
      quota: { videos: 4, reels: 20, posters: 20, photos: 10, stories: 10 },
      services: ['Social Media Management', 'Graphic Design', 'Video Editing', 'Meta Ads']
    }
  ],
  clients: [
    {
      id: 'cli-1',
      businessName: 'Balaji Catering',
      contactPerson: 'Senthil Nathan',
      phone: '+91 98400 11223',
      whatsapp: '+91 98400 11223',
      email: 'contact@balajicatering.in',
      address: '12, South Usman Road, T. Nagar, Chennai - 600017',
      industry: 'Food & Hospitality',
      socials: {
        website: 'https://balajicatering.in',
        instagram: '@balaji_catering_official'
      },
      billing: {
        billingName: 'Balaji Catering Services LLP',
        billingAddress: '12, South Usman Road, T. Nagar, Chennai',
        gstNumber: '33AAAAA0000A1Z5'
      },
      packageId: 'pkg-starter',
      packageName: 'Starter',
      monthlyFee: 20000,
      startDate: '2026-09-01',
      endDate: '2027-02-28',
      paymentTerms: '50% Advance, Balance on 15th',
      paymentStatus: 'partial',
      status: 'active',
      accountManagerId: 'usr-1',
      accountManagerName: 'Velu',
      notes: 'Quotation sent for 20K. Client paid 10K advance via UPI. 10K balance pending.',
      createdAt: '2026-09-01T10:00:00.000Z'
    }
  ],
  quotas: [
    {
      id: 'quota-cli-1',
      clientId: 'cli-1',
      clientName: 'Balaji Catering',
      month: '2026-09',
      monthLabel: 'September 2026',
      items: {
        videos: { type: 'video', allocated: 0, completed: 0, remaining: 0, overDelivered: 0 },
        reels: { type: 'reel', allocated: 15, completed: 6, remaining: 9, overDelivered: 0 },
        posters: { type: 'poster', allocated: 15, completed: 8, remaining: 7, overDelivered: 0 },
        photos: { type: 'photo', allocated: 0, completed: 0, remaining: 0, overDelivered: 0 },
        stories: { type: 'story', allocated: 0, completed: 0, remaining: 0, overDelivered: 0 },
      },
      status: 'on_track'
    }
  ],
  contents: [
    {
      id: 'cnt-1',
      clientId: 'cli-1',
      clientName: 'Balaji Catering',
      contentType: 'Reel',
      title: 'Signature Wedding Biryani Making (Behind the Scenes)',
      description: 'High-speed 4K kitchen montage showing authentic wood-fired cooking.',
      platform: 'Instagram',
      assignedToId: 'usr-3',
      assignedToName: 'Karthik',
      dueDate: '2026-10-02',
      publishDate: '2026-10-03',
      priority: 'High',
      status: 'Scheduled',
      mediaThumbnail: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&auto=format&fit=crop&q=80',
      createdAt: '2026-09-20T10:00:00.000Z'
    }
  ],
  tasks: [
    {
      id: 'tsk-1',
      title: 'Edit 3 Reel cuts for Balaji Catering October Festival',
      description: 'Color grade food footage and add dynamic audio beats.',
      clientId: 'cli-1',
      clientName: 'Balaji Catering',
      assignedToId: 'usr-3',
      assignedToName: 'Karthik',
      priority: 'High',
      status: 'In Progress',
      dueDate: '2026-10-02',
      estimatedHours: 4,
      createdAt: '2026-09-28T09:00:00.000Z'
    }
  ],
  campaigns: [],
  invoices: [
    {
      id: 'inv-1',
      invoiceNumber: 'QUO-2026-001',
      documentType: 'Quotation',
      clientId: 'cli-1',
      clientName: 'Balaji Catering',
      clientAddress: '12, South Usman Road, T. Nagar, Chennai - 600017',
      clientGst: '33AAAAA0000A1Z5',
      invoiceDate: '2026-09-01',
      dueDate: '2026-09-15',
      items: [
        {
          id: 'itm-1',
          description: 'Starter Retainer: 15 Reels & 15 Posters Content Management (Monthly Retainer Quotation)',
          quantity: 1,
          unitPrice: 20000,
          amount: 20000
        }
      ],
      subtotal: 20000,
      taxRate: 0,
      taxAmount: 0,
      discount: 0,
      total: 20000,
      amountPaid: 10000,
      balanceDue: 10000,
      paymentStatus: 'Partial',
      notes: 'Quoted amount ₹20,000. 50% advance payment of ₹10,000 received via UPI. Balance ₹10,000 pending clearance.'
    }
  ],
  payments: [
    {
      id: 'pay-1',
      clientId: 'cli-1',
      clientName: 'Balaji Catering',
      invoiceId: 'inv-1',
      invoiceNumber: 'QUO-2026-001',
      amount: 10000,
      paymentDate: '2026-09-02',
      paymentMethod: 'UPI',
      referenceNumber: 'UPI-HDFC-902148',
      status: 'Completed',
      notes: 'Initial 50% advance payment received against quotation QUO-2026-001.'
    }
  ],
  expenses: [
    {
      id: 'exp-1',
      title: 'Adobe Creative Cloud Team License',
      category: 'Software',
      amount: 4500,
      date: '2026-09-05',
      paidBy: 'Velu',
      paymentMethod: 'Card',
      receiptName: 'Adobe-Receipt-Sep2026.pdf',
      notes: 'Monthly video editing and design software subscription.'
    }
  ],
  media: [
    {
      id: 'med-1',
      clientId: 'cli-1',
      clientName: 'Balaji Catering',
      folder: 'Reels',
      fileName: 'balaji_biryani_teaser_reel.mp4',
      fileType: 'video/mp4',
      fileSize: '14.8 MB',
      thumbnailUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&auto=format&fit=crop&q=80',
      fileUrl: '#',
      uploadedBy: 'Karthik',
      uploadedAt: '2026-09-22'
    }
  ],
  notifications: [
    {
      id: 'notif-1',
      title: 'Partial Payment Received',
      message: 'Balaji Catering paid ₹10,000 via UPI towards QUO-2026-001. Balance ₹10,000 pending.',
      type: 'info',
      timestamp: '2 hours ago',
      read: false,
      link: '/finance/invoices'
    }
  ],
  activityLogs: [
    {
      id: 'act-1',
      userName: 'Velu',
      userRole: 'Super Admin',
      action: 'Recorded partial payment',
      target: '₹10,000 for QUO-2026-001 (Balaji Catering)',
      timestamp: '2 hours ago',
      type: 'finance'
    }
  ],
  settings: {
    companyName: 'Getup Digital Solution',
    tagline: 'Digital Marketing & Creative Production Agency',
    email: 'contact@getupdigital.com',
    phone: '+91 98401 23456',
    gstNumber: '33AAACG9988Z1ZP',
    address: '42 Anna Salai, Guindy, Chennai, Tamil Nadu 600032',
    defaultCurrency: 'INR (₹)',
    defaultTaxRate: 18,
    invoicePrefix: 'INV-2026-',
    quotationPrefix: 'QUO-2026-'
  }
};

class Store {
  private data: StoreData;
  private syncTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadData();
    // Sync initial state to PostgreSQL on startup
    this.queueDbSync();
  }

  private loadData(): StoreData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read store.json, using seed defaults:', err);
    }
    this.saveData(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  public queueDbSync() {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    this.syncTimeout = setTimeout(() => {
      syncStoreToPostgres(this.data).catch(err => {
        console.warn('PostgreSQL synchronization warning:', err.message);
      });
    }, 500);
  }

  public saveData(customData?: StoreData) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(customData || this.data, null, 2), 'utf-8');
      this.queueDbSync();
    } catch (err) {
      console.error('Failed to write store.json:', err);
    }
  }

  // Getters
  public getUsers() { return this.data.users; }
  public getClients() { return this.data.clients; }
  public getPackages() { return this.data.packages; }
  public getQuotas() { return this.data.quotas; }
  public getContents() { return this.data.contents; }
  public getTasks() { return this.data.tasks; }
  public getCampaigns() { return this.data.campaigns; }
  public getInvoices() { return this.data.invoices; }
  public getPayments() { return this.data.payments; }
  public getExpenses() { return this.data.expenses; }
  public getMedia() { return this.data.media; }
  public getNotifications() { return this.data.notifications; }
  public getActivityLogs() { return this.data.activityLogs; }
  public getSettings() { return this.data.settings; }

  // Setters
  public setUsers(users: StoreData['users']) { this.data.users = users; this.saveData(); }
  public setClients(clients: Client[]) { this.data.clients = clients; this.saveData(); }
  public setPackages(packages: Package[]) { this.data.packages = packages; this.saveData(); }
  public setQuotas(quotas: MonthlyQuota[]) { this.data.quotas = quotas; this.saveData(); }
  public setContents(contents: ContentItem[]) { this.data.contents = contents; this.saveData(); }
  public setTasks(tasks: Task[]) { this.data.tasks = tasks; this.saveData(); }
  public setCampaigns(campaigns: Campaign[]) { this.data.campaigns = campaigns; this.saveData(); }
  public setInvoices(invoices: Invoice[]) { this.data.invoices = invoices; this.saveData(); }
  public setPayments(payments: Payment[]) { this.data.payments = payments; this.saveData(); }
  public setExpenses(expenses: Expense[]) { this.data.expenses = expenses; this.saveData(); }
  public setMedia(media: MediaItem[]) { this.data.media = media; this.saveData(); }
  public setNotifications(notifs: Notification[]) { this.data.notifications = notifs; this.saveData(); }
  public setActivityLogs(logs: ActivityLog[]) { this.data.activityLogs = logs; this.saveData(); }
  public setSettings(settings: Record<string, any>) { this.data.settings = settings; this.saveData(); }

  // Activity Log helper
  public addLog(userName: string, userRole: any, action: string, target: string, type: ActivityLog['type'] = 'system') {
    const newLog: ActivityLog = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userName,
      userRole,
      action,
      target,
      timestamp: 'Just now',
      type
    };
    this.data.activityLogs.unshift(newLog);
    this.saveData();
    return newLog;
  }
}

export const store = new Store();
export default store;
