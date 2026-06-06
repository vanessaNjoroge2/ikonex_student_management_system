import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth());

router.get('/student/:id/pdf', ReportsController.studentPDF);
router.get('/student/:id', ReportsController.student);
router.get('/summary/pdf', ReportsController.classSummaryPDF);
router.get('/class', ReportsController.classSummary);
router.get('/stream-comparison', ReportsController.streamComparison);
router.get('/grade-distribution', ReportsController.gradeDistribution);
router.get('/top-performers', ReportsController.topPerformers);
router.get('/term-trend', ReportsController.termTrend);

export default router;
