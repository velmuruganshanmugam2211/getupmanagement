import { Router } from 'express';
import { getCalendarEvents } from '../controllers/calendar.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeModule } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate, authorizeModule('calendar'));

router.get('/', getCalendarEvents);

export default router;
