import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Film, 
  Filter 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Input';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { ContentFormModal } from '../../components/forms/ContentFormModal';
import { ContentItem } from '../../types';

export const CalendarPage: React.FC = () => {
  const { contents, clients } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date('2026-09-29'));
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [clientFilter, setClientFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDateForCreate, setSelectedDateForCreate] = useState<string | undefined>(undefined);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date('2026-09-29'));
  };

  // Build grid days for Month view
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, dayNum);
    const dateStr = prevMonthDate.toISOString().split('T')[0];
    calendarDays.push({ dayNum, dateStr, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ dayNum: d, dateStr: dStr, isCurrentMonth: true });
  }

  // Next month leading days to complete 35 or 42 grid cells
  const remainingCells = 35 - calendarDays.length > 0 ? 35 - calendarDays.length : 42 - calendarDays.length;
  for (let n = 1; n <= remainingCells; n++) {
    const nextDate = new Date(year, month + 1, n);
    const dateStr = nextDate.toISOString().split('T')[0];
    calendarDays.push({ dayNum: n, dateStr, isCurrentMonth: false });
  }

  // Filter items
  const filteredContents = contents.filter(c => {
    const matchesClient = clientFilter === 'all' || c.clientId === clientFilter;
    const matchesType = typeFilter === 'all' || c.contentType === typeFilter;
    return matchesClient && matchesType;
  });

  const getEventsForDate = (dateStr: string) => {
    return filteredContents.filter(c => c.publishDate === dateStr);
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDateForCreate(dateStr);
    setIsAddOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            Content Publishing Calendar
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Cross-client editorial calendar for scheduling, production coordination, and visual release timelines.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setSelectedDateForCreate(new Date().toISOString().split('T')[0]);
            setIsAddOpen(true);
          }}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Schedule Post
        </Button>
      </div>

      {/* Calendar Controls & Filter Bar */}
      <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Title & Nav */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-[#CBD5E1] dark:border-[#334155] rounded-lg overflow-hidden bg-white dark:bg-[#111827]">
            <button
              onClick={handlePrev}
              className="p-1.5 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#64748B]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border-x border-[#CBD5E1] dark:border-[#334155]"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#64748B]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] ml-2">
            {monthNames[month]} {year}
          </h2>
        </div>

        {/* View Switcher & Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Buttons */}
          <div className="flex p-0.5 bg-[#F1F5F9] dark:bg-[#1E293B] rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'month' ? 'bg-white dark:bg-[#111827] text-[#008000] shadow-xs' : 'text-[#64748B]'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'week' ? 'bg-white dark:bg-[#111827] text-[#008000] shadow-xs' : 'text-[#64748B]'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'day' ? 'bg-white dark:bg-[#111827] text-[#008000] shadow-xs' : 'text-[#64748B]'
              }`}
            >
              Day
            </button>
          </div>

          <div className="w-40">
            <Select
              value={clientFilter}
              onChange={e => setClientFilter(e.target.value)}
            >
              <option value="all">All Clients</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.businessName}</option>
              ))}
            </Select>
          </div>

          <div className="w-36">
            <Select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Video">Video</option>
              <option value="Reel">Reel</option>
              <option value="Poster">Poster</option>
              <option value="Photo">Photo</option>
              <option value="Story">Story</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Calendar Grid View (Month) */}
      {viewMode === 'month' && (
        <Card className="overflow-hidden">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0B1120] text-center text-xs font-bold text-[#475569] dark:text-[#94A3B8] py-2.5">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
            {calendarDays.map((cell, idx) => {
              const dayEvents = getEventsForDate(cell.dateStr);
              const isToday = cell.dateStr === '2026-09-29';

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(cell.dateStr)}
                  className={`min-h-[110px] p-1.5 transition-colors cursor-pointer group ${
                    cell.isCurrentMonth
                      ? 'bg-white dark:bg-[#111827] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40'
                      : 'bg-[#F8FAFC]/50 dark:bg-[#0B1120]/40 text-[#94A3B8]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-[#008000] text-white font-bold shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-[#0F172A] dark:text-[#F8FAFC]'
                          : 'text-[#94A3B8]'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    <button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 text-[#008000] p-0.5 rounded hover:bg-[#F0FDF4] transition-opacity"
                      title="Quick Schedule"
                      onClick={(e) => { e.stopPropagation(); handleDayClick(cell.dateStr); }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Day Events Stack */}
                  <div className="space-y-1">
                    {dayEvents.map(evt => (
                      <div
                        key={evt.id}
                        onClick={(e) => { e.stopPropagation(); setEditingContent(evt); }}
                        className={`px-2 py-1 rounded text-[11px] font-medium border truncate transition-all ${
                          evt.status === 'Published'
                            ? 'bg-[#F0FDF4] text-[#008000] border-[#BBF7D0] dark:bg-[#14532D]/40 dark:border-[#166534]'
                            : evt.status === 'Scheduled'
                            ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] dark:bg-[#1E3A8A]/30 dark:border-[#1E40AF]'
                            : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A] dark:bg-[#78350F]/30 dark:border-[#92400E]'
                        }`}
                        title={`${evt.title} (${evt.clientName} - ${evt.assignedToName})`}
                      >
                        <span className="font-bold mr-1">[{evt.contentType}]</span>
                        <span>{evt.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Week / Day View Placeholder for seamless view */}
      {viewMode !== 'month' && (
        <Card className="p-6 text-center space-y-3">
          <CalendarIcon className="w-8 h-8 text-[#008000] mx-auto" />
          <h3 className="font-bold text-sm">Showing Detailed {viewMode === 'week' ? 'Week' : 'Day'} View</h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Switching back to standard monthly calendar view will display all active scheduled items.
          </p>
          <Button variant="secondary" size="sm" onClick={() => setViewMode('month')}>
            Return to Month View
          </Button>
        </Card>
      )}

      {/* Modals */}
      <ContentFormModal
        isOpen={isAddOpen}
        onClose={() => { setIsAddOpen(false); setSelectedDateForCreate(undefined); }}
        defaultDate={selectedDateForCreate}
      />

      {editingContent && (
        <ContentFormModal
          isOpen={true}
          onClose={() => setEditingContent(null)}
          initialData={editingContent}
        />
      )}
    </div>
  );
};
