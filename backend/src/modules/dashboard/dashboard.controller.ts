import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { sendSuccess } from '../../utils/response';

export class DashboardController {
  static async getStats(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const stats = await DashboardService.getStats(req.user!.id, req.user!.role === 'ADMIN');
      return sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  static async getActivity(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const activities = await DashboardService.getActivity(req.user!.id, req.user!.role === 'ADMIN');
      return sendSuccess(res, activities);
    } catch (error) {
      next(error);
    }
  }
}
