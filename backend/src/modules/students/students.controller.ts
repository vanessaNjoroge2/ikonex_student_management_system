import { Request, Response, NextFunction } from 'express';
import { StudentsService } from './students.service';
import { prisma } from '../../config/db';
import { sendSuccess, sendError } from '../../utils/response';
import { getPaginationParams } from '../../utils/pagination';
import { z } from 'zod';

export const createStudentSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    admissionNumber: z.string().min(1, 'Admission number is required'),
    gender: z.string().min(1, 'Gender is required'),
    dateOfBirth: z.preprocess((val) => new Date(val as string), z.date()),
    nationality: z.string().optional(),
    formLevel: z.enum(['Form 1', 'Form 2', 'Form 3', 'Form 4'], {
      message: 'Form level must be Form 1, Form 2, Form 3, or Form 4'
    }),
    stream: z.enum(['A', 'B', 'C', 'D'], {
      message: 'Stream must be A, B, C, or D'
    }),
    kcpeScore: z.preprocess((val) => parseFloat(val as string), z.number().min(0).max(500)),
    enrollmentStatus: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED']),
    admissionDate: z.preprocess((val) => new Date(val as string), z.date()).optional(),
    parentName: z.string().min(1, 'Parent/guardian name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    parentPhone: z.string().min(1, 'Phone number is required'),
    altPhone: z.string().optional(),
    attendancePercentage: z.preprocess((val) => parseFloat(val as string), z.number().min(0).max(100)).optional(),
    remarks: z.string().optional(),
    image: z.string().optional(),
    email: z.preprocess((val) => (val === '' ? undefined : val), z.string().email().optional()),
  }),
});

export const updateStudentSchema = z.object({
  body: z.object({
    fullName: z.string().optional(),
    admissionNumber: z.string().optional(),
    gender: z.string().optional(),
    dateOfBirth: z.preprocess((val) => new Date(val as string), z.date()).optional(),
    nationality: z.string().optional(),
    formLevel: z.enum(['Form 1', 'Form 2', 'Form 3', 'Form 4']).optional(),
    stream: z.enum(['A', 'B', 'C', 'D']).optional(),
    kcpeScore: z.preprocess((val) => parseFloat(val as string), z.number().min(0).max(500)).optional(),
    enrollmentStatus: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED']).optional(),
    admissionDate: z.preprocess((val) => new Date(val as string), z.date()).optional(),
    parentName: z.string().optional(),
    relationship: z.string().optional(),
    parentPhone: z.string().optional(),
    altPhone: z.string().optional(),
    attendancePercentage: z.preprocess((val) => parseFloat(val as string), z.number().min(0).max(100)).optional(),
    remarks: z.string().optional(),
    image: z.string().optional(),
    email: z.preprocess((val) => (val === '' ? undefined : val), z.string().email().optional()),
  }).partial(),
});

export class StudentsController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { streamId, search, status } = req.query;
      const { page, limit, skip } = getPaginationParams(req.query);

      const { students, total } = await StudentsService.listStudents({
        streamId: streamId as string,
        search: search as string,
        status: status as string,
        page,
        limit,
        skip,
        teacherId: req.user!.id,
        isAdmin: req.user!.role === 'ADMIN',
      });

      return sendSuccess(res, students, 200, { page, total, limit });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const studentExists = await prisma.student.findUnique({
        where: { id: req.params.id as string }
      });
      if (!studentExists || studentExists.isDeleted) {
        return sendError(res, 'Student not found', 404, 'NOT_FOUND');
      }
      if (studentExists.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return sendError(res, 'Access forbidden: student belongs to another teacher', 403, 'FORBIDDEN');
      }

      const student = await StudentsService.getStudent(req.params.id as string, req.user!.id, req.user!.role === 'ADMIN');
      return sendSuccess(res, student);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      let teacherId = req.user!.id;

      if (req.user!.role === 'ADMIN') {
        const streamId = `${req.body.formLevel.replace(' ', '')}-${req.body.stream.toUpperCase()}`;
        const stream = await prisma.stream.findUnique({ where: { id: streamId } });
        if (stream && stream.teacherId) {
          teacherId = stream.teacherId;
        } else {
          // Find a teacher associated with this stream first (via subjects in this stream)
          const subjectStream = await prisma.subjectStream.findFirst({
            where: { streamId },
            include: { subject: true }
          });

          if (subjectStream && subjectStream.subject && subjectStream.subject.teacherId) {
            teacherId = subjectStream.subject.teacherId;
          } else {
            // Fall back to the first teacher in the database
            const firstTeacher = await prisma.prismaUser.findFirst({
              where: { role: 'TEACHER', isSuspended: false }
            });
            if (firstTeacher) {
              teacherId = firstTeacher.id;
            }
          }
        }
      }

      const student = await StudentsService.createStudent({
        ...req.body,
        teacherId
      });
      return sendSuccess(res, student, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const studentExists = await prisma.student.findUnique({
        where: { id: req.params.id as string }
      });
      if (!studentExists || studentExists.isDeleted) {
        return sendError(res, 'Student not found', 404, 'NOT_FOUND');
      }
      if (studentExists.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return sendError(res, 'Access forbidden: student belongs to another teacher', 403, 'FORBIDDEN');
      }

      const student = await StudentsService.updateStudent(req.params.id as string, req.body);
      return sendSuccess(res, student);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const studentExists = await prisma.student.findUnique({
        where: { id: req.params.id as string }
      });
      if (!studentExists || studentExists.isDeleted) {
        return sendError(res, 'Student not found', 404, 'NOT_FOUND');
      }
      if (studentExists.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return sendError(res, 'Access forbidden: student belongs to another teacher', 403, 'FORBIDDEN');
      }

      const deleted = await StudentsService.deleteStudent(req.params.id as string);
      return sendSuccess(res, deleted);
    } catch (error) {
      next(error);
    }
  }

  static async getScores(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const studentExists = await prisma.student.findUnique({
        where: { id: req.params.id as string }
      });
      if (!studentExists || studentExists.isDeleted) {
        return sendError(res, 'Student not found', 404, 'NOT_FOUND');
      }
      if (studentExists.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return sendError(res, 'Access forbidden: student belongs to another teacher', 403, 'FORBIDDEN');
      }

      const gradesResult = await StudentsService.computeGrades(req.params.id as string, req.user!.id, req.user!.role === 'ADMIN');
      return sendSuccess(res, gradesResult.grades);
    } catch (error) {
      next(error);
    }
  }

  static async getReport(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const studentExists = await prisma.student.findUnique({
        where: { id: req.params.id as string }
      });
      if (!studentExists || studentExists.isDeleted) {
        return sendError(res, 'Student not found', 404, 'NOT_FOUND');
      }
      if (studentExists.teacherId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return sendError(res, 'Access forbidden: student belongs to another teacher', 403, 'FORBIDDEN');
      }

      const student = await StudentsService.getStudent(req.params.id as string, req.user!.id, req.user!.role === 'ADMIN');
      const gradesResult = await StudentsService.computeGrades(req.params.id as string, req.user!.id, req.user!.role === 'ADMIN');
      return sendSuccess(res, {
        student,
        grades: gradesResult.grades,
        summary: {
          kcpeScore: student!.kcpeScore,
          attendance: student!.attendancePercentage,
          remarks: student!.remarks,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
