import { Router } from 'express';
import { 
  getPackages, 
  createPackage, 
  updatePackage, 
  deletePackage,
  getQuotas,
  updateQuotaNumbers,
  generateNewMonthQuotas
} from '../controllers/package.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeModule, authorizeRoles } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate, authorizeModule('packages'));

router.get('/', getPackages);
router.post('/', authorizeRoles('Super Admin', 'Admin'), createPackage);
router.put('/:id', authorizeRoles('Super Admin', 'Admin'), updatePackage);
router.delete('/:id', authorizeRoles('Super Admin', 'Admin'), deletePackage);

// Monthly quotas
router.get('/quotas/all', getQuotas);
router.put('/quotas/:id', updateQuotaNumbers);
router.post('/quotas/generate', authorizeRoles('Super Admin', 'Admin'), generateNewMonthQuotas);

export default router;
