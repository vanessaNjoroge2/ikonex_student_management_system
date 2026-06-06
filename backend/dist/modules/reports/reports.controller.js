"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const reports_service_1 = require("./reports.service");
const response_1 = require("../../utils/response");
const pdf_service_1 = require("./pdf.service");
const db_1 = require("../../config/db");
class ReportsController {
    static async student(req, res, next) {
        try {
            const { term, year } = req.query;
            const report = await reports_service_1.ReportsService.getStudentReport(req.params.id, term, year ? parseInt(year, 10) : undefined);
            if (!report) {
                return (0, response_1.sendError)(res, 'Student not found', 404, 'NOT_FOUND');
            }
            return (0, response_1.sendSuccess)(res, report);
        }
        catch (error) {
            next(error);
        }
    }
    static async classSummary(req, res, next) {
        try {
            const { streamId, subjectId, term, year } = req.query;
            if (!streamId) {
                return (0, response_1.sendError)(res, 'streamId query parameter is required', 400, 'BAD_REQUEST');
            }
            const summary = await reports_service_1.ReportsService.getClassSummary(streamId, subjectId, term, year ? parseInt(year, 10) : undefined);
            return (0, response_1.sendSuccess)(res, summary);
        }
        catch (error) {
            next(error);
        }
    }
    static async streamComparison(req, res, next) {
        try {
            const { term, year } = req.query;
            const comparison = await reports_service_1.ReportsService.getStreamComparison(term, year ? parseInt(year, 10) : undefined);
            return (0, response_1.sendSuccess)(res, comparison);
        }
        catch (error) {
            next(error);
        }
    }
    static async gradeDistribution(req, res, next) {
        try {
            const { subjectId, streamId, term, year } = req.query;
            const distribution = await reports_service_1.ReportsService.getGradeDistribution(subjectId, streamId, term, year ? parseInt(year, 10) : undefined);
            return (0, response_1.sendSuccess)(res, distribution);
        }
        catch (error) {
            next(error);
        }
    }
    static async topPerformers(req, res, next) {
        try {
            const { term, year, limit } = req.query;
            const performers = await reports_service_1.ReportsService.getTopPerformers(term, year ? parseInt(year, 10) : undefined, limit ? parseInt(limit, 10) : undefined);
            return (0, response_1.sendSuccess)(res, performers);
        }
        catch (error) {
            next(error);
        }
    }
    static async termTrend(req, res, next) {
        try {
            const { streamId, subjectId } = req.query;
            if (!streamId) {
                return (0, response_1.sendError)(res, 'streamId query parameter is required', 400, 'BAD_REQUEST');
            }
            const trend = await reports_service_1.ReportsService.getTermTrend(streamId, subjectId);
            return (0, response_1.sendSuccess)(res, trend);
        }
        catch (error) {
            next(error);
        }
    }
    static async studentPDF(req, res, next) {
        try {
            const { term, year } = req.query;
            const report = await reports_service_1.ReportsService.getStudentReport(req.params.id, term, year ? parseInt(year, 10) : undefined);
            if (!report) {
                return (0, response_1.sendError)(res, 'Student not found', 404, 'NOT_FOUND');
            }
            const pdfBuffer = await pdf_service_1.PDFService.generateStudentReportPDF({
                student: report.student,
                grades: report.grades,
            });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=ReportCard_${report.student.admissionNumber}.pdf`);
            return res.send(pdfBuffer);
        }
        catch (error) {
            next(error);
        }
    }
    static async classSummaryPDF(req, res, next) {
        try {
            const { streamId, term, year } = req.query;
            if (!streamId) {
                return (0, response_1.sendError)(res, 'streamId query parameter is required', 400, 'BAD_REQUEST');
            }
            const summary = await reports_service_1.ReportsService.getClassSummary(streamId, undefined, term, year ? parseInt(year, 10) : undefined);
            const stream = await db_1.prisma.stream.findUnique({
                where: { id: streamId },
                include: { teacher: true }
            });
            if (!stream) {
                return (0, response_1.sendError)(res, 'Stream not found', 404, 'NOT_FOUND');
            }
            let classAvg = 0;
            if (summary.averages.length > 0) {
                const sum = summary.averages.reduce((acc, curr) => acc + (curr['Group Average %'] || 0), 0);
                classAvg = Math.round(sum / summary.averages.length);
            }
            const studentCount = await db_1.prisma.student.count({ where: { streamId: stream.id, isDeleted: false } });
            const pdfBuffer = await pdf_service_1.PDFService.generateClassSummaryPDF({
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
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReportsController = ReportsController;
