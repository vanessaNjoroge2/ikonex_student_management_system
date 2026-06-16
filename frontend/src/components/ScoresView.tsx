import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, Clock, Sparkles, Check, CheckCircle2, 
  AlertTriangle, Play, X, Trash2, HelpCircle, Loader2, Edit3, 
  TrendingUp, BarChart2, Grid, Award, SlidersHorizontal, ChevronRight,
  ChevronDown, TrendingDown, PlusCircle
} from 'lucide-react';
import { Student, Assessment, Stream, Subject } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line
} from 'recharts';

interface ScoresViewProps {
  students: Student[];
  assessments: Assessment[];
  streams: Stream[];
  subjects: Subject[];
  onAddAssessment: (newAssessment: any) => void;
  onUpdateAssessment: (updated: any) => void;
  onDeleteAssessment: (catId?: string, examId?: string) => void;
  prefilledSubject: string | null;
  onClearPrefill: () => void;
}

export default function ScoresView({ 
  students, 
  assessments, 
  streams,
  subjects,
  onAddAssessment, 
  onUpdateAssessment,
  onDeleteAssessment,
  prefilledSubject,
  onClearPrefill
}: ScoresViewProps) {
  // Sub-navigation within Scores tab
  const [activeSubTab, setActiveSubTab] = useState<'record' | 'charts' | 'class'>('record');

  // Score assessment form states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [chosenSubject, setChosenSubject] = useState('');
  const [catMarks, setCatMarks] = useState('');
  const [examMarks, setExamMarks] = useState('');
  const [chosenTerm, setChosenTerm] = useState('Term 1');

  // Interactive filters for the table
  const [filterFormLevel, setFilterFormLevel] = useState('all');
  const [filterStreamName, setFilterStreamName] = useState('all');
  const [filterSubjectName, setFilterSubjectName] = useState('all');
  const [filterStudentSearch, setFilterStudentSearch] = useState('');
  const [filterTerm, setFilterTerm] = useState('all');

  // Collapsible groups state
  const [collapsedGroups, setCollapsedGroups] = useState<{ [key: string]: boolean }>({});

  // Editing state
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [editCatVal, setEditCatVal] = useState('');
  const [editExamVal, setEditExamVal] = useState('');
  const [editTerm, setEditTerm] = useState('Term 1');

  // States for dynamic feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [validationError, setValidationError] = useState('');

  // Interactive filters for charts/rankings
  const [chartSelectedStudentId, setChartSelectedStudentId] = useState(students[0]?.id || '');
  const [classSelectedStreamId, setClassSelectedStreamId] = useState('stream-a');
  const [classSelectedSubjectName, setClassSelectedSubjectName] = useState('Mathematics');
  const [trendSelectedSubject, setTrendSelectedSubject] = useState('Mathematics');

  const terms = ['Term 1', 'Term 2', 'Term 3'];

  // Update selected student/stream when lists load asynchronously
  useEffect(() => {
    if (students.length > 0 && !chartSelectedStudentId) {
      setChartSelectedStudentId(students[0].id);
    }
  }, [students, chartSelectedStudentId]);

  useEffect(() => {
    if (streams.length > 0 && classSelectedStreamId === 'stream-a') {
      setClassSelectedStreamId(streams[0].id);
    }
  }, [streams, classSelectedStreamId]);

  // Handle prefilled subject from navigation
  useEffect(() => {
    if (prefilledSubject) {
      setChosenSubject(prefilledSubject);
      onClearPrefill();
    }
  }, [prefilledSubject, onClearPrefill]);

  // Auto-filtering student dropdown for entry form
  const matchingStudents = studentSearch.trim() === '' || selectedStudent
    ? []
    : students.filter(s => 
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
        s.id.toLowerCase().includes(studentSearch.toLowerCase())
      );

  const checkDuplicateWarning = (studentId: string, subject: string, term: string): boolean => {
    if (!studentId || !subject || !term) {
      setValidationError('');
      return false;
    }
    // A duplicate is defined if there is already ANY score record for the student + subject + term
    const exists = assessments.some(a => 
      a.studentId === studentId && 
      a.subject.toLowerCase() === subject.toLowerCase() && 
      a.term === term
    );

    if (exists) {
      setValidationError("Score already recorded. Use Edit to update.");
      return true;
    } else {
      setValidationError('');
      return false;
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setStudentSearch(student.name);
    checkDuplicateWarning(student.id, chosenSubject, chosenTerm);
  };

  // Re-run validation checks on field changes
  useEffect(() => {
    if (selectedStudent && chosenSubject && chosenTerm) {
      checkDuplicateWarning(selectedStudent.id, chosenSubject, chosenTerm);
    } else {
      setValidationError('');
    }
  }, [selectedStudent, chosenSubject, chosenTerm]);

  // Dynamic calculated total inline
  const numericCAT = parseFloat(catMarks) || 0;
  const numericExam = parseFloat(examMarks) || 0;
  const inlineTotal = numericCAT + numericExam;

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) {
      alert("Please choose a student.");
      return;
    }
    if (!chosenSubject) {
      alert("Please select an academic subject.");
      return;
    }

    const cat = catMarks.trim() === '' ? 0 : parseFloat(catMarks);
    const exam = examMarks.trim() === '' ? 0 : parseFloat(examMarks);

    if (cat < 0 || cat > 30) {
      alert("CAT Marks must be between 0 and 30.");
      return;
    }
    if (exam < 0 || exam > 70) {
      alert("Exam Marks must be between 0 and 70.");
      return;
    }
    if (cat + exam > 100) {
      alert("Total Marks (CAT + Exam) cannot exceed 100.");
      return;
    }

    if (checkDuplicateWarning(selectedStudent.id, chosenSubject, chosenTerm)) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      onAddAssessment({
        studentId: selectedStudent.id,
        subject: chosenSubject,
        term: chosenTerm,
        catScore: cat,
        examScore: exam
      });
      setIsSubmitting(false);

      setToastMsg(`Recorded scores for ${selectedStudent.firstName} ${selectedStudent.lastName}`);
      setShowToast(true);

      // Reset form
      setSelectedStudent(null);
      setStudentSearch('');
      setCatMarks('');
      setExamMarks('');
      setValidationError('');

      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  // Group assessments by student, term, and map to subjects horizontally
  const getHorizontalRows = () => {
    const rowsMap: { [key: string]: any } = {};

    students.forEach(student => {
      const stream = streams.find(st => st.id === student.streamId);
      const streamName = stream ? stream.name : 'Stream A';

      terms.forEach(term => {
        const rowKey = `${student.id}-${term}`;
        rowsMap[rowKey] = {
          key: rowKey,
          studentId: student.id,
          studentName: student.name,
          firstName: student.name.split(' ')[0] || '',
          lastName: student.name.split(' ').slice(1).join(' ') || '',
          streamId: student.streamId,
          streamName,
          formLevel: student.formLevel,
          stream: student.stream,
          term,
          subjectScores: {}, // subjectName -> { catScore, examScore, total, catId, examId }
          cumulativeTotal: 0,
        };
      });
    });

    // Populate scores
    assessments.forEach(rec => {
      const rowKey = `${rec.studentId}-${rec.term}`;
      if (!rowsMap[rowKey]) return;

      const row = rowsMap[rowKey];
      const subName = rec.subject;
      if (!row.subjectScores[subName]) {
        row.subjectScores[subName] = {
          catScore: 0,
          catId: undefined,
          examScore: 0,
          examId: undefined,
        };
      }

      if (rec.examType === 'CA') {
        row.subjectScores[subName].catScore = rec.score;
        row.subjectScores[subName].catId = rec.id;
      } else {
        row.subjectScores[subName].examScore = rec.score;
        row.subjectScores[subName].examId = rec.id;
      }
    });

    // Calculate totals and convert to array
    const allRows = Object.values(rowsMap).map((row: any) => {
      let cumulativeTotal = 0;
      subjects.forEach(sub => {
        const scoreInfo = row.subjectScores[sub.name];
        if (scoreInfo) {
          const total = (scoreInfo.catScore || 0) + (scoreInfo.examScore || 0);
          scoreInfo.total = total;
          cumulativeTotal += total;
        } else {
          row.subjectScores[sub.name] = {
            catScore: 0,
            examScore: 0,
            total: 0,
          };
        }
      });
      row.cumulativeTotal = cumulativeTotal;
      return row;
    });

    // Filter by form, stream, student search, term, and subject
    return allRows.filter((row: any) => {
      const matchForm = filterFormLevel === 'all' || row.formLevel === filterFormLevel;
      const matchStream = filterStreamName === 'all' || row.stream === filterStreamName;
      const matchTerm = filterTerm === 'all' || row.term === filterTerm;
      const matchStudent = row.studentName.toLowerCase().includes(filterStudentSearch.toLowerCase());
      
      const hasScores = filterSubjectName === 'all'
        ? Object.values(row.subjectScores).some((s: any) => s.catId || s.examId)
        : !!(row.subjectScores[filterSubjectName]?.catId || row.subjectScores[filterSubjectName]?.examId);

      return matchForm && matchStream && matchTerm && matchStudent && hasScores;
    });
  };

  const getGroupedRows = () => {
    const filteredRows = getHorizontalRows();
    const grouped: { [key: string]: { formLevel: string; stream: string; rows: any[] } } = {};

    const formsOrder = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
    const streamsOrder = ['A', 'B', 'C', 'D'];

    formsOrder.forEach(f => {
      streamsOrder.forEach(s => {
        const groupKey = `${f}-${s}`;
        grouped[groupKey] = {
          formLevel: f,
          stream: s,
          rows: []
        };
      });
    });

    filteredRows.forEach(row => {
      const f = row.formLevel || 'Form 1';
      const s = row.stream || 'A';
      const groupKey = `${f}-${s}`;
      if (grouped[groupKey]) {
        grouped[groupKey].rows.push(row);
      } else {
        grouped[groupKey] = {
          formLevel: f,
          stream: s,
          rows: [row]
        };
      }
    });

    return Object.keys(grouped)
      .map(key => {
        const g = grouped[key];
        g.rows.sort((a, b) => a.studentName.localeCompare(b.studentName));
        return {
          key,
          ...g
        };
      })
      .filter(g => g.rows.length > 0);
  };

  const groupedRows = getGroupedRows();
  const totalRecordsCount = groupedRows.reduce((acc, g) => acc + g.rows.length, 0);

  // Open Edit Modal
  const handleOpenEdit = (g: any) => {
    setEditingRecord(g);
    setEditCatVal(String(g.catScore));
    setEditExamVal(String(g.examScore));
    setEditTerm(g.term);
  };

  // Submit Edit Score
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const cat = editCatVal.trim() === '' ? 0 : parseFloat(editCatVal);
    const exam = editExamVal.trim() === '' ? 0 : parseFloat(editExamVal);

    if (cat < 0 || cat > 30) {
      alert("CAT Marks must be between 0 and 30.");
      return;
    }
    if (exam < 0 || exam > 70) {
      alert("Exam Marks must be between 0 and 70.");
      return;
    }
    if (cat + exam > 100) {
      alert("Total Marks (CAT + Exam) cannot exceed 100.");
      return;
    }

    onUpdateAssessment({
      studentId: editingRecord.studentId,
      subject: editingRecord.subject,
      term: editTerm,
      catId: editingRecord.catId,
      catScore: cat,
      examId: editingRecord.examId,
      examScore: exam
    });

    setToastMsg(`Updated score record for ${editingRecord.studentName}`);
    setShowToast(true);
    setEditingRecord(null);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Delete
  const handleDelete = (g: any) => {
    if (confirm(`Remove scores for ${g.studentName} in ${g.subject}?`)) {
      onDeleteAssessment(g.catId, g.examId);
      setToastMsg(`Removed score record.`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // --- RECHARTS CALCULATIONS FOR CHARTS TAB ---
  const currentChartStudent = students.find(s => s.id === chartSelectedStudentId) || students[0];

  const getGroupedBarData = () => {
    if (!currentChartStudent) return [];
    return subjects.map(sub => {
      const studentAss = assessments.filter(a => a.studentId === currentChartStudent.id && a.subject.toLowerCase() === sub.name.toLowerCase());
      const caRec = studentAss.find(a => a.examType === 'CA');
      const examRec = studentAss.find(a => a.examType === 'Exam');
      
      const caScore = caRec ? Math.round((caRec.score / caRec.maxScore) * 100) : 0;
      const examScore = examRec ? Math.round((examRec.score / examRec.maxScore) * 100) : 0;

      return {
        name: sub.name,
        'Continuous Assessment (CA) %': caScore,
        'Final Examination %': examScore,
      };
    });
  };

  const getRadarData = () => {
    if (!currentChartStudent) return [];
    return subjects.map(sub => {
      const studentAss = assessments.filter(a => a.studentId === currentChartStudent.id && a.subject.toLowerCase() === sub.name.toLowerCase());
      let combinedPct = 0;
      if (studentAss.length > 0) {
        const sum = studentAss.reduce((acc, curr) => acc + (curr.score / curr.maxScore * 100), 0);
        combinedPct = Math.round(sum / studentAss.length);
      }
      return {
        subject: sub.name,
        Performance: combinedPct,
      };
    });
  };

  const getLineTrendData = () => {
    if (!currentChartStudent) return [];
    return terms.map(t => {
      const studentAss = assessments.filter(a => 
        a.studentId === currentChartStudent.id && 
        a.subject.toLowerCase() === trendSelectedSubject.toLowerCase() && 
        a.term === t
      );
      let val = 0;
      if (studentAss.length > 0) {
        const scoreSum = studentAss.reduce((acc, curr) => acc + curr.score, 0);
        const maxSum = studentAss.reduce((acc, curr) => acc + curr.maxScore, 0);
        val = maxSum > 0 ? Math.round((scoreSum / maxSum) * 100) : 0;
      }
      return {
        term: t,
        'Score %': val
      };
    });
  };

  const getClassRankingsData = () => {
    const streamStudents = students.filter(s => s.streamId === classSelectedStreamId);
    
    const ranked = streamStudents.map(student => {
      const studentAss = assessments.filter(a => 
        a.studentId === student.id && 
        a.subject.toLowerCase() === classSelectedSubjectName.toLowerCase()
      );

      const caRec = studentAss.find(a => a.examType === 'CA');
      const examRec = studentAss.find(a => a.examType === 'Exam');

      const caScore = caRec ? caRec.score : 0;
      const caMax = caRec ? caRec.maxScore : 30;
      const examScore = examRec ? examRec.score : 0;
      const examMax = examRec ? examRec.maxScore : 70;

      const totalPoints = caScore + examScore;
      const maxPoints = caMax + examMax;
      const totalPercent = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

      return {
        name: student.name,
        caScore,
        caMax,
        examScore,
        examMax,
        totalPoints,
        maxPoints,
        totalPercent
      };
    });

    return ranked.sort((a, b) => b.totalPercent - a.totalPercent);
  };

  return (
    <div className="space-y-6 animate-in duration-500 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold text-[#9333ea] tracking-widest uppercase">
            Curriculum Assessments
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
            Academic Performance Log
          </h2>
        </div>

        <div className="flex p-1.5 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button 
            onClick={() => setActiveSubTab('record')}
            className={`flex-1 sm:flex-initial px-4 py-2 font-bold text-xs rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'record'
                ? 'bg-white text-[#9333ea] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Record & List
          </button>
          <button 
            onClick={() => setActiveSubTab('charts')}
            className={`flex-1 sm:flex-initial px-4 py-2 font-bold text-xs rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'charts'
                ? 'bg-white text-[#9333ea] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Student Insights
          </button>
          <button 
            onClick={() => setActiveSubTab('class')}
            className={`flex-1 sm:flex-initial px-4 py-2 font-bold text-xs rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'class'
                ? 'bg-white text-[#9333ea] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Class Rankings
          </button>
        </div>
      </div>

      {activeSubTab === 'record' && (
        <div className="space-y-6">
          {/* Additive Filter Bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search student name..."
                value={filterStudentSearch}
                onChange={(e) => setFilterStudentSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:border-[#9333ea] outline-none"
              />
            </div>
            
            <div className="w-full md:w-48">
              <select
                value={filterFormLevel}
                onChange={(e) => setFilterFormLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none"
              >
                <option value="all">All Forms</option>
                <option value="Form 1">Form 1</option>
                <option value="Form 2">Form 2</option>
                <option value="Form 3">Form 3</option>
                <option value="Form 4">Form 4</option>
              </select>
            </div>

            <div className="w-full md:w-48">
              <select
                value={filterStreamName}
                onChange={(e) => setFilterStreamName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none"
              >
                <option value="all">All Streams</option>
                <option value="A">Stream A</option>
                <option value="B">Stream B</option>
                <option value="C">Stream C</option>
                <option value="D">Stream D</option>
              </select>
            </div>

            <div className="w-full md:w-48">
              <select
                value={filterSubjectName}
                onChange={(e) => setFilterSubjectName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none"
              >
                <option value="all">All Subjects</option>
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.name}>{sub.name}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-48">
              <select
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none"
              >
                <option value="all">All Terms</option>
                {terms.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 h-fit space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Grading & Score Input</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Submit CAT (out of 30) and Exam (out of 70).</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {validationError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold leading-relaxed flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{validationError}</span>
                  </div>
                )}

                <div className="space-y-1.5 relative">
                  <label className="text-xs font-bold text-slate-500 uppercase">Select Student</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search student name..."
                      value={studentSearch}
                      onChange={(e) => {
                        setStudentSearch(e.target.value);
                        if (selectedStudent && e.target.value !== `${selectedStudent.firstName} ${selectedStudent.lastName}`) {
                          setSelectedStudent(null);
                        }
                      }}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-707 focus:border-[#9333ea] outline-none"
                    />
                    {selectedStudent && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudent(null);
                          setStudentSearch('');
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {!selectedStudent && matchingStudents.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-44 overflow-y-auto divide-y divide-slate-100">
                      {matchingStudents.map(student => (
                        <div
                          key={student.id}
                          onClick={() => handleStudentSelect(student)}
                          className="p-2.5 text-xs font-semibold text-slate-707 hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                        >
                          <span>{student.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {streams.find(st => st.id === student.streamId)?.name || 'Stream A'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Assigned Student Stream</label>
                  <div className="w-full px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black">
                    {selectedStudent 
                      ? streams.find(st => st.id === selectedStudent.streamId)?.name || 'Stream A'
                      : 'Select student to resolve stream...'
                    }
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Academic Course / Subject</label>
                  <select
                    value={chosenSubject}
                    onChange={(e) => setChosenSubject(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-707 transition"
                  >
                    <option value="">-- Choose Subject --</option>
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.name}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Term Period</label>
                  <select
                    value={chosenTerm}
                    onChange={(e) => setChosenTerm(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#9333ea] outline-none"
                  >
                    {terms.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">CAT Marks (Max 30)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="30"
                      placeholder="e.g. 22"
                      value={catMarks}
                      onChange={(e) => setCatMarks(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-black text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Exam Marks (Max 70)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="70"
                      placeholder="e.g. 55"
                      value={examMarks}
                      onChange={(e) => setExamMarks(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-black text-slate-800"
                    />
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-700 bg-purple-50/50 p-3.5 rounded-xl border border-purple-100/50 flex justify-between items-center">
                  <span>Auto-calculated Total:</span>
                  <span className="text-[#9333ea] font-black text-sm">{inlineTotal} / 100</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !!validationError}
                  className={`w-full py-3.5 rounded-xl text-xs font-black tracking-wide shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSubmitting || !!validationError
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-[#9333ea] hover:bg-[#7e22ce] text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Record Score Entry</span>
                  )}
                </button>
              </form>
            </div>

            {/* Scores Table */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-slate-900 text-sm">Recorded Scores Logs</h3>
                <span className="px-2 py-0.5 bg-slate-100 text-[#9333ea] rounded text-[10px] font-black font-mono">
                  {totalRecordsCount} Record(s) listed
                </span>
              </div>

              {(() => {
                const renderedSubjects = filterSubjectName === 'all'
                  ? subjects
                  : subjects.filter(s => s.name.toLowerCase() === filterSubjectName.toLowerCase());

                return (
                  <div className="overflow-x-auto rounded-xl border border-slate-150 bg-white">
                    <table className="w-full text-left text-xs text-slate-700 min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-150 text-[10px] uppercase tracking-wider">
                          <th rowSpan={2} className="p-3">Student Name</th>
                          <th rowSpan={2} className="p-3">Stream</th>
                          {renderedSubjects.map(sub => (
                            <th key={sub.id} colSpan={3} className="p-3 text-center border-l border-slate-200/85 bg-slate-50/85">
                              {sub.name}
                            </th>
                          ))}
                          <th rowSpan={2} className="p-3 text-center border-l border-slate-200">Cumulative Total</th>
                        </tr>
                        <tr className="bg-slate-50/50 text-[9px] text-slate-500 font-bold border-b border-slate-150">
                          {renderedSubjects.map(sub => (
                            <React.Fragment key={sub.id}>
                              <th className="p-2 text-center border-l border-slate-150">CAT</th>
                              <th className="p-2 text-center">Exam</th>
                              <th className="p-2 text-center font-extrabold text-slate-600 bg-slate-100/50">Total</th>
                            </React.Fragment>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {groupedRows.map(group => {
                          const isCollapsed = !!collapsedGroups[group.key];
                          const groupKey = group.key;
                          return (
                            <React.Fragment key={groupKey}>
                              {/* Group Header Row */}
                              <tr 
                                onClick={() => {
                                  setCollapsedGroups(prev => ({
                                    ...prev,
                                    [groupKey]: !prev[groupKey]
                                  }));
                                }}
                                className="bg-slate-100/70 hover:bg-slate-200/50 cursor-pointer transition select-none text-slate-750 font-extrabold"
                              >
                                <td 
                                  colSpan={3 + renderedSubjects.length * 3} 
                                  className="p-3 border-y border-slate-200"
                                >
                                  <div className="flex items-center gap-2 text-xs">
                                    {isCollapsed ? (
                                      <ChevronRight className="w-4 h-4 text-[#9333ea]" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-[#9333ea]" />
                                    )}
                                    <span>
                                      {group.formLevel} — Stream {group.stream}
                                    </span>
                                    <span className="ml-auto px-2 py-0.5 bg-purple-50 text-[#9333ea] rounded-[6px] text-[9px] font-bold">
                                      {group.rows.length} {group.rows.length === 1 ? 'record' : 'records'}
                                    </span>
                                  </div>
                                </td>
                              </tr>

                              {/* Student Rows (only if not collapsed) */}
                              {!isCollapsed && group.rows.map(row => (
                                <tr key={row.key} className="hover:bg-slate-50/50 group">
                                  <td className="p-3">
                                    <p className="font-bold text-slate-900 leading-none">{row.studentName}</p>
                                    <p className="text-[9px] text-slate-400 font-mono mt-1">{row.term}</p>
                                  </td>
                                  <td className="p-3 text-slate-500 font-semibold">{row.streamName}</td>
                                  {renderedSubjects.map(sub => {
                                    const scoreInfo = row.subjectScores[sub.name] || { catScore: 0, examScore: 0, total: 0 };
                                    return (
                                      <React.Fragment key={sub.id}>
                                        <td className="p-2 text-center font-mono font-bold text-slate-600 border-l border-slate-100">
                                          {scoreInfo.catId ? scoreInfo.catScore : '-'}
                                        </td>
                                        <td className="p-2 text-center font-mono font-bold text-slate-600">
                                          {scoreInfo.examId ? scoreInfo.examScore : '-'}
                                        </td>
                                        <td className="p-2 text-center font-mono font-black text-[#9333ea] bg-purple-50/30">
                                          <div className="flex items-center justify-center gap-1.5">
                                            <span>{scoreInfo.catId || scoreInfo.examId ? scoreInfo.total : '-'}</span>
                                            {(scoreInfo.catId || scoreInfo.examId) && (
                                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                  onClick={() => handleOpenEdit({
                                                    studentId: row.studentId,
                                                    studentName: row.studentName,
                                                    subject: sub.name,
                                                    term: row.term,
                                                    catId: scoreInfo.catId,
                                                    catScore: scoreInfo.catScore,
                                                    examId: scoreInfo.examId,
                                                    examScore: scoreInfo.examScore,
                                                  })}
                                                  className="p-0.5 text-slate-400 hover:text-[#9333ea] hover:bg-slate-100 rounded"
                                                  title="Edit Score"
                                                >
                                                  <Edit3 className="w-3 h-3" />
                                                </button>
                                                <button
                                                  onClick={() => handleDelete({
                                                    studentName: row.studentName,
                                                    subject: sub.name,
                                                    catId: scoreInfo.catId,
                                                    examId: scoreInfo.examId,
                                                  })}
                                                  className="p-0.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                                                  title="Delete Score"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        </td>
                                      </React.Fragment>
                                    );
                                  })}
                                  <td className="p-3 text-center font-mono text-xs font-black text-slate-800 bg-slate-100/50 border-l border-slate-200">
                                    {row.cumulativeTotal} pts
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          );
                        })}

                        {groupedRows.length === 0 && (
                          <tr>
                            <td colSpan={3 + renderedSubjects.length * 3} className="py-12 text-center text-slate-400">
                              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                              <p className="text-xs font-semibold">No recorded scores found matching the active filters.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* VIEW PANEL 2: STUDENT INSIGHTS CHARTS */}
      {activeSubTab === 'charts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-[#9333ea]" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-xs">Visualize Performance</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Filter charts on any student profile in the academy.</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <select
                value={chartSelectedStudentId}
                onChange={(e) => setChartSelectedStudentId(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none w-full sm:w-64"
              >
                {students.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({streams.find(s => s.id === st.streamId)?.name || 'Stream A'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {currentChartStudent && assessments.some(a => a.studentId === currentChartStudent.id) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CHART 1: GROUPED BAR CHART CA vs Exam */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Continuous Assessment (CA) vs Examination Score %</h4>
                  <p className="text-[10px] text-slate-400">Comparing score efficiency out of 100% per subject course.</p>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getGroupedBarData()}
                      margin={{ top: 20, right: 10, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                      <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(value) => [`${value}%`]} />
                      <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                      <Bar dataKey="Continuous Assessment (CA) %" fill="#fb923c" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Final Examination %" fill="#9333ea" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CHART 2: RADAR CHART Strength breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Academic Strength Profile (Radar Chart)</h4>
                  <p className="text-[10px] text-slate-400">Balanced overview of subject capabilities.</p>
                </div>

                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarData()}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} fontWeight="bold" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" fontSize={9} />
                      <Radar name="Student Grade Percent" dataKey="Performance" stroke="#9333ea" fill="#9333ea" fillOpacity={0.15} />
                      <Tooltip formatter={(value) => [`${value}%`]} />
                      <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CHART 3: PERFORMANCE TREND LINE CHART */}
              <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Individual Performance Trend Across Terms</h4>
                    <p className="text-[10px] text-slate-400">Progression record across Term 1, Term 2, and Term 3.</p>
                  </div>

                  <select
                    value={trendSelectedSubject}
                    onChange={(e) => setTrendSelectedSubject(e.target.value)}
                    className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 outline-none"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getLineTrendData()} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="term" stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                      <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(value) => [`${value}%`]} />
                      <Line type="monotone" dataKey="Score %" stroke="#9333ea" strokeWidth={3} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold">Select a student profile with recorded scores to render diagrams.</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW PANEL 3: CLASS RANKINGS & HEATMAPS */}
      {activeSubTab === 'class' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-[#9333ea]" />
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">Class Rankings & Visual Grids</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Selected Stream</label>
                <select
                  value={classSelectedStreamId}
                  onChange={(e) => setClassSelectedStreamId(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                >
                  {streams.map(str => (
                    <option key={str.id} value={str.id}>{str.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Selected Subject</label>
                <select
                  value={classSelectedSubjectName}
                  onChange={(e) => setClassSelectedSubjectName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Students Performance Ranking (Total Score)</h4>
                <p className="text-[10px] text-slate-400">Ranks of all enrollees in the class sorted by Total Achieved (CA + Exam score).</p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white flex-1 mt-4">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <th className="p-3">Rank / Name</th>
                      <th className="p-3 text-center">CA Score</th>
                      <th className="p-3 text-center">Exam Score</th>
                      <th className="p-3 text-right">Composite Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {getClassRankingsData().map((player, idx) => {
                      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
                      return (
                        <tr key={player.name} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-800 flex items-center gap-2">
                            <span className="font-black text-xs min-w-[20px]">{medal}</span>
                            <span>{player.name}</span>
                          </td>
                          <td className="p-3 text-center font-mono">
                            {player.caScore}/{player.caMax}
                          </td>
                          <td className="p-3 text-center font-mono">
                            {player.examScore}/{player.examMax}
                          </td>
                          <td className="p-3 text-right font-black text-xs text-slate-900 font-mono">
                            {player.totalPoints} / {player.maxPoints} pts ({player.totalPercent}%)
                          </td>
                        </tr>
                      );
                    })}

                    {getClassRankingsData().length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400">
                          <p className="text-xs font-semibold">No student scores are reported in this combination.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Quality Heatmap Grid</h4>
                <p className="text-[10px] text-slate-400 mb-4">Students vs subject coverage map. Red: &lt;60%, Yellow: 60-80%, Green: &ge;80%.</p>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {students.map(st => (
                  <div key={st.id} className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                    <p className="text-xs font-extrabold text-slate-800 leading-none">{st.name}</p>
                    
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {subjects.map(sub => {
                        const assessmentsList = assessments.filter(a => a.studentId === st.id && a.subject.toLowerCase() === sub.name.toLowerCase());
                        let percent = 0;
                        if (assessmentsList.length > 0) {
                          const ca = assessmentsList.find(a => a.examType === 'CA')?.score || 0;
                          const ex = assessmentsList.find(a => a.examType === 'Exam')?.score || 0;
                          percent = ca + ex;
                        }

                        let badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
                        let labelWord = 'E / Fail';
                        if (percent >= 75) {
                          badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                          labelWord = 'A / Exclt';
                        } else if (percent >= 60) {
                          badgeBg = 'bg-purple-50 text-purple-800 border-purple-200';
                          labelWord = 'B / Good';
                        } else if (percent >= 45) {
                          badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
                          labelWord = 'C / Pass';
                        } else if (percent >= 30) {
                          badgeBg = 'bg-orange-50 text-orange-800 border-orange-200';
                          labelWord = 'D / Poor';
                        }

                        return (
                          <div 
                            key={sub.id} 
                            className={`p-2 rounded-lg border text-[9px] font-black tracking-tight leading-normal ${badgeBg} flex flex-col justify-between`}
                            title={`${sub.name}: ${percent}%`}
                          >
                            <span className="line-clamp-1 block text-[10px] pb-1 border-b border-white/50">{sub.name}</span>
                            <div className="flex justify-between items-center mt-1">
                              <span>{percent}%</span>
                              <span className="opacity-75 uppercase text-[7px]">{labelWord}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm border border-slate-200 shadow-2xl scale-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Edit Score Records
              </h3>
              <button 
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Student Name</label>
                <p className="text-xs font-bold text-slate-800">{editingRecord.studentName}</p>
                <p className="text-[10px] text-slate-400 font-mono">ID: #{editingRecord.studentId}</p>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-505 uppercase">Course Subject</label>
                  <p className="text-xs font-semibold text-slate-700">{editingRecord.subject}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-505 uppercase">Term Period</label>
                  <p className="text-xs font-semibold text-slate-700">{editingRecord.term}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase block">Term Period</label>
                <select
                  value={editTerm}
                  onChange={(e) => setEditTerm(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {terms.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-505">CAT Marks (Max 30)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="30"
                    value={editCatVal}
                    onChange={(e) => setEditCatVal(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-550">Exam Marks (Max 70)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="70"
                    value={editExamVal}
                    onChange={(e) => setEditExamVal(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none"
                  />
                </div>
              </div>

              <div className="text-xs font-bold text-slate-700 bg-purple-50/50 p-3 rounded-xl border border-purple-100/50 flex justify-between items-center">
                <span>Calculated Total:</span>
                <span className="text-[#9333ea] font-black text-sm">
                  {(parseFloat(editCatVal) || 0) + (parseFloat(editExamVal) || 0)} / 100
                </span>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#9333ea] hover:bg-[#7e22ce] text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Apply Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl min-w-[280px]">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
