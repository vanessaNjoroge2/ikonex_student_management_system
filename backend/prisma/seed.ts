import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear in correct order (children before parents)
  await prisma.gradingScale.deleteMany();
  await prisma.score.deleteMany();
  await prisma.subjectStream.deleteMany();
  await prisma.student.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.stream.deleteMany();
  await prisma.loginActivity.deleteMany();
  await prisma.prismaUser.deleteMany();

  // Create default grading scales
  await prisma.gradingScale.createMany({
    data: [
      { letter: 'A+', minScore: 90, status: 'Pass', remarks: 'Excellent' },
      { letter: 'A', minScore: 80, status: 'Pass', remarks: 'Very Good' },
      { letter: 'B+', minScore: 75, status: 'Pass', remarks: 'Good' },
      { letter: 'B', minScore: 65, status: 'Pass', remarks: 'Competent' },
      { letter: 'C+', minScore: 60, status: 'Pass', remarks: 'Satisfactory' },
      { letter: 'C', minScore: 50, status: 'Pass', remarks: 'Fair' },
      { letter: 'D', minScore: 40, status: 'Pass', remarks: 'Pass' },
      { letter: 'F', minScore: 0, status: 'Fail', remarks: 'Fail' },
    ],
  });

  console.log('✅ Grading Scales seeded');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@1234', 10);
  const admin = await prisma.prismaUser.create({
    data: {
      name: 'System Admin',
      email: 'njorogevenessa1@gmail.com',
      password: hashedPassword,
      role: Role.ADMIN,
      isVerified: true,
      isSuspended: false,
    },
  });

  console.log('✅ Admin created:', admin.email);

  // Create a teacher
  const teacherPassword = await bcrypt.hash('Teacher@1234', 10);
  const teacher = await prisma.prismaUser.create({
    data: {
      name: 'Vanessa Wambui',
      email: 'vanessa642022@gmail.com',
      password: teacherPassword,
      role: Role.TEACHER,
      isVerified: true,
      isSuspended: false,
    },
  });

  console.log('✅ Teacher created:', teacher.email);

  // Create all 16 streams (Forms 1-4, Streams A-D)
  const forms = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
  const streamLetters = ['A', 'B', 'C', 'D'];
  const rooms = {
    'Form 1': { A: 'Room 101', B: 'Room 102', C: 'Room 103', D: 'Room 104' },
    'Form 2': { A: 'Room 201', B: 'Room 202', C: 'Room 203', D: 'Room 204' },
    'Form 3': { A: 'Room 301', B: 'Room 302', C: 'Room 303', D: 'Room 304' },
    'Form 4': { A: 'Room 401', B: 'Room 402', C: 'Room 403', D: 'Room 404' },
  } as any;
  const types = ['Science', 'Arts', 'Commercial', 'Science'];

  const allStreamIds: string[] = [];
  for (const form of forms) {
    for (let i = 0; i < streamLetters.length; i++) {
      const letter = streamLetters[i];
      const streamId = `${form.replace(' ', '')}-${letter}`;
      const name = `${form}${letter}`;
      const room = rooms[form][letter] || 'Room 100';
      const type = types[i];
      
      await prisma.stream.create({
        data: {
          id: streamId,
          name,
          room,
          gradeLevel: form,
          type,
        }
      });
      allStreamIds.push(streamId);
    }
  }

  console.log('✅ Streams created');

  // Create subjects
  const biology = await prisma.subject.create({
    data: {
      id: 'subj-biology',
      name: 'Biology',
      code: 'BIO',
      teacherName: teacher.name,
      teacherId: teacher.id,
    },
  });

  const mathematics = await prisma.subject.create({
    data: {
      id: 'subj-mathematics',
      name: 'Mathematics',
      code: 'MATH',
      teacherName: teacher.name,
      teacherId: teacher.id,
    },
  });

  console.log('✅ Subjects created');

  // Link subjects to all streams
  const subjectStreamsData = [];
  for (const streamId of allStreamIds) {
    subjectStreamsData.push({ subjectId: biology.id, streamId });
    subjectStreamsData.push({ subjectId: mathematics.id, streamId });
  }
  await prisma.subjectStream.createMany({
    data: subjectStreamsData,
  });

  // Create students
  const student1 = await prisma.student.create({
    data: {
      fullName: 'Kris Sakwa',
      admissionNumber: 'ADM001',
      gender: 'Male',
      dateOfBirth: new Date('2008-03-15'),
      formLevel: 'Form 1',
      stream: 'A',
      kcpeScore: 380,
      parentName: 'John Sakwa',
      relationship: 'Father',
      parentPhone: '0712345678',
      streamId: 'Form1-A',
      teacherId: teacher.id,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      fullName: 'Mary Njeri',
      admissionNumber: 'ADM002',
      gender: 'Female',
      dateOfBirth: new Date('2007-07-20'),
      formLevel: 'Form 2',
      stream: 'B',
      kcpeScore: 410,
      parentName: 'Grace Njeri',
      relationship: 'Mother',
      parentPhone: '0723456789',
      streamId: 'Form2-B',
      teacherId: teacher.id,
    },
  });

  console.log('✅ Students created');

  // Create scores
  await prisma.score.createMany({
    data: [
      {
        studentId: student1.id,
        subjectId: biology.id,
        examType: 'CA',
        term: 'Term 1',
        year: 2026,
        score: 22,
        maxScore: 30,
        teacherId: teacher.id,
      },
      {
        studentId: student1.id,
        subjectId: biology.id,
        examType: 'EXAM',
        term: 'Term 1',
        year: 2026,
        score: 45,
        maxScore: 70,
        teacherId: teacher.id,
      },
      {
        studentId: student2.id,
        subjectId: mathematics.id,
        examType: 'CA',
        term: 'Term 1',
        year: 2026,
        score: 25,
        maxScore: 30,
        teacherId: teacher.id,
      },
    ],
  });

  console.log('✅ Scores created');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });