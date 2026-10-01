export type UserRole = 
  | 'Super Admin' 
  | 'Admin' 
  | 'Digital Marketer' 
  | 'Designer' 
  | 'Video Editor';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  status: 'active' | 'inactive';
  assignedTasksCount?: number;
  completedTasksCount?: number;
  overdueTasksCount?: number;
  workload: 'Low' | 'Normal' | 'High' | 'Overloaded';
  password?: string;
}

export type ClientStatus = 'active' | 'paused' | 'archived';

export interface ClientSocialAccount {
  website?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  googleBusiness?: string;
}

export interface ClientBilling {
  gstNumber?: string;
  billingName: string;
  billingAddress: string;
}

export interface Client {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  industry: string;
  socials: ClientSocialAccount;
  billing: ClientBilling;
  packageId: string;
  packageName: string;
  monthlyFee: number;
  startDate: string;
  endDate: string;
  paymentTerms: string;
  paymentStatus: 'paid' | 'partial' | 'pending' | 'overdue';
  status: ClientStatus;
  accountManagerId: string;
  accountManagerName: string;
  notes?: string;
  createdAt: string;
}

export interface PackageQuotaTemplate {
  videos: number;
  reels: number;
  posters: number;
  photos: number;
  stories: number;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  billingCycle: 'Monthly' | 'Quarterly' | 'Yearly';
  status: 'active' | 'inactive';
  quota: PackageQuotaTemplate;
  services: string[];
  isCustom?: boolean;
}

export interface QuotaItem {
  type: 'video' | 'reel' | 'poster' | 'photo' | 'story';
  allocated: number;
  completed: number;
  remaining: number;
  overDelivered: number;
}

export interface MonthlyQuota {
  id: string;
  clientId: string;
  clientName: string;
  month: string;
  monthLabel: string;
  items: {
    videos: QuotaItem;
    reels: QuotaItem;
    posters: QuotaItem;
    photos: QuotaItem;
    stories: QuotaItem;
  };
  status: 'on_track' | 'at_risk' | 'overdue' | 'completed';
  notes?: string;
}

export type ContentType = 
  | 'Video' 
  | 'Reel' 
  | 'Poster' 
  | 'Photo' 
  | 'Story' 
  | 'Carousel' 
  | 'Ad Creative';

export type ContentStatus = 
  | 'Idea' 
  | 'Planned' 
  | 'Assigned' 
  | 'In Progress' 
  | 'Internal Review' 
  | 'Ready' 
  | 'Scheduled' 
  | 'Published' 
  | 'Cancelled';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface ContentItem {
  id: string;
  clientId: string;
  clientName: string;
  contentType: ContentType;
  title: string;
  description: string;
  platform: 'Instagram' | 'Facebook' | 'YouTube' | 'LinkedIn' | 'Google' | 'Multi-platform';
  assignedToId: string;
  assignedToName: string;
  dueDate: string;
  publishDate: string;
  priority: PriorityLevel;
  status: ContentStatus;
  campaignId?: string;
  campaignName?: string;
  mediaUrl?: string;
  mediaThumbnail?: string;
  caption?: string;
  hashtags?: string;
  notes?: string;
  createdAt: string;
}

export type TaskStatus = 'Todo' | 'In Progress' | 'Review' | 'Completed' | 'Cancelled';

export interface Task {
  id: string;
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  project?: string;
  assignedToId: string;
  assignedToName: string;
  priority: PriorityLevel;
  status: TaskStatus;
  dueDate: string;
  estimatedHours: number;
  actualHours?: number;
  commentsCount?: number;
  createdAt: string;
}

export type CampaignStatus = 'Draft' | 'Planned' | 'Running' | 'Paused' | 'Completed';

export interface Campaign {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  platform: 'Meta Ads' | 'Google Ads' | 'Instagram Ads' | 'YouTube' | 'Influencer';
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  status: CampaignStatus;
  objective: 'Brand Awareness' | 'Lead Generation' | 'Conversions' | 'Store Visits' | 'Engagement';
  metrics: {
    reach: number;
    impressions: number;
    clicks: number;
    leads: number;
    engagement: number;
    conversions: number;
  };
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export type InvoiceStatus = 'Paid' | 'Partial' | 'Pending' | 'Overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientAddress: string;
  clientGst?: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: InvoiceStatus;
  documentType?: 'Invoice' | 'Quotation';
  notes?: string;
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Other';

export interface Payment {
  id: string;
  clientId: string;
  clientName: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  status: 'Completed' | 'Pending' | 'Failed';
  notes?: string;
}

export type ExpenseCategory = 
  | 'Software' 
  | 'Salary' 
  | 'Freelancer' 
  | 'Advertising' 
  | 'Travel' 
  | 'Office' 
  | 'Equipment' 
  | 'Subscription' 
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paidBy: string;
  paymentMethod: PaymentMethod;
  receiptName?: string;
  notes?: string;
}

export type MediaFolderType = 
  | 'Brand Assets' 
  | 'Photos' 
  | 'Videos' 
  | 'Posters' 
  | 'Reels' 
  | 'Documents';

export interface MediaItem {
  id: string;
  clientId: string;
  clientName: string;
  folder: MediaFolderType;
  fileName: string;
  fileType: string;
  fileSize: string;
  thumbnailUrl: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ActivityLog {
  id: string;
  userName: string;
  userRole: UserRole;
  action: string;
  target: string;
  timestamp: string;
  type: 'client' | 'content' | 'task' | 'finance' | 'package' | 'system';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'danger' | 'success';
  timestamp: string;
  read: boolean;
  link?: string;
}
