"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const db_1 = require("../../config/db");
class DashboardService {
    static getRelativeTime(date) {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMins < 1)
            return 'Just now';
        if (diffMins < 60)
            return `${diffMins} minutes ago`;
        if (diffHours < 24)
            return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    }
    static async getStats(teacherId, isAdmin = false) {
        const studentWhere = { isDeleted: false };
        const subjectWhere = {};
        const scoreWhere = {};
        if (!isAdmin) {
            studentWhere.teacherId = teacherId;
            subjectWhere.teacherId = teacherId;
            scoreWhere.teacherId = teacherId;
        }
        const [totalStudents, totalSubjects] = await Promise.all([
            db_1.prisma.student.count({ where: studentWhere }),
            db_1.prisma.subject.count({ where: subjectWhere }),
        ]);
        // Compute students per form level
        const forms = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
        const studentsPerForm = {};
        for (const form of forms) {
            studentsPerForm[form] = await db_1.prisma.student.count({
                where: { ...studentWhere, formLevel: form },
            });
        }
        // Compute students per stream letter
        const streamsList = ['A', 'B', 'C', 'D'];
        const studentsPerStream = {};
        for (const str of streamsList) {
            studentsPerStream[str] = await db_1.prisma.student.count({
                where: { ...studentWhere, stream: str },
            });
        }
        // Active vs inactive status counts
        const statuses = ['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED'];
        const statusCounts = {};
        for (const status of statuses) {
            statusCounts[status] = await db_1.prisma.student.count({
                where: { ...studentWhere, enrollmentStatus: status },
            });
        }
        const scores = await db_1.prisma.score.findMany({ where: scoreWhere });
        let avgPerformance = 84;
        if (scores.length > 0) {
            const sumPct = scores.reduce((acc, curr) => acc + (curr.score / curr.maxScore) * 100, 0);
            avgPerformance = Math.round(sumPct / scores.length);
        }
        return {
            totalStudents,
            totalSubjects,
            avgPerformance,
            studentsPerForm,
            studentsPerStream,
            statusCounts,
        };
    }
    static async getActivity(teacherId, isAdmin = false) {
        const studentWhere = { isDeleted: false };
        const scoreWhere = {};
        if (!isAdmin) {
            studentWhere.teacherId = teacherId;
            scoreWhere.teacherId = teacherId;
        }
        const [recentStudents, recentScores] = await Promise.all([
            db_1.prisma.student.findMany({
                where: studentWhere,
                take: 5,
                orderBy: { createdAt: 'desc' },
            }),
            db_1.prisma.score.findMany({
                where: scoreWhere,
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { student: true, subject: true },
            }),
        ]);
        const activities = [];
        // Map enrollments
        for (const student of recentStudents) {
            activities.push({
                id: `act-stud-${student.id}`,
                type: 'enrollment',
                title: `New Student: ${student.fullName}`,
                description: `Enrolled successfully in ${student.formLevel}${student.stream}.`,
                time: this.getRelativeTime(student.createdAt),
                date: student.createdAt,
            });
        }
        // Map score additions
        for (const score of recentScores) {
            const examLabel = score.examType === 'CA' ? 'CA' : 'Final Exam';
            activities.push({
                id: `act-score-${score.id}`,
                type: 'score_update',
                title: `Scores Updated: ${score.subject.name}`,
                description: `${score.student.fullName} scored ${score.score}/${score.maxScore} in ${examLabel}.`,
                time: this.getRelativeTime(score.createdAt),
                date: score.createdAt,
            });
        }
        // Sort combined activities by date descending
        return activities
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 10)
            .map(({ id, type, title, description, time }) => ({
            id,
            type,
            title,
            description,
            time,
        }));
    }
}
exports.DashboardService = DashboardService;
