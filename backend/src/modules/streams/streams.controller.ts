import { Request, Response, NextFunction } from 'express';
import { StreamsService } from './streams.service';
import { sendSuccess, sendError } from '../../utils/response';

export class StreamsController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const streams = await StreamsService.listStreams();
      return sendSuccess(res, streams);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const stream = await StreamsService.getStream(req.params.id as string);
      if (!stream) {
        return sendError(res, 'Stream not found', 404, 'NOT_FOUND');
      }
      return sendSuccess(res, stream);
    } catch (error) {
      next(error);
    }
  }

  static async getStudents(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const students = await StreamsService.getStreamStudents(req.params.id as string);
      return sendSuccess(res, students);
    } catch (error) {
      next(error);
    }
  }

  static async getPerformance(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const performance = await StreamsService.getStreamPerformance(req.params.id as string);
      return sendSuccess(res, performance);
    } catch (error) {
      next(error);
    }
  }

  static async assignTeacher(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      const { teacherId } = req.body;
      
      const updated = await StreamsService.assignTeacher(id as string, teacherId);
      return sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { name, room, gradeLevel, type, teacherId } = req.body;
      const newStream = await StreamsService.createStream({ name, room, gradeLevel, type, teacherId });
      return sendSuccess(res, newStream, 201);
    } catch (error) {
      next(error);
    }
  }
}
