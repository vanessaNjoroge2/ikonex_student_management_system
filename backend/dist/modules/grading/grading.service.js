"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradingService = exports.DEFAULT_GRADING_SCALES = void 0;
const db_1 = require("../../config/db");
exports.DEFAULT_GRADING_SCALES = [
    { letter: 'A+', minScore: 95, status: 'Pass', remarks: 'Demonstrates outstanding comprehension and critical analyses.' },
    { letter: 'A', minScore: 90, status: 'Pass', remarks: 'Demonstrates outstanding comprehension and critical analyses.' },
    { letter: 'B+', minScore: 85, status: 'Pass', remarks: 'Commendable effort. Solid application in core assessments.' },
    { letter: 'B', minScore: 80, status: 'Pass', remarks: 'Commendable effort. Solid application in core assessments.' },
    { letter: 'C+', minScore: 75, status: 'Pass', remarks: 'Consistent progress. Work on refining minor theoretical parameters.' },
    { letter: 'C', minScore: 70, status: 'Pass', remarks: 'Consistent progress. Work on refining minor theoretical parameters.' },
    { letter: 'D', minScore: 60, status: 'Pass', remarks: 'Requires targeted support and reviews of weekly topics.' },
    { letter: 'F', minScore: 0, status: 'Fail', remarks: 'Action plan recommended for essential recovery.' },
];
class GradingService {
    static async list() {
        const scales = await db_1.prisma.gradingScale.findMany({
            orderBy: { minScore: 'desc' },
        });
        if (scales.length === 0) {
            // Return defaults if not initialized in database
            return exports.DEFAULT_GRADING_SCALES;
        }
        return scales;
    }
    static async create(data) {
        return db_1.prisma.gradingScale.create({
            data: {
                letter: data.letter,
                minScore: data.minScore,
                status: data.status || 'Pass',
                remarks: data.remarks,
            },
        });
    }
    static async update(id, data) {
        return db_1.prisma.gradingScale.update({
            where: { id },
            data,
        });
    }
    static async delete(id) {
        await db_1.prisma.gradingScale.delete({ where: { id } });
        return { id };
    }
    static async resetDefaults() {
        await db_1.prisma.gradingScale.deleteMany();
        const created = [];
        for (const scale of exports.DEFAULT_GRADING_SCALES) {
            const dbScale = await db_1.prisma.gradingScale.create({
                data: scale,
            });
            created.push(dbScale);
        }
        return created;
    }
    static async getGradingScales() {
        const dbScales = await db_1.prisma.gradingScale.findMany({
            orderBy: { minScore: 'desc' },
        });
        return dbScales.length > 0 ? dbScales : exports.DEFAULT_GRADING_SCALES;
    }
}
exports.GradingService = GradingService;
