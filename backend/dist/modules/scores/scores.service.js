"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoresService = void 0;
const db_1 = require("../../config/db");
const client_1 = require("@prisma/client");
class ScoresService {
    static mapScoreToAssessment(score) {
        return {
            id: score.id,
            studentId: score.studentId,
            studentName: score.student.fullName,
            streamId: score.student.streamId,
            subject: score.subject.name,
            examType: score.examType === client_1.ExamType.EXAM ? 'Exam' : 'CA',
            score: score.score,
            maxScore: score.maxScore,
            term: score.term,
            date: score.createdAt.toISOString().split('T')[0],
        };
    }
    static async listScores(filters) {
        const where = {};
        if (!filters.isAdmin) {
            where.teacherId = filters.teacherId;
        }
        if (filters.studentId)
            where.studentId = filters.studentId;
        if (filters.subjectId)
            where.subjectId = filters.subjectId;
        if (filters.term)
            where.term = filters.term;
        if (filters.year)
            where.year = filters.year;
        if (filters.examType) {
            where.examType = filters.examType.toUpperCase() === 'CA' ? client_1.ExamType.CA : client_1.ExamType.EXAM;
        }
        if (filters.streamId) {
            where.student = {
                streamId: filters.streamId,
            };
            if (!filters.isAdmin) {
                where.student.teacherId = filters.teacherId;
            }
        }
        const scores = await db_1.prisma.score.findMany({
            where,
            include: {
                student: true,
                subject: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return scores.map((s) => this.mapScoreToAssessment(s));
    }
    static async createScore(data) {
        const year = data.year || 2026;
        const dbExamType = data.examType === 'CA' ? client_1.ExamType.CA : client_1.ExamType.EXAM;
        // Resolve subject by name and teacherId
        const subjectWhere = { name: data.subjectName };
        if (!data.isAdmin) {
            subjectWhere.teacherId = data.teacherId;
        }
        const subject = await db_1.prisma.subject.findFirst({
            where: subjectWhere,
        });
        if (!subject) {
            throw new Error(`Subject with name "${data.subjectName}" not found.`);
        }
        // Check for duplicate
        const existing = await db_1.prisma.score.findUnique({
            where: {
                studentId_subjectId_examType_term_year: {
                    studentId: data.studentId,
                    subjectId: subject.id,
                    examType: dbExamType,
                    term: data.term,
                    year,
                },
            },
        });
        if (existing) {
            const error = new Error('Score already recorded. Use PUT to update.');
            error.status = 409;
            error.code = 'CONFLICT';
            throw error;
        }
        // Retrieve student to update GPA later
        const studentWhere = { id: data.studentId };
        if (!data.isAdmin) {
            studentWhere.teacherId = data.teacherId;
        }
        const student = await db_1.prisma.student.findFirst({
            where: studentWhere
        });
        if (!student) {
            throw new Error(`Student not found.`);
        }
        const score = await db_1.prisma.score.create({
            data: {
                studentId: data.studentId,
                subjectId: subject.id,
                examType: dbExamType,
                term: data.term,
                year,
                score: data.score,
                maxScore: data.maxScore,
                teacherId: subject.teacherId || data.teacherId,
            },
            include: {
                student: true,
                subject: true,
            },
        });
        // No longer need to update cumulative GPA since it was replaced by KCPE Score (static)
        return this.mapScoreToAssessment(score);
    }
    static async updateScore(id, data) {
        const existingScore = await db_1.prisma.score.findUnique({ where: { id } });
        if (!existingScore)
            return null;
        const updateData = {};
        if (data.score !== undefined)
            updateData.score = data.score;
        if (data.maxScore !== undefined)
            updateData.maxScore = data.maxScore;
        if (data.term)
            updateData.term = data.term;
        if (data.examType) {
            updateData.examType = data.examType === 'CA' ? client_1.ExamType.CA : client_1.ExamType.EXAM;
        }
        const score = await db_1.prisma.score.update({
            where: { id },
            data: updateData,
            include: {
                student: true,
                subject: true,
            },
        });
        return this.mapScoreToAssessment(score);
    }
    static async deleteScore(id) {
        await db_1.prisma.score.delete({ where: { id } });
        return { id };
    }
    static async getClassRankings(subjectId, streamId, term, teacherId, isAdmin = false) {
        // 1. Get all students in the stream
        const studentWhere = { streamId };
        if (!isAdmin) {
            studentWhere.teacherId = teacherId;
        }
        const students = await db_1.prisma.student.findMany({
            where: studentWhere,
        });
        const result = [];
        for (const student of students) {
            // Find CA and Exam scores for this subject
            const scoreWhere = {
                studentId: student.id,
                subjectId,
                term,
            };
            if (!isAdmin) {
                scoreWhere.teacherId = teacherId;
            }
            const studentScores = await db_1.prisma.score.findMany({
                where: scoreWhere,
            });
            const caRec = studentScores.find((s) => s.examType === client_1.ExamType.CA);
            const examRec = studentScores.find((s) => s.examType === client_1.ExamType.EXAM);
            const caScore = caRec ? caRec.score : 0;
            const caMax = caRec ? caRec.maxScore : 30;
            const examScore = examRec ? examRec.score : 0;
            const examMax = examRec ? examRec.maxScore : 70;
            const totalPoints = caScore + examScore;
            const maxPoints = caMax + examMax;
            const totalPercent = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
            result.push({
                name: student.fullName,
                caScore,
                caMax,
                examScore,
                examMax,
                totalPoints,
                maxPoints,
                totalPercent: totalPercent || Math.round(((student.kcpeScore || 0) / 500) * 100),
            });
        }
        // Sort descending by totalPercent
        return result.sort((a, b) => b.totalPercent - a.totalPercent);
    }
}
exports.ScoresService = ScoresService;
