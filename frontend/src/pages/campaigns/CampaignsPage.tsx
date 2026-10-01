import React, { useState } from 'react';
import { 
  Megaphone, 
  Plus, 
  TrendingUp, 
  Users, 
  MousePointer, 
  Target, 
  DollarSign,
  Edit3,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card, StatCard } from '../../components/ui/Card';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { Campaign, CampaignStatus } from '../../types';

export const CampaignsPage: React.FC = () => {
  const { campaigns, clients, addCampaign, updateCampaign } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [platform, setPlatform] = useState<Campaign['platform']>('Meta Ads');
  const [objective, setObjective] = useState<Campaign['objective']>('Lead Generation');
  const [budget, setBudget] = useState(30000);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2026-10-31');

  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalLeads = campaigns.reduce((s, c) => s + c.metrics.leads, 0);
  const totalReach = campaigns.reduce((s, c) => s + c.metrics.reach, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const selClient = clients.find(c => c.id === clientId);

    addCampaign({
      name,
      clientId,
      clientName: selClient?.businessName || 'General',
      platform,
      objective,
      budget: Number(budget),
      spent: 0,
      startDate,
      endDate,
      status: 'Running',
      metrics: {
        reach: 1200,
        impressions: 2400,
        clicks: 85,
        leads: 4,
        engagement: 320,
        conversions: 1
      }
    });

    setIsAddOpen(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            Performance Campaigns
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Meta Ads, Google Ads, and lead generation tracking for active agency client retainers.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Launch Campaign
        </Button>
      </div>

      {/* Campaign Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Ad Budget"
          value={`₹${(totalBudget / 1000).toFixed(0)}k`}
          caption="Allocated client spend"
          icon={<DollarSign className="w-5 h-5 text-[#2563EB]" />}
        />
        <StatCard
          title="Total Ad Spend"
          value={`₹${(totalSpent / 1000).toFixed(0)}k`}
          caption={`${Math.round((totalSpent / (totalBudget || 1)) * 100)}% budget utilized`}
          icon={<TrendingUp className="w-5 h-5 text-[#D97706]" />}
        />
        <StatCard
          title="Leads Generated"
          value={totalLeads}
          caption="Verified qualified prospects"
          change="Strong ROI"
          changeType="positive"
          icon={<Target className="w-5 h-5 text-[#008000]" />}
        />
        <StatCard
          title="Total Reach"
          value={`${(totalReach / 1000).toFixed(0)}k`}
          caption="Brand impressions delivered"
          icon={<Users className="w-5 h-5 text-[#9333EA]" />}
        />
      </div>

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns found"
          description="Create your first marketing or ad campaign for an agency client."
          actionLabel="+ New Campaign"
          onAction={() => setIsAddOpen(true)}
          icon={<Megaphone className="w-6 h-6" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map(camp => {
          const budgetPct = camp.budget > 0 ? Math.min(100, Math.round((camp.spent / camp.budget) * 100)) : 0;

          return (
            <Card key={camp.id} className="p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">{camp.name}</h3>
                    <p className="text-xs text-[#008000] font-semibold">{camp.clientName}</p>
                  </div>
                  <StatusBadge status={camp.status} />
                </div>

                <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
                  <Badge variant="neutral" size="sm">{camp.platform}</Badge>
                  <span>•</span>
                  <span>{camp.objective}</span>
                </div>

                {/* Budget Spend Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">Spent: ₹{camp.spent.toLocaleString()}</span>
                    <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">Budget: ₹{camp.budget.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full overflow-hidden">
                    <div className="h-full bg-[#008000] rounded-full" style={{ width: `${budgetPct}%` }} />
                  </div>
                </div>

                {/* Performance Metrics Box */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="p-2 bg-[#F8FAFC] dark:bg-[#0B1120] rounded border border-[#E2E8F0] dark:border-[#1E293B]">
                    <span className="text-[10px] text-[#94A3B8] block">Reach</span>
                    <span className="font-bold">{camp.metrics.reach.toLocaleString()}</span>
                  </div>
                  <div className="p-2 bg-[#F8FAFC] dark:bg-[#0B1120] rounded border border-[#E2E8F0] dark:border-[#1E293B]">
                    <span className="text-[10px] text-[#94A3B8] block">Clicks</span>
                    <span className="font-bold">{camp.metrics.clicks.toLocaleString()}</span>
                  </div>
                  <div className="p-2 bg-[#F8FAFC] dark:bg-[#0B1120] rounded border border-[#E2E8F0] dark:border-[#1E293B]">
                    <span className="text-[10px] text-[#94A3B8] block">Leads</span>
                    <span className="font-black text-[#008000]">{camp.metrics.leads}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span>{camp.startDate} to {camp.endDate}</span>
                <select
                  value={camp.status}
                  onChange={e => updateCampaign(camp.id, { status: e.target.value as CampaignStatus })}
                  className="text-xs font-semibold py-1 px-2 rounded border bg-white dark:bg-[#111827] border-[#CBD5E1] dark:border-[#334155]"
                >
                  <option value="Running">Running</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                  <option value="Planned">Planned</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </Card>
          );
        })}
      </div>
      )}

      {/* Launch Campaign Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Launch Client Ad Campaign"
        description="Set platform targets, budget envelope, and campaign performance goals."
        maxWidth="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreate}>Launch</Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Campaign Name"
            required
            placeholder="e.g. Diwali Flash Sale Lead Gen"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <Select
            label="Client"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
          >
            {clients.length === 0 ? (
              <option value="">No clients available (create client first)</option>
            ) : (
              clients.map(c => (
                <option key={c.id} value={c.id}>{c.businessName}</option>
              ))
            )}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Ad Platform"
              value={platform}
              onChange={e => setPlatform(e.target.value as Campaign['platform'])}
            >
              <option value="Meta Ads">Meta Ads (FB/Insta)</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Instagram Ads">Instagram Ads</option>
              <option value="YouTube">YouTube</option>
              <option value="Influencer">Influencer Marketing</option>
            </Select>

            <Select
              label="Primary Objective"
              value={objective}
              onChange={e => setObjective(e.target.value as Campaign['objective'])}
            >
              <option value="Lead Generation">Lead Generation</option>
              <option value="Brand Awareness">Brand Awareness</option>
              <option value="Conversions">Conversions</option>
              <option value="Store Visits">Store Visits</option>
              <option value="Engagement">Engagement</option>
            </Select>
          </div>

          <Input
            label="Allocated Budget (₹ INR)"
            type="number"
            value={budget}
            onChange={e => setBudget(Number(e.target.value))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
