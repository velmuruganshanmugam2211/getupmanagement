import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  AlertCircle,
  ExternalLink 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const NotificationsPage: React.FC = () => {
  const { 
    notifications, 
    unreadNotifsCount, 
    markNotificationRead, 
    markAllNotificationsRead 
  } = useApp();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'danger': return <AlertCircle className="w-5 h-5 text-[#DC2626]" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-[#D97706]" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />;
      default: return <Info className="w-5 h-5 text-[#2563EB]" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
              Notifications & Operational Alerts
            </h1>
            {unreadNotifsCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#FEE2E2] text-[#DC2626]">
                {unreadNotifsCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Real-time triggers on overdue payments, approaching client contract expirations, and production deadlines.
          </p>
        </div>

        {unreadNotifsCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={markAllNotificationsRead}
            leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-[#008000] text-white shadow-xs'
              : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'unread'
              ? 'bg-[#008000] text-white shadow-xs'
              : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]'
          }`}
        >
          Unread Only ({unreadNotifsCount})
        </button>
      </div>

      {/* Notifications List */}
      <Card className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#94A3B8]">
            No notifications in this filter view.
          </div>
        ) : (
          filtered.map(notif => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationRead(notif.id);
                if (notif.link) navigate(notif.link);
              }}
              className={`p-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/60 transition-colors ${
                !notif.read ? 'bg-[#F0FDF4]/30 dark:bg-[#14532D]/10' : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">{notif.title}</h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#008000]" />
                    )}
                  </div>
                  <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-[#94A3B8] block">{notif.timestamp}</span>
                </div>
              </div>

              {notif.link && (
                <span className="text-xs text-[#008000] dark:text-[#4ADE80] font-semibold shrink-0 flex items-center gap-1 hover:underline">
                  Open <ExternalLink className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          ))
        )}
      </Card>
    </div>
  );
};
