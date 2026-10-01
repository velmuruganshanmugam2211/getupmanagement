import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus, PriorityLevel } from '../../types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Task;
  defaultClientId?: string;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  defaultClientId
}) => {
  const { addTask, updateTask, clients, users } = useApp();

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [clientId, setClientId] = useState(initialData?.clientId || defaultClientId || clients[0]?.id || '');
  const [project, setProject] = useState(initialData?.project || 'Social Media Retainer');
  const [assignedToId, setAssignedToId] = useState(initialData?.assignedToId || users[0]?.id || '');
  const [priority, setPriority] = useState<PriorityLevel>(initialData?.priority || 'High');
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || 'Todo');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || new Date().toISOString().split('T')[0]);
  const [estimatedHours, setEstimatedHours] = useState<number>(initialData?.estimatedHours || 3);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    const selectedClient = clients.find(c => c.id === clientId);
    const selectedUser = users.find(u => u.id === assignedToId);

    const taskPayload = {
      title,
      description,
      clientId,
      clientName: selectedClient?.businessName || 'General',
      project,
      assignedToId,
      assignedToName: selectedUser?.name || 'Unassigned',
      priority,
      status,
      dueDate,
      estimatedHours: Number(estimatedHours),
      commentsCount: initialData?.commentsCount || 0
    };

    if (initialData) {
      updateTask(initialData.id, taskPayload);
    } else {
      addTask(taskPayload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Task' : 'Create Task'}
      description="Assign actionable work to team members with deadline tracking."
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {initialData ? 'Update Task' : 'Create Task'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          required
          placeholder="e.g. Color grade 4K Biryani reel footage"
          value={title}
          onChange={e => { setTitle(e.target.value); setError(''); }}
          error={error}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Client"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
          >
            {clients.length === 0 ? (
              <option value="">Internal Agency / No Client</option>
            ) : (
              clients.map(c => (
                <option key={c.id} value={c.id}>{c.businessName}</option>
              ))
            )}
          </Select>

          <Input
            label="Project / Campaign"
            placeholder="e.g. Diwali Launch Teasers"
            value={project}
            onChange={e => setProject(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Assign To"
            value={assignedToId}
            onChange={e => setAssignedToId(e.target.value)}
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </Select>

          <Select
            label="Priority"
            value={priority}
            onChange={e => setPriority(e.target.value as PriorityLevel)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Due Date"
            type="date"
            required
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />

          <Input
            label="Estimated Time (Hours)"
            type="number"
            step="0.5"
            value={estimatedHours}
            onChange={e => setEstimatedHours(Number(e.target.value))}
          />
        </div>

        <Select
          label="Initial Status"
          value={status}
          onChange={e => setStatus(e.target.value as TaskStatus)}
        >
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Review">Review</option>
          <option value="Completed">Completed</option>
        </Select>

        <Textarea
          label="Description & Technical Requirements"
          placeholder="Aspect ratio, resolution, color style notes, assets link..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
      </form>
    </Modal>
  );
};
