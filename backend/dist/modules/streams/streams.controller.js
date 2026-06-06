"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamsController = void 0;
const streams_service_1 = require("./streams.service");
const response_1 = require("../../utils/response");
class StreamsController {
    static async list(req, res, next) {
        try {
            const streams = await streams_service_1.StreamsService.listStreams();
            return (0, response_1.sendSuccess)(res, streams);
        }
        catch (error) {
            next(error);
        }
    }
    static async get(req, res, next) {
        try {
            const stream = await streams_service_1.StreamsService.getStream(req.params.id);
            if (!stream) {
                return (0, response_1.sendError)(res, 'Stream not found', 404, 'NOT_FOUND');
            }
            return (0, response_1.sendSuccess)(res, stream);
        }
        catch (error) {
            next(error);
        }
    }
    static async getStudents(req, res, next) {
        try {
            const students = await streams_service_1.StreamsService.getStreamStudents(req.params.id);
            return (0, response_1.sendSuccess)(res, students);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPerformance(req, res, next) {
        try {
            const performance = await streams_service_1.StreamsService.getStreamPerformance(req.params.id);
            return (0, response_1.sendSuccess)(res, performance);
        }
        catch (error) {
            next(error);
        }
    }
    static async assignTeacher(req, res, next) {
        try {
            const { id } = req.params;
            const { teacherId } = req.body;
            const updated = await streams_service_1.StreamsService.assignTeacher(id, teacherId);
            return (0, response_1.sendSuccess)(res, updated);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const { name, room, gradeLevel, type, teacherId } = req.body;
            const newStream = await streams_service_1.StreamsService.createStream({ name, room, gradeLevel, type, teacherId });
            return (0, response_1.sendSuccess)(res, newStream, 201);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.StreamsController = StreamsController;
