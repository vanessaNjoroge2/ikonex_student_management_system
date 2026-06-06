import { Router } from 'express';
import { SubjectsController, createSubjectSchema, updateSubjectSchema, assignStreamSchema } from './subjects.controller';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth());

router.get('/', SubjectsController.list);
router.get('/:id', SubjectsController.get);
router.post('/', validate(createSubjectSchema), SubjectsController.create);
router.put('/:id', validate(updateSubjectSchema), SubjectsController.update);
router.delete('/:id', SubjectsController.delete);

router.get('/:id/streams', SubjectsController.getStreams);
router.post('/:id/streams', validate(assignStreamSchema), SubjectsController.assignStream);
router.delete('/:id/streams/:streamId', SubjectsController.unassignStream);

export default router;
