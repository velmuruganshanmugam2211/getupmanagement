import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Plus, 
  Bell, 
  Moon, 
  Sun, 
  Users2, 
  CheckSquare, 
  Film, 
  DollarSign, 
  Receipt, 
  ChevronRight,
  ShieldCheck,
  Check,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenMobileSidebar: () => void;
  onOpenAddClient: () => void;
  onOpenAddTask: () => void;
  onOpenAddContent: () => void;
  onOpenAddInvoice: () => void;
  onOpenAddExpense: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenMobileSidebar,
  onOpenAddClient,
  onOpenAddTask,
  onOpenAddContent,
  onOpenAddInvoice,
  onOpenAddExpense
}) => {
  const { 
    currentUser, 
    currentRole, 
    setCurrentRole,
    isDark, 
    toggleDarkMode, 
    unreadNotifsCount, 
    notifications,
    markNotificationRead,
    setIsCommandPaletteOpen,
    showToast,
    logout
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const quickMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quickMenuRef.current && !quickMenuRef.current.contains(e.target as Node)) {
        setQuickCreateOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setNotifsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format breadcrumbs from pathname
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathParts.length === 0 ? ['Dashboard'] : pathParts.map(p => {
    if (p === 'clients') return 'Clients';
    if (p === 'packages') return 'Packages';
    if (p === 'content') return 'Content';
    if (p === 'calendar') return 'Content Calendar';
    if (p === 'tasks') return 'Tasks';
    if (p === 'campaigns') return 'Campaigns';
    if (p === 'finance') return 'Finance';
    if (p === 'payments') return 'Payments';
    if (p === 'invoices') return 'Invoices';
    if (p === 'expenses') return 'Expenses';
    if (p === 'media') return 'Media Library';
    if (p === 'team') return 'Team';
    if (p === 'reports') return 'Reports';
    if (p === 'settings') return 'Settings';
    return p;
  });

  return (
    <header className="h-16 px-4 md:px-6 bg-white dark:bg-[#111827] border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Hamburger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] hidden md:flex items-center justify-center"
          title="Toggle sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">
          <Link to="/" className="hover:text-[#008000] dark:hover:text-[#4ADE80] transition-colors">
            GETUP OS
          </Link>
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span className={index === breadcrumbItems.length - 1 ? 'text-[#0F172A] dark:text-[#F8FAFC] font-semibold' : ''}>
                {item}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center / Right: Global Search & Quick Actions */}
      <div className="flex items-center gap-2.5">
        {/* Global Search Trigger (Ctrl+K) */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 h-9 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] border border-transparent hover:border-[#CBD5E1] text-xs text-[#64748B] dark:text-[#94A3B8] transition-all"
        >
          <Search className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="hidden sm:inline">Search clients, tasks, content...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white dark:bg-[#0F172A] text-[#475569] dark:text-[#CBD5E1] border border-[#CBD5E1] dark:border-[#334155]">
            ⌘K
          </kbd>
        </button>

        {/* Quick Action Dropdown */}
        <div className="relative" ref={quickMenuRef}>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setQuickCreateOpen(!quickCreateOpen)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            <span className="hidden sm:inline">Create</span>
          </Button>

          {quickCreateOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#111827] rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Quick Create
              </div>
              <button
                onClick={() => { setQuickCreateOpen(false); onOpenAddClient(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
              >
                <Users2 className="w-4 h-4 text-[#008000]" />
                <span>Add Client</span>
              </button>
              <button
                onClick={() => { setQuickCreateOpen(false); onOpenAddTask(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
              >
                <CheckSquare className="w-4 h-4 text-[#2563EB]" />
                <span>Create Task</span>
              </button>
              <button
                onClick={() => { setQuickCreateOpen(false); onOpenAddContent(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
              >
                <Film className="w-4 h-4 text-[#D97706]" />
                <span>Add Content</span>
              </button>
              <button
                onClick={() => { setQuickCreateOpen(false); onOpenAddInvoice(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
              >
                <Receipt className="w-4 h-4 text-[#16A34A]" />
                <span>New Invoice</span>
              </button>
              <button
                onClick={() => { setQuickCreateOpen(false); onOpenAddExpense(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
              >
                <DollarSign className="w-4 h-4 text-[#DC2626]" />
                <span>Log Expense</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setNotifsOpen(!notifsOpen)}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#DC2626] ring-2 ring-white dark:ring-[#111827]" />
            )}
          </button>

          {notifsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#111827] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Notifications</span>
                <span className="text-[10px] font-semibold text-[#008000]">{unreadNotifsCount} unread</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#F1F5F9] dark:divide-[#1E293B]">
                {notifications.slice(0, 4).map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.link) navigate(n.link);
                      setNotifsOpen(false);
                    }}
                    className={`p-3 text-xs cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/70 transition-colors ${
                      !n.read ? 'bg-[#F0FDF4]/30 dark:bg-[#14532D]/10' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{n.title}</span>
                      <span className="text-[10px] text-[#94A3B8]">{n.timestamp}</span>
                    </div>
                    <p className="text-[#64748B] dark:text-[#CBD5E1] mt-1 text-[11px] leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-3 pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
                <button
                  onClick={() => { setNotifsOpen(false); navigate('/notifications'); }}
                  className="w-full py-1 text-center text-xs font-semibold text-[#008000] hover:underline"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
          title="Toggle light/dark"
        >
          {isDark ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Avatar with Role pill & Sign Out */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#E2E8F0] dark:border-[#1E293B]">
          <div className="hidden lg:flex items-center gap-2">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-[#008000]"
            />
            <div className="text-left">
              <span className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-none">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-medium text-[#008000] dark:text-[#4ADE80]">
                {currentRole}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#DC2626] dark:text-[#94A3B8] dark:hover:text-[#EF4444] hover:bg-[#FEE2E2]/50 dark:hover:bg-[#EF4444]/10 transition-colors ml-1"
            title="Sign out of GETUP OS"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
