import React, { useState, useRef } from 'react';
import { 
  FolderGit2, 
  UploadCloud, 
  Folder, 
  FileText, 
  Film, 
  Image as ImageIcon, 
  Eye, 
  Trash2, 
  Download, 
  CheckCircle2, 
  X,
  Filter,
  File,
  Upload
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SearchInput, Select, Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { MediaItem, MediaFolderType } from '../../types';

export const MediaPage: React.FC = () => {
  const { mediaItems, clients, currentUser, addMediaItem, deleteMediaItem } = useApp();

  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Modals & Upload State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  // Upload Form
  const [uploadClientId, setUploadClientId] = useState(clients[0]?.id || '');
  const [uploadFolder, setUploadFolder] = useState<MediaFolderType>('Reels');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState('');
  const [uploadFileType, setUploadFileType] = useState('');
  const [uploadThumbnail, setUploadThumbnail] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const folders: MediaFolderType[] = [
    'Brand Assets', 'Photos', 'Videos', 'Posters', 'Reels', 'Documents'
  ];

  const filteredMedia = mediaItems.filter(m => {
    const matchesSearch = m.fileName.toLowerCase().includes(search.toLowerCase()) || m.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = selectedFolder === 'all' || m.folder === selectedFolder;
    const matchesClient = selectedClient === 'all' || m.clientId === selectedClient;
    return matchesSearch && matchesFolder && matchesClient;
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const processFile = (file: File) => {
    setUploadFileName(file.name);
    setUploadFileSize(formatFileSize(file.size));
    setUploadFileType(file.type || 'application/octet-stream');

    // Auto-detect folder
    if (file.type.startsWith('video/')) {
      setUploadFolder('Reels');
    } else if (file.type.startsWith('image/')) {
      setUploadFolder('Photos');
    } else if (file.type.includes('pdf') || file.type.includes('document')) {
      setUploadFolder('Documents');
    }

    // Read real image preview if image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setUploadThumbnail(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      setUploadThumbnail('https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&auto=format&fit=crop&q=80');
    } else {
      setUploadThumbnail('https://images.unsplash.com/photo-1542744094-3a31f272c490?w=400&auto=format&fit=crop&q=80');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const clearSelectedFile = () => {
    setUploadFileName('');
    setUploadFileSize('');
    setUploadFileType('');
    setUploadThumbnail('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;

    setUploadProgress(15);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return 30;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const client = clients.find(c => c.id === uploadClientId) || clients[0];
            addMediaItem({
              clientId: client?.id || 'gen',
              clientName: client?.businessName || 'General Agency',
              folder: uploadFolder,
              fileName: uploadFileName,
              fileType: uploadFileType || (uploadFolder === 'Videos' || uploadFolder === 'Reels' ? 'video/mp4' : 'image/jpeg'),
              fileSize: uploadFileSize || '4.5 MB',
              thumbnailUrl: uploadThumbnail || (uploadFolder === 'Videos' || uploadFolder === 'Reels'
                ? 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=300&auto=format&fit=crop&q=80'),
              fileUrl: uploadThumbnail || '#',
              uploadedBy: currentUser.name
            });
            setUploadProgress(null);
            setIsUploadOpen(false);
            clearSelectedFile();
          }, 300);
          return 100;
        }
        return prev + 30;
      });
    }, 150);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            Media Asset Library
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Client brand identity kits, 4K reel cuts, campaign posters, high-res photos, and project documents.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            clearSelectedFile();
            setIsUploadOpen(true);
          }}
          leftIcon={<UploadCloud className="w-4 h-4" />}
        >
          Upload Asset
        </Button>
      </div>

      {/* Folder Categories Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2.5">
        <button
          onClick={() => setSelectedFolder('all')}
          className={`p-3 rounded-lg border text-left transition-all ${
            selectedFolder === 'all'
              ? 'border-[#008000] bg-[#F0FDF4] dark:bg-[#14532D]/40 text-[#008000] dark:text-[#4ADE80] font-bold shadow-xs'
              : 'border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#475569] dark:text-[#CBD5E1] hover:border-[#CBD5E1]'
          }`}
        >
          <Folder className="w-4 h-4 mb-1 text-[#008000]" />
          <span className="text-xs block">All Files</span>
          <span className="text-[10px] text-[#94A3B8] font-normal">{mediaItems.length} files</span>
        </button>

        {folders.map(f => {
          const count = mediaItems.filter(m => m.folder === f).length;
          return (
            <button
              key={f}
              onClick={() => setSelectedFolder(f)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedFolder === f
                  ? 'border-[#008000] bg-[#F0FDF4] dark:bg-[#14532D]/40 text-[#008000] dark:text-[#4ADE80] font-bold shadow-xs'
                  : 'border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#475569] dark:text-[#CBD5E1] hover:border-[#CBD5E1]'
              }`}
            >
              {f === 'Videos' || f === 'Reels' ? (
                <Film className="w-4 h-4 mb-1 text-[#2563EB]" />
              ) : f === 'Photos' || f === 'Posters' ? (
                <ImageIcon className="w-4 h-4 mb-1 text-[#D97706]" />
              ) : (
                <FileText className="w-4 h-4 mb-1 text-[#9333EA]" />
              )}
              <span className="text-xs block truncate">{f}</span>
              <span className="text-[10px] text-[#94A3B8] font-normal">{count} items</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search by file name or client..."
          />
        </div>
        <div className="w-56">
          <Select
            value={selectedClient}
            onChange={e => setSelectedClient(e.target.value)}
          >
            <option value="all">All Clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.businessName}</option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <EmptyState
          title="No media assets found"
          description="Upload media assets, raw cuts, and client creatives to the vault."
          actionLabel="+ Upload Asset"
          onAction={() => {
            clearSelectedFile();
            setIsUploadOpen(true);
          }}
          icon={<UploadCloud className="w-6 h-6" />}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map(item => (
            <Card key={item.id} className="overflow-hidden group flex flex-col justify-between">
              <div className="relative aspect-video bg-[#0F172A] overflow-hidden">
                <img
                  src={item.thumbnailUrl}
                  alt={item.fileName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white">
                  {item.folder}
                </span>

                {/* Hover Overlay Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPreviewMedia(item)}
                    className="w-8 h-8 rounded-full bg-white text-[#0F172A] flex items-center justify-center shadow-md hover:bg-[#008000] hover:text-white transition-colors"
                    title="Preview Asset"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMediaItem(item.id)}
                    className="w-8 h-8 rounded-full bg-white text-[#DC2626] flex items-center justify-center shadow-md hover:bg-[#DC2626] hover:text-white transition-colors"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 space-y-1">
                <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate" title={item.fileName}>
                  {item.fileName}
                </h4>
                <p className="text-[10px] text-[#008000] font-semibold truncate">{item.clientName}</p>
                <div className="flex items-center justify-between text-[10px] text-[#94A3B8] pt-1">
                  <span>{item.fileSize}</span>
                  <span>{item.uploadedBy}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Asset Preview Modal */}
      {previewMedia && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewMedia(null)}
          title={previewMedia.fileName}
          description={`Uploaded by ${previewMedia.uploadedBy} on ${previewMedia.uploadedAt} for ${previewMedia.clientName}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-[#64748B]">Size: {previewMedia.fileSize}</span>
              <Button variant="secondary" size="sm" onClick={() => setPreviewMedia(null)}>
                Close Preview
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={previewMedia.thumbnailUrl}
                alt={previewMedia.fileName}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B1120] rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Client Account:</span>
                <span className="font-bold text-[#008000]">{previewMedia.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Storage Folder:</span>
                <span className="font-semibold">{previewMedia.folder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">MIME Type:</span>
                <span className="font-mono">{previewMedia.fileType}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Asset Modal with REAL Click-to-Upload & Drag-and-Drop */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Media Asset"
        description="Select client account, target folder, and upload deliverables with auto compression."
        maxWidth="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsUploadOpen(false)} disabled={uploadProgress !== null}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleUploadSubmit} isLoading={uploadProgress !== null}>
              Start Upload
            </Button>
          </>
        }
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <Select
            label="Client Account"
            value={uploadClientId}
            onChange={e => setUploadClientId(e.target.value)}
          >
            {clients.length === 0 ? (
              <option value="">No clients available (create client first)</option>
            ) : (
              clients.map(c => (
                <option key={c.id} value={c.id}>{c.businessName}</option>
              ))
            )}
          </Select>

          <Select
            label="Target Storage Folder"
            value={uploadFolder}
            onChange={e => setUploadFolder(e.target.value as MediaFolderType)}
          >
            {folders.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </Select>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*,application/pdf,.psd,.ai"
            className="hidden"
          />

          {/* Clickable & Drag-and-Drop Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center space-y-2 cursor-pointer transition-all ${
              isDragging
                ? 'border-[#008000] bg-[#F0FDF4] dark:bg-[#14532D]/30 scale-[1.01]'
                : 'border-[#CBD5E1] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0B1120] hover:border-[#008000] hover:bg-[#F0FDF4]/40 dark:hover:bg-[#14532D]/10'
            }`}
          >
            <UploadCloud className={`w-9 h-9 mx-auto transition-transform ${isDragging ? 'text-[#008000] scale-110' : 'text-[#008000]'}`} />
            <div>
              <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Click to browse files, or drag and drop here
              </p>
              <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Supports MP4, MOV, PNG, JPG, PSD, AI, PDF (up to 500 MB)
              </p>
            </div>
            <span className="inline-block text-[11px] font-semibold text-[#008000] bg-[#DCFCE7] dark:bg-[#14532D] dark:text-[#4ADE80] px-2.5 py-0.5 rounded-full">
              Click to Choose File
            </span>
          </div>

          {/* File Selected Preview Pill */}
          {uploadFileName && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F0FDF4] dark:bg-[#14532D]/30 border border-[#BBF7D0] dark:border-[#166534] text-xs">
              <div className="flex items-center gap-3 min-w-0">
                {uploadThumbnail ? (
                  <img src={uploadThumbnail} alt="Thumbnail preview" className="w-10 h-10 rounded object-cover border" />
                ) : (
                  <div className="w-10 h-10 rounded bg-[#008000]/10 flex items-center justify-center text-[#008000]">
                    <File className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate max-w-[200px]">{uploadFileName}</p>
                  <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{uploadFileSize || 'Ready to upload'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="xs"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change
                </Button>
                <button
                  type="button"
                  onClick={clearSelectedFile}
                  className="p-1 rounded text-[#94A3B8] hover:text-[#DC2626]"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <Input
            label="File Name *"
            required
            placeholder="e.g. food_festival_reel_v3_final.mp4"
            value={uploadFileName}
            onChange={e => setUploadFileName(e.target.value)}
          />

          {uploadProgress !== null && (
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-xs">
                <span>Uploading asset...</span>
                <span className="font-bold text-[#008000]">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full overflow-hidden">
                <div className="h-full bg-[#008000] transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};
