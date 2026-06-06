import { Router } from 'express';
import { GradingController, createGradingScaleSchema, updateGradingScaleSchema } from './grading.controller';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Retrieve scales is allowed for any authenticated user
router.get('/', requireAuth(), GradingController.list);

// Admin-only updates
router.post('/', requireAuth([Role.ADMIN]), validate(createGradingScaleSchema), GradingController.create);
router.post('/reset', requireAuth([Role.ADMIN]), GradingController.reset);
router.put('/:id', requireAuth([Role.ADMIN]), validate(updateGradingScaleSchema), GradingController.update);
router.delete('/:id', requireAuth([Role.ADMIN]), GradingController.delete);

export default router;
