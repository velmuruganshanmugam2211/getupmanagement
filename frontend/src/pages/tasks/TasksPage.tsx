import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  List, 
  Kanban, 
  Clock, 
  User as UserIcon, 
  Edit3, 
  Trash2, 
  CheckCircle2,
  AlertTriangle,
  MoveRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SearchInput, Select } from '../../components/ui/Input';
import { PriorityBadge, StatusBadge, Badge } from '../../components/ui/Badge';
import { TaskFormModal } from '../../components/forms/TaskFormModal';
import { ConfirmDialog } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { Task, TaskStatus } from '../../types';

export const TasksPage: React.FC = () => {
  const { tasks, clients, users, currentUser, updateTaskStatus, deleteTask } = useApp();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.clientName.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedToName.toLowerCase().includes(search.toLowerCase());

    const matchesClient = clientFilter === 'all' || t.clientId === clientFilter;
    const matchesAssignee = assigneeFilter === 'all' || t.assignedToId === assigneeFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;

    return matchesSearch && matchesClient && matchesAssignee && matchesPriority;
  });

  const columns: { id: TaskStatus; label: string; countColor: string }[] = [
    { id: 'Todo', label: 'To Do', countColor: 'text-[#64748B]' },
    { id: 'In Progress', label: 'In Progress', countColor: 'text-[#2563EB]' },
    { id: 'Review', label: 'Internal Review', countColor: 'text-[#D97706]' },
    { id: 'Completed', label: 'Completed', countColor: 'text-[#16A34A]' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            Task & Workload Management
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Internal agency operations, video editing batches, graphic design tickets, and ads optimization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex p-0.5 bg-[#F1F5F9] dark:bg-[#1E293B] rounded-lg border border-[#E2E8F0] dark:border-[#334155]">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md ${viewMode === 'kanban' ? 'bg-white dark:bg-[#111827] text-[#008000] shadow-xs' : 'text-[#64748B]'}`}
              title="Kanban Board"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-[#111827] text-[#008000] shadow-xs' : 'text-[#64748B]'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <SearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search task title, client, assignee..."
          />

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
            <option value="all">All Team Members</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </Select>

          <Select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </Select>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8] pt-1 gap-2">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{filteredTasks.length}</strong> of {tasks.length} tasks
            </span>
            <span className="text-[#CBD5E1]">|</span>
            <button
              onClick={() => setAssigneeFilter(assigneeFilter === currentUser.id ? 'all' : currentUser.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                assigneeFilter === currentUser.id 
                  ? 'bg-[#008000] text-white' 
                  : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8] hover:text-[#008000]'
              }`}
            >
              📋 My Assigned Tasks ({tasks.filter(t => t.assignedToId === currentUser.id).length})
            </button>
          </div>

          {(search || clientFilter !== 'all' || assigneeFilter !== 'all' || priorityFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setClientFilter('all');
                setAssigneeFilter('all');
                setPriorityFilter('all');
              }}
              className="text-[#008000] hover:underline font-semibold"
            >
              Clear filters
            </button>
          )}
        </div>
      </Card>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);

            return (
              <div key={col.id} className="bg-[#F8FAFC] dark:bg-[#0B1120] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] p-3 space-y-3">
                {/* Column Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                      {col.label}
                    </span>
                    <span className={`text-xs font-bold px-1.5 py-0.2 rounded-full bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] ${col.countColor}`}>
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsAddOpen(true)}
                    className="p-1 rounded text-[#94A3B8] hover:text-[#008000] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 min-h-[350px]">
                  {colTasks.length === 0 ? (
                    <div className="h-32 flex items-center justify-center border border-dashed border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs text-[#94A3B8]">
                      No tasks in this lane
                    </div>
                  ) : (
                    colTasks.map(t => (
                      <Card key={t.id} className="p-3.5 space-y-2.5 hover:shadow-xs transition-shadow">
                        <div className="flex items-center justify-between">
                          <PriorityBadge priority={t.priority} size="sm" />
                          <span className="text-[10px] text-[#94A3B8] font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {t.estimatedHours}h
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-snug line-clamp-2">
                          {t.title}
                        </h4>

                        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] line-clamp-2">
                          {t.description}
                        </p>

                        <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-semibold text-[#008000] block">{t.clientName}</span>
                            <span className="text-[10px] text-[#94A3B8]">Due: {t.dueDate}</span>
                          </div>
                          <span className="font-semibold text-[#0F172A] dark:text-[#CBD5E1] bg-[#F1F5F9] dark:bg-[#1E293B] px-1.5 py-0.5 rounded text-[10px]">
                            {t.assignedToName}
                          </span>
                        </div>

                        {/* Quick Move Status Bar */}
                        <div className="pt-1 flex items-center justify-between">
                          <select
                            value={t.status}
                            onChange={e => updateTaskStatus(t.id, e.target.value as TaskStatus)}
                            className="text-[10px] py-0.5 px-1.5 rounded border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#111827] text-[#475569] dark:text-[#CBD5E1]"
                          >
                            <option value="Todo">Move: Todo</option>
                            <option value="In Progress">Move: In Progress</option>
                            <option value="Review">Move: Review</option>
                            <option value="Completed">Move: Completed</option>
                          </select>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingTask(t)}
                              className="p-1 text-[#94A3B8] hover:text-[#2563EB]"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setDeletingId(t.id)}
                              className="p-1 text-[#94A3B8] hover:text-[#DC2626]"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description="Adjust your filters or create a new internal task for the team."
          actionLabel="+ Add New Task"
          onAction={() => setIsAddOpen(true)}
          icon={<CheckSquare className="w-6 h-6" />}
        />
      ) : (
        /* List View */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] dark:bg-[#0B1120] border-b border-[#E2E8F0] dark:border-[#1E293B] text-[#475569] dark:text-[#94A3B8] font-semibold">
                <tr>
                  <th className="p-3.5 pl-4">Task Title</th>
                  <th className="p-3.5">Client</th>
                  <th className="p-3.5">Assigned To</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5">Estimated</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                {filteredTasks.map(t => (
                  <tr key={t.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#111827]/60 transition-colors">
                    <td className="p-3.5 pl-4">
                      <p className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">{t.title}</p>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] line-clamp-1">{t.description}</p>
                    </td>
                    <td className="p-3.5 font-semibold text-[#008000]">{t.clientName}</td>
                    <td className="p-3.5 font-medium">{t.assignedToName}</td>
                    <td className="p-3.5"><PriorityBadge priority={t.priority} size="sm" /></td>
                    <td className="p-3.5 text-[#DC2626] font-semibold">{t.dueDate}</td>
                    <td className="p-3.5">{t.estimatedHours} hrs</td>
                    <td className="p-3.5">
                      <select
                        value={t.status}
                        onChange={e => updateTaskStatus(t.id, e.target.value as TaskStatus)}
                        className="text-xs font-semibold py-1 px-2 rounded border bg-white dark:bg-[#111827] border-[#CBD5E1] dark:border-[#334155]"
                      >
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditingTask(t)} className="p-1.5 text-[#64748B] hover:text-[#2563EB]">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeletingId(t.id)} className="p-1.5 text-[#64748B] hover:text-[#DC2626]">
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
      )}

      {/* Modals */}
      <TaskFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      {editingTask && (
        <TaskFormModal
          isOpen={true}
          onClose={() => setEditingTask(null)}
          initialData={editingTask}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Delete Task?"
        description="Are you sure you want to remove this task from the project board?"
        confirmLabel="Delete Task"
        confirmVariant="danger"
        onConfirm={() => {
          if (deletingId) {
            deleteTask(deletingId);
            setDeletingId(null);
          }
        }}
      />
    </div>
  );
};
