import { Router } from 'express';
import { 
  getSettings, 
  updateSettings, 
  getActivityLogs 
} from '../controllers/setting.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeModule } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/', authorizeModule('settings'), getSettings);
router.put('/', authorizeModule('settings'), updateSettings);
router.get('/activity', getActivityLogs);

export default router;
