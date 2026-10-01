import React, { useState } from 'react';
import { 
  Package as PackageIcon, 
  Plus, 
  Check, 
  Film, 
  Layers, 
  Calendar, 
  Sparkles,
  RefreshCw,
  Edit2,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { Package } from '../../types';

export const PackagesPage: React.FC = () => {
  const { packages, addPackage, updatePackage, deletePackage, clients, monthlyQuotas, generateNewMonthQuota } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deletingPackageId, setDeletingPackageId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState(35000);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [videos, setVideos] = useState(6);
  const [reels, setReels] = useState(6);
  const [posters, setPosters] = useState(10);
  const [photos, setPhotos] = useState(20);
  const [stories, setStories] = useState(15);
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Social Media Management',
    'Graphic Design',
    'Video Editing'
  ]);

  const allAvailableServices = [
    'Social Media Management',
    'Graphic Design',
    'Video Editing',
    'Meta Ads',
    'Google Ads',
    'Influencer Marketing',
    'Photography',
    'SEO'
  ];

  const toggleService = (svc: string) => {
    if (selectedServices.includes(svc)) {
      setSelectedServices(selectedServices.filter(s => s !== svc));
    } else {
      setSelectedServices([...selectedServices, svc]);
    }
  };

  const openAddModal = () => {
    setName('');
    setDescription('');
    setMonthlyPrice(20000);
    setStatus('active');
    setVideos(0);
    setReels(15);
    setPosters(15);
    setPhotos(0);
    setStories(0);
    setSelectedServices(['Social Media Management', 'Graphic Design', 'Video Editing']);
    setIsAddOpen(true);
  };

  const openEditModal = (pkg: Package) => {
    setEditingPackage(pkg);
    setName(pkg.name);
    setDescription(pkg.description);
    setMonthlyPrice(pkg.monthlyPrice);
    setStatus(pkg.status);
    setVideos(pkg.quota.videos);
    setReels(pkg.quota.reels);
    setPosters(pkg.quota.posters);
    setPhotos(pkg.quota.photos);
    setStories(pkg.quota.stories);
    setSelectedServices(pkg.services);
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addPackage({
      name,
      description,
      monthlyPrice: Number(monthlyPrice),
      billingCycle: 'Monthly',
      status,
      quota: {
        videos: Number(videos),
        reels: Number(reels),
        posters: Number(posters),
        photos: Number(photos),
        stories: Number(stories)
      },
      services: selectedServices
    });

    setIsAddOpen(false);
  };

  const handleUpdatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage || !name.trim()) return;

    updatePackage(editingPackage.id, {
      name,
      description,
      monthlyPrice: Number(monthlyPrice),
      status,
      quota: {
        videos: Number(videos),
        reels: Number(reels),
        posters: Number(posters),
        photos: Number(photos),
        stories: Number(stories)
      },
      services: selectedServices
    });

    setEditingPackage(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
              Service Packages & Content Quotas
            </h1>
            <Badge variant="brand">Retainer Engine</Badge>
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Predefined and custom monthly production quotas automatically provisioned upon client subscription.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => generateNewMonthQuota('2026-10', 'October 2026')}
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-[#008000]" />}
          >
            Generate Next Month (Oct 2026)
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={openAddModal}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Tier
          </Button>
        </div>
      </div>

      {/* Package Tiers Grid or Empty State */}
      {packages.length === 0 ? (
        <EmptyState
          title="No service packages yet"
          description="Create your agency's service packages and content quotas to start onboarding clients and automating monthly deliverables."
          actionLabel="+ Create Package Tier"
          onAction={openAddModal}
          icon={<PackageIcon className="w-6 h-6" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map(pkg => {
            const subscriberClients = clients.filter(c => c.packageId === pkg.id);

            return (
              <Card key={pkg.id} className="p-6 flex flex-col justify-between space-y-6 relative overflow-hidden group">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">{pkg.name}</h3>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 line-clamp-2">
                        {pkg.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={pkg.status} size="sm" />
                      <button
                        onClick={() => openEditModal(pkg)}
                        className="p-1 rounded text-[#94A3B8] hover:text-[#008000] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
                        title="Edit tier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingPackageId(pkg.id)}
                        className="p-1 rounded text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
                        title="Delete tier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-[#008000] dark:text-[#4ADE80]">
                        ₹{pkg.monthlyPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">/ month</span>
                    </div>
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      {subscriberClients.length} active client subscriptions
                    </span>
                  </div>

                  {/* Quota Deliverables Breakdown */}
                  <div className="p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                      Monthly Deliverables Quota:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#64748B] dark:text-[#94A3B8]">Videos:</span>
                        <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{pkg.quota.videos} / mo</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B] dark:text-[#94A3B8]">Reels (9:16):</span>
                        <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{pkg.quota.reels} / mo</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B] dark:text-[#94A3B8]">Posters:</span>
                        <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{pkg.quota.posters} / mo</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B] dark:text-[#94A3B8]">Photos:</span>
                        <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{pkg.quota.photos} / mo</strong>
                      </div>
                      <div className="flex justify-between col-span-2">
                        <span className="text-[#64748B] dark:text-[#94A3B8]">Stories:</span>
                        <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{pkg.quota.stories} / mo</strong>
                      </div>
                    </div>
                  </div>

                  {/* Included Services */}
                  <div className="space-y-2 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                      Included Services:
                    </span>
                    <div className="space-y-1.5">
                      {pkg.services.map(svc => (
                        <div key={svc} className="flex items-center gap-2 text-[#475569] dark:text-[#CBD5E1]">
                          <Check className="w-3.5 h-3.5 text-[#008000] shrink-0" />
                          <span>{svc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Subscribed Clients Tags */}
                <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E293B]">
                  <p className="text-[11px] text-[#94A3B8] mb-1.5">Assigned to:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {subscriberClients.length === 0 ? (
                      <span className="text-[11px] text-[#94A3B8] italic">No active clients assigned</span>
                    ) : (
                      subscriberClients.map(c => (
                        <span key={c.id} className="text-[11px] px-2 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#1E293B] font-medium">
                          {c.businessName}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Package Tier Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Service Package Tier"
        description="Define standard quota deliverables and monthly subscription fees."
        maxWidth="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreatePackage}>Save Package</Button>
          </>
        }
      >
        <form onSubmit={handleCreatePackage} className="space-y-4">
          <Input
            label="Package Name"
            required
            placeholder="e.g. Enterprise Dominance"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <Textarea
            label="Description"
            placeholder="Who is this package best suited for?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Monthly Subscription Price (₹ INR)"
              type="number"
              required
              value={monthlyPrice}
              onChange={e => setMonthlyPrice(Number(e.target.value))}
            />
            <Select
              label="Status"
              value={status}
              onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>

          {/* Quotas */}
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#008000]">
              Monthly Content Quotas
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <Input
                label="Videos"
                type="number"
                value={videos}
                onChange={e => setVideos(Number(e.target.value))}
                inputSize="sm"
              />
              <Input
                label="Reels (9:16)"
                type="number"
                value={reels}
                onChange={e => setReels(Number(e.target.value))}
                inputSize="sm"
              />
              <Input
                label="Posters"
                type="number"
                value={posters}
                onChange={e => setPosters(Number(e.target.value))}
                inputSize="sm"
              />
              <Input
                label="Photos"
                type="number"
                value={photos}
                onChange={e => setPhotos(Number(e.target.value))}
                inputSize="sm"
              />
              <Input
                label="Stories"
                type="number"
                value={stories}
                onChange={e => setStories(Number(e.target.value))}
                inputSize="sm"
              />
            </div>
          </div>

          {/* Included Services Multi-select */}
          <div>
            <label className="block text-xs font-medium text-[#0F172A] dark:text-[#E2E8F0] mb-2">
              Included Agency Services
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {allAvailableServices.map(svc => {
                const checked = selectedServices.includes(svc);
                return (
                  <label
                    key={svc}
                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer select-none transition-colors ${
                      checked
                        ? 'border-[#008000] bg-[#F0FDF4] dark:bg-[#14532D]/30 text-[#008000] dark:text-[#4ADE80] font-semibold'
                        : 'border-[#CBD5E1] dark:border-[#334155] text-[#475569] dark:text-[#CBD5E1]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleService(svc)}
                      className="hidden"
                    />
                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                      checked ? 'bg-[#008000] border-[#008000] text-white' : 'border-[#CBD5E1]'
                    }`}>
                      {checked && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span>{svc}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Package Tier Modal */}
      {editingPackage && (
        <Modal
          isOpen={true}
          onClose={() => setEditingPackage(null)}
          title={`Edit Service Package — ${editingPackage.name}`}
          description="Update tier deliverables, quotas, and retainer fees."
          maxWidth="lg"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setEditingPackage(null)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleUpdatePackage}>Save Changes</Button>
            </>
          }
        >
          <form onSubmit={handleUpdatePackage} className="space-y-4">
            <Input
              label="Package Name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <Textarea
              label="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Monthly Subscription Price (₹ INR)"
                type="number"
                required
                value={monthlyPrice}
                onChange={e => setMonthlyPrice(Number(e.target.value))}
              />
              <Select
                label="Status"
                value={status}
                onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>

            {/* Quotas */}
            <div className="p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#008000]">
                Monthly Content Quotas
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <Input
                  label="Videos"
                  type="number"
                  value={videos}
                  onChange={e => setVideos(Number(e.target.value))}
                  inputSize="sm"
                />
                <Input
                  label="Reels (9:16)"
                  type="number"
                  value={reels}
                  onChange={e => setReels(Number(e.target.value))}
                  inputSize="sm"
                />
                <Input
                  label="Posters"
                  type="number"
                  value={posters}
                  onChange={e => setPosters(Number(e.target.value))}
                  inputSize="sm"
                />
                <Input
                  label="Photos"
                  type="number"
                  value={photos}
                  onChange={e => setPhotos(Number(e.target.value))}
                  inputSize="sm"
                />
                <Input
                  label="Stories"
                  type="number"
                  value={stories}
                  onChange={e => setStories(Number(e.target.value))}
                  inputSize="sm"
                />
              </div>
            </div>

            {/* Included Services Multi-select */}
            <div>
              <label className="block text-xs font-medium text-[#0F172A] dark:text-[#E2E8F0] mb-2">
                Included Agency Services
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {allAvailableServices.map(svc => {
                  const checked = selectedServices.includes(svc);
                  return (
                    <label
                      key={svc}
                      className={`flex items-center gap-2 p-2 rounded border cursor-pointer select-none transition-colors ${
                        checked
                          ? 'border-[#008000] bg-[#F0FDF4] dark:bg-[#14532D]/30 text-[#008000] dark:text-[#4ADE80] font-semibold'
                          : 'border-[#CBD5E1] dark:border-[#334155] text-[#475569] dark:text-[#CBD5E1]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleService(svc)}
                        className="hidden"
                      />
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                        checked ? 'bg-[#008000] border-[#008000] text-white' : 'border-[#CBD5E1]'
                      }`}>
                        {checked && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span>{svc}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingPackageId}
        onClose={() => setDeletingPackageId(null)}
        onConfirm={() => {
          if (deletingPackageId) {
            deletePackage(deletingPackageId);
            setDeletingPackageId(null);
          }
        }}
        title="Delete Service Package?"
        description="Are you sure you want to delete this package tier? Active client subscriptions attached to this tier will keep their current quotas."
        confirmLabel="Delete Tier"
        confirmVariant="danger"
      />
    </div>
  );
};
