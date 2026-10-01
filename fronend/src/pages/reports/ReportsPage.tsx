import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  TrendingUp, 
  Users, 
  Film, 
  CheckCircle, 
  DollarSign 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card, StatCard } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const { 
    clients, 
    monthlyQuotas, 
    tasks, 
    invoices, 
    payments, 
    expenses, 
    isDark,
    showToast 
  } = useApp();

  const [activeReport, setActiveReport] = useState('business');

  // Overall Financial Calculations
  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = Math.max(0, totalCollected - totalExpenses);

  // Content Delivered vs Remaining Aggregation
  const contentPerformance = monthlyQuotas.map(q => ({
    name: q.clientName.split(' ')[0],
    allocated: Object.values(q.items).reduce((s, it) => s + it.allocated, 0),
    completed: Object.values(q.items).reduce((s, it) => s + it.completed, 0),
  }));

  // Expense by category
  const expenseByCategoryMap: Record<string, number> = {};
  expenses.forEach(e => {
    expenseByCategoryMap[e.category] = (expenseByCategoryMap[e.category] || 0) + e.amount;
  });
  const expenseData = Object.entries(expenseByCategoryMap).map(([name, value]) => ({ name, value }));

  const COLORS = ['#008000', '#2563EB', '#D97706', '#9333EA', '#DC2626', '#14B8A6'];

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Client,Package,Monthly Fee,Payment Status\n"
      + clients.map(c => `"${c.businessName}","${c.packageName}",${c.monthlyFee},"${c.paymentStatus}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GETUP_OS_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report Exported', 'CSV report successfully downloaded.');
  };

  const exportPDF = () => {
    window.print();
  };

  const tabs = [
    { id: 'business', label: 'Agency Business & P&L Report' },
    { id: 'clients', label: 'Client Content & Quotas Report' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            Internal Executive Reports
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Operational summaries, monthly content fulfillment ratios, expenditure distributions, and cashflow health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={exportCSV}
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={exportPDF}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print / PDF
          </Button>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeReport} onChange={setActiveReport} />

      {activeReport === 'business' ? (
        <div className="space-y-6">
          {/* Top KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Collected Revenue"
              value={`₹${(totalCollected / 1000).toFixed(0)}k`}
              caption="Cash in bank"
              icon={<DollarSign className="w-5 h-5 text-[#008000]" />}
            />
            <StatCard
              title="Operational Expenses"
              value={`₹${(totalExpenses / 1000).toFixed(0)}k`}
              caption="Fixed & variable"
              icon={<TrendingUp className="w-5 h-5 text-[#DC2626]" />}
            />
            <StatCard
              title="Net Retained Profit"
              value={`₹${(netProfit / 1000).toFixed(0)}k`}
              caption={totalCollected > 0 ? `${Math.round((netProfit / totalCollected) * 100)}% net margin` : "0% net margin"}
              change="Stable"
              changeType="positive"
              icon={<CheckCircle className="w-5 h-5 text-[#2563EB]" />}
            />
            <StatCard
              title="Active Retainers"
              value={clients.length}
              caption={clients.length > 0 ? `${clients.length} active client contracts` : "No active clients yet"}
              icon={<Users className="w-5 h-5 text-[#9333EA]" />}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Content Deliverables by Client */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                  Monthly Content Deliverables by Client
                </h3>
                <span className="text-xs text-[#64748B]">Units Produced vs Allocated</span>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                {contentPerformance.length === 0 ? (
                  <div className="text-center p-6 text-[#94A3B8]">
                    <Film className="w-8 h-8 mb-2 mx-auto opacity-40 text-[#64748B]" />
                    <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">No deliverables recorded yet</p>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">Quota fulfillment bars will populate when client deliverables are scheduled.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={contentPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#F1F5F9'} />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#111827' : '#FFFFFF',
                          borderColor: isDark ? '#1E293B' : '#E2E8F0',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="allocated" name="Allocated" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed" name="Completed" fill="#008000" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            {/* Chart 2: Expense Breakdown Pie */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                  Expense Category Distribution
                </h3>
                <span className="text-xs font-bold text-[#DC2626]">₹{totalExpenses.toLocaleString()} Total</span>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                {expenseData.length === 0 ? (
                  <div className="text-center p-6 text-[#94A3B8]">
                    <TrendingUp className="w-8 h-8 mb-2 mx-auto opacity-40 text-[#64748B]" />
                    <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">No operational expenses logged</p>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">Expenses logged in the Finance module will appear in this category breakdown.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }: any) => `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                        labelLine={false}
                        fontSize={11}
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#111827' : '#FFFFFF',
                          borderColor: isDark ? '#1E293B' : '#E2E8F0',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* Client Quotas Detailed Audit */
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Client Quota Performance Breakdown
            </h3>
          </div>
          {monthlyQuotas.length === 0 ? (
            <div className="p-12 text-center text-[#64748B] dark:text-[#94A3B8]">
              <Film className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">No active client quotas found</p>
              <p className="text-[11px] mt-1">Monthly content quotas will be tracked here once clients are assigned to packages.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] dark:bg-[#0B1120] border-b border-[#E2E8F0] dark:border-[#1E293B] text-[#475569] dark:text-[#94A3B8] font-semibold">
                  <tr>
                    <th className="p-3.5 pl-4">Client Name</th>
                    <th className="p-3.5">Videos (Comp/Alloc)</th>
                    <th className="p-3.5">Reels (Comp/Alloc)</th>
                    <th className="p-3.5">Posters (Comp/Alloc)</th>
                    <th className="p-3.5">Photos (Comp/Alloc)</th>
                    <th className="p-3.5">Stories (Comp/Alloc)</th>
                    <th className="p-3.5">Quota Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                  {monthlyQuotas.map(q => (
                    <tr key={q.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#111827]/60">
                      <td className="p-3.5 pl-4 font-bold text-[#0F172A] dark:text-[#F8FAFC]">{q.clientName}</td>
                      <td className="p-3.5">{q.items.videos.completed} / {q.items.videos.allocated}</td>
                      <td className="p-3.5">{q.items.reels.completed} / {q.items.reels.allocated}</td>
                      <td className="p-3.5">{q.items.posters.completed} / {q.items.posters.allocated}</td>
                      <td className="p-3.5">{q.items.photos.completed} / {q.items.photos.allocated}</td>
                      <td className="p-3.5">{q.items.stories.completed} / {q.items.stories.allocated}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          q.status === 'on_track' ? 'bg-[#DCFCE7] text-[#008000]' : q.status === 'at_risk' ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-[#FEE2E2] text-[#DC2626]'
                        }`}>
                          {q.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
