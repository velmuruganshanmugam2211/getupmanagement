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
  Save 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export const SettingsPage: React.FC = () => {
  const { isDark, toggleDarkMode, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('company');

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Role-Based Access Control (RBAC Matrix)
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Enforced on navigation, write operations, and data visibility per Section 32.
              </p>
            </div>
            <Badge variant="brand">Strict Internal Security</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] dark:bg-[#0B1120] border-b text-[#475569] dark:text-[#94A3B8] font-bold">
                <tr>
                  <th className="p-3">Module</th>
                  <th className="p-3 text-center">Super Admin</th>
                  <th className="p-3 text-center">Admin</th>
                  <th className="p-3 text-center">Digital Marketer</th>
                  <th className="p-3 text-center">Designer</th>
                  <th className="p-3 text-center">Video Editor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                {[
                  { module: 'Dashboard & Metrics', sa: true, a: true, dm: true, de: true, ve: true },
                  { module: 'Clients Management', sa: true, a: true, dm: true, de: false, ve: false },
                  { module: 'Packages & Quotas', sa: true, a: true, dm: false, de: false, ve: false },
                  { module: 'Content Pipeline', sa: true, a: true, dm: true, de: true, ve: true },
                  { module: 'Content Calendar', sa: true, a: true, dm: true, de: true, ve: true },
                  { module: 'Tasks & Kanban', sa: true, a: true, dm: true, de: true, ve: true },
                  { module: 'Performance Campaigns', sa: true, a: true, dm: true, de: false, ve: false },
                  { module: 'Finance & Invoices', sa: true, a: true, dm: false, de: false, ve: false },
                  { module: 'Media Library', sa: true, a: true, dm: true, de: true, ve: true },
                  { module: 'Team & Workload', sa: true, a: true, dm: false, de: false, ve: false },
                  { module: 'Executive Reports', sa: true, a: true, dm: true, de: false, ve: false },
                  { module: 'System Settings', sa: true, a: true, dm: false, de: false, ve: false },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-[#F8FAFC] dark:hover:bg-[#111827]">
                    <td className="p-3 font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{row.module}</td>
                    <td className="p-3 text-center">{row.sa ? <Check className="w-4 h-4 text-[#008000] mx-auto" /> : '—'}</td>
                    <td className="p-3 text-center">{row.a ? <Check className="w-4 h-4 text-[#008000] mx-auto" /> : '—'}</td>
                    <td className="p-3 text-center">{row.dm ? <Check className="w-4 h-4 text-[#008000] mx-auto" /> : '—'}</td>
                    <td className="p-3 text-center">{row.de ? <Check className="w-4 h-4 text-[#008000] mx-auto" /> : '—'}</td>
                    <td className="p-3 text-center">{row.ve ? <Check className="w-4 h-4 text-[#008000] mx-auto" /> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

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
