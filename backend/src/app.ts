import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';

import authRouter from './modules/auth/auth.routes';
import studentsRouter from './modules/students/students.routes';
import streamsRouter from './modules/streams/streams.routes';
import subjectsRouter from './modules/subjects/subjects.routes';
import scoresRouter from './modules/scores/scores.routes';
import reportsRouter from './modules/reports/reports.routes';
import dashboardRouter from './modules/dashboard/dashboard.routes';
import accountsRouter from './modules/accounts/accounts.routes';
import gradingRouter from './modules/grading/grading.routes';

const app = express();

// Security and Logging middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
  ],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Mounting API routers
app.use('/api/auth', authRouter);
app.use('/api/students', studentsRouter);
app.use('/api/streams', streamsRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/scores', scoresRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/grading-scales', gradingRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
