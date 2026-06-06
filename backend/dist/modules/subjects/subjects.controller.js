"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectsController = exports.assignStreamSchema = exports.updateSubjectSchema = exports.createSubjectSchema = void 0;
const subjects_service_1 = require("./subjects.service");
const db_1 = require("../../config/db");
const response_1 = require("../../utils/response");
const zod_1 = require("zod");
exports.createSubjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Subject Name is required'),
        teacherName: zod_1.z.string().min(1, 'Teacher Name is required'),
        assignedStreams: zod_1.z.array(zod_1.z.string()).min(1, 'At least one stream assignment is required'),
        teacherId: zod_1.z.string().optional(),
    }),
});
exports.updateSubjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        teacherName: zod_1.z.string().optional(),
        assignedStreams: zod_1.z.array(zod_1.z.string()).optional(),
        teacherId: zod_1.z.string().optional(),
    }).partial(),
});
exports.assignStreamSchema = zod_1.z.object({
    body: zod_1.z.object({
        streamId: zod_1.z.string().min(1, 'Stream ID is required'),
    }),
});
class SubjectsController {
    static async list(req, res, next) {
        try {
            const subjects = await subjects_service_1.SubjectsService.listSubjects(req.user.id, req.user.role === 'ADMIN');
            return (0, response_1.sendSuccess)(res, subjects);
        }
        catch (error) {
            next(error);
        }
    }
    static async get(req, res, next) {
        try {
            const subjectExists = await db_1.prisma.subject.findUnique({
                where: { id: req.params.id }
            });
            if (!subjectExists) {
                return (0, response_1.sendError)(res, 'Subject not found', 404, 'NOT_FOUND');
            }
            if (subjectExists.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
                return (0, response_1.sendError)(res, 'Access forbidden: subject belongs to another teacher', 403, 'FORBIDDEN');
            }
            const subject = await subjects_service_1.SubjectsService.getSubject(req.params.id);
            return (0, response_1.sendSuccess)(res, subject);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const teacherId = (req.user.role === 'ADMIN' && req.body.teacherId)
                ? req.body.teacherId
                : req.user.id;
            let teacherName = req.body.teacherName;
            if (req.user.role === 'ADMIN' && req.body.teacherId) {
                const tUser = await db_1.prisma.prismaUser.findUnique({
                    where: { id: req.body.teacherId }
                });
                if (tUser) {
                    teacherName = tUser.name;
                }
            }
            const subject = await subjects_service_1.SubjectsService.createSubject({
                ...req.body,
                teacherId,
                teacherName
            });
            return (0, response_1.sendSuccess)(res, subject, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const subjectExists = await db_1.prisma.subject.findUnique({
                where: { id: req.params.id }
            });
            if (!subjectExists) {
                return (0, response_1.sendError)(res, 'Subject not found', 404, 'NOT_FOUND');
            }
            if (subjectExists.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
                return (0, response_1.sendError)(res, 'Access forbidden: subject belongs to another teacher', 403, 'FORBIDDEN');
            }
            const updatePayload = { ...req.body };
            if (req.user.role === 'ADMIN' && req.body.teacherId) {
                const tUser = await db_1.prisma.prismaUser.findUnique({
                    where: { id: req.body.teacherId }
                });
                if (tUser) {
                    updatePayload.teacherName = tUser.name;
                }
            }
            const subject = await subjects_service_1.SubjectsService.updateSubject(req.params.id, updatePayload);
            return (0, response_1.sendSuccess)(res, subject);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const subjectExists = await db_1.prisma.subject.findUnique({
                where: { id: req.params.id }
            });
            if (!subjectExists) {
                return (0, response_1.sendError)(res, 'Subject not found', 404, 'NOT_FOUND');
            }
            if (subjectExists.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
                return (0, response_1.sendError)(res, 'Access forbidden: subject belongs to another teacher', 403, 'FORBIDDEN');
            }
            const deleted = await subjects_service_1.SubjectsService.deleteSubject(req.params.id);
            return (0, response_1.sendSuccess)(res, deleted);
        }
        catch (error) {
            next(error);
        }
    }
    static async getStreams(req, res, next) {
        try {
            const subjectExists = await db_1.prisma.subject.findUnique({
                where: { id: req.params.id }
            });
            if (!subjectExists) {
                return (0, response_1.sendError)(res, 'Subject not found', 404, 'NOT_FOUND');
            }
            if (subjectExists.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
                return (0, response_1.sendError)(res, 'Access forbidden: subject belongs to another teacher', 403, 'FORBIDDEN');
            }
            const streams = await subjects_service_1.SubjectsService.getSubjectStreams(req.params.id);
            return (0, response_1.sendSuccess)(res, streams);
        }
        catch (error) {
            next(error);
        }
    }
    static async assignStream(req, res, next) {
        try {
            const subjectExists = await db_1.prisma.subject.findUnique({
                where: { id: req.params.id }
            });
            if (!subjectExists) {
                return (0, response_1.sendError)(res, 'Subject not found', 404, 'NOT_FOUND');
            }
            if (subjectExists.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
                return (0, response_1.sendError)(res, 'Access forbidden: subject belongs to another teacher', 403, 'FORBIDDEN');
            }
            const assigned = await subjects_service_1.SubjectsService.assignStream(req.params.id, req.body.streamId);
            return (0, response_1.sendSuccess)(res, assigned);
        }
        catch (error) {
            next(error);
        }
    }
    static async unassignStream(req, res, next) {
        try {
            const subjectExists = await db_1.prisma.subject.findUnique({
                where: { id: req.params.id }
            });
            if (!subjectExists) {
                return (0, response_1.sendError)(res, 'Subject not found', 404, 'NOT_FOUND');
            }
            if (subjectExists.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
                return (0, response_1.sendError)(res, 'Access forbidden: subject belongs to another teacher', 403, 'FORBIDDEN');
            }
            await subjects_service_1.SubjectsService.unassignStream(req.params.id, req.params.streamId);
            return (0, response_1.sendSuccess)(res, { success: true });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SubjectsController = SubjectsController;
