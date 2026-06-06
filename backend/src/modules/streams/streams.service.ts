import { prisma } from '../../config/db';

export class StreamsService {
  static async computeStreamStats(stream: any) {
    const studentCount = await prisma.student.count({
      where: { streamId: stream.id },
    });

    // Compute average performance from scores
    const scores = await prisma.score.findMany({
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
      type: stream.type as 'Science' | 'Arts' | 'Commercial',
      teacherId: stream.teacherId || null,
      teacherName: stream.teacher ? stream.teacher.name : null,
      teacher: stream.teacher ? { id: stream.teacher.id, name: stream.teacher.name, email: stream.teacher.email } : null,
    };
  }

  static async listStreams() {
    const streams = await prisma.stream.findMany({
      include: { teacher: true },
      orderBy: { name: 'asc' },
    });

    const result = [];
    for (const stream of streams) {
      result.push(await this.computeStreamStats(stream));
    }
    return result;
  }

  static async getStream(id: string) {
    const stream = await prisma.stream.findUnique({
      where: { id },
      include: { teacher: true },
    });
    if (!stream) return null;
    return this.computeStreamStats(stream);
  }

  static async assignTeacher(streamId: string, teacherId: string | null) {
    const stream = await prisma.stream.findUnique({ where: { id: streamId } });
    if (!stream) {
      const err = new Error('Stream not found') as any;
      err.statusCode = 404;
      throw err;
    }

    if (teacherId) {
      const teacher = await prisma.prismaUser.findUnique({ where: { id: teacherId } });
      if (!teacher || (teacher.role !== 'TEACHER' && teacher.role !== 'ADMIN')) {
        const err = new Error('Teacher not found or invalid role') as any;
        err.statusCode = 404;
        throw err;
      }
    }

    // Update Stream
    const updatedStream = await prisma.stream.update({
      where: { id: streamId },
      data: {
        teacherId: teacherId || null,
      },
      include: { teacher: true },
    });

    // If teacher is assigned, update all students in this stream to have the same teacherId!
    if (teacherId) {
      await prisma.student.updateMany({
        where: { streamId, isDeleted: false },
        data: { teacherId },
      });
    }

    return this.computeStreamStats(updatedStream);
  }

  static async getStreamStudents(streamId: string) {
    const students = await prisma.student.findMany({
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

  static async getStreamPerformance(streamId: string) {
    const subjects = await prisma.subject.findMany();
    const result = [];

    for (const sub of subjects) {
      const scores = await prisma.score.findMany({
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

  static async createStream(data: { name: string; room: string; gradeLevel: string; type: string; teacherId?: string }) {
    if (!data.name || !data.room || !data.gradeLevel || !data.type) {
      const err = new Error('Name, Room, Grade Level, and Type are required') as any;
      err.statusCode = 400;
      throw err;
    }

    // Format ID to be alphanumeric-dash (e.g. Form 3C -> Form-3C or Form-3-C)
    const id = data.name.trim().replace(/\s+/g, '-');

    const existing = await prisma.stream.findUnique({ where: { id } });
    if (existing) {
      const err = new Error('Stream with this name already exists') as any;
      err.statusCode = 400;
      throw err;
    }

    if (data.teacherId) {
      const teacher = await prisma.prismaUser.findUnique({ where: { id: data.teacherId } });
      if (!teacher || (teacher.role !== 'TEACHER' && teacher.role !== 'ADMIN')) {
        const err = new Error('Teacher not found or invalid role') as any;
        err.statusCode = 400;
        throw err;
      }
    }

    const newStream = await prisma.stream.create({
      data: {
        id,
        name: data.name,
        room: data.room,
        gradeLevel: data.gradeLevel,
        type: data.type,
        teacherId: data.teacherId || null,
      },
      include: { teacher: true },
    });

    return this.computeStreamStats(newStream);
  }
}
