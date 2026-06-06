import { prisma } from '../../config/db';

export class SubjectsService {
  static async listSubjects(teacherId: string, isAdmin?: boolean) {
    const where = isAdmin ? {} : { teacherId };
    const subjects = await prisma.subject.findMany({
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

  static async getSubject(id: string) {
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: { subjectStreams: true },
    });
    if (!subject) return null;

    return {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      teacherName: subject.teacherName,
      teacherId: subject.teacherId,
      assignedStreams: subject.subjectStreams.map((ss) => ss.streamId),
    };
  }

  static async createSubject(data: { name: string; teacherName: string; assignedStreams: string[]; teacherId: string }) {
    const code = data.name.trim().slice(0, 4).toUpperCase() + String(Math.floor(100 + Math.random() * 900));

    // Create subject
    const subject = await prisma.subject.create({
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
      await prisma.subjectStream.createMany({
        data: data.assignedStreams.map((streamId) => ({
          subjectId: subject.id,
          streamId,
        })),
      });
    }

    return this.getSubject(subject.id);
  }

  static async updateSubject(
    id: string,
    data: { name?: string; teacherName?: string; assignedStreams?: string[]; teacherId?: string }
  ) {
    const updateData: any = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.code = data.name.trim().slice(0, 4).toUpperCase() + String(Math.floor(100 + Math.random() * 900));
    }
    if (data.teacherName) updateData.teacherName = data.teacherName;
    if (data.teacherId) updateData.teacherId = data.teacherId;

    const subject = await prisma.subject.update({
      where: { id },
      data: updateData,
    });

    if (data.assignedStreams) {
      // Sync stream associations (delete old, insert new)
      await prisma.subjectStream.deleteMany({ where: { subjectId: id } });
      if (data.assignedStreams.length > 0) {
        await prisma.subjectStream.createMany({
          data: data.assignedStreams.map((streamId) => ({
            subjectId: id,
            streamId,
          })),
        });
      }
    }

    return this.getSubject(subject.id);
  }

  static async deleteSubject(id: string) {
    await prisma.subject.delete({ where: { id } });
    return { id };
  }

  static async getSubjectStreams(subjectId: string) {
    const subjectStreams = await prisma.subjectStream.findMany({
      where: { subjectId },
      include: { stream: true },
    });
    return subjectStreams.map((ss) => ss.stream);
  }

  static async assignStream(subjectId: string, streamId: string) {
    return prisma.subjectStream.upsert({
      where: {
        subjectId_streamId: { subjectId, streamId },
      },
      create: { subjectId, streamId },
      update: {},
    });
  }

  static async unassignStream(subjectId: string, streamId: string) {
    return prisma.subjectStream.delete({
      where: {
        subjectId_streamId: { subjectId, streamId },
      },
    });
  }
}
