import { Router } from 'express';
import { 
  getCampaigns, 
  createCampaign, 
  updateCampaign, 
  deleteCampaign 
} from '../controllers/campaign.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeModule } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate, authorizeModule('campaigns'));

router.get('/', getCampaigns);
router.post('/', createCampaign);
router.put('/:id', updateCampaign);
router.delete('/:id', deleteCampaign);

export default router;
