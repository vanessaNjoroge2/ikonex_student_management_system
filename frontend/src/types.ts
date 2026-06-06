export interface Grade {
  subject: string;
  caScore?: number;
  caMax?: number;
  examScore?: number;
  examMax?: number;
  totalScore?: number;
  totalMax?: number;
  letter: string;
  status: 'Pass' | 'Fail';
  subtopic?: string;
  score?: number;
  subjectPosition?: number;
  percent?: number;
  remarks?: string;
}

export interface Student {
  id: string; // ST-2024-001, etc
  name: string;
  fullName: string;
  admissionNumber: string;
  gender: string;
  dateOfBirth: string;
  nationality?: string;
  formLevel: string; // Form 1, Form 2, Form 3, Form 4
  stream: string; // A, B, C, D
  kcpeScore: number;
  enrollmentStatus: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'SUSPENDED';
  status: 'Active' | 'Inactive'; // for backward compatibility
  admissionDate: string;
  parentName: string;
  relationship: string;
  parentPhone: string;
  altPhone?: string;
  attendancePercentage: number;
  attendanceRate: number; // backward compatibility
  remarks?: string;
  image?: string;
  email?: string;
  streamId: string;
  gradeLevel: string; // Form + Stream e.g. Form 1A
  grades: Grade[];
  overallPosition?: number;
}

export interface GradingScale {
  id: string;
  letter: string;
  minScore: number;
  status: 'Pass' | 'Fail';
  remarks: string;
}

export interface Stream {
  id: string;
  name: string;
  room: string;
  gradeLevel: string;
  studentCount: number;
  avgPerformance: number;
  trend: string; // e.g. +2.4%, -1.2%, Stable
  type: 'Science' | 'Arts' | 'Commercial';
  teacherId?: string | null;
  teacherName?: string | null;
}

export interface Subject {
  id: string;
  name: string;
  assignedStreams: string[]; // e.g. ['stream-a', 'stream-b']
  teacherName: string;
  teacherId?: string;
}

export interface Assessment {
  id: string;
  studentId: string;
  studentName: string;
  streamId: string;
  subject: string;
  examType: 'Exam' | 'CA';
  score: number;
  maxScore: number;
  term: string; // e.g. 'Term 1', 'Term 2', 'Term 3'
  date: string;
}

export interface Activity {
  id: string;
  type: 'enrollment' | 'score_update';
  title: string;
  description: string;
  time: string; // e.g., 2 minutes ago
}
