"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const reports_service_1 = require("./reports.service");
const response_1 = require("../../utils/response");
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
}
exports.ReportsController = ReportsController;
