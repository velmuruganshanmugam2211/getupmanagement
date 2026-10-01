import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredModule?: 'clients' | 'packages' | 'content' | 'calendar' | 'tasks' | 'campaigns' | 'finance' | 'media' | 'team' | 'reports' | 'settings';
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredModule,
  allowedRoles
}) => {
  const { isAuthenticated, isAuthLoading, currentRole, hasAccess } = useApp();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0F17]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#008000] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
            Verifying secure session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role restrictions if specified
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-8 text-center shadow-lg">
          <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            Access Forbidden (403)
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-2 mb-6">
            Your role (<strong className="text-[#0F172A] dark:text-[#F8FAFC]">{currentRole}</strong>) does not have sufficient administrative permissions to access this area.
          </p>
          <Button variant="primary" size="sm" onClick={() => window.location.href = '/'}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Check module permission if specified
  if (requiredModule && !hasAccess(requiredModule)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-8 text-center shadow-lg">
          <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            Restricted Module
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-2 mb-6">
            The <strong className="capitalize text-[#008000]">{requiredModule}</strong> module is restricted. Your current active role is <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{currentRole}</strong>.
          </p>
          <Button variant="primary" size="sm" onClick={() => window.location.href = '/'}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
