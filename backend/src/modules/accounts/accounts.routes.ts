import { Router } from 'express';
import { AccountsController, createAccountSchema, updateAccountSchema, resetPasswordSchema, updateProfileSchema } from './accounts.controller';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Profile update (any authenticated user)
router.put('/profile', requireAuth(), validate(updateProfileSchema), AccountsController.updateProfile);

// Admin-only endpoints
router.get('/', requireAuth([Role.ADMIN]), AccountsController.list);
router.post('/', requireAuth([Role.ADMIN]), validate(createAccountSchema), AccountsController.create);
router.get('/logs', requireAuth([Role.ADMIN]), AccountsController.getLogs);
router.put('/:id', requireAuth([Role.ADMIN]), validate(updateAccountSchema), AccountsController.update);
router.put('/:id/reset-password', requireAuth([Role.ADMIN]), validate(resetPasswordSchema), AccountsController.resetPassword);
router.delete('/:id', requireAuth([Role.ADMIN]), AccountsController.delete);

export default router;
