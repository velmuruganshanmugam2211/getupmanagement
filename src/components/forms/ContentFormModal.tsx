import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import { useApp } from '../../context/AppContext';
import { ContentItem, ContentType, ContentStatus, PriorityLevel } from '../../types';

interface ContentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ContentItem;
  defaultClientId?: string;
  defaultDate?: string;
}

export const ContentFormModal: React.FC<ContentFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  defaultClientId,
  defaultDate
}) => {
  const { addContent, updateContent, clients, users } = useApp();

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [clientId, setClientId] = useState(initialData?.clientId || defaultClientId || clients[0]?.id || '');
  const [contentType, setContentType] = useState<ContentType>(initialData?.contentType || 'Reel');
  const [platform, setPlatform] = useState<ContentItem['platform']>(initialData?.platform || 'Instagram');
  const [assignedToId, setAssignedToId] = useState(initialData?.assignedToId || users[2]?.id || 'usr-3');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || defaultDate || new Date().toISOString().split('T')[0]);
  const [publishDate, setPublishDate] = useState(initialData?.publishDate || defaultDate || new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<PriorityLevel>(initialData?.priority || 'High');
  const [status, setStatus] = useState<ContentStatus>(initialData?.status || 'Planned');
  const [campaignName, setCampaignName] = useState(initialData?.campaignName || '');
  const [caption, setCaption] = useState(initialData?.caption || '');
  const [hashtags, setHashtags] = useState(initialData?.hashtags || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Content title is required');
      return;
    }

    const selectedClient = clients.find(c => c.id === clientId);
    const selectedUser = users.find(u => u.id === assignedToId);

    const payload = {
      clientId,
      clientName: selectedClient?.businessName || 'General',
      contentType,
      title,
      description,
      platform,
      assignedToId,
      assignedToName: selectedUser?.name || 'Unassigned',
      dueDate,
      publishDate,
      priority,
      status,
      campaignName,
      caption,
      hashtags,
      notes
    };

    if (initialData) {
      updateContent(initialData.id, payload);
    } else {
      addContent(payload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Content Item' : 'Schedule New Content'}
      description="Plan, produce, review, and track quota consumption for this content asset."
      maxWidth="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {initialData ? 'Save Changes' : 'Create & Schedule'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Content Title"
          required
          placeholder="e.g. Secret Biryani Dum Unsealing Behind The Scenes"
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

          <Select
            label="Content Type"
            value={contentType}
            onChange={e => setContentType(e.target.value as ContentType)}
          >
            <option value="Video">Video (Horizontal)</option>
            <option value="Reel">Reel / Short (9:16)</option>
            <option value="Poster">Poster / Banner</option>
            <option value="Photo">Photo Shoot</option>
            <option value="Story">Story / Status</option>
            <option value="Carousel">Carousel Post</option>
            <option value="Ad Creative">Ad Creative</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Publish Platform"
            value={platform}
            onChange={e => setPlatform(e.target.value as ContentItem['platform'])}
          >
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
            <option value="YouTube">YouTube</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Google">Google Business</option>
            <option value="Multi-platform">Multi-platform</option>
          </Select>

          <Select
            label="Assignee"
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Due Date (Creative Ready)"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />

          <Input
            label="Target Publish Date"
            type="date"
            value={publishDate}
            onChange={e => setPublishDate(e.target.value)}
          />

          <Select
            label="Workflow Status"
            value={status}
            onChange={e => setStatus(e.target.value as ContentStatus)}
          >
            <option value="Idea">Idea</option>
            <option value="Planned">Planned</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Internal Review">Internal Review</option>
            <option value="Ready">Ready</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Published">Published (Counts toward Quota)</option>
            <option value="Cancelled">Cancelled</option>
          </Select>
        </div>

        <Input
          label="Associated Campaign (Optional)"
          placeholder="e.g. Festive Diwali Blast, Weekend Feasts"
          value={campaignName}
          onChange={e => setCampaignName(e.target.value)}
        />

        <Textarea
          label="Caption & Copy"
          placeholder="Draft copy, call to action, phone numbers..."
          value={caption}
          onChange={e => setCaption(e.target.value)}
          rows={2}
        />

        <Input
          label="Hashtags"
          placeholder="#brand #marketing #chennai #trend"
          value={hashtags}
          onChange={e => setHashtags(e.target.value)}
        />
      </form>
    </Modal>
  );
};
