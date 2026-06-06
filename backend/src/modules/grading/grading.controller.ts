import { Request, Response, NextFunction } from 'express';
import { GradingService } from './grading.service';
import { sendSuccess, sendError } from '../../utils/response';
import { z } from 'zod';

export const createGradingScaleSchema = z.object({
  body: z.object({
    letter: z.string().min(1, 'Letter is required'),
    minScore: z.number().min(0).max(100),
    status: z.enum(['Pass', 'Fail']).optional(),
    remarks: z.string().min(1, 'Remarks are required'),
  }),
});

export const updateGradingScaleSchema = z.object({
  body: z.object({
    letter: z.string().optional(),
    minScore: z.number().min(0).max(100).optional(),
    status: z.enum(['Pass', 'Fail']).optional(),
    remarks: z.string().optional(),
  }).partial(),
});

export class GradingController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const scales = await GradingService.list();
      return sendSuccess(res, scales);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const scale = await GradingService.create(req.body);
      return sendSuccess(res, scale, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const scale = await GradingService.update(req.params.id as string, req.body);
      return sendSuccess(res, scale);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const result = await GradingService.delete(req.params.id as string);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async reset(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const scales = await GradingService.resetDefaults();
      return sendSuccess(res, scales);
    } catch (error) {
      next(error);
    }
  }
}
