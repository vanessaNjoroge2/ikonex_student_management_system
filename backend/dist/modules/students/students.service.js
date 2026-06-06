"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsService = void 0;
const db_1 = require("../../config/db");
const grading_1 = require("../../utils/grading");
class StudentsService {
    static async computeGrades(studentId, teacherId, isAdmin = false) {
        const student = await db_1.prisma.student.findUnique({
            where: { id: studentId }
        });
        if (!student)
            return [];
        const scoreWhere = { studentId };
        if (!isAdmin && teacherId) {
            scoreWhere.teacherId = teacherId;
        }
        const scores = await db_1.prisma.score.findMany({
            where: scoreWhere,
            include: { subject: true },
        });
        const subjectWhere = {};
        if (!isAdmin && teacherId) {
            subjectWhere.teacherId = teacherId;
        }
        const subjects = await db_1.prisma.subject.findMany({
            where: subjectWhere
        });
        // Group scores by subject
        return subjects.map((sub) => {
            const subScores = scores.filter((s) => s.subjectId === sub.id);
            const caScoreRec = subScores.find((s) => s.examType === 'CA');
            const examScoreRec = subScores.find((s) => s.examType === 'EXAM');
            const caScore = caScoreRec ? caScoreRec.score : 0;
            const caMax = caScoreRec ? caScoreRec.maxScore : 30;
            const examScore = examScoreRec ? examScoreRec.score : 0;
            const examMax = examScoreRec ? examScoreRec.maxScore : 70;
            const totalScore = caScore + examScore;
            const totalMax = caMax + examMax;
            const percent = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
            const { letter, status } = (0, grading_1.getGradeLetter)(percent);
            return {
                subject: sub.name,
                caScore,
                caMax,
                examScore,
                examMax,
                totalScore,
                totalMax,
                percent,
                letter,
                status,
                remarks: (0, grading_1.getRemarksForGrade)(letter),
            };
        });
    }
    static mapStudentResponse(student, grades) {
        return {
            id: student.id,
            name: student.fullName,
            fullName: student.fullName,
            admissionNumber: student.admissionNumber,
            gender: student.gender,
            dateOfBirth: student.dateOfBirth.toISOString().split('T')[0],
            nationality: student.nationality || undefined,
            formLevel: student.formLevel,
            stream: student.stream,
            kcpeScore: student.kcpeScore,
            enrollmentStatus: student.enrollmentStatus,
            status: student.enrollmentStatus === 'ACTIVE' ? 'Active' : 'Inactive', // backward compatibility
            admissionDate: student.admissionDate.toISOString().split('T')[0],
            parentName: student.parentName,
            relationship: student.relationship,
            parentPhone: student.parentPhone,
            altPhone: student.altPhone || undefined,
            attendancePercentage: student.attendancePercentage,
            attendanceRate: student.attendancePercentage, // backward compatibility
            remarks: student.remarks || undefined,
            image: student.image || undefined,
            email: student.email || undefined,
            streamId: student.streamId,
            gradeLevel: `${student.formLevel}${student.stream}`, // e.g. Form 1A
            grades,
        };
    }
    static async listStudents(filters) {
        const where = { isDeleted: false };
        if (!filters.isAdmin) {
            where.teacherId = filters.teacherId;
        }
        if (filters.streamId && filters.streamId !== 'all') {
            const match = filters.streamId.match(/^(Form\s+\d)\s*([A-D])$/i);
            if (match) {
                where.formLevel = match[1];
                where.stream = match[2].toUpperCase();
            }
            else {
                where.streamId = filters.streamId;
            }
        }
        if (filters.status && filters.status !== 'all') {
            if (filters.status === 'Active') {
                where.enrollmentStatus = 'ACTIVE';
            }
            else if (filters.status === 'Inactive') {
                where.enrollmentStatus = 'INACTIVE';
            }
            else {
                where.enrollmentStatus = filters.status.toUpperCase();
            }
        }
        if (filters.search) {
            where.OR = [
                { fullName: { contains: filters.search, mode: 'insensitive' } },
                { admissionNumber: { contains: filters.search, mode: 'insensitive' } },
                { id: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        const [students, total] = await Promise.all([
            db_1.prisma.student.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: filters.skip,
                take: filters.limit,
            }),
            db_1.prisma.student.count({ where }),
        ]);
        const result = [];
        for (const student of students) {
            const grades = await this.computeGrades(student.id, filters.teacherId, filters.isAdmin);
            result.push(this.mapStudentResponse(student, grades));
        }
        return { students: result, total };
    }
    static async getStudent(id, teacherId, isAdmin = false) {
        const student = await db_1.prisma.student.findUnique({
            where: { id },
        });
        if (!student || student.isDeleted)
            return null;
        const grades = await this.computeGrades(student.id, teacherId, isAdmin);
        return this.mapStudentResponse(student, grades);
    }
    static async createStudent(data) {
        const existing = await db_1.prisma.student.findUnique({
            where: { admissionNumber: data.admissionNumber }
        });
        if (existing) {
            const err = new Error('Admission number is already in use');
            err.statusCode = 409;
            throw err;
        }
        const count = await db_1.prisma.student.count();
        const year = new Date().getFullYear();
        const studentId = `ST-${year}-${String(count + 11).padStart(3, '0')}`;
        const streamId = `${data.formLevel.replace(' ', '')}-${data.stream.toUpperCase()}`;
        const student = await db_1.prisma.student.create({
            data: {
                id: studentId,
                fullName: data.fullName,
                admissionNumber: data.admissionNumber,
                gender: data.gender,
                dateOfBirth: data.dateOfBirth,
                nationality: data.nationality || 'Kenyan',
                formLevel: data.formLevel,
                stream: data.stream.toUpperCase(),
                kcpeScore: data.kcpeScore,
                enrollmentStatus: data.enrollmentStatus.toUpperCase(),
                admissionDate: data.admissionDate || new Date(),
                parentName: data.parentName,
                relationship: data.relationship,
                parentPhone: data.parentPhone,
                altPhone: data.altPhone,
                attendancePercentage: data.attendancePercentage !== undefined ? data.attendancePercentage : 100.0,
                remarks: data.remarks,
                image: data.image,
                email: data.email,
                streamId,
                teacherId: data.teacherId,
            },
        });
        const grades = await this.computeGrades(student.id);
        return this.mapStudentResponse(student, grades);
    }
    static async updateStudent(id, data) {
        if (data.admissionNumber) {
            const existing = await db_1.prisma.student.findUnique({
                where: { admissionNumber: data.admissionNumber }
            });
            if (existing && existing.id !== id) {
                const err = new Error('Admission number is already in use');
                err.statusCode = 409;
                throw err;
            }
        }
        const updateData = { ...data };
        if (data.formLevel || data.stream) {
            const currentStudent = await db_1.prisma.student.findUnique({ where: { id } });
            if (currentStudent) {
                const nextForm = data.formLevel || currentStudent.formLevel;
                const nextStream = data.stream || currentStudent.stream;
                updateData.streamId = `${nextForm.replace(' ', '')}-${nextStream.toUpperCase()}`;
            }
        }
        if (data.stream) {
            updateData.stream = data.stream.toUpperCase();
        }
        if (data.enrollmentStatus) {
            updateData.enrollmentStatus = data.enrollmentStatus.toUpperCase();
        }
        const student = await db_1.prisma.student.update({
            where: { id },
            data: updateData,
        });
        const grades = await this.computeGrades(student.id);
        return this.mapStudentResponse(student, grades);
    }
    static async deleteStudent(id) {
        await db_1.prisma.student.update({
            where: { id },
            data: { isDeleted: true }
        });
        return { id };
    }
}
exports.StudentsService = StudentsService;
