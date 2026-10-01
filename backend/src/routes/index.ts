import { Router } from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import clientRoutes from './client.routes';
import campaignRoutes from './campaign.routes';
import contentRoutes from './content.routes';
import calendarRoutes from './calendar.routes';
import taskRoutes from './task.routes';
import teamRoutes from './team.routes';
import mediaRoutes from './media.routes';
import packageRoutes from './package.routes';
import financeRoutes from './finance.routes';
import reportRoutes from './report.routes';
import notificationRoutes from './notification.routes';
import settingRoutes from './setting.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/clients', clientRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/content', contentRoutes);
router.use('/calendar', calendarRoutes);
router.use('/tasks', taskRoutes);
router.use('/team', teamRoutes);
router.use('/users', teamRoutes);
router.use('/media', mediaRoutes);
router.use('/packages', packageRoutes);
router.use('/finance', financeRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/settings', settingRoutes);

export default router;
