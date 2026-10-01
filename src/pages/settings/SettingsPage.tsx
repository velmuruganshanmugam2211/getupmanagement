import React, { useState } from 'react';
import { 
  Building, 
  ShieldCheck, 
  Palette, 
  Receipt, 
  Bell, 
  Check, 
  Moon, 
  Sun, 
  Save,
  Plus,
  Trash2,
  Sparkles,
  Shield,
  CheckSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { AppModule } from '../../types';

const BASE_ROLES = ['Super Admin', 'Admin', 'Digital Marketer', 'Designer', 'Video Editor'];

const MODULE_DEFINITIONS: { id: AppModule; label: string; description: string }[] = [
  { id: 'dashboard', label: 'Dashboard & Metrics', description: 'Overview statistics, active counters, and performance charts' },
  { id: 'clients', label: 'Clients Management', description: 'Client CRM profiles, social media handles, and billing metadata' },
  { id: 'packages', label: 'Packages & Quotas', description: 'Service tiers, monthly delivery quotas, and add-on pricing' },
  { id: 'content', label: 'Content Pipeline', description: 'Video & graphic asset production stages and review flow' },
  { id: 'calendar', label: 'Content Calendar', description: 'Monthly posting schedule and multi-platform planning grid' },
  { id: 'tasks', label: 'Tasks & Kanban', description: 'Operational task assignments, deadlines, and kanban boards' },
  { id: 'campaigns', label: 'Performance Campaigns', description: 'Paid ad campaigns on Meta & Google with ROI metrics' },
  { id: 'finance', label: 'Finance & Invoices', description: 'Client quotations, invoices, payments, and agency expenses' },
  { id: 'media', label: 'Media Library', description: 'Storage and asset organization for client footage and graphics' },
  { id: 'team', label: 'Team & Workload', description: 'Employee accounts, role assignments, passwords, and capacity' },
  { id: 'reports', label: 'Executive Reports', description: 'Monthly client performance digests and revenue analytics' },
  { id: 'settings', label: 'System Settings', description: 'Agency profile, brand themes, and RBAC matrix permissions' },
];

export const SettingsPage: React.FC = () => {
  const { 
    isDark, 
    toggleDarkMode, 
    showToast,
    customRoles,
    rolePermissions,
    updateRolePermission,
    createCustomRole,
    deleteCustomRole
  } = useApp();
  const [activeTab, setActiveTab] = useState('company');

  // Custom Role Modal State
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleModules, setNewRoleModules] = useState<AppModule[]>([
    'dashboard', 'content', 'tasks', 'media'
  ]);
  const [roleError, setRoleError] = useState('');

  // Company Profile form state
  const [companyName, setCompanyName] = useState('Getup Digital Solution');
  const [tagline, setTagline] = useState('Digital Marketing & Creative Production Agency');
  const [email, setEmail] = useState('contact@getupdigital.com');
  const [phone, setPhone] = useState('+91 98401 23456');
  const [gstNumber, setGstNumber] = useState('33AAACG9988Z1ZP');
  const [address, setAddress] = useState('42 Anna Salai, Guindy, Chennai, Tamil Nadu 600032');

  const tabs = [
    { id: 'company', label: 'Company Profile' },
    { id: 'roles', label: 'Roles & Permissions' },
    { id: 'appearance', label: 'Appearance & Theme' },
    { id: 'invoice', label: 'Billing & Invoice Defaults' }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Settings Saved', 'Agency configuration has been updated successfully.');
  };

  const allRoles = [...BASE_ROLES, ...customRoles];

  const handleTogglePermission = (role: string, module: AppModule) => {
    // Super Admin protection for critical settings
    if (role === 'Super Admin' && (module === 'settings' || module === 'dashboard')) {
      showToast('Protected Module', 'Super Admin must retain access to Dashboard and Settings.', 'warning');
      return;
    }
    const currentList = rolePermissions[role] || [];
    const isAllowed = currentList.includes(module);
    updateRolePermission(role, module, !isAllowed);
    showToast('Permission Updated', `${isAllowed ? 'Revoked' : 'Granted'} "${module}" access for ${role}.`);
  };

  const toggleNewRoleModule = (modId: AppModule) => {
    setNewRoleModules(prev => 
      prev.includes(modId) ? prev.filter(m => m !== modId) : [...prev, modId]
    );
  };

  const handleSelectAllModules = () => {
    setNewRoleModules(MODULE_DEFINITIONS.map(m => m.id));
  };

  const handleDeselectAllModules = () => {
    setNewRoleModules(['dashboard']);
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newRoleName.trim();
    if (!trimmed) {
      setRoleError('Role name is required');
      return;
    }
    if (BASE_ROLES.includes(trimmed) || customRoles.includes(trimmed)) {
      setRoleError('A role with this name already exists');
      return;
    }
    if (newRoleModules.length === 0) {
      setRoleError('Please select at least one module permission for this role');
      return;
    }

    createCustomRole(trimmed, newRoleModules);
    showToast('Role Created', `Custom role "${trimmed}" created with ${newRoleModules.length} permissions.`);
    setIsAddRoleOpen(false);
    setNewRoleName('');
    setNewRoleModules(['dashboard', 'content', 'tasks', 'media']);
    setRoleError('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
          Agency System Settings
        </h1>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
          Configure internal organization profiles, role permissions, billing defaults, and UI theme.
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Company Profile */}
      {activeTab === 'company' && (
        <Card className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
              <div className="w-10 h-10 rounded-lg bg-[#008000] text-white flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">Organization Profile</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Appears on tax invoices and client PDF deliverables</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Agency Legal Name"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
              />
              <Input
                label="Company Tagline"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
              />
              <Input
                label="Primary Business Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Input
                label="Primary Phone Number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
              <Input
                label="GSTIN Number"
                value={gstNumber}
                onChange={e => setGstNumber(e.target.value)}
              />
              <Input
                label="Default Currency"
                value="INR (₹) — Indian Rupee"
                disabled
              />
              <div className="sm:col-span-2">
                <Textarea
                  label="Registered Head Office Address"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] flex justify-end">
              <Button type="submit" variant="primary" size="sm" leftIcon={<Save className="w-3.5 h-3.5" />}>
                Save Profile
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 2: Roles & Permissions Matrix */}
      {activeTab === 'roles' && (
        <Card className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Role-Based Access Control (RBAC Matrix)
                </h3>
                <Badge variant="brand">Interactive Rules</Badge>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Click any cell to grant or revoke real-time permissions for each module. Enforced on sidebar and page access.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddRoleOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Custom Role
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] dark:bg-[#0B1120] border-b text-[#475569] dark:text-[#94A3B8] font-bold">
                <tr>
                  <th className="p-3.5 pl-4">Module</th>
                  {allRoles.map(role => {
                    const isCustom = customRoles.includes(role);
                    return (
                      <th key={role} className="p-3.5 text-center whitespace-nowrap min-w-[110px]">
                        <div className="flex items-center justify-center gap-1.5">
                          <span>{role}</span>
                          {isCustom && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete custom role "${role}"? Users with this role should be reassigned.`)) {
                                  deleteCustomRole(role);
                                  showToast('Role Removed', `Custom role "${role}" was deleted.`);
                                }
                              }}
                              className="text-[#94A3B8] hover:text-[#DC2626] transition-colors p-0.5"
                              title={`Delete ${role}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        {isCustom && (
                          <span className="block text-[9px] font-normal text-[#008000] dark:text-[#4ADE80]">Custom Role</span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                {MODULE_DEFINITIONS.map(mod => (
                  <tr key={mod.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#111827]/70 transition-colors">
                    <td className="p-3.5 pl-4">
                      <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">{mod.label}</p>
                      <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{mod.description}</p>
                    </td>
                    {allRoles.map(role => {
                      const permissions = rolePermissions[role] || [];
                      const isAllowed = permissions.includes(mod.id);
                      return (
                        <td key={role} className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(role, mod.id)}
                            className={`w-7 h-7 mx-auto rounded-md flex items-center justify-center transition-all ${
                              isAllowed 
                                ? 'bg-[#F0FDF4] dark:bg-[#14532D]/40 text-[#008000] border border-[#BBF7D0] dark:border-[#166534] hover:bg-[#DCFCE7]' 
                                : 'text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-transparent'
                            }`}
                            title={`Click to ${isAllowed ? 'Revoke' : 'Grant'} ${mod.label} access for ${role}`}
                          >
                            {isAllowed ? (
                              <Check className="w-4 h-4 text-[#008000] stroke-[2.5]" />
                            ) : (
                              <span className="text-sm font-bold text-[#94A3B8]">—</span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8] border-t border-[#E2E8F0] dark:border-[#1E293B]">
            <span>Tip: Click any <strong className="text-[#008000]">✓</strong> or <strong className="text-[#94A3B8]">—</strong> icon in the table above to toggle role access instantly.</span>
            <span className="font-medium text-[#008000]">{allRoles.length} Active Agency Roles</span>
          </div>
        </Card>
      )}

      {/* Add Custom Role Modal */}
      <Modal
        isOpen={isAddRoleOpen}
        onClose={() => {
          setIsAddRoleOpen(false);
          setRoleError('');
        }}
        title="Add Custom Agency Role"
        description="Define a new role and choose exactly which modules it has access to using the checkboxes below."
        maxWidth="lg"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsAddRoleOpen(false);
                setRoleError('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateRole}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Create Role
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateRole} className="space-y-4">
          <Input
            label="Role Title / Designation"
            placeholder="e.g. Lead Video Editor, Content Strategist, Shoot Director"
            value={newRoleName}
            onChange={e => {
              setNewRoleName(e.target.value);
              setRoleError('');
            }}
            required
            error={roleError}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0]">
                Module Permissions & Rules (Checkboxes)
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllModules}
                  className="text-[#008000] hover:underline font-semibold"
                >
                  Select All
                </button>
                <span className="text-[#CBD5E1]">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAllModules}
                  className="text-[#64748B] hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto p-1 border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl">
              {MODULE_DEFINITIONS.map(mod => {
                const isChecked = newRoleModules.includes(mod.id);
                return (
                  <label
                    key={mod.id}
                    onClick={() => toggleNewRoleModule(mod.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isChecked
                        ? 'border-[#008000] bg-[#F0FDF4] dark:bg-[#14532D]/20 text-[#0F172A] dark:text-white'
                        : 'border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B]/40 hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by parent label click
                      className="mt-0.5 w-4 h-4 rounded text-[#008000] focus:ring-[#008000] accent-[#008000]"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">{mod.label}</p>
                      <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] leading-tight line-clamp-1">{mod.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>

      {/* Tab 3: Appearance & Theme */}
      {activeTab === 'appearance' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <Palette className="w-5 h-5 text-[#008000]" />
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">Appearance & Brand Theme</h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Customized brand green (#008000) scale with enterprise light and dark modes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => { if (isDark) toggleDarkMode(); }}
              className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between ${
                !isDark ? 'border-[#008000] bg-[#F0FDF4]' : 'border-[#CBD5E1] dark:border-[#334155]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sun className="w-5 h-5 text-[#F59E0B]" />
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">Enterprise Light</h4>
                  <p className="text-[11px] text-[#64748B]">Clean crisp white & slate surfaces</p>
                </div>
              </div>
              {!isDark && <Check className="w-4 h-4 text-[#008000]" />}
            </div>

            <div
              onClick={() => { if (!isDark) toggleDarkMode(); }}
              className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between ${
                isDark ? 'border-[#008000] bg-[#14532D]/30' : 'border-[#CBD5E1] dark:border-[#334155]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-[#60A5FA]" />
                <div>
                  <h4 className="text-xs font-bold text-[#F8FAFC]">SaaS Dark</h4>
                  <p className="text-[11px] text-[#94A3B8]">Deep slate #0F172A dark environment</p>
                </div>
              </div>
              {isDark && <Check className="w-4 h-4 text-[#008000]" />}
            </div>
          </div>
        </Card>
      )}

      {/* Tab 4: Billing Defaults */}
      {activeTab === 'invoice' && (
        <Card className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
              <Receipt className="w-5 h-5 text-[#008000]" />
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">Invoice Defaults</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Default tax rate, bank accounts, and terms on generated invoices</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Default GST Rate (%)" value="18" disabled />
              <Input label="Default Payment Terms" value="Net 10 Days" />
              <Input label="Beneficiary Bank Name" value="HDFC Bank" />
              <Input label="Bank Account Number" value="50200088991122" />
              <Input label="Bank IFSC Code" value="HDFC0001234" />
              <Input label="Branch" value="T. Nagar, Chennai" />
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] flex justify-end">
              <Button type="submit" variant="primary" size="sm">Save Billing Settings</Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
