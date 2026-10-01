import { Router } from 'express';
import { getReportsData } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeModule } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate, authorizeModule('reports'));

router.get('/', getReportsData);

export default router;
