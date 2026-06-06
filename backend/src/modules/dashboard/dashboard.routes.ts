import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth());

router.get('/stats', DashboardController.getStats);
router.get('/activity', DashboardController.getActivity);

export default router;
