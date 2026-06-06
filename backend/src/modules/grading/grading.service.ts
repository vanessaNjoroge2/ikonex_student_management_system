import { prisma } from '../../config/db';

export const DEFAULT_GRADING_SCALES = [
  { letter: 'A+', minScore: 95, status: 'Pass', remarks: 'Demonstrates outstanding comprehension and critical analyses.' },
  { letter: 'A', minScore: 90, status: 'Pass', remarks: 'Demonstrates outstanding comprehension and critical analyses.' },
  { letter: 'B+', minScore: 85, status: 'Pass', remarks: 'Commendable effort. Solid application in core assessments.' },
  { letter: 'B', minScore: 80, status: 'Pass', remarks: 'Commendable effort. Solid application in core assessments.' },
  { letter: 'C+', minScore: 75, status: 'Pass', remarks: 'Consistent progress. Work on refining minor theoretical parameters.' },
  { letter: 'C', minScore: 70, status: 'Pass', remarks: 'Consistent progress. Work on refining minor theoretical parameters.' },
  { letter: 'D', minScore: 60, status: 'Pass', remarks: 'Requires targeted support and reviews of weekly topics.' },
  { letter: 'F', minScore: 0, status: 'Fail', remarks: 'Action plan recommended for essential recovery.' },
];

export class GradingService {
  static async list() {
    const scales = await prisma.gradingScale.findMany({
      orderBy: { minScore: 'desc' },
    });

    if (scales.length === 0) {
      // Return defaults if not initialized in database
      return DEFAULT_GRADING_SCALES;
    }
    return scales;
  }

  static async create(data: { letter: string; minScore: number; status?: string; remarks: string }) {
    return prisma.gradingScale.create({
      data: {
        letter: data.letter,
        minScore: data.minScore,
        status: data.status || 'Pass',
        remarks: data.remarks,
      },
    });
  }

  static async update(id: string, data: { letter?: string; minScore?: number; status?: string; remarks?: string }) {
    return prisma.gradingScale.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    await prisma.gradingScale.delete({ where: { id } });
    return { id };
  }

  static async resetDefaults() {
    await prisma.gradingScale.deleteMany();
    
    const created = [];
    for (const scale of DEFAULT_GRADING_SCALES) {
      const dbScale = await prisma.gradingScale.create({
        data: scale,
      });
      created.push(dbScale);
    }
    return created;
  }

  static async getGradingScales() {
    const dbScales = await prisma.gradingScale.findMany({
      orderBy: { minScore: 'desc' },
    });
    return dbScales.length > 0 ? dbScales : DEFAULT_GRADING_SCALES;
  }
}
