import { Router } from 'express';
import { 
  getTeam, 
  createTeamMember, 
  updateTeamMember, 
  deleteTeamMember 
} from '../controllers/team.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getTeam);
router.post('/', authorizeRoles('Super Admin', 'Admin'), createTeamMember);
router.put('/:id', authorizeRoles('Super Admin', 'Admin'), updateTeamMember);
router.delete('/:id', authorizeRoles('Super Admin', 'Admin'), deleteTeamMember);

export default router;
