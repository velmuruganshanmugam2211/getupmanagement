import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users2, 
  Package as PackageIcon, 
  Film, 
  CalendarDays, 
  CheckSquare, 
  Megaphone, 
  DollarSign, 
  FolderGit2, 
  UserCheck, 
  BarChart3, 
  Bell, 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  Moon, 
  Sun, 
  Palette,
  Sparkles,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (o: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const { 
    currentUser, 
    currentRole, 
    setCurrentRole, 
    hasAccess, 
    unreadNotifsCount, 
    isDark, 
    toggleDarkMode,
    showToast,
    logout,
    users,
    switchToUser
  } = useApp();

  const location = useLocation();
  const [contentOpen, setContentOpen] = useState(true);
  const [financeOpen, setFinanceOpen] = useState(true);

  const roles: UserRole[] = ['Super Admin', 'Admin', 'Digital Marketer', 'Designer', 'Video Editor'];

  const navLinkClass = ({ isActive }: { isActive: boolean }) => `
    flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 select-none
    ${isActive 
      ? 'bg-[#008000] text-white shadow-xs font-semibold' 
      : 'text-[#475569] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
    }
  `;

  const subNavLinkClass = ({ isActive }: { isActive: boolean }) => `
    flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150
    ${isActive
      ? 'text-[#008000] dark:text-[#4ADE80] font-semibold bg-[#F0FDF4] dark:bg-[#14532D]/40'
      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
    }
  `;

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-[#111827] border-r border-[#E2E8F0] dark:border-[#1E293B] select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#008000] flex items-center justify-center text-white font-bold shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-[#0F172A] dark:text-white">GETUP</span>
              </div>
              <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium truncate"> Management System</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Scroll */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Main Section */}
        <NavLink to="/" end className={navLinkClass}>
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        {hasAccess('clients') && (
          <NavLink to="/clients" className={navLinkClass}>
            <Users2 className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Clients</span>}
          </NavLink>
        )}

        {hasAccess('packages') && (
          <NavLink to="/packages" className={navLinkClass}>
            <PackageIcon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Packages</span>}
          </NavLink>
        )}

        {/* Content Section with Submenu */}
        {hasAccess('content') && (
          <div>
            <div
              onClick={() => setContentOpen(!contentOpen)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 ${
                location.pathname.startsWith('/content')
                  ? 'text-[#008000] dark:text-[#4ADE80] font-semibold'
                  : 'text-[#475569] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Film className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Content</span>}
              </div>
              {!collapsed && (
                contentOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
              )}
            </div>

            {!collapsed && contentOpen && (
              <div className="ml-5 pl-2 border-l border-[#E2E8F0] dark:border-[#1E293B] mt-1 space-y-0.5">
                <NavLink to="/content" end className={subNavLinkClass}>All Content</NavLink>
                <NavLink to="/content?type=Video" className={subNavLinkClass}>Videos</NavLink>
                <NavLink to="/content?type=Reel" className={subNavLinkClass}>Reels</NavLink>
                <NavLink to="/content?type=Poster" className={subNavLinkClass}>Posters</NavLink>
                <NavLink to="/content?type=Photo" className={subNavLinkClass}>Photos</NavLink>
                <NavLink to="/content?type=Story" className={subNavLinkClass}>Stories</NavLink>
              </div>
            )}
          </div>
        )}

        {hasAccess('calendar') && (
          <NavLink to="/calendar" className={navLinkClass}>
            <CalendarDays className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Content Calendar</span>}
          </NavLink>
        )}

        {hasAccess('tasks') && (
          <NavLink to="/tasks" className={navLinkClass}>
            <CheckSquare className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Tasks</span>}
          </NavLink>
        )}

        {hasAccess('campaigns') && (
          <NavLink to="/campaigns" className={navLinkClass}>
            <Megaphone className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Campaigns</span>}
          </NavLink>
        )}

        {/* Finance Section with Submenu */}
        {hasAccess('finance') && (
          <div>
            <div
              onClick={() => setFinanceOpen(!financeOpen)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 ${
                location.pathname.startsWith('/finance')
                  ? 'text-[#008000] dark:text-[#4ADE80] font-semibold'
                  : 'text-[#475569] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
              }`}
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Finance</span>}
              </div>
              {!collapsed && (
                financeOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
              )}
            </div>

            {!collapsed && financeOpen && (
              <div className="ml-5 pl-2 border-l border-[#E2E8F0] dark:border-[#1E293B] mt-1 space-y-0.5">
                <NavLink to="/finance" end className={subNavLinkClass}>Finance Overview</NavLink>
                <NavLink to="/finance/payments" className={subNavLinkClass}>Payments</NavLink>
                <NavLink to="/finance/invoices" className={subNavLinkClass}>Invoices</NavLink>
                <NavLink to="/finance/expenses" className={subNavLinkClass}>Expenses</NavLink>
              </div>
            )}
          </div>
        )}

        {hasAccess('media') && (
          <NavLink to="/media" className={navLinkClass}>
            <FolderGit2 className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Media Library</span>}
          </NavLink>
        )}

        {hasAccess('team') && (
          <NavLink to="/team" className={navLinkClass}>
            <UserCheck className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Team</span>}
          </NavLink>
        )}

        {hasAccess('reports') && (
          <NavLink to="/reports" className={navLinkClass}>
            <BarChart3 className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Reports</span>}
          </NavLink>
        )}

        <NavLink to="/notifications" className={navLinkClass}>
          <div className="relative shrink-0">
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#DC2626]" />
            )}
          </div>
          {!collapsed && (
            <div className="flex items-center justify-between w-full">
              <span>Notifications</span>
              {unreadNotifsCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#DC2626] text-white font-bold">
                  {unreadNotifsCount}
                </span>
              )}
            </div>
          )}
        </NavLink>

        <NavLink to="/settings" className={navLinkClass}>
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>

      {/* Role Switcher & User Profile Bottom */}
      <div className="p-3 border-t border-[#E2E8F0] dark:border-[#1E293B] shrink-0 bg-[#F8FAFC]/70 dark:bg-[#0B1120]">
        {!collapsed && (currentUser.role === 'Super Admin' || currentUser.role === 'Admin') && (
          <div className="mb-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              <span className="font-semibold uppercase tracking-wider">Switch Team User</span>
              <Sparkles className="w-3 h-3 text-[#008000]" />
            </div>
            <select
              value={currentUser.id}
              onChange={(e) => {
                switchToUser(e.target.value);
              }}
              className="w-full text-xs font-medium py-1.5 px-2 rounded-lg bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#008000]"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} — {u.role}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-[#008000]/40 shrink-0"
            />
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">{currentUser.name}</p>
                <p className="text-[10px] text-[#008000] dark:text-[#4ADE80] font-medium truncate">{currentRole}</p>
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="flex items-center gap-1">
              <button
                onClick={toggleDarkMode}
                title="Toggle theme"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] hover:bg-white dark:hover:bg-[#1E293B] transition-colors"
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-[#F59E0B]" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={logout}
                title="Sign out"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#64748B] hover:text-red-600 dark:text-[#94A3B8] dark:hover:text-red-400 hover:bg-white dark:hover:bg-[#1E293B] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:block transition-all duration-200 h-screen sticky top-0 ${
        collapsed ? 'w-16' : 'w-64'
      }`}>
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 h-full z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
