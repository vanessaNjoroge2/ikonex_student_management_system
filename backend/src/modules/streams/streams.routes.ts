import { Router } from 'express';
import { StreamsController } from './streams.controller';
import { requireAuth } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', requireAuth(), StreamsController.list);
router.post('/', requireAuth([Role.ADMIN]), StreamsController.create);
router.get('/:id', requireAuth(), StreamsController.get);
router.get('/:id/students', requireAuth(), StreamsController.getStudents);
router.get('/:id/performance', requireAuth(), StreamsController.getPerformance);
router.put('/:id/teacher', requireAuth([Role.ADMIN]), StreamsController.assignTeacher);

export default router;
