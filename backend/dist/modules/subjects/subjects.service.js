"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectsService = void 0;
const db_1 = require("../../config/db");
class SubjectsService {
    static async listSubjects(teacherId, isAdmin) {
        const where = isAdmin ? {} : { teacherId };
        const subjects = await db_1.prisma.subject.findMany({
            where,
            include: { subjectStreams: true },
            orderBy: { name: 'asc' },
        });
        return subjects.map((s) => ({
            id: s.id,
            name: s.name,
            code: s.code,
            teacherName: s.teacherName,
            teacherId: s.teacherId,
            assignedStreams: s.subjectStreams.map((ss) => ss.streamId),
        }));
    }
    static async getSubject(id) {
        const subject = await db_1.prisma.subject.findUnique({
            where: { id },
            include: { subjectStreams: true },
        });
        if (!subject)
            return null;
        return {
            id: subject.id,
            name: subject.name,
            code: subject.code,
            teacherName: subject.teacherName,
            teacherId: subject.teacherId,
            assignedStreams: subject.subjectStreams.map((ss) => ss.streamId),
        };
    }
    static async createSubject(data) {
        const code = data.name.trim().slice(0, 4).toUpperCase() + String(Math.floor(100 + Math.random() * 900));
        // Create subject
        const subject = await db_1.prisma.subject.create({
            data: {
                id: `sub-${Date.now()}`,
                name: data.name,
                code,
                teacherName: data.teacherName,
                teacherId: data.teacherId,
            },
        });
        // Create stream associations
        if (data.assignedStreams && data.assignedStreams.length > 0) {
            await db_1.prisma.subjectStream.createMany({
                data: data.assignedStreams.map((streamId) => ({
                    subjectId: subject.id,
                    streamId,
                })),
            });
        }
        return this.getSubject(subject.id);
    }
    static async updateSubject(id, data) {
        const updateData = {};
        if (data.name) {
            updateData.name = data.name;
            updateData.code = data.name.trim().slice(0, 4).toUpperCase() + String(Math.floor(100 + Math.random() * 900));
        }
        if (data.teacherName)
            updateData.teacherName = data.teacherName;
        if (data.teacherId)
            updateData.teacherId = data.teacherId;
        const subject = await db_1.prisma.subject.update({
            where: { id },
            data: updateData,
        });
        if (data.assignedStreams) {
            // Sync stream associations (delete old, insert new)
            await db_1.prisma.subjectStream.deleteMany({ where: { subjectId: id } });
            if (data.assignedStreams.length > 0) {
                await db_1.prisma.subjectStream.createMany({
                    data: data.assignedStreams.map((streamId) => ({
                        subjectId: id,
                        streamId,
                    })),
                });
            }
        }
        return this.getSubject(subject.id);
    }
    static async deleteSubject(id) {
        await db_1.prisma.subject.delete({ where: { id } });
        return { id };
    }
    static async getSubjectStreams(subjectId) {
        const subjectStreams = await db_1.prisma.subjectStream.findMany({
            where: { subjectId },
            include: { stream: true },
        });
        return subjectStreams.map((ss) => ss.stream);
    }
    static async assignStream(subjectId, streamId) {
        return db_1.prisma.subjectStream.upsert({
            where: {
                subjectId_streamId: { subjectId, streamId },
            },
            create: { subjectId, streamId },
            update: {},
        });
    }
    static async unassignStream(subjectId, streamId) {
        return db_1.prisma.subjectStream.delete({
            where: {
                subjectId_streamId: { subjectId, streamId },
            },
        });
    }
}
exports.SubjectsService = SubjectsService;
