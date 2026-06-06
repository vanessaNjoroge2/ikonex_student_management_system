import { prisma } from '../../config/db';
import { ExamType } from '@prisma/client';

export class ScoresService {
  static mapScoreToAssessment(score: any) {
    return {
      id: score.id,
      studentId: score.studentId,
      studentName: score.student.fullName,
      streamId: score.student.streamId,
      subject: score.subject.name,
      examType: score.examType === ExamType.EXAM ? 'Exam' : 'CA',
      score: score.score,
      maxScore: score.maxScore,
      term: score.term,
      date: score.createdAt.toISOString().split('T')[0],
    };
  }

  static async listScores(filters: {
    studentId?: string;
    subjectId?: string;
    streamId?: string;
    term?: string;
    year?: number;
    examType?: string;
    teacherId: string;
    isAdmin?: boolean;
  }) {
    const where: any = {};
    if (!filters.isAdmin) {
      where.teacherId = filters.teacherId;
    }

    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.subjectId) where.subjectId = filters.subjectId;
    if (filters.term) where.term = filters.term;
    if (filters.year) where.year = filters.year;

    if (filters.examType) {
      where.examType = filters.examType.toUpperCase() === 'CA' ? ExamType.CA : ExamType.EXAM;
    }

    if (filters.streamId) {
      where.student = {
        streamId: filters.streamId,
      };
      if (!filters.isAdmin) {
        where.student.teacherId = filters.teacherId;
      }
    }

    const scores = await prisma.score.findMany({
      where,
      include: {
        student: true,
        subject: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return scores.map((s) => this.mapScoreToAssessment(s));
  }

  static async createScore(data: {
    studentId: string;
    subjectName: string; // Taught subject name from frontend input
    examType: 'Exam' | 'CA';
    term: string;
    year?: number;
    score: number;
    maxScore: number;
    teacherId: string;
    isAdmin?: boolean;
  }) {
    const year = data.year || 2026;
    const dbExamType = data.examType === 'CA' ? ExamType.CA : ExamType.EXAM;

    if (data.score > data.maxScore) {
      throw new Error('Score cannot exceed maximum score');
    }

    // Resolve subject by name and teacherId
    const subjectWhere: any = { name: data.subjectName };
    if (!data.isAdmin) {
      subjectWhere.teacherId = data.teacherId;
    }
    const subject = await prisma.subject.findFirst({
      where: subjectWhere,
    });

    if (!subject) {
      throw new Error(`Subject with name "${data.subjectName}" not found.`);
    }

    // Check for duplicate
    const existing = await prisma.score.findUnique({
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
      const error = new Error('Score already recorded. Use PUT to update.') as any;
      error.status = 409;
      error.code = 'CONFLICT';
      throw error;
    }

    // Retrieve student to update GPA later
    const studentWhere: any = { id: data.studentId };
    if (!data.isAdmin) {
      studentWhere.teacherId = data.teacherId;
    }
    const student = await prisma.student.findFirst({
      where: studentWhere
    });
    if (!student) {
      throw new Error(`Student not found.`);
    }

    const score = await prisma.score.create({
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

  static async updateScore(
    id: string,
    data: {
      score?: number;
      maxScore?: number;
      term?: string;
      examType?: 'Exam' | 'CA';
    }
  ) {
    const existingScore = await prisma.score.findUnique({ where: { id } });
    if (!existingScore) return null;

    const scoreVal = data.score !== undefined ? data.score : existingScore.score;
    const maxScoreVal = data.maxScore !== undefined ? data.maxScore : existingScore.maxScore;
    if (scoreVal > maxScoreVal) {
      throw new Error('Score cannot exceed maximum score');
    }

    const updateData: any = {};
    if (data.score !== undefined) updateData.score = data.score;
    if (data.maxScore !== undefined) updateData.maxScore = data.maxScore;
    if (data.term) updateData.term = data.term;
    if (data.examType) {
      updateData.examType = data.examType === 'CA' ? ExamType.CA : ExamType.EXAM;
    }

    const score = await prisma.score.update({
      where: { id },
      data: updateData,
      include: {
        student: true,
        subject: true,
      },
    });

    return this.mapScoreToAssessment(score);
  }

  static async deleteScore(id: string) {
    await prisma.score.delete({ where: { id } });
    return { id };
  }

  static async getClassRankings(subjectId: string, streamId: string, term: string, teacherId: string, isAdmin: boolean = false) {
    // 1. Get all students in the stream
    const studentWhere: any = { streamId };
    if (!isAdmin) {
      studentWhere.teacherId = teacherId;
    }
    const students = await prisma.student.findMany({
      where: studentWhere,
    });

    const result = [];

    for (const student of students) {
      // Find CA and Exam scores for this subject
      const scoreWhere: any = {
        studentId: student.id,
        subjectId,
        term,
      };
      if (!isAdmin) {
        scoreWhere.teacherId = teacherId;
      }
      const studentScores = await prisma.score.findMany({
        where: scoreWhere,
      });

      const caRec = studentScores.find((s) => s.examType === ExamType.CA);
      const examRec = studentScores.find((s) => s.examType === ExamType.EXAM);

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
