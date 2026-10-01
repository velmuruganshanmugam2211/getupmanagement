import api from './api';

export interface CalendarEventItem {
  id: string;
  title: string;
  date: string;
  publishDate: string;
  dueDate: string;
  contentType: string;
  platform: string;
  clientName: string;
  clientId: string;
  status: string;
  assignedToName: string;
  priority: string;
}

export const calendarService = {
  getEvents: async (clientId?: string, type?: string): Promise<CalendarEventItem[]> => {
    return api.get<CalendarEventItem[]>('/calendar', { params: { clientId, type } });
  },
};

export default calendarService;
