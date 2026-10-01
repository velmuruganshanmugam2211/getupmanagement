import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Globe, 
  MapPin, 
  Phone, 
  Mail, 
  Plus, 
  Edit3, 
  FileText, 
  Film, 
  CheckSquare, 
  DollarSign, 
  FolderGit2, 
  Calendar,
  Layers,
  Sparkles,
  BarChart2,
  Share2,
  CreditCard,
  Eye,
  UploadCloud,
  CheckCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card, StatCard } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { StatusBadge, Badge, PriorityBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { ClientFormModal } from '../../components/forms/ClientFormModal';
import { ContentFormModal } from '../../components/forms/ContentFormModal';
import { TaskFormModal } from '../../components/forms/TaskFormModal';
import { InvoiceFormModal } from '../../components/forms/InvoiceFormModal';
import { PaymentFormModal } from '../../components/forms/PaymentFormModal';
import { InvoicePreviewModal } from '../../components/finance/InvoicePreviewModal';
import { Invoice, MediaItem, MediaFolderType } from '../../types';

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    clients, 
    monthlyQuotas, 
    contents, 
    tasks, 
    campaigns, 
    invoices, 
    payments, 
    mediaItems, 
    activityLogs,
    currentUser,
    updateQuotaNumbers,
    markInvoicePaid,
    addMediaItem
  } = useApp();

  const client = clients.find(c => c.id === id);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | undefined>(undefined);
  
  // Media upload & preview
  const [isUploadMediaOpen, setIsUploadMediaOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [uploadFolder, setUploadFolder] = useState<MediaFolderType>('Reels');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState('');
  const [uploadThumbnail, setUploadThumbnail] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Quota editor state for instant in-line updates
  const [editingQuotaType, setEditingQuotaType] = useState<string | null>(null);
  const [allocVal, setAllocVal] = useState<number>(0);
  const [compVal, setCompVal] = useState<number>(0);

  if (!client) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-lg font-bold">Client Not Found</h2>
        <p className="text-xs text-[#94A3B8]">The requested client record does not exist or has been deleted.</p>
        <Button variant="primary" size="sm" onClick={() => navigate('/clients')}>
          Back to Clients
        </Button>
      </div>
    );
  }

  const quota = monthlyQuotas.find(q => q.clientId === client.id);
  const clientContent = contents.filter(c => c.clientId === client.id);
  const clientTasks = tasks.filter(t => t.clientId === client.id);
  const clientCampaigns = campaigns.filter(c => c.clientId === client.id);
  const clientInvoices = invoices.filter(i => i.clientId === client.id);
  const clientPayments = payments.filter(p => p.clientId === client.id);
  const clientMedia = mediaItems.filter(m => m.clientId === client.id);
  const clientLogs = activityLogs.filter(l => l.target.toLowerCase().includes(client.businessName.toLowerCase()));

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'quota', label: 'Monthly Quota', count: quota ? 5 : 0 },
    { id: 'content', label: 'Content Items', count: clientContent.length },
    { id: 'tasks', label: 'Tasks', count: clientTasks.length },
    { id: 'campaigns', label: 'Campaigns', count: clientCampaigns.length },
    { id: 'billing', label: 'Invoices & Payments', count: clientInvoices.length },
    { id: 'media', label: 'Media Assets', count: clientMedia.length },
    { id: 'activity', label: 'Activity Trail' }
  ];

  const handleOpenQuotaEditor = (key: 'videos' | 'reels' | 'posters' | 'photos' | 'stories') => {
    if (!quota) return;
    setEditingQuotaType(key);
    setAllocVal(quota.items[key].allocated);
    setCompVal(quota.items[key].completed);
  };

  const handleSaveQuota = () => {
    if (!quota || !editingQuotaType) return;
    updateQuotaNumbers(
      quota.id, 
      editingQuotaType as 'videos' | 'reels' | 'posters' | 'photos' | 'stories', 
      Number(allocVal), 
      Number(compVal)
    );
    setEditingQuotaType(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/clients')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] hover:text-[#008000] dark:hover:text-[#4ADE80] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Clients
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
          >
            Edit Profile
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddContentOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Content
          </Button>
        </div>
      </div>

      {/* Client Profile Header Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                {client.businessName}
              </h1>
              <StatusBadge status={client.status} />
              <Badge variant="brand">{client.packageName}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 text-xs text-[#64748B] dark:text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#0F172A] dark:text-[#CBD5E1]">Contact:</span>
                <span>{client.contactPerson}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#008000]" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#0F172A] dark:text-[#CBD5E1]">Manager:</span>
                <span className="text-[#008000] font-bold">{client.accountManagerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#DC2626]" />
                <span className="truncate">{client.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#0F172A] dark:text-[#CBD5E1]">Contract:</span>
                <span>{client.startDate} to {client.endDate}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2 text-xs">
              {client.socials.website && (
                <a href={client.socials.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#008000] hover:underline">
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              )}
              {client.socials.instagram && (
                <span className="flex items-center gap-1 text-[#E1306C]">
                  <Share2 className="w-3.5 h-3.5" /> {client.socials.instagram}
                </span>
              )}
              {client.socials.facebook && (
                <span className="flex items-center gap-1 text-[#1877F2]">
                  <Globe className="w-3.5 h-3.5" /> Facebook
                </span>
              )}
              {client.socials.youtube && (
                <span className="flex items-center gap-1 text-[#FF0000]">
                  <Film className="w-3.5 h-3.5" /> YouTube
                </span>
              )}
            </div>
          </div>

          {/* Monthly Retainer Box */}
          <div className="p-4 bg-[#F8FAFC] dark:bg-[#0B1120] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] shrink-0 text-right space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Monthly Retainer</span>
            <p className="text-2xl font-black text-[#008000] dark:text-[#4ADE80]">
              ₹{client.monthlyFee.toLocaleString()}
            </p>
            <div className="pt-1">
              <StatusBadge status={client.paymentStatus} size="sm" />
            </div>
            <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{client.paymentTerms}</p>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Active Tasks"
              value={clientTasks.filter(t => t.status !== 'Completed').length}
              caption={`${clientTasks.length} total tasks`}
              icon={<CheckSquare className="w-5 h-5 text-[#2563EB]" />}
            />
            <StatCard
              title="Content Items"
              value={clientContent.length}
              caption={`${clientContent.filter(c => c.status === 'Published').length} published`}
              icon={<Film className="w-5 h-5 text-[#008000]" />}
            />
            <StatCard
              title="Total Invoiced"
              value={`₹${clientInvoices.reduce((s, i) => s + i.total, 0).toLocaleString()}`}
              caption={`${clientInvoices.length} invoices issued`}
              icon={<DollarSign className="w-5 h-5 text-[#16A34A]" />}
            />
            <StatCard
              title="Media Assets"
              value={clientMedia.length}
              caption="Videos, posters & photos"
              icon={<FolderGit2 className="w-5 h-5 text-[#9333EA]" />}
            />
          </div>

          {/* Quota Progress Snapshot */}
          {quota && (
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                    Current Month Quota Fulfillment ({quota.monthLabel})
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    Deliverables tracked against {client.packageName} subscription agreement.
                  </p>
                </div>
                <Button variant="secondary" size="xs" onClick={() => setActiveTab('quota')}>
                  Manage Full Quota
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                {(['videos', 'reels', 'posters', 'photos', 'stories'] as const).map(type => {
                  const it = quota.items[type];
                  return (
                    <div key={type} className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold capitalize">{type}</span>
                        <span className="font-bold text-[#008000]">{it.completed} / {it.allocated}</span>
                      </div>
                      <ProgressBar value={it.completed} max={it.allocated} size="sm" />
                      <div className="flex justify-between text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                        <span>{it.remaining} remaining</span>
                        {it.overDelivered > 0 && (
                          <span className="text-[#008000] font-bold">+{it.overDelivered} over</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Notes & Client Guidelines */}
          {client.notes && (
            <Card className="p-4 bg-[#FFFBEB] dark:bg-[#78350F]/20 border-[#FDE68A] dark:border-[#92400E]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D97706] block mb-1">
                Account Priorities & Special Guidelines
              </span>
              <p className="text-xs text-[#0F172A] dark:text-[#CBD5E1] leading-relaxed">
                {client.notes}
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Tab 2: Monthly Quota (Core Feature) */}
      {activeTab === 'quota' && quota && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Monthly Content Quota Engine
                </h2>
                <StatusBadge status={quota.status} />
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                Allocated content from retainer package vs completed, remaining, and over-delivered items.
              </p>
            </div>
            <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Cycle: <strong className="text-[#008000]">{quota.monthLabel}</strong>
            </div>
          </div>

          <div className="space-y-4">
            {(['videos', 'reels', 'posters', 'photos', 'stories'] as const).map(key => {
              const it = quota.items[key];
              const pct = it.allocated > 0 ? Math.round((it.completed / it.allocated) * 100) : 0;

              return (
                <div key={key} className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-[#0F172A] dark:text-[#F8FAFC]">
                        {key}
                      </h4>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                        Allocated: {it.allocated} • Completed: {it.completed} • Remaining: {it.remaining}
                        {it.overDelivered > 0 && ` • Over-delivered: ${it.overDelivered}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#008000]">{pct}% Complete</span>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => handleOpenQuotaEditor(key)}
                      >
                        Adjust Quota
                      </Button>
                    </div>
                  </div>

                  <ProgressBar value={it.completed} max={it.allocated} size="md" />

                  {/* Inline Quota Adjuster */}
                  {editingQuotaType === key && (
                    <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B1120] rounded-lg border border-[#BBF7D0] dark:border-[#166534] flex items-center gap-3 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">Allocated:</span>
                        <input
                          type="number"
                          className="w-16 h-8 text-xs px-2 border rounded bg-white dark:bg-[#111827] text-center"
                          value={allocVal}
                          onChange={e => setAllocVal(Number(e.target.value))}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">Completed:</span>
                        <input
                          type="number"
                          className="w-16 h-8 text-xs px-2 border rounded bg-white dark:bg-[#111827] text-center"
                          value={compVal}
                          onChange={e => setCompVal(Number(e.target.value))}
                        />
                      </div>
                      <Button variant="primary" size="xs" onClick={handleSaveQuota}>Save</Button>
                      <Button variant="secondary" size="xs" onClick={() => setEditingQuotaType(null)}>Cancel</Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tab 3: Content Items */}
      {activeTab === 'content' && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
              Scheduled & Published Deliverables
            </h3>
            <Button
              variant="primary"
              size="xs"
              onClick={() => setIsAddContentOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Content
            </Button>
          </div>

          {clientContent.length === 0 ? (
            <p className="text-xs text-[#94A3B8] py-8 text-center">No content items recorded for this client yet.</p>
          ) : (
            <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
              {clientContent.map(cnt => (
                <div key={cnt.id} className="py-3 flex items-start justify-between text-xs gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">{cnt.title}</span>
                      <Badge variant="neutral" size="sm">{cnt.contentType}</Badge>
                      <span className="text-[11px] text-[#008000] font-semibold">{cnt.platform}</span>
                    </div>
                    <p className="text-[#64748B] dark:text-[#94A3B8] text-[11px] line-clamp-1">{cnt.description}</p>
                    <p className="text-[10px] text-[#94A3B8]">
                      Assigned to: {cnt.assignedToName} • Due: {cnt.dueDate} • Publish: {cnt.publishDate}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <PriorityBadge priority={cnt.priority} size="sm" />
                    <StatusBadge status={cnt.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 4: Tasks */}
      {activeTab === 'tasks' && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
              Workload & Production Tasks
            </h3>
            <Button
              variant="primary"
              size="xs"
              onClick={() => setIsAddTaskOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Create Task
            </Button>
          </div>

          {clientTasks.length === 0 ? (
            <p className="text-xs text-[#94A3B8] py-8 text-center">No tasks assigned for this client.</p>
          ) : (
            <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
              {clientTasks.map(t => (
                <div key={t.id} className="py-3 flex items-start justify-between text-xs gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">{t.title}</span>
                      <PriorityBadge priority={t.priority} size="sm" />
                    </div>
                    <p className="text-[#64748B] dark:text-[#94A3B8] text-[11px] line-clamp-1">{t.description}</p>
                    <p className="text-[10px] text-[#94A3B8]">
                      Assigned to: <strong className="text-[#0F172A] dark:text-[#CBD5E1]">{t.assignedToName}</strong> • Est: {t.estimatedHours} hrs • Due: {t.dueDate}
                    </p>
                  </div>
                  <StatusBadge status={t.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 5: Campaigns */}
      {activeTab === 'campaigns' && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
              Paid Advertising & Growth Campaigns
            </h3>
          </div>

          {clientCampaigns.length === 0 ? (
            <p className="text-xs text-[#94A3B8] py-8 text-center">No active ad campaigns configured for this client.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientCampaigns.map(camp => (
                <div key={camp.id} className="p-4 rounded-lg bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">{camp.name}</h4>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{camp.platform} • {camp.objective}</p>
                    </div>
                    <StatusBadge status={camp.status} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-white dark:bg-[#111827] rounded border border-[#E2E8F0] dark:border-[#1E293B]">
                      <span className="text-[10px] text-[#94A3B8] block">Budget</span>
                      <span className="font-bold">₹{camp.budget.toLocaleString()}</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-[#111827] rounded border border-[#E2E8F0] dark:border-[#1E293B]">
                      <span className="text-[10px] text-[#94A3B8] block">Spent</span>
                      <span className="font-bold text-[#DC2626]">₹{camp.spent.toLocaleString()}</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-[#111827] rounded border border-[#E2E8F0] dark:border-[#1E293B]">
                      <span className="text-[10px] text-[#94A3B8] block">Leads</span>
                      <span className="font-bold text-[#008000]">{camp.metrics.leads}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 6: Billing & Invoices */}
      {activeTab === 'billing' && (() => {
        const totalBilled = clientInvoices.reduce((s, i) => s + i.total, 0);
        const totalPaid = clientPayments.reduce((s, p) => s + p.amount, 0);
        const totalDue = clientInvoices.reduce((s, i) => s + i.balanceDue, 0);

        return (
          <div className="space-y-5">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">Total Quoted / Invoiced</span>
                <p className="text-xl font-black text-[#0F172A] dark:text-[#F8FAFC]">₹{totalBilled.toLocaleString()}</p>
                <p className="text-[10px] text-[#94A3B8]">{clientInvoices.length} billing documents</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F0FDF4] dark:bg-[#14532D]/20 border border-[#BBF7D0] dark:border-[#166534] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#008000] dark:text-[#4ADE80]">Total Collected Cash</span>
                <p className="text-xl font-black text-[#008000] dark:text-[#4ADE80]">₹{totalPaid.toLocaleString()}</p>
                <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{clientPayments.length} verified receipts</p>
              </div>

              <div className="p-4 rounded-xl bg-[#FEF2F2] dark:bg-[#7F1D1D]/20 border border-[#FECACA] dark:border-[#991B1B] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] dark:text-[#F87171]">Outstanding Balance Due</span>
                <p className="text-xl font-black text-[#DC2626] dark:text-[#F87171]">₹{totalDue.toLocaleString()}</p>
                <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{totalDue > 0 ? 'Pending clearance' : 'All accounts settled'}</p>
              </div>
            </div>

            {/* Invoices and Quotations Table */}
            <Card className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                    Quotations & Tax Invoices
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    Agreed deliverables, advance deposits, and outstanding balance status.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => {
                      setPaymentInvoiceId(clientInvoices.find(i => i.balanceDue > 0)?.id);
                      setIsAddPaymentOpen(true);
                    }}
                    leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                  >
                    Record Payment
                  </Button>
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => setIsAddInvoiceOpen(true)}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    New Invoice / Quote
                  </Button>
                </div>
              </div>

              {clientInvoices.length === 0 ? (
                <p className="text-xs text-[#94A3B8] py-8 text-center">No quotations or tax invoices generated for this client.</p>
              ) : (
                <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                  {clientInvoices.map(inv => {
                    const isQuote = inv.documentType === 'Quotation';
                    return (
                      <div key={inv.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">{inv.invoiceNumber}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              isQuote ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#F1F5F9] text-[#475569]'
                            }`}>
                              {isQuote ? 'Quotation' : 'Tax Invoice'}
                            </span>
                            <StatusBadge status={inv.paymentStatus} size="sm" />
                          </div>
                          <p className="text-[10px] text-[#94A3B8]">
                            Dated: {inv.invoiceDate} • Due: {inv.dueDate}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                              ₹{inv.total.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                              Paid: <span className="text-[#008000] font-semibold">₹{inv.amountPaid.toLocaleString()}</span> • Due: <span className="text-[#DC2626] font-semibold">₹{inv.balanceDue.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="secondary"
                              size="xs"
                              onClick={() => setSelectedInvoice(inv)}
                            >
                              Preview
                            </Button>
                            {inv.balanceDue > 0 && (
                              <Button
                                variant="primary"
                                size="xs"
                                onClick={() => {
                                  setPaymentInvoiceId(inv.id);
                                  setIsAddPaymentOpen(true);
                                }}
                                leftIcon={<CreditCard className="w-3 h-3" />}
                              >
                                Record Pay
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Payment Receipts Table */}
            <Card className="p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC] pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
                Payment Receipts & Remittances
              </h3>
              {clientPayments.length === 0 ? (
                <p className="text-xs text-[#94A3B8] py-6 text-center">No payment receipts credited for this client yet.</p>
              ) : (
                <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                  {clientPayments.map(p => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#008000]">₹{p.amount.toLocaleString()}</span>
                        <span className="text-[10px] text-[#94A3B8] ml-2">via {p.paymentMethod} • Ref: {p.referenceNumber || '—'}</span>
                        <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{p.paymentDate} • #{p.invoiceNumber}</p>
                      </div>
                      <StatusBadge status={p.status} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        );
      })()}

      {/* Tab 7: Media Assets */}
      {activeTab === 'media' && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                Client Media Storage
              </h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Creatives, raw cuts, logos, and deliverables for {client.businessName}.
              </p>
            </div>
            <Button
              variant="primary"
              size="xs"
              onClick={() => {
                setUploadFileName('');
                setUploadThumbnail('');
                setIsUploadMediaOpen(true);
              }}
              leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
            >
              Upload Asset
            </Button>
          </div>

          {clientMedia.length === 0 ? (
            <div className="p-8 text-center text-xs space-y-3">
              <UploadCloud className="w-8 h-8 text-[#94A3B8] mx-auto" />
              <p className="text-[#94A3B8]">No media files uploaded for this client yet.</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsUploadMediaOpen(true)}
              >
                Upload First Deliverable
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {clientMedia.map(m => (
                <div
                  key={m.id}
                  onClick={() => setPreviewMedia(m)}
                  className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] space-y-2 cursor-pointer hover:border-[#008000] transition-all group"
                >
                  <div className="relative aspect-video rounded overflow-hidden bg-black">
                    <img src={m.thumbnailUrl} alt={m.fileName} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute top-1 left-1 text-[9px] font-bold px-1 py-0.2 rounded bg-black/70 text-white">
                      {m.folder}
                    </span>
                  </div>
                  <p className="text-xs font-semibold truncate group-hover:text-[#008000] transition-colors">{m.fileName}</p>
                  <p className="text-[10px] text-[#94A3B8]">{m.fileSize} • By {m.uploadedBy}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 8: Activity */}
      {activeTab === 'activity' && (
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC] pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            Client Audit History
          </h3>
          <div className="space-y-3">
            {clientLogs.length === 0 ? (
              <p className="text-xs text-[#94A3B8] py-4 text-center">No specific activity logged yet.</p>
            ) : (
              clientLogs.map((log, idx) => (
                <div key={`${log.id}-${idx}`} className="flex items-center gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#008000]" />
                  <div>
                    <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{log.userName}</span>{' '}
                    <span className="text-[#64748B] dark:text-[#94A3B8]">{log.action}: {log.target}</span>
                    <span className="text-[10px] text-[#94A3B8] block">{log.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Modals */}
      <ClientFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={client}
      />

      <ContentFormModal
        isOpen={isAddContentOpen}
        onClose={() => setIsAddContentOpen(false)}
        defaultClientId={client.id}
      />

      <TaskFormModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        defaultClientId={client.id}
      />

      <InvoiceFormModal
        isOpen={isAddInvoiceOpen}
        onClose={() => setIsAddInvoiceOpen(false)}
        defaultClientId={client.id}
      />

      <PaymentFormModal
        isOpen={isAddPaymentOpen}
        onClose={() => {
          setIsAddPaymentOpen(false);
          setPaymentInvoiceId(undefined);
        }}
        defaultInvoiceId={paymentInvoiceId}
        defaultClientId={client.id}
      />

      <InvoicePreviewModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />

      {/* Client Media Upload Modal */}
      <Modal
        isOpen={isUploadMediaOpen}
        onClose={() => setIsUploadMediaOpen(false)}
        title={`Upload Asset for ${client.businessName}`}
        description="Select deliverables or raw footage to add to this client's media vault."
        maxWidth="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsUploadMediaOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (!uploadFileName.trim()) return;
                addMediaItem({
                  clientId: client.id,
                  clientName: client.businessName,
                  folder: uploadFolder,
                  fileName: uploadFileName.trim(),
                  fileType: uploadFolder === 'Videos' || uploadFolder === 'Reels' ? 'video/mp4' : 'image/jpeg',
                  fileSize: uploadFileSize || '5.2 MB',
                  thumbnailUrl: uploadThumbnail || (uploadFolder === 'Videos' || uploadFolder === 'Reels'
                    ? 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&auto=format&fit=crop&q=80'
                    : 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=300&auto=format&fit=crop&q=80'),
                  fileUrl: uploadThumbnail || '#',
                  uploadedBy: currentUser.name
                });
                setIsUploadMediaOpen(false);
              }}
            >
              Upload Asset
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Storage Category"
            value={uploadFolder}
            onChange={e => setUploadFolder(e.target.value as MediaFolderType)}
          >
            <option value="Reels">Reels (9:16)</option>
            <option value="Posters">Posters & Creatives</option>
            <option value="Videos">Long Form Videos</option>
            <option value="Photos">Photoshoot Library</option>
            <option value="Brand Assets">Brand Assets</option>
            <option value="Documents">Documents & Briefs</option>
          </Select>

          <input
            type="file"
            ref={fileInputRef}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                setUploadFileName(file.name);
                setUploadFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
                if (file.type.startsWith('image/')) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === 'string') setUploadThumbnail(reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }
            }}
            accept="image/*,video/*,application/pdf"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#CBD5E1] dark:border-[#334155] rounded-xl p-6 text-center space-y-2 cursor-pointer hover:border-[#008000] hover:bg-[#F0FDF4]/30 transition-all bg-[#F8FAFC] dark:bg-[#0B1120]"
          >
            <UploadCloud className="w-8 h-8 text-[#008000] mx-auto" />
            <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Click to select file from computer</p>
            <p className="text-[10px] text-[#94A3B8]">Supports MP4, MOV, PNG, JPG, PSD, PDF</p>
          </div>

          <Input
            label="Asset File Name *"
            required
            placeholder="e.g. balaji_catering_special_menu.mp4"
            value={uploadFileName}
            onChange={e => setUploadFileName(e.target.value)}
          />
        </div>
      </Modal>

      {/* Media Preview Modal */}
      {previewMedia && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewMedia(null)}
          title={previewMedia.fileName}
          description={`Uploaded by ${previewMedia.uploadedBy} for ${previewMedia.clientName}`}
          maxWidth="lg"
          footer={
            <Button variant="secondary" size="sm" onClick={() => setPreviewMedia(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <img src={previewMedia.thumbnailUrl} alt={previewMedia.fileName} className="max-h-full max-w-full object-contain" />
            </div>
            <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B1120] rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Folder:</span>
                <span className="font-semibold">{previewMedia.folder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">File Size:</span>
                <span>{previewMedia.fileSize}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
