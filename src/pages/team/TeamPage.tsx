import React, { useState, useRef } from 'react';
import { 
  UserCheck, 
  Plus, 
  Phone, 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Film, 
  Briefcase,
  Edit2,
  Trash2,
  Upload,
  User as UserIcon,
  Shield,
  Search,
  Filter,
  Camera,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { Input, Select, SearchInput } from '../../components/ui/Input';
import { User, UserRole } from '../../types';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
];

export const TeamPage: React.FC = () => {
  const { users, tasks, contents, addUser, updateUser, deleteUser } = useApp();

  // Search & Filter
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [workloadFilter, setWorkloadFilter] = useState<string>('all');

  // Modals
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [deletingMember, setDeletingMember] = useState<User | null>(null);

  // Form State for Add / Edit
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPasswordError, setFormPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('Digital Marketer');
  const [formWorkload, setFormWorkload] = useState<User['workload']>('Normal');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formAvatar, setFormAvatar] = useState(AVATAR_PRESETS[0]);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormPasswordError('');
    setShowPassword(false);
    setFormPhone('');
    setFormRole('Digital Marketer');
    setFormWorkload('Normal');
    setFormStatus('active');
    setFormAvatar(AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)]);
    setIsAddOpen(true);
  };

  const openEditModal = (member: User) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormEmail(member.email);
    setFormPassword('');
    setFormPasswordError('');
    setShowPassword(false);
    setFormPhone(member.phone);
    setFormRole(member.role);
    setFormWorkload(member.workload);
    setFormStatus(member.status);
    setFormAvatar(member.avatar);
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    if (!formPassword.trim()) {
      setFormPasswordError('Password is mandatory for adding a new team member.');
      return;
    }

    if (formPassword.trim().length < 6) {
      setFormPasswordError('Password must be at least 6 characters long.');
      return;
    }

    addUser({
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim() || '+91 98400 00000',
      role: formRole,
      avatar: formAvatar,
      status: formStatus,
      workload: formWorkload,
      password: formPassword.trim()
    });

    setIsAddOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !formName.trim() || !formEmail.trim()) return;

    const updates: Partial<User> = {
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      role: formRole,
      avatar: formAvatar,
      status: formStatus,
      workload: formWorkload
    };

    if (formPassword.trim()) {
      updates.password = formPassword.trim();
    }

    updateUser(editingMember.id, updates);

    setEditingMember(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingMember) return;
    deleteUser(deletingMember.id);
    setDeletingMember(null);
  };

  const getWorkloadBadgeVariant = (workload: User['workload']) => {
    switch (workload) {
      case 'Overloaded': return 'danger';
      case 'High': return 'warning';
      case 'Normal': return 'brand';
      case 'Low': return 'info';
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesWorkload = workloadFilter === 'all' || u.workload === workloadFilter;
    return matchesSearch && matchesRole && matchesWorkload;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
              Agency Team & Workload Capacity
            </h1>
            <Badge variant="brand">{users.length} Members</Badge>
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Internal creators, digital marketers, designers, and video editors workload monitoring and management.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Team Member
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search by name, email, or phone..."
          />
        </div>
        <div className="w-48">
          <Select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Admin">Admin</option>
            <option value="Digital Marketer">Digital Marketer</option>
            <option value="Designer">Designer</option>
            <option value="Video Editor">Video Editor</option>
          </Select>
        </div>
        <div className="w-44">
          <Select
            value={workloadFilter}
            onChange={e => setWorkloadFilter(e.target.value)}
          >
            <option value="all">All Workloads</option>
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Overloaded">Overloaded</option>
          </Select>
        </div>
      </Card>

      {/* Workload Alerts Banner */}
      {(() => {
        const overloadedUsers = users.filter(u => {
          const activeCount = tasks.filter(t => t.assignedToId === u.id && t.status !== 'Completed').length;
          return u.workload === 'Overloaded' || activeCount > 8;
        });
        if (overloadedUsers.length === 0) return null;
        return (
          <Card className="p-4 bg-[#FEF2F2] dark:bg-[#7F1D1D]/20 border-[#FECACA] dark:border-[#991B1B] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-[#DC2626]">Workload Bottleneck Warning:</span>
                <p className="text-[#475569] dark:text-[#CBD5E1]">
                  {overloadedUsers.map(u => {
                    const count = tasks.filter(t => t.assignedToId === u.id && t.status !== 'Completed').length;
                    return `${u.name} (${u.role}) has ${count} active tasks`;
                  }).join(', ')}. Consider reallocating pending edits.
                </p>
              </div>
            </div>
            <Badge variant="danger">Action Recommended</Badge>
          </Card>
        );
      })()}

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(member => {
          const memberTasks = tasks.filter(t => t.assignedToId === member.id && t.status !== 'Completed');
          const memberCompleted = tasks.filter(t => t.assignedToId === member.id && t.status === 'Completed');
          const memberContent = contents.filter(c => c.assignedToId === member.id);

          return (
            <Card key={member.id} className="p-5 space-y-4 hover:border-[#CBD5E1] transition-all relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#008000]"
                      />
                      <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#111827] ${
                        member.status === 'active' ? 'bg-[#008000]' : 'bg-[#94A3B8]'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">{member.name}</h3>
                        {member.status === 'inactive' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#008000] font-semibold">{member.role}</p>
                      <p className="text-[10px] text-[#94A3B8]">{member.email}</p>
                      <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{member.phone}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <Badge variant={getWorkloadBadgeVariant(member.workload)} size="sm">
                      {member.workload}
                    </Badge>
                    <div className="flex items-center gap-1 pt-1">
                      <button
                        onClick={() => openEditModal(member)}
                        className="p-1 rounded text-[#64748B] hover:text-[#008000] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
                        title="Edit Team Member"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingMember(member)}
                        className="p-1 rounded text-[#64748B] hover:text-[#DC2626] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
                        title="Delete Team Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Workload Metric Pills */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="p-2 bg-[#F8FAFC] dark:bg-[#0B1120] rounded border border-[#E2E8F0] dark:border-[#1E293B]">
                    <span className="text-[10px] text-[#94A3B8] block">Active Tasks</span>
                    <span className={`font-bold ${memberTasks.length > 8 ? 'text-[#DC2626]' : ''}`}>
                      {memberTasks.length}
                    </span>
                  </div>
                  <div className="p-2 bg-[#F8FAFC] dark:bg-[#0B1120] rounded border border-[#E2E8F0] dark:border-[#1E293B]">
                    <span className="text-[10px] text-[#94A3B8] block">Completed</span>
                    <span className="font-bold text-[#008000]">{memberCompleted.length}</span>
                  </div>
                  <div className="p-2 bg-[#F8FAFC] dark:bg-[#0B1120] rounded border border-[#E2E8F0] dark:border-[#1E293B]">
                    <span className="text-[10px] text-[#94A3B8] block">Media Pieces</span>
                    <span className="font-bold">{memberContent.length}</span>
                  </div>
                </div>

                {/* Current Active Assignment */}
                <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B] text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Primary Assignment:
                  </span>
                  {memberTasks.length > 0 ? (
                    <p className="text-[#0F172A] dark:text-[#F8FAFC] font-medium truncate">
                      {memberTasks[0].title}
                    </p>
                  ) : (
                    <span className="text-[#94A3B8] italic">No active queue</span>
                  )}
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedMember(member)}
                >
                  Inspect Workload
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(member)}
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Team Member Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Team Member"
        description="Register a new internal creator, editor, or agency manager."
        maxWidth="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSaveAdd}>Create Member</Button>
          </>
        }
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          {/* Avatar selector & click to upload */}
          <div>
            <label className="block text-xs font-medium text-[#0F172A] dark:text-[#E2E8F0] mb-2">
              Profile Photo / Avatar
            </label>
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                <img
                  src={formAvatar}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#008000]"
                />
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="xs"
                  onClick={() => avatarInputRef.current?.click()}
                  leftIcon={<Upload className="w-3 h-3" />}
                >
                  Upload Local Photo
                </Button>
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarFile}
                  accept="image/*"
                  className="hidden"
                />
                <p className="text-[10px] text-[#94A3B8]">Or pick a preset avatar below:</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {AVATAR_PRESETS.map((p, idx) => (
                    <img
                      key={idx}
                      src={p}
                      alt="Preset"
                      onClick={() => setFormAvatar(p)}
                      className={`w-7 h-7 rounded-full object-cover cursor-pointer border transition-transform hover:scale-110 ${
                        formAvatar === p ? 'border-[#008000] ring-2 ring-[#008000]' : 'border-transparent opacity-70'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Input
            label="Full Name"
            required
            placeholder="e.g. Rahul Sharma"
            value={formName}
            onChange={e => setFormName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="e.g. rahul@getupdigital.com"
              value={formEmail}
              onChange={e => setFormEmail(e.target.value)}
            />
            <Input
              label="Phone Number"
              placeholder="+91 98401 23456"
              value={formPhone}
              onChange={e => setFormPhone(e.target.value)}
            />
          </div>

          <Input
            label="Account Password"
            required
            type={showPassword ? 'text' : 'password'}
            placeholder="Set login password (min 6 characters)"
            value={formPassword}
            error={formPasswordError || undefined}
            onChange={e => {
              setFormPassword(e.target.value);
              if (formPasswordError) setFormPasswordError('');
            }}
            helperText={!formPasswordError ? "Mandatory: Set password for team member to log in (minimum 6 characters)." : undefined}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Agency Role"
              value={formRole}
              onChange={e => setFormRole(e.target.value as UserRole)}
            >
              <option value="Digital Marketer">Digital Marketer</option>
              <option value="Video Editor">Video Editor</option>
              <option value="Designer">Designer</option>
              <option value="Admin">Admin</option>
              <option value="Super Admin">Super Admin</option>
            </Select>

            <Select
              label="Workload Level"
              value={formWorkload}
              onChange={e => setFormWorkload(e.target.value as User['workload'])}
            >
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Overloaded">Overloaded</option>
            </Select>

            <Select
              label="Status"
              value={formStatus}
              onChange={e => setFormStatus(e.target.value as 'active' | 'inactive')}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </form>
      </Modal>

      {/* Edit Team Member Modal */}
      {editingMember && (
        <Modal
          isOpen={true}
          onClose={() => setEditingMember(null)}
          title={`Edit Team Member — ${editingMember.name}`}
          description="Update role permissions, contact details, and workload allocation."
          maxWidth="md"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setEditingMember(null)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSaveEdit}>Save Changes</Button>
            </>
          }
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            {/* Avatar selector & click to upload */}
            <div>
              <label className="block text-xs font-medium text-[#0F172A] dark:text-[#E2E8F0] mb-2">
                Profile Photo / Avatar
              </label>
              <div className="flex items-center gap-4">
                <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                  <img
                    src={formAvatar}
                    alt="Avatar preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#008000]"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-1.5">
                  <Button
                    type="button"
                    variant="secondary"
                    size="xs"
                    onClick={() => avatarInputRef.current?.click()}
                    leftIcon={<Upload className="w-3 h-3" />}
                  >
                    Upload Local Photo
                  </Button>
                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarFile}
                    accept="image/*"
                    className="hidden"
                  />
                  <p className="text-[10px] text-[#94A3B8]">Or pick a preset avatar below:</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {AVATAR_PRESETS.map((p, idx) => (
                      <img
                        key={idx}
                        src={p}
                        alt="Preset"
                        onClick={() => setFormAvatar(p)}
                        className={`w-7 h-7 rounded-full object-cover cursor-pointer border transition-transform hover:scale-110 ${
                          formAvatar === p ? 'border-[#008000] ring-2 ring-[#008000]' : 'border-transparent opacity-70'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Input
              label="Full Name"
              required
              value={formName}
              onChange={e => setFormName(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Email Address"
                type="email"
                required
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
              />
              <Input
                label="Phone Number"
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
              />
            </div>

            <Input
              label="Reset Password (Optional)"
              type={showPassword ? 'text' : 'password'}
              placeholder="Leave blank to keep current password"
              value={formPassword}
              onChange={e => setFormPassword(e.target.value)}
              helperText="Only fill this if you want to reset this user's password."
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Agency Role"
                value={formRole}
                onChange={e => setFormRole(e.target.value as UserRole)}
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Digital Marketer">Digital Marketer</option>
                <option value="Designer">Designer</option>
                <option value="Video Editor">Video Editor</option>
              </Select>

              <Select
                label="Workload Level"
                value={formWorkload}
                onChange={e => setFormWorkload(e.target.value as User['workload'])}
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Overloaded">Overloaded</option>
              </Select>

              <Select
                label="Status"
                value={formStatus}
                onChange={e => setFormStatus(e.target.value as 'active' | 'inactive')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingMember}
        onClose={() => setDeletingMember(null)}
        onConfirm={handleDeleteConfirm}
        title={`Remove ${deletingMember?.name}?`}
        description={`Are you sure you want to remove ${deletingMember?.name} (${deletingMember?.role}) from the agency team? Tasks currently assigned to them may need re-allocation.`}
        confirmLabel="Delete Member"
        confirmVariant="danger"
      />

      {/* Team Member Workload Breakdown Modal */}
      {selectedMember && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedMember(null)}
          title={`${selectedMember.name} — Workload Breakdown`}
          description={`${selectedMember.role} • ${selectedMember.phone}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const m = selectedMember;
                  setSelectedMember(null);
                  openEditModal(m);
                }}
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              >
                Edit Member Details
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedMember(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B1120] rounded border">
                <span className="text-[10px] text-[#94A3B8] block">Current Workload</span>
                <span className="font-bold text-sm">{selectedMember.workload}</span>
              </div>
              <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B1120] rounded border">
                <span className="text-[10px] text-[#94A3B8] block">Active Tasks</span>
                <span className="font-bold text-sm">{tasks.filter(t => t.assignedToId === selectedMember.id && t.status !== 'Completed').length}</span>
              </div>
              <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B1120] rounded border">
                <span className="text-[10px] text-[#94A3B8] block">Deliverables Published</span>
                <span className="font-bold text-sm text-[#008000]">{contents.filter(c => c.assignedToId === selectedMember.id && c.status === 'Published').length}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#CBD5E1] mb-2">
                Active Queue ({tasks.filter(t => t.assignedToId === selectedMember.id && t.status !== 'Completed').length})
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {tasks.filter(t => t.assignedToId === selectedMember.id && t.status !== 'Completed').length === 0 ? (
                  <p className="text-xs text-[#94A3B8] italic py-4 text-center">No active tasks in queue.</p>
                ) : (
                  tasks.filter(t => t.assignedToId === selectedMember.id && t.status !== 'Completed').map(t => (
                    <div key={t.id} className="p-2.5 rounded bg-[#F8FAFC] dark:bg-[#0B1120] border text-xs flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{t.title}</p>
                        <p className="text-[10px] text-[#94A3B8]">{t.clientName} • Due: {t.dueDate}</p>
                      </div>
                      <Badge variant={t.priority === 'Urgent' ? 'danger' : 'neutral'} size="sm">{t.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
