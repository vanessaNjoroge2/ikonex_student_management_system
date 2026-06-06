"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoresController = exports.updateScoreSchema = exports.createScoreSchema = void 0;
const scores_service_1 = require("./scores.service");
const db_1 = require("../../config/db");
const response_1 = require("../../utils/response");
const zod_1 = require("zod");
exports.createScoreSchema = zod_1.z.object({
    body: zod_1.z.object({
        studentId: zod_1.z.string().min(1, 'Student ID is required'),
        subjectName: zod_1.z.string().min(1, 'Subject Name is required'),
        examType: zod_1.z.enum(['Exam', 'CA']),
        term: zod_1.z.string().min(1, 'Term is required'),
        year: zod_1.z.number().int().optional(),
        score: zod_1.z.number().min(0, 'Score cannot be negative'),
        maxScore: zod_1.z.number().min(1, 'Max score must be at least 1'),
    }).refine((data) => data.score <= data.maxScore, {
        message: 'Score cannot exceed maximum score',
        path: ['score'],
    }),
});
exports.updateScoreSchema = zod_1.z.object({
    body: zod_1.z.object({
        score: zod_1.z.number().min(0).optional(),
        maxScore: zod_1.z.number().min(1).optional(),
        term: zod_1.z.string().optional(),
        examType: zod_1.z.enum(['Exam', 'CA']).optional(),
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
class ScoresController {
    static async list(req, res, next) {
        try {
            const { studentId, subjectId, streamId, term, year, examType } = req.query;
            const scores = await scores_service_1.ScoresService.listScores({
                studentId: studentId,
                subjectId: subjectId,
                streamId: streamId,
                term: term,
                year: year ? parseInt(year, 10) : undefined,
                examType: examType,
                teacherId: req.user.id,
                isAdmin: req.user.role === 'ADMIN',
            });
            return (0, response_1.sendSuccess)(res, scores);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const score = await scores_service_1.ScoresService.createScore({
                ...req.body,
                teacherId: req.user.id,
                isAdmin: req.user.role === 'ADMIN',
            });
            return (0, response_1.sendSuccess)(res, score, 201);
        }
        catch (error) {
            if (error.status === 409) {
                return (0, response_1.sendError)(res, error.message, 409, 'CONFLICT');
            }
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const scoreExists = await db_1.prisma.score.findUnique({
                where: { id: req.params.id }
            });
            if (!scoreExists) {
                return (0, response_1.sendError)(res, 'Score record not found', 404, 'NOT_FOUND');
            }
            if (scoreExists.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
                return (0, response_1.sendError)(res, 'Access forbidden: score belongs to another teacher', 403, 'FORBIDDEN');
            }
            const score = await scores_service_1.ScoresService.updateScore(req.params.id, req.body);
            return (0, response_1.sendSuccess)(res, score);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const scoreExists = await db_1.prisma.score.findUnique({
                where: { id: req.params.id }
            });
            if (!scoreExists) {
                return (0, response_1.sendError)(res, 'Score record not found', 404, 'NOT_FOUND');
            }
            if (scoreExists.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
                return (0, response_1.sendError)(res, 'Access forbidden: score belongs to another teacher', 403, 'FORBIDDEN');
            }
            const deleted = await scores_service_1.ScoresService.deleteScore(req.params.id);
            return (0, response_1.sendSuccess)(res, deleted);
        }
        catch (error) {
            next(error);
        }
    }
    static async getClassRankings(req, res, next) {
        try {
            const { subjectId, streamId, term } = req.query;
            if (!subjectId || !streamId || !term) {
                return (0, response_1.sendError)(res, 'subjectId, streamId, and term are required query parameters', 400, 'BAD_REQUEST');
            }
            const subjectExists = await db_1.prisma.subject.findUnique({
                where: { id: subjectId }
            });
            if (!subjectExists) {
                return (0, response_1.sendError)(res, 'Subject not found', 404, 'NOT_FOUND');
            }
            if (subjectExists.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
                return (0, response_1.sendError)(res, 'Access forbidden: subject belongs to another teacher', 403, 'FORBIDDEN');
            }
            const rankings = await scores_service_1.ScoresService.getClassRankings(subjectId, streamId, term, req.user.id, req.user.role === 'ADMIN');
            return (0, response_1.sendSuccess)(res, rankings);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ScoresController = ScoresController;
