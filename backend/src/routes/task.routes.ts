import { Router } from 'express';
import { 
  getTasks, 
  createTask, 
  updateTask, 
  updateTaskStatus, 
  deleteTask 
} from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeModule } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate, authorizeModule('tasks'));

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', deleteTask);

export default router;
