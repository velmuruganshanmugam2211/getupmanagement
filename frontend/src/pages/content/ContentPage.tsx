import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Film, 
  Plus, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  LayoutGrid, 
  List, 
  Edit3, 
  Trash2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SearchInput, Select } from '../../components/ui/Input';
import { StatusBadge, PriorityBadge, Badge } from '../../components/ui/Badge';
import { ContentFormModal } from '../../components/forms/ContentFormModal';
import { ConfirmDialog } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { ContentItem, ContentStatus, ContentType } from '../../types';

export const ContentPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get('type');

  const { contents, clients, users, currentUser, updateContentStatus, deleteContent } = useApp();

  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState(typeParam || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync typeFilter with searchParams
  React.useEffect(() => {
    if (typeParam) {
      setTypeFilter(typeParam);
    }
  }, [typeParam]);

  const filteredContents = contents.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.assignedToName.toLowerCase().includes(search.toLowerCase());

    const matchesClient = clientFilter === 'all' || c.clientId === clientFilter;
    const matchesAssignee = assigneeFilter === 'all' || c.assignedToId === assigneeFilter;
    const matchesType = typeFilter === 'all' || c.contentType === typeFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || c.platform === platformFilter;

    return matchesSearch && matchesClient && matchesAssignee && matchesType && matchesStatus && matchesPlatform;
  });

  const myAssignedCount = contents.filter(c => c.assignedToId === currentUser.id).length;

  const statuses: ContentStatus[] = [
    'Idea', 'Planned', 'Assigned', 'In Progress', 'Internal Review', 'Ready', 'Scheduled', 'Published', 'Cancelled'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
              Content Production Pipeline
            </h1>
            {typeFilter !== 'all' && (
              <Badge variant="brand">{typeFilter}s</Badge>
            )}
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Plan, produce, review, and publish client media assets with live monthly quota sync.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex p-0.5 bg-[#F1F5F9] dark:bg-[#1E293B] rounded-lg border border-[#E2E8F0] dark:border-[#334155]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-white dark:bg-[#111827] text-[#008000] shadow-xs' : 'text-[#64748B]'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-[#111827] text-[#008000] shadow-xs' : 'text-[#64748B]'}`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Content
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
          <div className="md:col-span-2">
            <SearchInput
              value={search}
              onChange={e => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search title, client, assignee..."
            />
          </div>

          <Select
            value={clientFilter}
            onChange={e => setClientFilter(e.target.value)}
          >
            <option value="all">All Clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.businessName}</option>
            ))}
          </Select>

          <Select
            value={assigneeFilter}
            onChange={e => setAssigneeFilter(e.target.value)}
          >
            <option value="all">All Assignees</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </Select>

          <Select
            value={typeFilter}
            onChange={e => {
              setTypeFilter(e.target.value);
              if (e.target.value === 'all') searchParams.delete('type');
              else searchParams.set('type', e.target.value);
              setSearchParams(searchParams);
            }}
          >
            <option value="all">All Types</option>
            <option value="Video">Video</option>
            <option value="Reel">Reel</option>
            <option value="Poster">Poster</option>
            <option value="Photo">Photo</option>
            <option value="Story">Story</option>
            <option value="Carousel">Carousel</option>
            <option value="Ad Creative">Ad Creative</option>
          </Select>

          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8] pt-1 gap-2">
          <div className="flex items-center gap-2">
            <span>Showing <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{filteredContents.length}</strong> items</span>
            <span className="text-[#CBD5E1]">|</span>
            <button
              onClick={() => setAssigneeFilter(assigneeFilter === currentUser.id ? 'all' : currentUser.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                assigneeFilter === currentUser.id 
                  ? 'bg-[#008000] text-white' 
                  : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8] hover:text-[#008000]'
              }`}
            >
              🎬 My Assigned Work ({myAssignedCount})
            </button>
          </div>

          {(search || clientFilter !== 'all' || assigneeFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setClientFilter('all');
                setAssigneeFilter('all');
                setTypeFilter('all');
                setStatusFilter('all');
                searchParams.delete('type');
                setSearchParams(searchParams);
              }}
              className="text-[#008000] hover:underline font-semibold"
            >
              Clear filters
            </button>
          )}
        </div>
      </Card>

      {/* Content Rendering */}
      {filteredContents.length === 0 ? (
        <EmptyState
          title="No content found"
          description="Adjust your filters or schedule a new content piece for production."
          actionLabel="+ Schedule Content"
          onAction={() => setIsAddOpen(true)}
          icon={<Film className="w-6 h-6" />}
        />
      ) : viewMode === 'table' ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] dark:bg-[#0B1120] border-b border-[#E2E8F0] dark:border-[#1E293B] text-[#475569] dark:text-[#94A3B8] font-semibold">
                <tr>
                  <th className="p-3.5 pl-4">Title & Details</th>
                  <th className="p-3.5">Client</th>
                  <th className="p-3.5">Type & Platform</th>
                  <th className="p-3.5">Assignee</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5">Target Publish</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Status (Live Quota Sync)</th>
                  <th className="p-3.5 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                {filteredContents.map(cnt => (
                  <tr key={cnt.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#111827]/60 transition-colors">
                    <td className="p-3.5 pl-4 max-w-xs">
                      <p className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] line-clamp-1">{cnt.title}</p>
                      {cnt.description && (
                        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] line-clamp-1 mt-0.5">{cnt.description}</p>
                      )}
                    </td>

                    <td className="p-3.5">
                      <span className="font-semibold text-[#0F172A] dark:text-[#CBD5E1]">{cnt.clientName}</span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="brand" size="sm">{cnt.contentType}</Badge>
                        <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">({cnt.platform})</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="font-medium text-[#0F172A] dark:text-[#CBD5E1]">{cnt.assignedToName}</span>
                    </td>

                    <td className="p-3.5 text-[#64748B] dark:text-[#94A3B8]">
                      {cnt.dueDate}
                    </td>

                    <td className="p-3.5 font-medium text-[#0F172A] dark:text-[#CBD5E1]">
                      {cnt.publishDate}
                    </td>

                    <td className="p-3.5">
                      <PriorityBadge priority={cnt.priority} size="sm" />
                    </td>

                    <td className="p-3.5">
                      {/* Live Workflow Status Selector */}
                      <select
                        value={cnt.status}
                        onChange={e => updateContentStatus(cnt.id, e.target.value as ContentStatus)}
                        className={`text-xs font-semibold py-1 px-2 rounded border focus:outline-none focus:ring-1 focus:ring-[#008000] cursor-pointer ${
                          cnt.status === 'Published' 
                            ? 'bg-[#F0FDF4] text-[#008000] border-[#BBF7D0]' 
                            : cnt.status === 'Scheduled' 
                            ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]' 
                            : cnt.status === 'Internal Review' 
                            ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]' 
                            : 'bg-white dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] border-[#CBD5E1] dark:border-[#334155]'
                        }`}
                      >
                        {statuses.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3.5 text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingItem(cnt)}
                          className="p-1.5 rounded text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
                          title="Edit Content"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(cnt.id)}
                          className="p-1.5 rounded text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                          title="Delete Content"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredContents.map(cnt => (
            <Card key={cnt.id} className="p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="brand" size="sm">{cnt.contentType}</Badge>
                  <PriorityBadge priority={cnt.priority} size="sm" />
                </div>

                <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] leading-snug">
                  {cnt.title}
                </h3>

                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-2">
                  {cnt.description}
                </p>

                <div className="pt-1 text-xs text-[#64748B] dark:text-[#94A3B8] space-y-1">
                  <div>Client: <strong className="text-[#0F172A] dark:text-[#CBD5E1]">{cnt.clientName}</strong></div>
                  <div>Owner: <span className="font-medium text-[#008000]">{cnt.assignedToName}</span></div>
                  <div>Publish: <span className="font-medium">{cnt.publishDate}</span></div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between">
                <select
                  value={cnt.status}
                  onChange={e => updateContentStatus(cnt.id, e.target.value as ContentStatus)}
                  className="text-xs font-semibold py-1 px-2 rounded border bg-white dark:bg-[#1E293B] border-[#CBD5E1] dark:border-[#334155]"
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingItem(cnt)}
                    className="p-1 text-[#64748B] hover:text-[#2563EB]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingId(cnt.id)}
                    className="p-1 text-[#64748B] hover:text-[#DC2626]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <ContentFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      {editingItem && (
        <ContentFormModal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          initialData={editingItem}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Delete Content Item?"
        description="Are you sure you want to delete this content record? If already published, the client's completed quota will be updated."
        confirmLabel="Delete Content"
        confirmVariant="danger"
        onConfirm={() => {
          if (deletingId) {
            deleteContent(deletingId);
            setDeletingId(null);
          }
        }}
      />
    </div>
  );
};
