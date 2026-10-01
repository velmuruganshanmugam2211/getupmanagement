import { Router } from 'express';
import { 
  getClients, 
  getClientById, 
  createClient, 
  updateClient, 
  deleteClient 
} from '../controllers/client.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeModule } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate, authorizeModule('clients'));

router.get('/', getClients);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
