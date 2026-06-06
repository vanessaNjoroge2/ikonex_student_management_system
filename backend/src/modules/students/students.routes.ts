import { Router } from 'express';
import { StudentsController, createStudentSchema, updateStudentSchema } from './students.controller';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth());

router.get('/', StudentsController.list);
router.get('/:id', StudentsController.get);
router.post('/', validate(createStudentSchema), StudentsController.create);
router.put('/:id', validate(updateStudentSchema), StudentsController.update);
router.delete('/:id', StudentsController.delete);
router.get('/:id/scores', StudentsController.getScores);
router.get('/:id/report', StudentsController.getReport);

export default router;
