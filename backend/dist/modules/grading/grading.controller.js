"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradingController = exports.updateGradingScaleSchema = exports.createGradingScaleSchema = void 0;
const grading_service_1 = require("./grading.service");
const response_1 = require("../../utils/response");
const zod_1 = require("zod");
exports.createGradingScaleSchema = zod_1.z.object({
    body: zod_1.z.object({
        letter: zod_1.z.string().min(1, 'Letter is required'),
        minScore: zod_1.z.number().min(0).max(100),
        status: zod_1.z.enum(['Pass', 'Fail']).optional(),
        remarks: zod_1.z.string().min(1, 'Remarks are required'),
    }),
});
exports.updateGradingScaleSchema = zod_1.z.object({
    body: zod_1.z.object({
        letter: zod_1.z.string().optional(),
        minScore: zod_1.z.number().min(0).max(100).optional(),
        status: zod_1.z.enum(['Pass', 'Fail']).optional(),
        remarks: zod_1.z.string().optional(),
    }).partial(),
});
class GradingController {
    static async list(req, res, next) {
        try {
            const scales = await grading_service_1.GradingService.list();
            return (0, response_1.sendSuccess)(res, scales);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const scale = await grading_service_1.GradingService.create(req.body);
            return (0, response_1.sendSuccess)(res, scale, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const scale = await grading_service_1.GradingService.update(req.params.id, req.body);
            return (0, response_1.sendSuccess)(res, scale);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const result = await grading_service_1.GradingService.delete(req.params.id);
            return (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async reset(req, res, next) {
        try {
            const scales = await grading_service_1.GradingService.resetDefaults();
            return (0, response_1.sendSuccess)(res, scales);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.GradingController = GradingController;
