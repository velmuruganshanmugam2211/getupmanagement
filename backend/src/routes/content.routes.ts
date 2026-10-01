import { Router } from 'express';
import { 
  getContents, 
  createContent, 
  updateContent, 
  updateContentStatus, 
  deleteContent 
} from '../controllers/content.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeModule } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate, authorizeModule('content'));

router.get('/', getContents);
router.post('/', createContent);
router.put('/:id', updateContent);
router.patch('/:id/status', updateContentStatus);
router.delete('/:id', deleteContent);

export default router;
