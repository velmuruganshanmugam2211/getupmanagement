import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  Receipt, 
  Clock, 
  Plus, 
  Printer, 
  CheckCircle, 
  AlertCircle, 
  ArrowUpRight,
  CreditCard,
  Building,
  Smartphone,
  Trash2,
  FileText,
  Search,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card, StatCard } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { SearchInput, Select } from '../../components/ui/Input';
import { InvoicePreviewModal } from '../../components/finance/InvoicePreviewModal';
import { InvoiceFormModal } from '../../components/forms/InvoiceFormModal';
import { PaymentFormModal } from '../../components/forms/PaymentFormModal';
import { ExpenseFormModal } from '../../components/forms/ExpenseFormModal';
import { ConfirmDialog } from '../../components/ui/Modal';
import { Invoice, Payment } from '../../types';

export const FinancePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    invoices, 
    payments, 
    expenses, 
    markInvoicePaid, 
    deleteInvoice,
    deletePayment,
    deleteExpense, 
    clients,
    users
  } = useApp();

  // Determine initial tab from pathname
  const getTabFromPath = () => {
    if (location.pathname.includes('/payments')) return 'payments';
    if (location.pathname.includes('/invoices')) return 'invoices';
    if (location.pathname.includes('/expenses')) return 'expenses';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath);

  // Sync activeTab when URL changes
  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'overview') navigate('/finance');
    else navigate(`/finance/${tabId}`);
  };

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [newDocType, setNewDocType] = useState<'Invoice' | 'Quotation'>('Quotation');
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | undefined>(undefined);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Confirmation dialogs
  const [deletingInvoiceId, setDeletingInvoiceId] = useState<string | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);

  // Search & Filter state for Invoices
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceDocTypeFilter, setInvoiceDocTypeFilter] = useState('all');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('all');

  // Search for Payments
  const [paymentSearch, setPaymentSearch] = useState('');

  // Search & Filter for Expenses
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('all');
  const [expenseClientFilter, setExpenseClientFilter] = useState('all');
  const [expenseMemberFilter, setExpenseMemberFilter] = useState('all');

  // Financial Computations according to Cashflow & Retainer Ledger
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalCollected = payments.reduce((sum, pay) => sum + pay.amount, 0);
  const totalPending = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const overdueInvoices = invoices.filter(inv => inv.paymentStatus === 'Overdue');
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const cashflowProfit = Math.max(0, totalCollected - totalExpenses);

  // Filtered Expenses with Client & Team Member Tagging
  const filteredExpenses = expenses.filter(e => {
    const searchLower = expenseSearch.toLowerCase();
    const matchesSearch = 
      e.title.toLowerCase().includes(searchLower) || 
      e.paidBy.toLowerCase().includes(searchLower) ||
      (e.clientName && e.clientName.toLowerCase().includes(searchLower)) ||
      (e.teamMemberName && e.teamMemberName.toLowerCase().includes(searchLower));
    const matchesCat = expenseCategoryFilter === 'all' || e.category === expenseCategoryFilter;
    const matchesClient = expenseClientFilter === 'all' || e.clientId === expenseClientFilter;
    const matchesMember = expenseMemberFilter === 'all' || e.teamMemberId === expenseMemberFilter;
    return matchesSearch && matchesCat && matchesClient && matchesMember;
  });

  // Client-Level Expense Allocation Breakdown
  const clientExpenseSummary = clients.map(client => {
    const clientExps = expenses.filter(e => e.clientId === client.id);
    const total = clientExps.reduce((s, e) => s + e.amount, 0);
    const cameraRent = clientExps.filter(e => e.category === 'Equipment' || e.title.toLowerCase().includes('camera')).reduce((s, e) => s + e.amount, 0);
    const petrolTravel = clientExps.filter(e => e.category === 'Travel' || e.title.toLowerCase().includes('petrol') || e.title.toLowerCase().includes('fuel')).reduce((s, e) => s + e.amount, 0);
    const editorAmount = clientExps.filter(e => e.category === 'Freelancer' || e.category === 'Salary' || e.title.toLowerCase().includes('editor')).reduce((s, e) => s + e.amount, 0);
    const otherAmount = Math.max(0, total - (cameraRent + petrolTravel + editorAmount));
    return {
      client,
      total,
      count: clientExps.length,
      cameraRent,
      petrolTravel,
      editorAmount,
      otherAmount
    };
  }).filter(item => item.total > 0 || item.count > 0);

  // Creator & Team Member Allocation Breakdown (e.g. Video Editor Storage Cards, Fees)
  const memberExpenseSummary = users.map(user => {
    const userExps = expenses.filter(e => e.teamMemberId === user.id);
    const total = userExps.reduce((s, e) => s + e.amount, 0);
    const storageCards = userExps.filter(e => e.title.toLowerCase().includes('storage') || e.title.toLowerCase().includes('sd card') || e.title.toLowerCase().includes('card') || e.category === 'Equipment').reduce((s, e) => s + e.amount, 0);
    const salaryOrFee = userExps.filter(e => e.category === 'Salary' || e.category === 'Freelancer' || e.title.toLowerCase().includes('fee') || e.title.toLowerCase().includes('amount') || e.title.toLowerCase().includes('payout')).reduce((s, e) => s + e.amount, 0);
    const travel = userExps.filter(e => e.category === 'Travel' || e.title.toLowerCase().includes('petrol')).reduce((s, e) => s + e.amount, 0);
    return {
      user,
      total,
      count: userExps.length,
      storageCards,
      salaryOrFee,
      travel
    };
  }).filter(item => item.total > 0 || item.count > 0);

  const tabs = [
    { id: 'overview', label: 'Financial Overview' },
    { id: 'invoices', label: 'Invoices & Quotations', count: invoices.length },
    { id: 'payments', label: 'Payment Receipts', count: payments.length },
    { id: 'expenses', label: 'Agency Expenses', count: expenses.length }
  ];

  // Filtered Invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(invoiceSearch.toLowerCase());
    const matchesDocType = 
      invoiceDocTypeFilter === 'all' || 
      (invoiceDocTypeFilter === 'Quotation' ? inv.documentType === 'Quotation' : inv.documentType !== 'Quotation');
    const matchesStatus = invoiceStatusFilter === 'all' || inv.paymentStatus === invoiceStatusFilter;
    return matchesSearch && matchesDocType && matchesStatus;
  });

  // Filtered Payments
  const filteredPayments = payments.filter(p => {
    return p.clientName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      (p.referenceNumber && p.referenceNumber.toLowerCase().includes(paymentSearch.toLowerCase()));
  });

  const openRecordPaymentForInvoice = (invId: string) => {
    setPaymentInvoiceId(invId);
    setIsAddPaymentOpen(true);
  };

  const openCreateQuotation = () => {
    setNewDocType('Quotation');
    setIsAddInvoiceOpen(true);
  };

  const openCreateInvoice = () => {
    setNewDocType('Invoice');
    setIsAddInvoiceOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            Agency Finance & Cashflow
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Client quotations, retainer billing, partial payment tracking, operational expenditure, and actual cashflow profit.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAddExpenseOpen(true)}
            leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          >
            Log Expense
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setPaymentInvoiceId(undefined);
              setIsAddPaymentOpen(true);
            }}
            leftIcon={<CreditCard className="w-3.5 h-3.5" />}
          >
            Record Payment
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={openCreateQuotation}
            leftIcon={<FileText className="w-3.5 h-3.5 text-[#008000]" />}
          >
            New Quotation
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateInvoice}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Invoice
          </Button>
        </div>
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Total Invoiced / Quoted"
          value={`₹${(totalInvoiced / 1000).toFixed(0)}k`}
          caption="Total billed & quoted value"
          icon={<Receipt className="w-5 h-5 text-[#2563EB]" />}
        />
        <StatCard
          title="Collected Cash"
          value={`₹${(totalCollected / 1000).toFixed(0)}k`}
          caption="Verified received funds"
          change={`${totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0}% collected`}
          changeType="positive"
          icon={<CheckCircle className="w-5 h-5 text-[#008000]" />}
        />
        <StatCard
          title="Pending Clearance"
          value={`₹${(totalPending / 1000).toFixed(0)}k`}
          caption="Outstanding balance due"
          changeType="negative"
          icon={<Clock className="w-5 h-5 text-[#D97706]" />}
        />
        <StatCard
          title="Overdue Balance"
          value={`₹${(totalOverdue / 1000).toFixed(0)}k`}
          caption={`${overdueInvoices.length} invoices overdue`}
          change={overdueInvoices.length > 0 ? "Follow-up required" : "Zero overdue"}
          changeType={overdueInvoices.length > 0 ? "negative" : "positive"}
          icon={<AlertCircle className="w-5 h-5 text-[#DC2626]" />}
        />
        <StatCard
          title="Total Expenses"
          value={`₹${(totalExpenses / 1000).toFixed(0)}k`}
          caption="Software, ads & agency ops"
          icon={<DollarSign className="w-5 h-5 text-[#64748B]" />}
        />
        <StatCard
          title="Estimated Net Profit"
          value={`₹${(cashflowProfit / 1000).toFixed(0)}k`}
          caption="Cash collected minus expenses"
          change={cashflowProfit > 0 ? "Positive cashflow" : "Cashflow neutral"}
          changeType={cashflowProfit > 0 ? "positive" : "neutral"}
          icon={<TrendingUp className="w-5 h-5 text-[#008000]" />}
        />
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

      {/* Tab 1: Financial Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cashflow Breakdown Card */}
          <Card className="p-5 lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC] pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
              Real-Time Cashflow & Profit Breakdown
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Per agency management standards, profit is strictly calculated on <strong>actual cash collected</strong> (₹{totalCollected.toLocaleString()}) minus operational expenses (₹{totalExpenses.toLocaleString()}), safeguarding against counting pending balances as earned profit.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#F0FDF4] dark:bg-[#14532D]/30 border border-[#BBF7D0] dark:border-[#166534] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#008000]">1. Cash Collected</span>
                <p className="text-2xl font-black text-[#008000] dark:text-[#4ADE80]">₹{totalCollected.toLocaleString()}</p>
                <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{payments.length} verified transactions</p>
              </div>

              <div className="p-4 rounded-xl bg-[#FEF2F2] dark:bg-[#7F1D1D]/30 border border-[#FECACA] dark:border-[#991B1B] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626]">2. Operational Expenses</span>
                <p className="text-2xl font-black text-[#DC2626] dark:text-[#F87171]">₹{totalExpenses.toLocaleString()}</p>
                <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{expenses.length} expense vouchers</p>
              </div>

              <div className="p-4 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 border border-[#BFDBFE] dark:border-[#1E40AF] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">3. Net Profit Pool</span>
                <p className="text-2xl font-black text-[#2563EB] dark:text-[#60A5FA]">₹{cashflowProfit.toLocaleString()}</p>
                <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Retained agency earnings</p>
              </div>
            </div>

            {/* Pending Balance Callout */}
            <div className="p-4 rounded-xl bg-[#FFFBEB] dark:bg-[#78350F]/20 border border-[#FDE68A] dark:border-[#92400E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#D97706] shrink-0" />
                <div>
                  <span className="font-bold text-[#D97706]">Outstanding Client Balances:</span>
                  <p className="text-[#64748B] dark:text-[#CBD5E1]">
                    Total of ₹{totalPending.toLocaleString()} remaining to be collected across {invoices.filter(i => i.balanceDue > 0).length} client invoices/quotations.
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="xs" onClick={() => handleTabChange('invoices')}>
                View Invoices & Quotes
              </Button>
            </div>
          </Card>

          {/* Quick Expense Breakdown */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                Recent Expenses
              </h3>
              <span className="text-xs font-bold text-[#DC2626]">₹{totalExpenses.toLocaleString()}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {expenses.length === 0 ? (
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] italic py-6 text-center">
                  No agency expenses logged yet.
                </p>
              ) : (
                expenses.slice(0, 5).map(exp => (
                  <div key={exp.id} className="flex items-center justify-between p-2 rounded bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B]">
                    <div>
                      <p className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate max-w-[170px]">{exp.title}</p>
                      <span className="text-[10px] text-[#94A3B8]">{exp.category} • {exp.date}</span>
                    </div>
                    <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">₹{exp.amount.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>

            <Button
              variant="secondary"
              size="xs"
              className="w-full"
              onClick={() => handleTabChange('expenses')}
            >
              Manage All Expenses
            </Button>
          </Card>

          {/* Client & Creator Expense Allocation Analytics Section */}
          <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* 1. Client Cost Allocations (Camera Rent, Petrol, Video Editor) */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Client Cost Breakdown (Camera Rent, Petrol, Editors)
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    Specific expenditures incurred and tagged to individual client accounts.
                  </p>
                </div>
                <Badge variant="brand">{clientExpenseSummary.length} Clients Tagged</Badge>
              </div>

              {clientExpenseSummary.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#64748B] dark:text-[#94A3B8] italic">
                  No client-specific expenses recorded yet. Use "Log Expense" to tag expenses to clients.
                </div>
              ) : (
                <div className="overflow-x-auto -mx-5 -mb-5">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] dark:bg-[#0B1120] border-y border-[#E2E8F0] dark:border-[#1E293B] text-[#475569] dark:text-[#94A3B8] font-semibold">
                      <tr>
                        <th className="p-3 pl-5">Client Name</th>
                        <th className="p-3 text-right">📸 Camera Rent</th>
                        <th className="p-3 text-right">⛽ Petrol/Fuel</th>
                        <th className="p-3 text-right">🎬 Editor Cost</th>
                        <th className="p-3 text-right pr-5">Total Spent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                      {clientExpenseSummary.map(({ client, total, cameraRent, petrolTravel, editorAmount }) => (
                        <tr key={client.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#111827]/60 transition-colors">
                          <td className="p-3 pl-5 font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                            {client.businessName}
                          </td>
                          <td className="p-3 text-right font-medium text-[#64748B] dark:text-[#94A3B8]">
                            {cameraRent > 0 ? `₹${cameraRent.toLocaleString()}` : '—'}
                          </td>
                          <td className="p-3 text-right font-medium text-[#64748B] dark:text-[#94A3B8]">
                            {petrolTravel > 0 ? `₹${petrolTravel.toLocaleString()}` : '—'}
                          </td>
                          <td className="p-3 text-right font-medium text-[#64748B] dark:text-[#94A3B8]">
                            {editorAmount > 0 ? `₹${editorAmount.toLocaleString()}` : '—'}
                          </td>
                          <td className="p-3 text-right pr-5 font-bold text-[#DC2626] dark:text-[#F87171]">
                            ₹{total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* 2. Creator & Team Member Allocation (Storage Cards, Video Editor Payouts) */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Creator & Video Editor Expenditure
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    Storage cards, hard drives, freelancer editor payouts, and commute allowances.
                  </p>
                </div>
                <Badge variant="neutral">{memberExpenseSummary.length} Members Tagged</Badge>
              </div>

              {memberExpenseSummary.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#64748B] dark:text-[#94A3B8] italic">
                  No member-specific expenses tagged yet. Tag video editors when logging expenses.
                </div>
              ) : (
                <div className="overflow-x-auto -mx-5 -mb-5">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] dark:bg-[#0B1120] border-y border-[#E2E8F0] dark:border-[#1E293B] text-[#475569] dark:text-[#94A3B8] font-semibold">
                      <tr>
                        <th className="p-3 pl-5">Team Member / Creator</th>
                        <th className="p-3 text-right">💾 SD / Storage</th>
                        <th className="p-3 text-right">💼 Payout / Fees</th>
                        <th className="p-3 text-right">🚗 Commute</th>
                        <th className="p-3 text-right pr-5">Total Tagged</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                      {memberExpenseSummary.map(({ user, total, storageCards, salaryOrFee, travel }) => (
                        <tr key={user.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#111827]/60 transition-colors">
                          <td className="p-3 pl-5">
                            <div className="flex items-center gap-2">
                              <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                              <div>
                                <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">{user.name}</p>
                                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{user.role}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-right font-medium text-[#64748B] dark:text-[#94A3B8]">
                            {storageCards > 0 ? `₹${storageCards.toLocaleString()}` : '—'}
                          </td>
                          <td className="p-3 text-right font-medium text-[#64748B] dark:text-[#94A3B8]">
                            {salaryOrFee > 0 ? `₹${salaryOrFee.toLocaleString()}` : '—'}
                          </td>
                          <td className="p-3 text-right font-medium text-[#64748B] dark:text-[#94A3B8]">
                            {travel > 0 ? `₹${travel.toLocaleString()}` : '—'}
                          </td>
                          <td className="p-3 text-right pr-5 font-bold text-[#DC2626] dark:text-[#F87171]">
                            ₹{total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Invoices & Quotations */}
      {activeTab === 'invoices' && (
        <Card className="overflow-hidden space-y-4 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">Client Quotations & Tax Invoices</h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Tracks full amount, advance payments, and balance due per client.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="xs"
                onClick={openCreateQuotation}
                leftIcon={<FileText className="w-3.5 h-3.5 text-[#008000]" />}
              >
                + Quotation
              </Button>
              <Button
                variant="primary"
                size="xs"
                onClick={openCreateInvoice}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                + Tax Invoice
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchInput
                value={invoiceSearch}
                onChange={e => setInvoiceSearch(e.target.value)}
                onClear={() => setInvoiceSearch('')}
                placeholder="Search by quote/invoice # or client..."
              />
            </div>
            <div className="w-44">
              <Select
                value={invoiceDocTypeFilter}
                onChange={e => setInvoiceDocTypeFilter(e.target.value)}
              >
                <option value="all">All Documents</option>
                <option value="Quotation">Quotations Only</option>
                <option value="Invoice">Invoices Only</option>
              </Select>
            </div>
            <div className="w-44">
              <Select
                value={invoiceStatusFilter}
                onChange={e => setInvoiceStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Partial">Partial (Advance Paid)</option>
                <option value="Pending">Pending (Unpaid)</option>
                <option value="Paid">Paid (Full)</option>
                <option value="Overdue">Overdue</option>
              </Select>
            </div>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="p-12 text-center text-[#64748B] dark:text-[#94A3B8] text-xs">
              <Receipt className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
              <p className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">No matching quotations or invoices found</p>
              <p className="text-[11px] mt-1">Click "New Quotation" or "New Invoice" above to create one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 -mb-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] dark:bg-[#0B1120] border-y border-[#E2E8F0] dark:border-[#1E293B] text-[#475569] dark:text-[#94A3B8] font-semibold">
                  <tr>
                    <th className="p-3.5 pl-4">Doc # & Type</th>
                    <th className="p-3.5">Client</th>
                    <th className="p-3.5">Date / Due</th>
                    <th className="p-3.5">Total Amount</th>
                    <th className="p-3.5">Amount Paid</th>
                    <th className="p-3.5">Balance Due</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                  {filteredInvoices.map(inv => {
                    const isQuote = inv.documentType === 'Quotation';
                    const paidPct = inv.total > 0 ? Math.round((inv.amountPaid / inv.total) * 100) : 0;

                    return (
                      <tr key={inv.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#111827]/60 transition-colors">
                        <td className="p-3.5 pl-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                              #{inv.invoiceNumber}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              isQuote 
                                ? 'bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E3A8A]/40 dark:text-[#60A5FA]' 
                                : 'bg-[#F1F5F9] text-[#475569] dark:bg-[#1E293B] dark:text-[#CBD5E1]'
                            }`}>
                              {isQuote ? 'Quote' : 'Invoice'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 font-semibold text-[#008000]">{inv.clientName}</td>
                        <td className="p-3.5 text-[#64748B] dark:text-[#94A3B8]">
                          <div>{inv.invoiceDate}</div>
                          <div className="text-[10px] text-[#94A3B8]">Due: {inv.dueDate}</div>
                        </td>
                        <td className="p-3.5 font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                          ₹{inv.total.toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-[#008000] dark:text-[#4ADE80]">
                            ₹{inv.amountPaid.toLocaleString()}
                          </div>
                          {inv.total > 0 && (
                            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                              {paidPct}% cleared
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-bold text-[#DC2626]">
                          {inv.balanceDue > 0 ? `₹${inv.balanceDue.toLocaleString()}` : <span className="text-[#008000]">Cleared</span>}
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status={inv.paymentStatus} />
                        </td>
                        <td className="p-3.5 text-right pr-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="secondary"
                              size="xs"
                              onClick={() => setSelectedInvoice(inv)}
                            >
                              Preview
                            </Button>
                            {inv.balanceDue > 0 && (
                              <>
                                <Button
                                  variant="primary"
                                  size="xs"
                                  onClick={() => openRecordPaymentForInvoice(inv.id)}
                                  leftIcon={<CreditCard className="w-3 h-3" />}
                                >
                                  Pay
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => markInvoicePaid(inv.id)}
                                  title="Mark 100% Paid"
                                >
                                  Full Paid
                                </Button>
                              </>
                            )}
                            <button
                              onClick={() => setDeletingInvoiceId(inv.id)}
                              className="p-1 rounded text-[#94A3B8] hover:text-[#DC2626] transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 3: Payments */}
      {activeTab === 'payments' && (
        <Card className="overflow-hidden space-y-4 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">Incoming Payment Receipts & Collections</h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Verified client payments credited to quotes and tax invoices.
              </p>
            </div>
            <Button
              variant="primary"
              size="xs"
              onClick={() => {
                setPaymentInvoiceId(undefined);
                setIsAddPaymentOpen(true);
              }}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Record Payment
            </Button>
          </div>

          <div className="w-full sm:w-72">
            <SearchInput
              value={paymentSearch}
              onChange={e => setPaymentSearch(e.target.value)}
              onClear={() => setPaymentSearch('')}
              placeholder="Search receipts or client..."
            />
          </div>

          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center text-[#64748B] dark:text-[#94A3B8] text-xs">
              <CreditCard className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
              <p className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">No payment receipts found</p>
              <p className="text-[11px] mt-1">Click "Record Payment" to credit client receipts.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 -mb-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] dark:bg-[#0B1120] border-y border-[#E2E8F0] dark:border-[#1E293B] text-[#475569] dark:text-[#94A3B8] font-semibold">
                  <tr>
                    <th className="p-3.5 pl-4">Client</th>
                    <th className="p-3.5">Invoice / Quote Ref</th>
                    <th className="p-3.5">Amount Paid</th>
                    <th className="p-3.5">Payment Date</th>
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5">Transaction ID</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right pr-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                  {filteredPayments.map(p => (
                    <tr key={p.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#111827]/60 transition-colors">
                      <td className="p-3.5 pl-4 font-bold text-[#0F172A] dark:text-[#F8FAFC]">{p.clientName}</td>
                      <td className="p-3.5 font-mono text-[#64748B] dark:text-[#94A3B8]">#{p.invoiceNumber}</td>
                      <td className="p-3.5 font-black text-sm text-[#008000] dark:text-[#4ADE80]">
                        ₹{p.amount.toLocaleString()}
                      </td>
                      <td className="p-3.5">{p.paymentDate}</td>
                      <td className="p-3.5">
                        <Badge variant="brand" size="sm">{p.paymentMethod}</Badge>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">{p.referenceNumber || '—'}</td>
                      <td className="p-3.5">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="p-3.5 text-right pr-4">
                        <button
                          onClick={() => setDeletingPaymentId(p.id)}
                          className="p-1 rounded text-[#94A3B8] hover:text-[#DC2626] transition-colors"
                          title="Void / Delete payment receipt"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 4: Expenses */}
      {activeTab === 'expenses' && (
        <Card className="overflow-hidden space-y-4 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">Agency Expenditure Log</h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Software tools, creator salaries, freelance support, and operational costs.
              </p>
            </div>
            <Button
              variant="primary"
              size="xs"
              onClick={() => setIsAddExpenseOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Log Expense
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <SearchInput
                value={expenseSearch}
                onChange={e => setExpenseSearch(e.target.value)}
                onClear={() => setExpenseSearch('')}
                placeholder="Search title, spender, or tag..."
              />
            </div>
            <div>
              <Select
                value={expenseCategoryFilter}
                onChange={e => setExpenseCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Equipment">Equipment & Cameras</option>
                <option value="Travel">Travel & Petrol</option>
                <option value="Freelancer">Freelance & Creators</option>
                <option value="Salary">Salary & Team</option>
                <option value="Software">Software</option>
                <option value="Advertising">Advertising</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            <div>
              <Select
                value={expenseClientFilter}
                onChange={e => setExpenseClientFilter(e.target.value)}
              >
                <option value="all">All Clients</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.businessName}</option>
                ))}
              </Select>
            </div>
            <div>
              <Select
                value={expenseMemberFilter}
                onChange={e => setExpenseMemberFilter(e.target.value)}
              >
                <option value="all">All Team Members</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </Select>
            </div>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="p-12 text-center text-[#64748B] dark:text-[#94A3B8] text-xs">
              <DollarSign className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
              <p className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">No expenditure vouchers match the filter</p>
              <p className="text-[11px] mt-1">Try clearing your filters or click "Log Expense" above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 -mb-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] dark:bg-[#0B1120] border-y border-[#E2E8F0] dark:border-[#1E293B] text-[#475569] dark:text-[#94A3B8] font-semibold">
                  <tr>
                    <th className="p-3.5 pl-4">Expense Title</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Client Tag</th>
                    <th className="p-3.5">Tagged Creator</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Paid By</th>
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5">Receipt Ref</th>
                    <th className="p-3.5 text-right pr-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                  {filteredExpenses.map(e => (
                    <tr key={e.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#111827]/60 transition-colors">
                      <td className="p-3.5 pl-4 font-bold text-[#0F172A] dark:text-[#F8FAFC]">{e.title}</td>
                      <td className="p-3.5">
                        <Badge variant="neutral" size="sm">{e.category}</Badge>
                      </td>
                      <td className="p-3.5 font-bold text-[#DC2626] dark:text-[#F87171]">
                        ₹{e.amount.toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        {e.clientName ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 text-[#2563EB] dark:text-[#60A5FA] border border-[#BFDBFE] dark:border-[#1E40AF]">
                            {e.clientName}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#94A3B8] italic">— General</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {e.teamMemberName ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F0FDF4] dark:bg-[#14532D]/40 text-[#008000] dark:text-[#4ADE80] border border-[#BBF7D0] dark:border-[#166534]">
                            {e.teamMemberName}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#94A3B8]">—</span>
                        )}
                      </td>
                      <td className="p-3.5 text-[#64748B] dark:text-[#94A3B8]">{e.date}</td>
                      <td className="p-3.5 font-medium">{e.paidBy}</td>
                      <td className="p-3.5">{e.paymentMethod}</td>
                      <td className="p-3.5 text-[11px] text-[#008000]">{e.receiptName || '—'}</td>
                      <td className="p-3.5 text-right pr-4">
                        <button
                          onClick={() => deleteExpense(e.id)}
                          className="text-[#94A3B8] hover:text-[#DC2626] p-1 transition-colors"
                          title="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Delete Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={!!deletingInvoiceId}
        onClose={() => setDeletingInvoiceId(null)}
        onConfirm={() => {
          if (deletingInvoiceId) {
            deleteInvoice(deletingInvoiceId);
            setDeletingInvoiceId(null);
          }
        }}
        title="Delete Invoice / Quotation?"
        description="Are you sure you want to delete this invoice or quotation document? Any future payment reconciliation will be affected."
        confirmLabel="Delete Document"
        confirmVariant="danger"
      />

      <ConfirmDialog
        isOpen={!!deletingPaymentId}
        onClose={() => setDeletingPaymentId(null)}
        onConfirm={() => {
          if (deletingPaymentId) {
            deletePayment(deletingPaymentId);
            setDeletingPaymentId(null);
          }
        }}
        title="Void / Delete Payment Receipt?"
        description="Are you sure you want to void this payment receipt? The paid amount will be reversed and the invoice balance restored."
        confirmLabel="Void Receipt"
        confirmVariant="danger"
      />

      {/* Modals */}
      <InvoicePreviewModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />

      <InvoiceFormModal
        isOpen={isAddInvoiceOpen}
        onClose={() => setIsAddInvoiceOpen(false)}
        defaultDocType={newDocType}
      />

      <PaymentFormModal
        isOpen={isAddPaymentOpen}
        onClose={() => {
          setIsAddPaymentOpen(false);
          setPaymentInvoiceId(undefined);
        }}
        defaultInvoiceId={paymentInvoiceId}
      />

      <ExpenseFormModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
      />
    </div>
  );
};
