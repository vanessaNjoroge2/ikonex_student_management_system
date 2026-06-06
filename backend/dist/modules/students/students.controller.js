"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsController = exports.updateStudentSchema = exports.createStudentSchema = void 0;
const students_service_1 = require("./students.service");
const db_1 = require("../../config/db");
const response_1 = require("../../utils/response");
const pagination_1 = require("../../utils/pagination");
const zod_1 = require("zod");
exports.createStudentSchema = zod_1.z.object({
    body: zod_1.z.object({
        fullName: zod_1.z.string().min(1, 'Full name is required'),
        admissionNumber: zod_1.z.string().min(1, 'Admission number is required'),
        gender: zod_1.z.string().min(1, 'Gender is required'),
        dateOfBirth: zod_1.z.preprocess((val) => new Date(val), zod_1.z.date()),
        nationality: zod_1.z.string().optional(),
        formLevel: zod_1.z.enum(['Form 1', 'Form 2', 'Form 3', 'Form 4'], {
            message: 'Form level must be Form 1, Form 2, Form 3, or Form 4'
        }),
        stream: zod_1.z.enum(['A', 'B', 'C', 'D'], {
            message: 'Stream must be A, B, C, or D'
        }),
        kcpeScore: zod_1.z.preprocess((val) => parseFloat(val), zod_1.z.number().min(0).max(500)),
        enrollmentStatus: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED']),
        admissionDate: zod_1.z.preprocess((val) => new Date(val), zod_1.z.date()).optional(),
        parentName: zod_1.z.string().min(1, 'Parent/guardian name is required'),
        relationship: zod_1.z.string().min(1, 'Relationship is required'),
        parentPhone: zod_1.z.string().min(1, 'Phone number is required'),
        altPhone: zod_1.z.string().optional(),
        attendancePercentage: zod_1.z.preprocess((val) => parseFloat(val), zod_1.z.number().min(0).max(100)).optional(),
        remarks: zod_1.z.string().optional(),
        image: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
    }),
});
exports.updateStudentSchema = zod_1.z.object({
    body: zod_1.z.object({
        fullName: zod_1.z.string().optional(),
        admissionNumber: zod_1.z.string().optional(),
        gender: zod_1.z.string().optional(),
        dateOfBirth: zod_1.z.preprocess((val) => new Date(val), zod_1.z.date()).optional(),
        nationality: zod_1.z.string().optional(),
        formLevel: zod_1.z.enum(['Form 1', 'Form 2', 'Form 3', 'Form 4']).optional(),
        stream: zod_1.z.enum(['A', 'B', 'C', 'D']).optional(),
        kcpeScore: zod_1.z.preprocess((val) => parseFloat(val), zod_1.z.number().min(0).max(500)).optional(),
        enrollmentStatus: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED']).optional(),
        admissionDate: zod_1.z.preprocess((val) => new Date(val), zod_1.z.date()).optional(),
        parentName: zod_1.z.string().optional(),
        relationship: zod_1.z.string().optional(),
        parentPhone: zod_1.z.string().optional(),
        altPhone: zod_1.z.string().optional(),
        attendancePercentage: zod_1.z.preprocess((val) => parseFloat(val), zod_1.z.number().min(0).max(100)).optional(),
        remarks: zod_1.z.string().optional(),
        image: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
    }).partial(),
});
class StudentsController {
    static async list(req, res, next) {
        try {
            const { streamId, search, status } = req.query;
            const { page, limit, skip } = (0, pagination_1.getPaginationParams)(req.query);
            const { students, total } = await students_service_1.StudentsService.listStudents({
                streamId: streamId,
                search: search,
                status: status,
                page,
                limit,
                skip,
                teacherId: req.user.id,
                isAdmin: req.user.role === 'ADMIN',
            });
            return (0, response_1.sendSuccess)(res, students, 200, { page, total, limit });
        }
        catch (error) {
            next(error);
        }
    }
    static async get(req, res, next) {
        try {
            const studentExists = await db_1.prisma.student.findUnique({
                where: { id: req.params.id }
            });
            if (!studentExists || studentExists.isDeleted) {
                return (0, response_1.sendError)(res, 'Student not found', 404, 'NOT_FOUND');
            }
            if (studentExists.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
                return (0, response_1.sendError)(res, 'Access forbidden: student belongs to another teacher', 403, 'FORBIDDEN');
            }
            const student = await students_service_1.StudentsService.getStudent(req.params.id, req.user.id, req.user.role === 'ADMIN');
            return (0, response_1.sendSuccess)(res, student);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const student = await students_service_1.StudentsService.createStudent({
                ...req.body,
                teacherId: req.user.id
            });
            return (0, response_1.sendSuccess)(res, student, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const studentExists = await db_1.prisma.student.findUnique({
                where: { id: req.params.id }
            });
            if (!studentExists || studentExists.isDeleted) {
                return (0, response_1.sendError)(res, 'Student not found', 404, 'NOT_FOUND');
            }
            if (studentExists.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
                return (0, response_1.sendError)(res, 'Access forbidden: student belongs to another teacher', 403, 'FORBIDDEN');
            }
            const student = await students_service_1.StudentsService.updateStudent(req.params.id, req.body);
            return (0, response_1.sendSuccess)(res, student);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const studentExists = await db_1.prisma.student.findUnique({
                where: { id: req.params.id }
            });
            if (!studentExists || studentExists.isDeleted) {
                return (0, response_1.sendError)(res, 'Student not found', 404, 'NOT_FOUND');
            }
            if (studentExists.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
                return (0, response_1.sendError)(res, 'Access forbidden: student belongs to another teacher', 403, 'FORBIDDEN');
            }
            const deleted = await students_service_1.StudentsService.deleteStudent(req.params.id);
            return (0, response_1.sendSuccess)(res, deleted);
        }
        catch (error) {
            next(error);
        }
    }
    static async getScores(req, res, next) {
        try {
            const studentExists = await db_1.prisma.student.findUnique({
                where: { id: req.params.id }
            });
            if (!studentExists || studentExists.isDeleted) {
                return (0, response_1.sendError)(res, 'Student not found', 404, 'NOT_FOUND');
            }
            if (studentExists.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
                return (0, response_1.sendError)(res, 'Access forbidden: student belongs to another teacher', 403, 'FORBIDDEN');
            }
            const grades = await students_service_1.StudentsService.computeGrades(req.params.id, req.user.id, req.user.role === 'ADMIN');
            return (0, response_1.sendSuccess)(res, grades);
        }
        catch (error) {
            next(error);
        }
    }
    static async getReport(req, res, next) {
        try {
            const studentExists = await db_1.prisma.student.findUnique({
                where: { id: req.params.id }
            });
            if (!studentExists || studentExists.isDeleted) {
                return (0, response_1.sendError)(res, 'Student not found', 404, 'NOT_FOUND');
            }
            if (studentExists.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
                return (0, response_1.sendError)(res, 'Access forbidden: student belongs to another teacher', 403, 'FORBIDDEN');
            }
            const student = await students_service_1.StudentsService.getStudent(req.params.id, req.user.id, req.user.role === 'ADMIN');
            const grades = await students_service_1.StudentsService.computeGrades(req.params.id, req.user.id, req.user.role === 'ADMIN');
            return (0, response_1.sendSuccess)(res, {
                student,
                grades,
                summary: {
                    kcpeScore: student.kcpeScore,
                    attendance: student.attendancePercentage,
                    remarks: student.remarks,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.StudentsController = StudentsController;
