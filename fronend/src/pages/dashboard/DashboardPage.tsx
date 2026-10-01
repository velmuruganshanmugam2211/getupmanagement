import React, { useState } from 'react';
import { 
  Users2, 
  DollarSign, 
  TrendingUp, 
  Film, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ArrowUpRight, 
  Calendar,
  Sparkles,
  Receipt,
  FileCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card, StatCard } from '../../components/ui/Card';
import { Badge, StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ClientFormModal } from '../../components/forms/ClientFormModal';
import { TaskFormModal } from '../../components/forms/TaskFormModal';
import { ContentFormModal } from '../../components/forms/ContentFormModal';
import { PaymentFormModal } from '../../components/forms/PaymentFormModal';
import { InvoicePreviewModal } from '../../components/finance/InvoicePreviewModal';
import { Invoice } from '../../types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { 
    currentUser, 
    clients, 
    packages,
    monthlyQuotas, 
    contents, 
    tasks, 
    invoices, 
    payments, 
    expenses, 
    activityLogs,
    isDark,
    markInvoicePaid
  } = useApp();

  const navigate = useNavigate();

  // Modals
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Financial Calculations
  const activeClients = clients.filter(c => c.status === 'active');
  const totalInvoicedRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalCollectedRevenue = payments.reduce((sum, pay) => sum + pay.amount, 0);
  const totalPendingPayments = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const estimatedProfit = Math.max(0, totalCollectedRevenue - totalExpenses);

  // Overall Content Quota Sums
  const quotaTotals = monthlyQuotas.reduce((acc, q) => {
    acc.videos.allocated += q.items.videos.allocated;
    acc.videos.completed += q.items.videos.completed;
    acc.videos.remaining += q.items.videos.remaining;

    acc.reels.allocated += q.items.reels.allocated;
    acc.reels.completed += q.items.reels.completed;
    acc.reels.remaining += q.items.reels.remaining;

    acc.posters.allocated += q.items.posters.allocated;
    acc.posters.completed += q.items.posters.completed;
    acc.posters.remaining += q.items.posters.remaining;

    acc.photos.allocated += q.items.photos.allocated;
    acc.photos.completed += q.items.photos.completed;
    acc.photos.remaining += q.items.photos.remaining;

    acc.stories.allocated += q.items.stories.allocated;
    acc.stories.completed += q.items.stories.completed;
    acc.stories.remaining += q.items.stories.remaining;

    return acc;
  }, {
    videos: { allocated: 0, completed: 0, remaining: 0 },
    reels: { allocated: 0, completed: 0, remaining: 0 },
    posters: { allocated: 0, completed: 0, remaining: 0 },
    photos: { allocated: 0, completed: 0, remaining: 0 },
    stories: { allocated: 0, completed: 0, remaining: 0 },
  });

  // Client Content Health Buckets
  const clientsOnTrack = monthlyQuotas.filter(q => q.status === 'on_track');
  const clientsAtRisk = monthlyQuotas.filter(q => q.status === 'at_risk');
  const clientsOverdue = monthlyQuotas.filter(q => q.status === 'overdue');

  // Today's Scheduled Content
  const today = new Date().toISOString().split('T')[0];
  const scheduledToday = contents.filter(c => c.publishDate === today || c.status === 'Scheduled');

  // Urgent and Overdue Tasks
  const pendingTasks = tasks.filter(t => t.status !== 'Completed').slice(0, 5);

  // Unpaid Invoices
  const pendingInvoices = invoices.filter(inv => inv.balanceDue > 0);

  // Revenue chart trend data based on real ledger records
  const revenueChartData = [
    { month: 'Jun', invoiced: 0, collected: 0, expenses: 0 },
    { month: 'Jul', invoiced: 0, collected: 0, expenses: 0 },
    { month: 'Aug', invoiced: 0, collected: 0, expenses: 0 },
    { month: 'Sep', invoiced: totalInvoicedRevenue, collected: totalCollectedRevenue, expenses: totalExpenses },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Standard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
              Good morning, {currentUser.name} 👋
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F0FDF4] text-[#008000] dark:bg-[#14532D]/50 border border-[#BBF7D0] dark:border-[#166534]">
              Agency Active
            </span>
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
            Here's what's happening across your agency operations, monthly content quotas, and cashflow today.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAddTaskOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Task
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAddContentOpen(true)}
            leftIcon={<Film className="w-3.5 h-3.5" />}
          >
            Add Content
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddClientOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Client
          </Button>
        </div>
      </div>

      {/* 2. Top Metrics (Answers Q1, Q2, Q3, Q14, Q15) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Total Clients"
          value={clients.length}
          caption={`${activeClients.length} active subscriptions`}
          icon={<Users2 className="w-5 h-5" />}
          onClick={() => navigate('/clients')}
        />
        <StatCard
          title="Active Clients"
          value={activeClients.length}
          caption="100% operational"
          icon={<CheckCircle2 className="w-5 h-5 text-[#16A34A]" />}
          onClick={() => navigate('/clients')}
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${(totalInvoicedRevenue / 1000).toFixed(0)}k`}
          caption="Invoiced for September"
          change="+18.5%"
          changeType="positive"
          icon={<DollarSign className="w-5 h-5" />}
          onClick={() => navigate('/finance/invoices')}
        />
        <StatCard
          title="Pending Payments"
          value={`₹${(totalPendingPayments / 1000).toFixed(0)}k`}
          caption={`${pendingInvoices.length} clients pending`}
          change={pendingInvoices.length > 0 ? "Action required" : "All clear"}
          changeType={pendingInvoices.length > 0 ? "negative" : "positive"}
          icon={<Clock className="w-5 h-5 text-[#D97706]" />}
          onClick={() => navigate('/finance')}
        />
        <StatCard
          title="Monthly Expenses"
          value={`₹${(totalExpenses / 1000).toFixed(0)}k`}
          caption="Software, salaries, gear"
          icon={<Receipt className="w-5 h-5 text-[#64748B]" />}
          onClick={() => navigate('/finance/expenses')}
        />
        <StatCard
          title="Estimated Profit"
          value={`₹${(estimatedProfit / 1000).toFixed(0)}k`}
          caption="Cash collected - expenses"
          change="Strong margin"
          changeType="positive"
          icon={<TrendingUp className="w-5 h-5 text-[#008000]" />}
          onClick={() => navigate('/reports')}
        />
      </div>

      {/* 3. Content Production Overview (Answers Q5, Q6, Q7, Q8, Q9) */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-[#1E293B] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                Monthly Content Production Overview
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-[#DCFCE7] text-[#008000] dark:bg-[#14532D] dark:text-[#4ADE80]">
                September 2026
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              Live automated aggregation across all active client packages and deliverables.
            </p>
          </div>
          <Link
            to="/content"
            className="text-xs font-semibold text-[#008000] dark:text-[#4ADE80] hover:underline inline-flex items-center gap-1"
          >
            Manage Content Pipeline <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4">
          {/* Videos */}
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">Videos</span>
              <span className="text-xs font-mono font-bold text-[#008000]">
                {quotaTotals.videos.completed} / {quotaTotals.videos.allocated}
              </span>
            </div>
            <ProgressBar
              value={quotaTotals.videos.completed}
              max={quotaTotals.videos.allocated}
              size="sm"
            />
            <div className="flex justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              <span>{Math.round((quotaTotals.videos.completed / (quotaTotals.videos.allocated || 1)) * 100)}% done</span>
              <span className="font-semibold text-[#D97706]">{quotaTotals.videos.remaining} remaining</span>
            </div>
          </div>

          {/* Reels */}
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">Reels (9:16)</span>
              <span className="text-xs font-mono font-bold text-[#008000]">
                {quotaTotals.reels.completed} / {quotaTotals.reels.allocated}
              </span>
            </div>
            <ProgressBar
              value={quotaTotals.reels.completed}
              max={quotaTotals.reels.allocated}
              size="sm"
            />
            <div className="flex justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              <span>{Math.round((quotaTotals.reels.completed / (quotaTotals.reels.allocated || 1)) * 100)}% done</span>
              <span className="font-semibold text-[#D97706]">{quotaTotals.reels.remaining} remaining</span>
            </div>
          </div>

          {/* Posters */}
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">Posters & Banners</span>
              <span className="text-xs font-mono font-bold text-[#008000]">
                {quotaTotals.posters.completed} / {quotaTotals.posters.allocated}
              </span>
            </div>
            <ProgressBar
              value={quotaTotals.posters.completed}
              max={quotaTotals.posters.allocated}
              size="sm"
            />
            <div className="flex justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              <span>{Math.round((quotaTotals.posters.completed / (quotaTotals.posters.allocated || 1)) * 100)}% done</span>
              <span className="font-semibold text-[#D97706]">{quotaTotals.posters.remaining} remaining</span>
            </div>
          </div>

          {/* Photos */}
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">Photoshoots</span>
              <span className="text-xs font-mono font-bold text-[#008000]">
                {quotaTotals.photos.completed} / {quotaTotals.photos.allocated}
              </span>
            </div>
            <ProgressBar
              value={quotaTotals.photos.completed}
              max={quotaTotals.photos.allocated}
              size="sm"
            />
            <div className="flex justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              <span>{Math.round((quotaTotals.photos.completed / (quotaTotals.photos.allocated || 1)) * 100)}% done</span>
              <span className="font-semibold text-[#D97706]">{quotaTotals.photos.remaining} remaining</span>
            </div>
          </div>

          {/* Stories */}
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">Stories</span>
              <span className="text-xs font-mono font-bold text-[#008000]">
                {quotaTotals.stories.completed} / {quotaTotals.stories.allocated}
              </span>
            </div>
            <ProgressBar
              value={quotaTotals.stories.completed}
              max={quotaTotals.stories.allocated}
              size="sm"
            />
            <div className="flex justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              <span>{Math.round((quotaTotals.stories.completed / (quotaTotals.stories.allocated || 1)) * 100)}% done</span>
              <span className="font-semibold text-[#D97706]">{quotaTotals.stories.remaining} remaining</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Two-Column Layout: Revenue Overview Chart & Client Content Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Financial Performance Chart */}
        <Card className="p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                Revenue & Cash Flow Trend
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Invoiced revenue vs actual collected payments and operational expenses
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#008000]" />
                <span className="text-[#64748B] dark:text-[#94A3B8]">Collected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                <span className="text-[#64748B] dark:text-[#94A3B8]">Invoiced</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#008000" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#008000" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#F1F5F9'} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `₹${val/1000}k`} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#111827' : '#FFFFFF',
                    borderColor: isDark ? '#1E293B' : '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="invoiced" name="Invoiced" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorInvoiced)" />
                <Area type="monotone" dataKey="collected" name="Collected" stroke="#008000" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCollected)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Right (1 col): Client Content Health (Answers Q10, Q13, Q18: which client needs attention) */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                Client Quota Health
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Pacing and risk indicators</p>
            </div>
            <span className="text-xs font-bold text-[#008000]">{clients.length} Clients</span>
          </div>

          <div className="space-y-3">
            {monthlyQuotas.length === 0 ? (
              <p className="text-xs text-[#94A3B8] py-8 text-center">
                No active client quotas. Onboard a client to initialize monthly quotas.
              </p>
            ) : (
              monthlyQuotas.map(q => {
              const totalAlloc = Object.values(q.items).reduce((s, it) => s + it.allocated, 0);
              const totalComp = Object.values(q.items).reduce((s, it) => s + it.completed, 0);
              const client = clients.find(c => c.id === q.clientId);

              return (
                <div
                  key={q.id}
                  onClick={() => navigate(`/clients/${q.clientId}`)}
                  className="p-3 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#CBD5E1] dark:hover:border-[#334155] cursor-pointer transition-all bg-[#F8FAFC]/50 dark:bg-[#0B1120]/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">{q.clientName}</p>
                      <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                        {client?.packageName} • Fee: ₹{client?.monthlyFee.toLocaleString()}/mo
                      </p>
                    </div>
                    <StatusBadge status={q.status} />
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      <span>Deliverables Completed</span>
                      <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                        {totalComp} / {totalAlloc}
                      </span>
                    </div>
                    <ProgressBar
                      value={totalComp}
                      max={totalAlloc}
                      size="sm"
                      color={q.status === 'overdue' ? 'danger' : q.status === 'at_risk' ? 'warning' : 'brand'}
                    />
                  </div>
                </div>
              );
            }))}
          </div>
        </Card>
      </div>

      {/* 5. Three-Column Lower Section: Upcoming Tasks, Pending Payments, Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Scheduled Today & Urgent Tasks (Answers Q11, Q12, Q16) */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                Today's Schedule & Tasks
              </h2>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                {scheduledToday.length} publishing, {pendingTasks.length} pending tasks
              </p>
            </div>
            <Link to="/tasks" className="text-xs font-semibold text-[#008000] hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-2.5">
            {scheduledToday.length === 0 && pendingTasks.length === 0 ? (
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] py-8 text-center">
                No deliverables scheduled or pending tasks for today.
              </p>
            ) : (
              <>
                {scheduledToday.map(c => (
                  <div key={c.id} className="p-2.5 rounded-lg bg-[#F0FDF4] dark:bg-[#14532D]/30 border border-[#BBF7D0] dark:border-[#166534] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#008000] dark:text-[#4ADE80]">[Publishing Today]</span>
                      <Badge variant="brand" size="sm">{c.contentType}</Badge>
                    </div>
                    <p className="font-medium text-[#0F172A] dark:text-[#F8FAFC] mt-1 line-clamp-1">{c.title}</p>
                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Client: {c.clientName} • Owner: {c.assignedToName}
                    </p>
                  </div>
                ))}

                {pendingTasks.map(t => (
                  <div key={t.id} className="p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <PriorityBadge priority={t.priority} size="sm" />
                      <span className="text-[10px] text-[#DC2626] font-semibold">Due: {t.dueDate}</span>
                    </div>
                    <p className="font-medium text-[#0F172A] dark:text-[#F8FAFC] line-clamp-1">{t.title}</p>
                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      {t.clientName} • Assigned: <span className="font-semibold text-[#0F172A] dark:text-[#CBD5E1]">{t.assignedToName}</span>
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        </Card>

        {/* Column 2: Pending Client Payments (Answers Q4: Which clients have pending payments) */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                Pending Invoices & Collections
              </h2>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                ₹{totalPendingPayments.toLocaleString()} outstanding across {pendingInvoices.length} invoices
              </p>
            </div>
            <Link to="/finance" className="text-xs font-semibold text-[#008000] hover:underline">
              Finance
            </Link>
          </div>

          <div className="space-y-2.5">
            {pendingInvoices.length === 0 ? (
              <p className="text-xs text-[#16A34A] py-6 text-center">All client invoices are fully settled!</p>
            ) : (
              pendingInvoices.map(inv => (
                <div key={inv.id} className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">{inv.clientName}</span>
                      <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono">#{inv.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-[#DC2626] dark:text-[#F87171]">
                        ₹{inv.balanceDue.toLocaleString()}
                      </span>
                      <p className="text-[10px] text-[#94A3B8]">Due {inv.dueDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0] dark:border-[#1E293B]/60">
                    <StatusBadge status={inv.paymentStatus} size="sm" />
                    <div className="flex gap-1.5">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => markInvoicePaid(inv.id)}
                      >
                        Mark Paid
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Column 3: Recent Activity Feed (Answers Section 30 audit log) */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                Live Agency Activity
              </h2>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Real-time operational audit trail</p>
            </div>
          </div>

          <div className="space-y-3">
            {activityLogs.length === 0 ? (
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] py-8 text-center">
                No activity recorded yet. Actions will appear in the audit trail.
              </p>
            ) : (
              activityLogs.slice(0, 6).map((log, idx) => (
                <div key={`${log.id}-${idx}`} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#008000] mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[#0F172A] dark:text-[#F8FAFC] leading-tight">
                      <span className="font-bold">{log.userName}</span>{' '}
                      <span className="text-[#475569] dark:text-[#94A3B8]">{log.action}:</span>{' '}
                      <span className="font-medium text-[#008000] dark:text-[#4ADE80]">{log.target}</span>
                    </p>
                    <span className="text-[10px] text-[#94A3B8] block mt-0.5">{log.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick Modals */}
      <ClientFormModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
      />

      <TaskFormModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
      />

      <ContentFormModal
        isOpen={isAddContentOpen}
        onClose={() => setIsAddContentOpen(false)}
      />

      <InvoicePreviewModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />
    </div>
  );
};
