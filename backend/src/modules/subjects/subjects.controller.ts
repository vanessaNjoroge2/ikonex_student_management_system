import { Request, Response, NextFunction } from 'express';
import { SubjectsService } from './subjects.service';
import { prisma } from '../../config/db';
import { sendSuccess, sendError } from '../../utils/response';
import { z } from 'zod';

export const createSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Subject Name is required'),
    teacherName: z.string().min(1, 'Teacher Name is required'),
    assignedStreams: z.array(z.string()).min(1, 'At least one stream assignment is required'),
    teacherId: z.string().optional(),
  }),
});

export const updateSubjectSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    teacherName: z.string().optional(),
    assignedStreams: z.array(z.string()).optional(),
    teacherId: z.string().optional(),
  }).partial(),
});

export const assignStreamSchema = z.object({
  body: z.object({
    streamId: z.string().min(1, 'Stream ID is required'),
  }),
});

export class SubjectsController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const subjects = await SubjectsService.listSubjects(req.user!.id, req.user!.role === 'ADMIN');
      return sendSuccess(res, subjects);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const subjectExists = await prisma.subject.findUnique({
        where: { id: req.params.id as string }
      });
      if (!subjectExists) {
        return sendError(res, 'Subject not found', 404, 'NOT_FOUND');
      }
      if (subjectExists.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return sendError(res, 'Access forbidden: subject belongs to another teacher', 403, 'FORBIDDEN');
      }

      const subject = await SubjectsService.getSubject(req.params.id as string);
      return sendSuccess(res, subject);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const teacherId = (req.user!.role === 'ADMIN' && req.body.teacherId)
        ? req.body.teacherId
        : req.user!.id;

      let teacherName = req.body.teacherName;
      if (req.user!.role === 'ADMIN' && req.body.teacherId) {
        const tUser = await prisma.prismaUser.findUnique({
          where: { id: req.body.teacherId }
        });
        if (tUser) {
          teacherName = tUser.name;
        }
      }

      const subject = await SubjectsService.createSubject({
        ...req.body,
        teacherId,
        teacherName
      });
      return sendSuccess(res, subject, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const subjectExists = await prisma.subject.findUnique({
        where: { id: req.params.id as string }
      });
      if (!subjectExists) {
        return sendError(res, 'Subject not found', 404, 'NOT_FOUND');
      }
      if (subjectExists.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return sendError(res, 'Access forbidden: subject belongs to another teacher', 403, 'FORBIDDEN');
      }

      const updatePayload = { ...req.body };
      if (req.user!.role === 'ADMIN' && req.body.teacherId) {
        const tUser = await prisma.prismaUser.findUnique({
          where: { id: req.body.teacherId }
        });
        if (tUser) {
          updatePayload.teacherName = tUser.name;
        }
      }

      const subject = await SubjectsService.updateSubject(req.params.id as string, updatePayload);
      return sendSuccess(res, subject);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const subjectExists = await prisma.subject.findUnique({
        where: { id: req.params.id as string }
      });
      if (!subjectExists) {
        return sendError(res, 'Subject not found', 404, 'NOT_FOUND');
      }
      if (subjectExists.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return sendError(res, 'Access forbidden: subject belongs to another teacher', 403, 'FORBIDDEN');
      }

      const deleted = await SubjectsService.deleteSubject(req.params.id as string);
      return sendSuccess(res, deleted);
    } catch (error) {
      next(error);
    }
  }

  static async getStreams(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const subjectExists = await prisma.subject.findUnique({
        where: { id: req.params.id as string }
      });
      if (!subjectExists) {
        return sendError(res, 'Subject not found', 404, 'NOT_FOUND');
      }
      if (subjectExists.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return sendError(res, 'Access forbidden: subject belongs to another teacher', 403, 'FORBIDDEN');
      }

      const streams = await SubjectsService.getSubjectStreams(req.params.id as string);
      return sendSuccess(res, streams);
    } catch (error) {
      next(error);
    }
  }

  static async assignStream(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const subjectExists = await prisma.subject.findUnique({
        where: { id: req.params.id as string }
      });
      if (!subjectExists) {
        return sendError(res, 'Subject not found', 404, 'NOT_FOUND');
      }
      if (subjectExists.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return sendError(res, 'Access forbidden: subject belongs to another teacher', 403, 'FORBIDDEN');
      }

      const assigned = await SubjectsService.assignStream(req.params.id as string, req.body.streamId);
      return sendSuccess(res, assigned);
    } catch (error) {
      next(error);
    }
  }

  static async unassignStream(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const subjectExists = await prisma.subject.findUnique({
        where: { id: req.params.id as string }
      });
      if (!subjectExists) {
        return sendError(res, 'Subject not found', 404, 'NOT_FOUND');
      }
      if (subjectExists.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return sendError(res, 'Access forbidden: subject belongs to another teacher', 403, 'FORBIDDEN');
      }

      await SubjectsService.unassignStream(req.params.id as string, req.params.streamId as string);
      return sendSuccess(res, { success: true });
    } catch (error) {
      next(error);
    }
  }
}
