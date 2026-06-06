import { Request, Response, NextFunction } from 'express';
import { ScoresService } from './scores.service';
import { prisma } from '../../config/db';
import { sendSuccess, sendError } from '../../utils/response';
import { z } from 'zod';

export const createScoreSchema = z.object({
  body: z.object({
    studentId: z.string().min(1, 'Student ID is required'),
    subjectName: z.string().min(1, 'Subject Name is required'),
    examType: z.enum(['Exam', 'CA']),
    term: z.string().min(1, 'Term is required'),
    year: z.number().int().optional(),
    score: z.number().min(0, 'Score cannot be negative'),
    maxScore: z.number().min(1, 'Max score must be at least 1'),
  }).refine((data) => data.score <= data.maxScore, {
    message: 'Score cannot exceed maximum score',
    path: ['score'],
  }),
});

export const updateScoreSchema = z.object({
  body: z.object({
    score: z.number().min(0).optional(),
    maxScore: z.number().min(1).optional(),
    term: z.string().optional(),
    examType: z.enum(['Exam', 'CA']).optional(),
  }).refine((data) => {
    if (data.score !== undefined && data.maxScore !== undefined) {
      return data.score <= data.maxScore;
    }
    return true;
  }, {
    message: 'Score cannot exceed maximum score',
    path: ['score'],
  }),
});


export class ScoresController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { studentId, subjectId, streamId, term, year, examType } = req.query;

      const scores = await ScoresService.listScores({
        studentId: studentId as string,
        subjectId: subjectId as string,
        streamId: streamId as string,
        term: term as string,
        year: year ? parseInt(year as string, 10) : undefined,
        examType: examType as string,
        teacherId: req.user!.id,
        isAdmin: req.user!.role === 'ADMIN',
      });

      return sendSuccess(res, scores);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const score = await ScoresService.createScore({
        ...req.body,
        teacherId: req.user!.id,
        isAdmin: req.user!.role === 'ADMIN',
      });
      return sendSuccess(res, score, 201);
    } catch (error: any) {
      if (error.status === 409) {
        return sendError(res, error.message, 409, 'CONFLICT');
      }
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const scoreExists = await prisma.score.findUnique({
        where: { id: req.params.id as string }
      });
      if (!scoreExists) {
        return sendError(res, 'Score record not found', 404, 'NOT_FOUND');
      }
      if (scoreExists.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return sendError(res, 'Access forbidden: score belongs to another teacher', 403, 'FORBIDDEN');
      }

      const score = await ScoresService.updateScore(req.params.id as string, req.body);
      return sendSuccess(res, score);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const scoreExists = await prisma.score.findUnique({
        where: { id: req.params.id as string }
      });
      if (!scoreExists) {
        return sendError(res, 'Score record not found', 404, 'NOT_FOUND');
      }
      if (scoreExists.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return sendError(res, 'Access forbidden: score belongs to another teacher', 403, 'FORBIDDEN');
      }

      const deleted = await ScoresService.deleteScore(req.params.id as string);
      return sendSuccess(res, deleted);
    } catch (error) {
      next(error);
    }
  }

  static async getClassRankings(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { subjectId, streamId, term } = req.query;
      if (!subjectId || !streamId || !term) {
        return sendError(
          res,
          'subjectId, streamId, and term are required query parameters',
          400,
          'BAD_REQUEST'
        );
      }

      const subjectExists = await prisma.subject.findUnique({
        where: { id: subjectId as string }
      });
      if (!subjectExists) {
        return sendError(res, 'Subject not found', 404, 'NOT_FOUND');
      }
      if (subjectExists.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return sendError(res, 'Access forbidden: subject belongs to another teacher', 403, 'FORBIDDEN');
      }

      const rankings = await ScoresService.getClassRankings(
        subjectId as string,
        streamId as string,
        term as string,
        req.user!.id,
        req.user!.role === 'ADMIN'
      );

      return sendSuccess(res, rankings);
    } catch (error) {
      next(error);
    }
  }
}
