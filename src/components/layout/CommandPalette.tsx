import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Users2, 
  Film, 
  CheckSquare, 
  Receipt, 
  UserCheck, 
  ArrowRight,
  X 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    clients, 
    contents, 
    tasks, 
    invoices, 
    users 
  } = useApp();

  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const q = query.toLowerCase().trim();

  // Filter entities
  const filteredClients = clients.filter(c => 
    c.businessName.toLowerCase().includes(q) || 
    c.industry.toLowerCase().includes(q) ||
    c.contactPerson.toLowerCase().includes(q)
  ).slice(0, 4);

  const filteredContent = contents.filter(cnt => 
    cnt.title.toLowerCase().includes(q) || 
    cnt.clientName.toLowerCase().includes(q) ||
    cnt.contentType.toLowerCase().includes(q)
  ).slice(0, 4);

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(q) || 
    t.clientName.toLowerCase().includes(q) ||
    t.assignedToName.toLowerCase().includes(q)
  ).slice(0, 4);

  const filteredInvoices = invoices.filter(i => 
    i.invoiceNumber.toLowerCase().includes(q) || 
    i.clientName.toLowerCase().includes(q)
  ).slice(0, 3);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(q) || 
    u.role.toLowerCase().includes(q)
  ).slice(0, 3);

  const totalResults = filteredClients.length + filteredContent.length + filteredTasks.length + filteredInvoices.length + filteredUsers.length;

  const handleSelect = (path: string) => {
    setIsCommandPaletteOpen(false);
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={() => setIsCommandPaletteOpen(false)} 
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-[#111827] rounded-xl border border-[#CBD5E1] dark:border-[#1E293B] shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-100">
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3 border-b border-[#E2E8F0] dark:border-[#1E293B] gap-3">
          <Search className="w-5 h-5 text-[#008000] shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search clients, tasks, content, invoices, team..."
            className="w-full bg-transparent text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#94A3B8] bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {totalResults === 0 && (
            <div className="py-8 text-center text-xs text-[#94A3B8]">
              No results found for "{query}". Try searching by client name or task title.
            </div>
          )}

          {/* Clients Section */}
          {filteredClients.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-2 mb-1 flex items-center gap-1.5">
                <Users2 className="w-3 h-3 text-[#008000]" /> Clients
              </div>
              <div className="space-y-0.5">
                {filteredClients.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleSelect(`/clients/${c.id}`)}
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs hover:bg-[#F0FDF4] dark:hover:bg-[#14532D]/30 cursor-pointer group"
                  >
                    <div>
                      <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{c.businessName}</span>
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] ml-2">({c.industry})</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#008000] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Section */}
          {filteredContent.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-2 mb-1 flex items-center gap-1.5">
                <Film className="w-3 h-3 text-[#D97706]" /> Content
              </div>
              <div className="space-y-0.5">
                {filteredContent.map(cnt => (
                  <div
                    key={cnt.id}
                    onClick={() => handleSelect('/content')}
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{cnt.title}</span>
                      <span className="text-[11px] text-[#008000] ml-2">[{cnt.contentType} • {cnt.clientName}]</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#008000] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Section */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-2 mb-1 flex items-center gap-1.5">
                <CheckSquare className="w-3 h-3 text-[#2563EB]" /> Tasks
              </div>
              <div className="space-y-0.5">
                {filteredTasks.map(t => (
                  <div
                    key={t.id}
                    onClick={() => handleSelect('/tasks')}
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{t.title}</span>
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] ml-2">({t.assignedToName} • {t.status})</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#008000] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoices Section */}
          {filteredInvoices.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-2 mb-1 flex items-center gap-1.5">
                <Receipt className="w-3 h-3 text-[#16A34A]" /> Invoices
              </div>
              <div className="space-y-0.5">
                {filteredInvoices.map(inv => (
                  <div
                    key={inv.id}
                    onClick={() => handleSelect('/finance/invoices')}
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] cursor-pointer group"
                  >
                    <div>
                      <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{inv.invoiceNumber}</span>
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] ml-2">₹{inv.total.toLocaleString()} — {inv.clientName}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#008000] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Members Section */}
          {filteredUsers.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-2 mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3 h-3 text-[#9333EA]" /> Team Members
              </div>
              <div className="space-y-0.5">
                {filteredUsers.map(u => (
                  <div
                    key={u.id}
                    onClick={() => handleSelect('/team')}
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                      <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{u.name}</span>
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">({u.role})</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#008000] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-[#F8FAFC] dark:bg-[#0B1120] border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between text-[11px] text-[#94A3B8]">
          <span>Navigate with mouse or keyboard</span>
          <span>GETUP OS Global Command</span>
        </div>
      </div>
    </div>
  );
};
