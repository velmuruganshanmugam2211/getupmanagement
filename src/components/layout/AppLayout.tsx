import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import { ToastContainer } from '../ui/ToastContainer';
import { ClientFormModal } from '../forms/ClientFormModal';
import { TaskFormModal } from '../forms/TaskFormModal';
import { ContentFormModal } from '../forms/ContentFormModal';
import { InvoiceFormModal } from '../forms/InvoiceFormModal';
import { ExpenseFormModal } from '../forms/ExpenseFormModal';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Global Quick Modals
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC]">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setCollapsed(!collapsed)}
          onOpenMobileSidebar={() => setMobileOpen(true)}
          onOpenAddClient={() => setIsAddClientOpen(true)}
          onOpenAddTask={() => setIsAddTaskOpen(true)}
          onOpenAddContent={() => setIsAddContentOpen(true)}
          onOpenAddInvoice={() => setIsAddInvoiceOpen(true)}
          onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        />

        {/* Page Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* Global Toast Container */}
      <ToastContainer />

      {/* Global Quick Action Modals */}
      <ClientFormModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
      />

      <TaskFormModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
      />

      <ContentFormModal
        isOpen={isAddContentOpen}
        onClose={() => setIsAddContentOpen(false)}
      />

      <InvoiceFormModal
        isOpen={isAddInvoiceOpen}
        onClose={() => setIsAddInvoiceOpen(false)}
      />

      <ExpenseFormModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
      />
    </div>
  );
};
