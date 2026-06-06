import { prisma } from '../../config/db';
import { getGradeLetter, getRemarksForGrade } from '../../utils/grading';

export class StudentsService {
  static async computeGrades(studentId: string, teacherId?: string, isAdmin: boolean = false) {
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });
    if (!student) return { grades: [], overallPosition: 1 };

    // 1. Get all classmates in the same stream
    const classmates = await prisma.student.findMany({
      where: { streamId: student.streamId, isDeleted: false }
    });
    const classmateIds = classmates.map(c => c.id);

    // 2. Fetch all scores for these classmates
    const allScores = await prisma.score.findMany({
      where: { studentId: { in: classmateIds } }
    });

    // 3. Fetch all subjects
    const allSubjects = await prisma.subject.findMany();

    // 4. Fetch grading scales from database
    const dbScales = await prisma.gradingScale.findMany({
      orderBy: { minScore: 'desc' }
    });

    const determineGrade = (score: number) => {
      if (dbScales.length > 0) {
        const matched = dbScales.find(s => score >= s.minScore);
        if (matched) {
          return {
            letter: matched.letter,
            status: matched.status as 'Pass' | 'Fail',
            remarks: matched.remarks
          };
        }
      }
      const fallback = getGradeLetter(score);
      return {
        letter: fallback.letter,
        status: fallback.status,
        remarks: getRemarksForGrade(fallback.letter)
      };
    };

    // 5. Compute classmate performance profile
    const classmatePerformance = classmates.map(c => {
      const studentScores = allScores.filter(s => s.studentId === c.id);
      
      let overallTotalScore = 0;
      let overallMaxScore = 0;
      
      const subjectScores: Record<string, number> = {}; // subjectId -> totalScore
      
      allSubjects.forEach(sub => {
        const subScores = studentScores.filter(s => s.subjectId === sub.id);
        const ca = subScores.find(s => s.examType === 'CA')?.score || 0;
        const exam = subScores.find(s => s.examType === 'EXAM')?.score || 0;
        const caMax = subScores.find(s => s.examType === 'CA')?.maxScore || 30;
        const examMax = subScores.find(s => s.examType === 'EXAM')?.maxScore || 70;
        
        const total = ca + exam;
        const max = caMax + examMax;
        
        subjectScores[sub.id] = total;
        
        overallTotalScore += total;
        overallMaxScore += max;
      });
      
      const overallPercent = overallMaxScore > 0 ? Math.round((overallTotalScore / overallMaxScore) * 100) : 0;
      
      return {
        studentId: c.id,
        subjectScores,
        overallTotalScore,
        overallPercent,
      };
    });

    // 6. Compute overall rank (competition ranking)
    const sortedOverall = [...classmatePerformance].sort((a, b) => b.overallTotalScore - a.overallTotalScore);
    let currentOverallRank = 1;
    const overallRanks: Record<string, number> = {};
    for (let i = 0; i < sortedOverall.length; i++) {
      if (i > 0 && sortedOverall[i].overallTotalScore < sortedOverall[i - 1].overallTotalScore) {
        currentOverallRank = i + 1;
      }
      overallRanks[sortedOverall[i].studentId] = currentOverallRank;
    }
    const overallPosition = overallRanks[studentId] || 1;

    // 7. Compute subject ranks (competition ranking)
    const subjectRanks: Record<string, Record<string, number>> = {}; // subjectId -> { studentId -> rank }
    allSubjects.forEach(sub => {
      const sortedForSub = [...classmatePerformance].sort((a, b) => (b.subjectScores[sub.id] || 0) - (a.subjectScores[sub.id] || 0));
      let currentSubRank = 1;
      const ranksForSub: Record<string, number> = {};
      for (let i = 0; i < sortedForSub.length; i++) {
        const currentScore = sortedForSub[i].subjectScores[sub.id] || 0;
        const prevScore = i > 0 ? (sortedForSub[i - 1].subjectScores[sub.id] || 0) : null;
        if (prevScore !== null && currentScore < prevScore) {
          currentSubRank = i + 1;
        }
        ranksForSub[sortedForSub[i].studentId] = currentSubRank;
      }
      subjectRanks[sub.id] = ranksForSub;
    });

    // 8. Filter subjects for response if a teacher is requesting and they are not admin
    const mySubjects = allSubjects.filter(sub => {
      if (!isAdmin && teacherId) {
        return sub.teacherId === teacherId;
      }
      return true;
    });

    const myScores = allScores.filter(s => s.studentId === studentId);

    // 9. Build final grades array
    const grades = mySubjects.map((sub) => {
      const subScores = myScores.filter((s) => s.subjectId === sub.id);
      const caScoreRec = subScores.find((s) => s.examType === 'CA');
      const examScoreRec = subScores.find((s) => s.examType === 'EXAM');

      const caScore = caScoreRec ? caScoreRec.score : 0;
      const caMax = caScoreRec ? caScoreRec.maxScore : 30;
      const examScore = examScoreRec ? examScoreRec.score : 0;
      const examMax = examScoreRec ? examScoreRec.maxScore : 70;

      const totalScore = caScore + examScore;
      const totalMax = caMax + examMax;
      const percent = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

      const { letter, status, remarks } = determineGrade(percent);
      const subjectPosition = subjectRanks[sub.id]?.[studentId] || 1;

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
        remarks,
        subjectPosition,
      };
    });

    return { grades, overallPosition };
  }

  static mapStudentResponse(student: any, grades: any[], overallPosition?: number) {
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
      overallPosition,
    };
  }

  static async listStudents(filters: {
    streamId?: string;
    search?: string;
    status?: string;
    page: number;
    limit: number;
    skip: number;
    teacherId: string;
    isAdmin?: boolean;
  }) {
    const where: any = { isDeleted: false };
    if (!filters.isAdmin) {
      where.teacherId = filters.teacherId;
    }

    if (filters.streamId && filters.streamId !== 'all') {
      const match = filters.streamId.match(/^(Form\s+\d)\s*([A-D])$/i);
      if (match) {
        where.formLevel = match[1];
        where.stream = match[2].toUpperCase();
      } else {
        where.streamId = filters.streamId;
      }
    }

    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'Active') {
        where.enrollmentStatus = 'ACTIVE';
      } else if (filters.status === 'Inactive') {
        where.enrollmentStatus = 'INACTIVE';
      } else {
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
      prisma.student.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: filters.skip,
        take: filters.limit,
      }),
      prisma.student.count({ where }),
    ]);

    const result = [];
    for (const student of students) {
      const { grades, overallPosition } = await this.computeGrades(student.id, filters.teacherId, filters.isAdmin);
      result.push(this.mapStudentResponse(student, grades, overallPosition));
    }

    return { students: result, total };
  }

  static async getStudent(id: string, teacherId?: string, isAdmin: boolean = false) {
    const student = await prisma.student.findUnique({
      where: { id },
    });
    if (!student || student.isDeleted) return null;

    const { grades, overallPosition } = await this.computeGrades(student.id, teacherId, isAdmin);
    return this.mapStudentResponse(student, grades, overallPosition);
  }

  static async createStudent(data: {
    fullName: string;
    admissionNumber: string;
    gender: string;
    dateOfBirth: Date;
    nationality?: string;
    formLevel: string;
    stream: string;
    kcpeScore: number;
    enrollmentStatus: string;
    admissionDate?: Date;
    parentName: string;
    relationship: string;
    parentPhone: string;
    altPhone?: string;
    attendancePercentage?: number;
    remarks?: string;
    image?: string;
    email?: string;
    teacherId: string;
  }) {
    const existing = await prisma.student.findUnique({
      where: { admissionNumber: data.admissionNumber }
    });
    if (existing) {
      const err = new Error('Admission number is already in use') as any;
      err.statusCode = 409;
      throw err;
    }

    const count = await prisma.student.count();
    const year = new Date().getFullYear();
    const studentId = `ST-${year}-${String(count + 11).padStart(3, '0')}`;
    
    const streamId = `${data.formLevel.replace(' ', '')}-${data.stream.toUpperCase()}`;

    const student = await prisma.student.create({
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

    const { grades, overallPosition } = await this.computeGrades(student.id);
    return this.mapStudentResponse(student, grades, overallPosition);
  }

  static async updateStudent(
    id: string,
    data: {
      fullName?: string;
      admissionNumber?: string;
      gender?: string;
      dateOfBirth?: Date;
      nationality?: string;
      formLevel?: string;
      stream?: string;
      kcpeScore?: number;
      enrollmentStatus?: string;
      admissionDate?: Date;
      parentName?: string;
      relationship?: string;
      parentPhone?: string;
      altPhone?: string;
      attendancePercentage?: number;
      remarks?: string;
      image?: string;
      email?: string;
    }
  ) {
    if (data.admissionNumber) {
      const existing = await prisma.student.findUnique({
        where: { admissionNumber: data.admissionNumber }
      });
      if (existing && existing.id !== id) {
        const err = new Error('Admission number is already in use') as any;
        err.statusCode = 409;
        throw err;
      }
    }

    const updateData: any = { ...data };
    
    if (data.formLevel || data.stream) {
      const currentStudent = await prisma.student.findUnique({ where: { id } });
      if (currentStudent) {
        const nextForm = data.formLevel || currentStudent.formLevel;
        const nextStream = data.stream || currentStudent.stream;
        const newStreamId = `${nextForm.replace(' ', '')}-${nextStream.toUpperCase()}`;
        updateData.streamId = newStreamId;

        const stream = await prisma.stream.findUnique({ where: { id: newStreamId } });
        if (stream && stream.teacherId) {
          updateData.teacherId = stream.teacherId;
        }
      }
    }

    if (data.stream) {
      updateData.stream = data.stream.toUpperCase();
    }
    if (data.enrollmentStatus) {
      updateData.enrollmentStatus = data.enrollmentStatus.toUpperCase();
    }

    const student = await prisma.student.update({
      where: { id },
      data: updateData,
    });

    const { grades, overallPosition } = await this.computeGrades(student.id);
    return this.mapStudentResponse(student, grades, overallPosition);
  }

  static async deleteStudent(id: string) {
    await prisma.student.update({
      where: { id },
      data: { isDeleted: true }
    });
    return { id };
  }
}
