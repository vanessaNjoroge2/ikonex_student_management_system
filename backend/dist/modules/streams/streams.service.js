"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamsService = void 0;
const db_1 = require("../../config/db");
class StreamsService {
    static async computeStreamStats(stream) {
        const studentCount = await db_1.prisma.student.count({
            where: { streamId: stream.id },
        });
        // Compute average performance from scores
        const scores = await db_1.prisma.score.findMany({
            where: {
                student: {
                    streamId: stream.id,
                },
            },
        });
        let avgPerformance = 0;
        if (scores.length > 0) {
            const sumPct = scores.reduce((acc, curr) => acc + (curr.score / curr.maxScore) * 100, 0);
            avgPerformance = Math.round(sumPct / scores.length);
        }
        return {
            id: stream.id,
            name: stream.name,
            room: stream.room,
            gradeLevel: stream.gradeLevel,
            studentCount,
            avgPerformance,
            trend: stream.trend,
            type: stream.type,
        };
    }
    static async listStreams() {
        const streams = await db_1.prisma.stream.findMany({
            orderBy: { name: 'asc' },
        });
        const result = [];
        for (const stream of streams) {
            result.push(await this.computeStreamStats(stream));
        }
        return result;
    }
    static async getStream(id) {
        const stream = await db_1.prisma.stream.findUnique({ where: { id } });
        if (!stream)
            return null;
        return this.computeStreamStats(stream);
    }
    static async getStreamStudents(streamId) {
        const students = await db_1.prisma.student.findMany({
            where: { streamId, isDeleted: false },
            include: { streamRel: true },
        });
        // Format students response
        return students.map((st) => {
            return {
                id: st.id,
                name: st.fullName,
                fullName: st.fullName,
                admissionNumber: st.admissionNumber,
                gender: st.gender,
                dateOfBirth: st.dateOfBirth.toISOString().split('T')[0],
                nationality: st.nationality || undefined,
                formLevel: st.formLevel,
                stream: st.stream,
                kcpeScore: st.kcpeScore,
                enrollmentStatus: st.enrollmentStatus,
                status: st.enrollmentStatus === 'ACTIVE' ? 'Active' : 'Inactive',
                admissionDate: st.admissionDate.toISOString().split('T')[0],
                parentName: st.parentName,
                relationship: st.relationship,
                parentPhone: st.parentPhone,
                altPhone: st.altPhone || undefined,
                attendancePercentage: st.attendancePercentage,
                attendanceRate: st.attendancePercentage,
                remarks: st.remarks || undefined,
                image: st.image || undefined,
                email: st.email || undefined,
                gradeLevel: `${st.formLevel}${st.stream}`,
                streamId: st.streamId,
            };
        });
    }
    static async getStreamPerformance(streamId) {
        const subjects = await db_1.prisma.subject.findMany();
        const result = [];
        for (const sub of subjects) {
            const scores = await db_1.prisma.score.findMany({
                where: {
                    subjectId: sub.id,
                    student: {
                        streamId,
                    },
                },
            });
            let average = 0;
            if (scores.length > 0) {
                const sumPct = scores.reduce((acc, curr) => acc + (curr.score / curr.maxScore) * 100, 0);
                average = Math.round(sumPct / scores.length);
            }
            result.push({
                subject: sub.name,
                average,
            });
        }
        return result;
    }
}
exports.StreamsService = StreamsService;
