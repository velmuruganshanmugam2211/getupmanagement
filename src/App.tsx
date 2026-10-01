import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ClientsPage } from './pages/clients/ClientsPage';
import { ClientDetailPage } from './pages/clients/ClientDetailPage';
import { PackagesPage } from './pages/packages/PackagesPage';
import { ContentPage } from './pages/content/ContentPage';
import { CalendarPage } from './pages/calendar/CalendarPage';
import { TasksPage } from './pages/tasks/TasksPage';
import { CampaignsPage } from './pages/campaigns/CampaignsPage';
import { FinancePage } from './pages/finance/FinancePage';
import { MediaPage } from './pages/media/MediaPage';
import { TeamPage } from './pages/team/TeamPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { SettingsPage } from './pages/settings/SettingsPage';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Agency Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="clients" element={<ProtectedRoute requiredModule="clients"><ClientsPage /></ProtectedRoute>} />
            <Route path="clients/:id" element={<ProtectedRoute requiredModule="clients"><ClientDetailPage /></ProtectedRoute>} />
            <Route path="packages" element={<ProtectedRoute requiredModule="packages"><PackagesPage /></ProtectedRoute>} />
            <Route path="content" element={<ProtectedRoute requiredModule="content"><ContentPage /></ProtectedRoute>} />
            <Route path="calendar" element={<ProtectedRoute requiredModule="calendar"><CalendarPage /></ProtectedRoute>} />
            <Route path="tasks" element={<ProtectedRoute requiredModule="tasks"><TasksPage /></ProtectedRoute>} />
            <Route path="campaigns" element={<ProtectedRoute requiredModule="campaigns"><CampaignsPage /></ProtectedRoute>} />
            <Route path="finance" element={<ProtectedRoute requiredModule="finance"><FinancePage /></ProtectedRoute>} />
            <Route path="finance/payments" element={<ProtectedRoute requiredModule="finance"><FinancePage /></ProtectedRoute>} />
            <Route path="finance/invoices" element={<ProtectedRoute requiredModule="finance"><FinancePage /></ProtectedRoute>} />
            <Route path="finance/expenses" element={<ProtectedRoute requiredModule="finance"><FinancePage /></ProtectedRoute>} />
            <Route path="media" element={<ProtectedRoute requiredModule="media"><MediaPage /></ProtectedRoute>} />
            <Route path="team" element={<ProtectedRoute requiredModule="team"><TeamPage /></ProtectedRoute>} />
            <Route path="reports" element={<ProtectedRoute requiredModule="reports"><ReportsPage /></ProtectedRoute>} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<ProtectedRoute requiredModule="settings"><SettingsPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
