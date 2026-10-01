import { Router } from 'express';
import { 
  getMediaItems, 
  createMediaItem, 
  deleteMediaItem 
} from '../controllers/media.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeModule } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate, authorizeModule('media'));

router.get('/', getMediaItems);
router.post('/', createMediaItem);
router.delete('/:id', deleteMediaItem);

export default router;
