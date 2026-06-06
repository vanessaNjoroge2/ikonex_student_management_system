import { Router } from 'express';
import { ScoresController, createScoreSchema, updateScoreSchema } from './scores.controller';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth());

router.get('/', ScoresController.list);
router.get('/class', ScoresController.getClassRankings);
router.post('/', validate(createScoreSchema), ScoresController.create);
router.put('/:id', validate(updateScoreSchema), ScoresController.update);
router.delete('/:id', ScoresController.delete);

export default router;
