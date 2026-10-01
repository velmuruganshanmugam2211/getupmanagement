import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Users2, 
  Eye, 
  Edit3, 
  Archive, 
  Trash2, 
  Phone, 
  Mail, 
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SearchInput, Select } from '../../components/ui/Input';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/Modal';
import { ClientFormModal } from '../../components/forms/ClientFormModal';
import { Client } from '../../types';

export const ClientsPage: React.FC = () => {
  const { clients, packages, monthlyQuotas, archiveClient, deleteClient } = useApp();
  const navigate = useNavigate();

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [packageFilter, setPackageFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortField, setSortField] = useState<'businessName' | 'monthlyFee' | 'endDate'>('businessName');
  const [sortAsc, setSortAsc] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);

  // Filtering
  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.businessName.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesPackage = packageFilter === 'all' || c.packageId === packageFilter;
    const matchesPayment = paymentFilter === 'all' || c.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPackage && matchesPayment;
  }).sort((a, b) => {
    let cmp = 0;
    if (sortField === 'businessName') cmp = a.businessName.localeCompare(b.businessName);
    if (sortField === 'monthlyFee') cmp = a.monthlyFee - b.monthlyFee;
    if (sortField === 'endDate') cmp = a.endDate.localeCompare(b.endDate);
    return sortAsc ? cmp : -cmp;
  });

  const getClientQuotaProgress = (clientId: string) => {
    const quota = monthlyQuotas.find(q => q.clientId === clientId);
    if (!quota) return { allocated: 0, completed: 0, pct: 0 };
    const allocated = Object.values(quota.items).reduce((s, it) => s + it.allocated, 0);
    const completed = Object.values(quota.items).reduce((s, it) => s + it.completed, 0);
    const pct = allocated > 0 ? Math.round((completed / allocated) * 100) : 0;
    return { allocated, completed, pct };
  };

  const isExpiringSoon = (endDateStr: string) => {
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    const daysLeft = (end - now) / (1000 * 3600 * 24);
    return daysLeft > 0 && daysLeft <= 45;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            Clients Directory
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Internal client accounts, service agreements, monthly deliverables, and billing records.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Client
        </Button>
      </div>

      {/* Filter & Toolbar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <SearchInput
              value={search}
              onChange={e => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search by business, contact, industry..."
            />
          </div>

          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </Select>

          <Select
            value={packageFilter}
            onChange={e => setPackageFilter(e.target.value)}
          >
            <option value="all">All Packages</option>
            {packages.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>

          <Select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </Select>
        </div>

        {/* Active Filter Count and Clear */}
        <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8] pt-1">
          <span>
            Showing <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{filteredClients.length}</strong> of {clients.length} clients
          </span>
          {(search || statusFilter !== 'all' || packageFilter !== 'all' || paymentFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setPackageFilter('all');
                setPaymentFilter('all');
              }}
              className="text-[#008000] hover:underline font-semibold"
            >
              Clear filters
            </button>
          )}
        </div>
      </Card>

      {/* Clients Table */}
      {filteredClients.length === 0 ? (
        <EmptyState
          title="No clients found"
          description="Try clearing your search query or add a new client to get started."
          actionLabel="+ Add New Client"
          onAction={() => setIsAddModalOpen(true)}
          icon={<Users2 className="w-6 h-6" />}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] dark:bg-[#0B1120] border-b border-[#E2E8F0] dark:border-[#1E293B] text-[#475569] dark:text-[#94A3B8] font-semibold">
                <tr>
                  <th className="p-3.5 pl-4">
                    <button
                      onClick={() => {
                        if (sortField === 'businessName') setSortAsc(!sortAsc);
                        else { setSortField('businessName'); setSortAsc(true); }
                      }}
                      className="flex items-center gap-1 hover:text-[#0F172A] dark:hover:text-white"
                    >
                      Client <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">Package</th>
                  <th className="p-3.5">
                    <button
                      onClick={() => {
                        if (sortField === 'monthlyFee') setSortAsc(!sortAsc);
                        else { setSortField('monthlyFee'); setSortAsc(true); }
                      }}
                      className="flex items-center gap-1 hover:text-[#0F172A] dark:hover:text-white"
                    >
                      Monthly Fee <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="p-3.5 w-44">Content Progress</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">
                    <button
                      onClick={() => {
                        if (sortField === 'endDate') setSortAsc(!sortAsc);
                        else { setSortField('endDate'); setSortAsc(true); }
                      }}
                      className="flex items-center gap-1 hover:text-[#0F172A] dark:hover:text-white"
                    >
                      Contract End <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                {filteredClients.map(client => {
                  const quota = getClientQuotaProgress(client.id);
                  const expiring = isExpiringSoon(client.endDate);

                  return (
                    <tr 
                      key={client.id}
                      className="hover:bg-[#F8FAFC] dark:hover:bg-[#111827]/60 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/clients/${client.id}`)}
                    >
                      <td className="p-3.5 pl-4">
                        <div className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#008000] dark:group-hover:text-[#4ADE80] transition-colors">
                          {client.businessName}
                        </div>
                        <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          {client.industry} • Mgr: {client.accountManagerName}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-medium text-[#0F172A] dark:text-[#CBD5E1]">
                          {client.contactPerson}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                          <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" /> {client.phone}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <Badge variant="neutral" size="sm">{client.packageName}</Badge>
                      </td>

                      <td className="p-3.5 font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                        ₹{client.monthlyFee.toLocaleString()}
                        <span className="text-[10px] font-normal text-[#94A3B8] block">/month</span>
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                            <span>{quota.completed}/{quota.allocated} units</span>
                            <span className="font-bold text-[#008000]">{quota.pct}%</span>
                          </div>
                          <ProgressBar value={quota.completed} max={quota.allocated} size="sm" />
                        </div>
                      </td>

                      <td className="p-3.5">
                        <StatusBadge status={client.paymentStatus} />
                      </td>

                      <td className="p-3.5">
                        <div className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1]">
                          {client.endDate}
                        </div>
                        {expiring && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#D97706] mt-0.5">
                            <AlertTriangle className="w-3 h-3" /> Expiring soon
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <StatusBadge status={client.status} />
                      </td>

                      <td className="p-3.5 text-right pr-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/clients/${client.id}`)}
                            className="p-1.5 rounded text-[#64748B] hover:text-[#008000] hover:bg-[#F0FDF4] dark:hover:bg-[#14532D]/40 transition-colors"
                            title="View Overview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingClient(client)}
                            className="p-1.5 rounded text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] dark:hover:bg-[#1E3A8A]/30 transition-colors"
                            title="Edit Client"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => archiveClient(client.id)}
                            className="p-1.5 rounded text-[#64748B] hover:text-[#D97706] hover:bg-[#FFFBEB] dark:hover:bg-[#78350F]/30 transition-colors"
                            title="Archive Client"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingClientId(client.id)}
                            className="p-1.5 rounded text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#7F1D1D]/30 transition-colors"
                            title="Delete Client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modals */}
      <ClientFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {editingClient && (
        <ClientFormModal
          isOpen={true}
          onClose={() => setEditingClient(null)}
          initialData={editingClient}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingClientId}
        onClose={() => setDeletingClientId(null)}
        title="Delete Client Record?"
        description="Are you sure you want to permanently delete this client? All associated monthly quotas will be removed. This action cannot be undone."
        confirmLabel="Delete Client"
        confirmVariant="danger"
        onConfirm={() => {
          if (deletingClientId) {
            deleteClient(deletingClientId);
            setDeletingClientId(null);
          }
        }}
      />
    </div>
  );
};
