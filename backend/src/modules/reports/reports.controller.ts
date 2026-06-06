import { Request, Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';
import { sendSuccess, sendError } from '../../utils/response';
import { PDFService } from './pdf.service';
import { prisma } from '../../config/db';

export class ReportsController {
  static async student(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { term, year } = req.query;
      const report = await ReportsService.getStudentReport(
        req.params.id as string,
        term as string,
        year ? parseInt(year as string, 10) : undefined
      );

      if (!report) {
        return sendError(res, 'Student not found', 404, 'NOT_FOUND');
      }

      return sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }

  static async classSummary(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { streamId, subjectId, term, year } = req.query;
      if (!streamId) {
        return sendError(res, 'streamId query parameter is required', 400, 'BAD_REQUEST');
      }

      const summary = await ReportsService.getClassSummary(
        streamId as string,
        subjectId as string,
        term as string,
        year ? parseInt(year as string, 10) : undefined
      );

      return sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }

  static async streamComparison(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { term, year } = req.query;
      const comparison = await ReportsService.getStreamComparison(
        term as string,
        year ? parseInt(year as string, 10) : undefined
      );

      return sendSuccess(res, comparison);
    } catch (error) {
      next(error);
    }
  }

  static async gradeDistribution(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { subjectId, streamId, term, year } = req.query;
      const distribution = await ReportsService.getGradeDistribution(
        subjectId as string,
        streamId as string,
        term as string,
        year ? parseInt(year as string, 10) : undefined
      );

      return sendSuccess(res, distribution);
    } catch (error) {
      next(error);
    }
  }

  static async topPerformers(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { term, year, limit } = req.query;
      const performers = await ReportsService.getTopPerformers(
        term as string,
        year ? parseInt(year as string, 10) : undefined,
        limit ? parseInt(limit as string, 10) : undefined
      );

      return sendSuccess(res, performers);
    } catch (error) {
      next(error);
    }
  }

  static async termTrend(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { streamId, subjectId } = req.query;
      if (!streamId) {
        return sendError(res, 'streamId query parameter is required', 400, 'BAD_REQUEST');
      }

      const trend = await ReportsService.getTermTrend(
        streamId as string,
        subjectId as string
      );

      return sendSuccess(res, trend);
    } catch (error) {
      next(error);
    }
  }

  static async studentPDF(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { term, year } = req.query;
      const report = await ReportsService.getStudentReport(
        req.params.id as string,
        term as string,
        year ? parseInt(year as string, 10) : undefined
      );

      if (!report) {
        return sendError(res, 'Student not found', 404, 'NOT_FOUND');
      }

      const pdfBuffer = await PDFService.generateStudentReportPDF({
        student: report.student,
        grades: report.grades,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=ReportCard_${report.student.admissionNumber}.pdf`);
      return res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  static async classSummaryPDF(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { streamId, term, year } = req.query;
      if (!streamId) {
        return sendError(res, 'streamId query parameter is required', 400, 'BAD_REQUEST');
      }

      const summary = await ReportsService.getClassSummary(
        streamId as string,
        undefined,
        term as string,
        year ? parseInt(year as string, 10) : undefined
      );

      const stream = await prisma.stream.findUnique({
        where: { id: streamId as string },
        include: { teacher: true }
      });

      if (!stream) {
        return sendError(res, 'Stream not found', 404, 'NOT_FOUND');
      }

      let classAvg = 0;
      if (summary.averages.length > 0) {
        const sum = summary.averages.reduce((acc, curr) => acc + (curr['Group Average %'] || 0), 0);
        classAvg = Math.round(sum / summary.averages.length);
      }

      const studentCount = await prisma.student.count({ where: { streamId: stream.id, isDeleted: false } });

      const pdfBuffer = await PDFService.generateClassSummaryPDF({
        streamName: stream.name,
        room: stream.room,
        teacherName: stream.teacher ? stream.teacher.name : 'Not Assigned',
        averages: summary.averages,
        studentCount,
        classAvg,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=ClassSummary_${stream.name.replace(/\s+/g, '')}.pdf`);
      return res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
}
