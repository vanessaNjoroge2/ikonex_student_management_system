import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Printer, Award, BookOpen, Check, TrendingUp,
  ChevronDown, AlertCircle, FileCheck, CheckCircle2, X, Users, 
  HelpCircle, Sparkles, Filter, SlidersHorizontal, ArrowUpRight
} from 'lucide-react';
import { Student, Stream, Subject, Assessment } from '../types';
import { getGradeLetter } from '../data';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

interface ReportsViewProps {
  students: Student[];
  streams: Stream[];
  subjects: Subject[];
  assessments: Assessment[];
  token?: string | null;
}

export default function ReportsView({ students, streams, subjects, assessments, token }: ReportsViewProps) {
  // Navigation layout: Students Reports vs Class Summaries vs School Analytics
  const [activeTab, setActiveTab] = useState<'student_card' | 'class_summary' | 'analytics'>('student_card');
  
  // Interactive Filters
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || 'ST-2024-002');
  const [selectedStreamId, setSelectedStreamId] = useState('stream-a');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');

  // Animation layout
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (students.length > 0 && selectedStudentId === 'ST-2024-002') {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  useEffect(() => {
    if (streams.length > 0 && selectedStreamId === 'stream-a') {
      setSelectedStreamId(streams[0].id);
    }
  }, [streams, selectedStreamId]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const triggerMockAction = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingClass, setIsDownloadingClass] = useState(false);

  const handleDownloadStudentPDF = async () => {
    if (!currentStudent || !selectedStudentId) return;
    setIsDownloading(true);
    try {
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`/api/reports/student/${selectedStudentId}/pdf?term=${encodeURIComponent(selectedTerm)}`, {
        headers
      });
      
      if (!res.ok) {
        throw new Error('Failed to generate report card PDF');
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ReportCard_${currentStudent.admissionNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      triggerMockAction('Report card downloaded successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadClassPDF = async () => {
    if (!selectedStreamId) return;
    setIsDownloadingClass(true);
    try {
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`/api/reports/summary/pdf?streamId=${encodeURIComponent(selectedStreamId)}&term=${encodeURIComponent(selectedTerm)}`, {
        headers
      });
      
      if (!res.ok) {
        throw new Error('Failed to generate class summary PDF');
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ClassSummary_${currentStream?.name.replace(/\s+/g, '')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      triggerMockAction('Class report summary downloaded successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to download class PDF. Please try again.');
    } finally {
      setIsDownloadingClass(false);
    }
  };

  // Resolve Student
  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  // Helper remarks generator
  const getRemarksForGrade = (letter: string) => {
    if (letter.startsWith('A')) return 'Demonstrates outstanding comprehension and critical analyses.';
    if (letter.startsWith('B')) return 'Commendable effort. Solid application in core assessments.';
    if (letter.startsWith('C')) return 'Consistent progress. Work on refining minor theoretical parameters.';
    if (letter.startsWith('D')) return 'Requires targeted support and reviews of weekly topics.';
    return 'Action plan recommended for essential recovery.';
  };

  // Helper letter grade calculation
  const getLetterGrade = (scorePct: number) => {
    return getGradeLetter(scorePct).letter;
  };

  // Compute student table grades from enrollees + raw assessments
  const getReportCardGrades = (student: Student) => {
    if (!student) return [];
    
    if (student.grades && student.grades.length > 0) {
      return student.grades.map(g => {
        const caVal = g.caScore ?? 0;
        const caMax = g.caMax ?? 30;
        const exVal = g.examScore ?? 0;
        const exMax = g.examMax ?? 70;
        const totalVal = g.totalScore ?? (caVal + exVal);
        const totalMax = g.totalMax ?? (caMax + exMax);
        const pct = g.percent ?? (totalMax > 0 ? Math.round((totalVal / totalMax) * 100) : 0);
        
        return {
          subject: g.subject,
          ca: `${caVal}/${caMax}`,
          exam: `${exVal}/${exMax}`,
          total: `${totalVal}/${totalMax}`,
          percent: pct,
          grade: g.letter,
          subjectPosition: g.subjectPosition,
          remarks: g.remarks || getRemarksForGrade(g.letter)
        };
      });
    }

    return subjects.map(sub => {
      const studentAss = assessments.filter(a => 
        a.studentId === student.id && 
        a.subject.toLowerCase() === sub.name.toLowerCase() &&
        a.term === selectedTerm
      );
      const caRec = studentAss.find(a => a.examType === 'CA');
      const examRec = studentAss.find(a => a.examType === 'Exam');

      const caVal = caRec ? caRec.score : 0;
      const caMax = caRec ? caRec.maxScore : 30;
      const exVal = examRec ? examRec.score : 0;
      const exMax = examRec ? examRec.maxScore : 70;

      const totalVal = caVal + exVal;
      const totalMax = caMax + exMax;
      const pct = totalMax > 0 ? Math.round((totalVal / totalMax) * 100) : 0;
      const letter = getLetterGrade(pct);

      return {
        subject: sub.name,
        ca: `${caVal}/${caMax}`,
        exam: `${exVal}/${exMax}`,
        total: `${totalVal}/${totalMax}`,
        percent: pct,
        grade: letter,
        subjectPosition: undefined,
        remarks: getRemarksForGrade(letter)
      };
    });
  };

  // Mini radar chart for the current report card student
  const getReportCardRadarData = (student: Student) => {
    if (!student) return [];
    const gr = getReportCardGrades(student);
    return gr.map(sub => ({
      subject: sub.subject,
      'Score %': sub.percent
    }));
  };

  // --- CLASS SUMMARIES INSIGHTS ---
  const currentStream = streams.find(s => s.id === selectedStreamId) || streams[0];
  const streamStudents = students.filter(s => s.streamId === selectedStreamId);

  // 1. Avg score per subject for selected stream
  const getSubjectAveragesForStream = () => {
    return subjects.map(sub => {
      // Find enrollees in that subject and stream
      const filterAssess = assessments.filter(a => 
        a.streamId === selectedStreamId && 
        a.subject.toLowerCase() === sub.name.toLowerCase() &&
        a.term === selectedTerm
      );

      let meanPct = 0;
      if (filterAssess.length > 0) {
        const sumGroupIdx = filterAssess.reduce((acc, curr) => acc + (curr.score / curr.maxScore * 100), 0);
        meanPct = Math.round(sumGroupIdx / filterAssess.length);
      }

      return {
        subject: sub.name,
        'Group Average %': Math.max(0, Math.min(100, meanPct))
      };
    });
  };

  // Locate top performer and highest average subject
  const getStreamPerformanceHighlights = () => {
    if (streamStudents.length === 0) {
      return { topName: 'None', highestSub: 'None', lowestSub: 'None' };
    }
    const sortedStud = [...streamStudents].sort((a,b) => b.kcpeScore - a.kcpeScore);
    const topName = sortedStud[0]?.fullName || sortedStud[0]?.name || 'Julianne Moore';

    const avgs = getSubjectAveragesForStream();
    const sortedAvgs = [...avgs].sort((a,b) => b['Group Average %'] - a['Group Average %']);
    const highestSub = sortedAvgs[0]?.subject || 'Mathematics';
    const lowestSub = sortedAvgs[sortedAvgs.length - 1]?.subject || 'English Literature';

    return { topName, highestSub, lowestSub };
  };

  // 2. Stream Comparison average per subject (Stream A vs B vs C)
  const getStreamComparisonChartData = () => {
    return subjects.map(sub => {
      const dataRow: any = { subject: sub.name };
      streams.forEach(str => {
        const filt = assessments.filter(a => 
          a.streamId === str.id && 
          a.subject.toLowerCase() === sub.name.toLowerCase() &&
          a.term === selectedTerm
        );
        let avg = 0;
        if (filt.length > 0) {
          avg = Math.round(filt.reduce((acc, curr) => acc + (curr.score / curr.maxScore * 100), 0) / filt.length);
        }
        dataRow[`${str.name} %`] = avg;
      });
      return dataRow;
    });
  };

  // --- ANALYTICS DATAS (PIE CHART, TRENDS, TOP 10) ---

  // 1. Grade distribution donut data
  const getGradePieData = () => {
    // enrollees distribution of A, B, C, D, E grades
    let countA = 0; let countB = 0; let countC = 0; let countD = 0; let countE = 0;
    
    // count grade distributions in current stream enrollees using real assessments
    streamStudents.forEach(st => {
      subjects.forEach(sub => {
        const studentAss = assessments.filter(a => 
          a.studentId === st.id && 
          a.subject.toLowerCase() === sub.name.toLowerCase() &&
          a.term === selectedTerm
        );
        const caRec = studentAss.find(a => a.examType === 'CA');
        const examRec = studentAss.find(a => a.examType === 'Exam');
        
        if (caRec || examRec) {
          const caVal = caRec ? caRec.score : 0;
          const exVal = examRec ? examRec.score : 0;
          const totalVal = caVal + exVal;
          const gradeRes = getGradeLetter(totalVal);
          if (gradeRes.letter === 'A') countA++;
          else if (gradeRes.letter === 'B') countB++;
          else if (gradeRes.letter === 'C') countC++;
          else if (gradeRes.letter === 'D') countD++;
          else if (gradeRes.letter === 'E') countE++;
        }
      });
    });

    return [
      { name: 'Grade A Range', value: countA, color: '#9333ea' },
      { name: 'Grade B Range', value: countB, color: '#6366f1' },
      { name: 'Grade C Range', value: countC, color: '#fb923c' },
      { name: 'Grade D Range', value: countD, color: '#f59e0b' },
      { name: 'Grade E Range', value: countE, color: '#f43f5e' },
    ];
  };

  // 2. Term over term class average trend line
  const getTermTrendData = () => {
    const getTermAverage = (termName: string) => {
      const termAssessments = assessments.filter(a => a.streamId === selectedStreamId && a.term === termName);
      if (termAssessments.length === 0) return 0;
      const totalPct = termAssessments.reduce((sum, a) => sum + (a.score / a.maxScore) * 100, 0);
      return Math.round(totalPct / termAssessments.length);
    };

    return [
      { name: 'Term 1', 'Class Average %': getTermAverage('Term 1') },
      { name: 'Term 2', 'Class Average %': getTermAverage('Term 2') },
      { name: 'Term 3', 'Class Average %': getTermAverage('Term 3') },
    ];
  };

  // 3. Top Performers pod list
  const getTopTenPerformers = () => {
    const studentsWithScore = students.map(st => {
      const studentAss = assessments.filter(a => a.studentId === st.id && a.term === selectedTerm);
      let avgPct = 0;
      if (studentAss.length > 0) {
        const totalPct = studentAss.reduce((sum, a) => sum + (a.score / a.maxScore) * 100, 0);
        avgPct = Math.round(totalPct / studentAss.length);
      } else {
        avgPct = Math.round(((st.kcpeScore || 0) / 500) * 100);
      }
      return {
        student: st,
        avgPct
      };
    });

    const sorted = [...studentsWithScore].sort((a, b) => b.avgPct - a.avgPct);
    return sorted.slice(0, 10).map((item, i) => {
      return {
        rank: i + 1,
        name: item.student.fullName || item.student.name,
        streamName: `${item.student.formLevel} ${item.student.stream}`,
        kcpeScore: item.student.kcpeScore,
        scorePct: `${item.avgPct}%`
      };
    });
  };

  return (
    <div className="space-y-6 animate-in duration-500 fade-in">
      
      {/* Header controls pane */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold text-[#9333ea] tracking-widest uppercase">
            Official Academic Registries
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
            Academia Reports
          </h2>
        </div>

        {/* Major views tabs switch */}
        <div className="flex p-1.5 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('student_card')}
            className={`flex-1 sm:flex-initial px-4 py-2 font-bold text-xs rounded-lg transition-all cursor-pointer ${
              activeTab === 'student_card'
                ? 'bg-white text-[#9333ea] shadow-sm font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Report Card
          </button>
          
          <button 
            onClick={() => setActiveTab('class_summary')}
            className={`flex-1 sm:flex-initial px-4 py-2 font-bold text-xs rounded-lg transition-all cursor-pointer ${
              activeTab === 'class_summary'
                ? 'bg-white text-[#9333ea] shadow-sm font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Class Summaries
          </button>

          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 sm:flex-initial px-4 py-2 font-bold text-xs rounded-lg transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white text-[#9333ea] shadow-sm font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            School Analytics
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          {/* TAB 1: INDIVIDUAL STUDENT REPORT CARDS */}
          {activeTab === 'student_card' && currentStudent && (
            <div className="space-y-6">
              
              {/* Filter card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Filter className="w-5 h-5 text-[#9333ea]" />
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-xs">Generate Student Report Transcript</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Select any candidate to compile Q3 official grades report.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none w-full sm:w-64"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({streams.find(str => str.id === s.streamId)?.name || 'Stream A'})
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none w-full sm:w-32"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>
              </div>

              {/* PDF Document Container card wrapper matches PDF aesthetics perfectly */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in duration-350 zoom-in-95">
                
                {/* Official header of layout */}
                <div className="p-8 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#9333ea] text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-purple-600/15">
                      IK
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">IKONEX ACADEMY</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 font-mono">
                        Primary Student transcript registry
                      </p>
                    </div>
                  </div>

                  <div className="text-left md:text-right space-y-1">
                    <span className="px-3 py-1 bg-[#f3e8ff] text-[#9333ea] text-[9px] font-black uppercase tracking-wider rounded-full">
                      Official Document card
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium pt-1 font-mono">Generated: 2026-06-04</p>
                  </div>
                </div>

                {/* Body details info section */}
                <div className="p-8 space-y-6">
                  
                  {/* Student personal identity block */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Candidate Name</p>
                      <p className="text-xs font-bold text-slate-900 pt-0.5">{currentStudent.fullName || currentStudent.name}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Student ID Number</p>
                      <p className="text-xs font-mono font-semibold text-slate-700 pt-0.5">#{currentStudent.id}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Assigned Stream</p>
                      <p className="text-xs font-black text-[#9333ea] pt-0.5">
                        {streams.find(s => s.id === currentStudent.streamId)?.name || 'Stream A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Overall Class Rank</p>
                      <p className="text-xs font-black text-purple-700 pt-0.5 font-mono">
                        {currentStudent.overallPosition ? `#${currentStudent.overallPosition}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">KCPE Enrollment Score</p>
                      <p className="text-xs font-black text-slate-700 pt-0.5 font-mono">{currentStudent.kcpeScore} / 500</p>
                    </div>
                  </div>

                  {/* Core report list table and radar split row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Grades detailed map */}
                    <div className="md:col-span-2 space-y-3">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Subjects breakdown</h4>
                      <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100">
                              <th className="p-3">Subject Offering</th>
                              <th className="p-3 text-center">CA (30 max)</th>
                              <th className="p-3 text-center">Exam (70 max)</th>
                              <th className="p-3 text-center">Total (100)</th>
                              <th className="p-3 text-center">Rank</th>
                              <th className="p-3 text-right">Grade</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {getReportCardGrades(currentStudent).map(g => (
                              <tr key={g.subject} className="hover:bg-slate-50/20 text-slate-650">
                                <td className="p-3 font-bold text-slate-900 text-[11px] leading-tight">
                                  {g.subject}
                                  <span className="text-[9px] text-slate-400 block font-normal leading-relaxed mt-0.5 max-w-[200px] line-clamp-1 italic-custom">
                                    "{g.remarks}"
                                  </span>
                                </td>
                                <td className="p-3 text-center font-mono font-medium">{g.ca}</td>
                                <td className="p-3 text-center font-mono font-medium">{g.exam}</td>
                                <td className="p-3 text-center font-black font-mono text-slate-900">{g.total}</td>
                                <td className="p-3 text-center font-bold text-[#9333ea] font-mono">
                                  {g.subjectPosition ? `#${g.subjectPosition}` : 'N/A'}
                                </td>
                                <td className="p-3 text-right">
                                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded font-extrabold font-mono text-[10px] border border-emerald-100">
                                    {g.grade}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Mini radar chart showing capabilities visualization inside card */}
                    <div className="bg-slate-50/50 rounded-2xl border border-slate-150 p-4 space-y-3">
                      <div className="text-center">
                        <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Performance Map</h4>
                        <p className="text-[9px] text-slate-400">Multi-axis visual overview</p>
                      </div>

                      <div className="h-44 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getReportCardRadarData(currentStudent)}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={8} fontWeight="bold" />
                            <PolarRadiusAxis domain={[0, 100]} stroke="#94a3b8" fontSize={7} />
                            <Radar name="Scoring" dataKey="Score %" stroke="#9333ea" fill="#9333ea" fillOpacity={0.15} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Print bottom controllers actions block inside report */}
                <div className="p-6 bg-slate-50 border-t border-slate-100/80 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold font-mono">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    CERTIFIED BY PRINCIPAL REGISTRATION DESK
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => triggerMockAction('Your local systems printer dialogue is loading...')}
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Transcript
                    </button>
                    <button
                      onClick={handleDownloadStudentPDF}
                      disabled={isDownloading}
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#9333ea] hover:bg-[#7e22ce] disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow shadow-purple-600/10 cursor-pointer transition flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {isDownloading ? 'Generating...' : 'Export To PDF'}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: CLASS SUMMARIES & STREAM AVERAGES */}
          {activeTab === 'class_summary' && (
            <div className="space-y-6">
              
              {/* Filter controls bar for stream comparison */}
              <div className="bg-white rounded-2xl border border-[#e2e8f0]/80 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#9333ea]" />
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Class Report Filters</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Stream to Analyze</label>
                    <select
                      value={selectedStreamId}
                      onChange={(e) => setSelectedStreamId(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-[#e2e8f0] rounded-xl text-xs font-bold text-slate-700 outline-none"
                    >
                      {streams.map(str => (
                        <option key={str.id} value={str.id}>{str.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Academic Term</label>
                    <select
                      value={selectedTerm}
                      onChange={(e) => setSelectedTerm(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-[#e2e8f0] rounded-xl text-xs font-bold text-[#475569] outline-none"
                    >
                      <option value="Term 1">Term 1 (Autumn)</option>
                      <option value="Term 2">Term 2 (Spring)</option>
                      <option value="Term 3">Term 3 (Summer Finals)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* HIGHLIGHT INFRASTRUCTURE KPI CARDS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-28">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Top Stream Performer</span>
                  <p className="text-sm font-black text-slate-900 pt-1 line-clamp-1">
                    {getStreamPerformanceHighlights().topName}
                  </p>
                  <span className="text-[10px] text-[#9333ea] font-semibold flex items-center gap-1 mt-1">
                    Highest GPA Candidate <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-28">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Highest Avg Subject</span>
                  <p className="text-sm font-black text-emerald-800 pt-1 line-clamp-1">
                    {getStreamPerformanceHighlights().highestSub}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    Strongest Domain Performance
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-28">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Lowest Avg Subject</span>
                  <p className="text-sm font-black text-amber-800 pt-1 line-clamp-1">
                    {getStreamPerformanceHighlights().lowestSub}
                  </p>
                  <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 mt-1">
                    Targeted Review Recommended
                  </span>
                </div>

              </div>

              {/* CHART 2.1: SUBJECT AVERAGES FOR CHOSEN STREAM CHARTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Subject-level Average Score Percentage for {currentStream?.name}</h4>
                    <p className="text-[10px] text-slate-400">Summary evaluates class average marks from Term exams.</p>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getSubjectAveragesForStream()} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="subject" stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                        <YAxis stroke="#94a3b8" fontSize={9} fontWeight="bold" tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(value) => [`${value}%`]} />
                        <Bar dataKey="Group Average %" fill="#9333ea" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* CHART 2.2: STREAM COMPARISON GROUPED BAR CHART */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Stream A vs Stream B vs Stream C subject comparison</h4>
                    <p className="text-[10px] text-slate-400">Comparing absolute stream averages per study subject.</p>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getStreamComparisonChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="subject" stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                        <YAxis stroke="#94a3b8" fontSize={9} fontWeight="bold" tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(value) => [`${value}%`]} />
                        <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} />
                        {streams.map((str, idx) => {
                          const colors = ["#9333ea", "#6366f1", "#fb923c", "#f59e0b"];
                          return (
                            <Bar 
                              key={str.id}
                              dataKey={`${str.name} %`} 
                              fill={colors[idx % colors.length]} 
                              radius={[3, 3, 0, 0]} 
                            />
                          );
                        })}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Bottom Generate & Download actions pane */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 font-mono">
                  COMPREHENSIVE CLASS STATISTICS REPORT FOR {currentStream?.name.toUpperCase()}
                </span>
                <button
                  onClick={handleDownloadClassPDF}
                  disabled={isDownloadingClass}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#9333ea] hover:bg-[#7e22ce] disabled:bg-slate-300 text-white rounded-xl text-xs font-black shadow transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  {isDownloadingClass ? 'Generating...' : 'Download Class Report'}
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: SCHOOL ANALYTICS (PIE CHART, TERM OVER TERM, TOP PERFORMERS PODIUM) */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* DONUT PIE CHART: Grade Distributions */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Letter Grade Distribution (A / B / C / D / F)</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mb-2">Analyzing student grade segments in Stream group.</p>
                  </div>

                  <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getGradePieData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {getGradePieData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* LINE CHART: Term over Term Trend */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Term-over-Term Progression Trend</h4>
                    <p className="text-[10px] text-slate-400 mb-2">Track the overall stream average improvement across semesters.</p>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getTermTrendData()} margin={{ top: 15, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="black" />
                        <YAxis stroke="#94a3b8" fontSize={10} fontWeight="black" tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(value) => [`${value}%`]} />
                        <Line type="monotone" dataKey="Class Average %" stroke="#9333ea" strokeWidth={4} activeDot={{ r: 7 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* TOP PERFORMERS ROSTER PODIUM */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Top Performers Podium (Ranked Top 10)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Top-ranking enrollees globally across all academic modules.</p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
                  <table className="w-full text-left text-xs text-slate-705">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <th className="p-3">Rank / Nominee</th>
                        <th className="p-3 font-semibold">Assigned Stream</th>
                        <th className="p-3 text-center">Score Ratio Index</th>
                        <th className="p-3 text-right">KCPE Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {getTopTenPerformers().map(item => {
                        const trophyBadge = item.rank === 1 ? '🥇 1st Place' : item.rank === 2 ? '🥈 2nd Place' : item.rank === 3 ? '🥉 3rd Place' : `#${item.rank}`;
                        const badgeStyle = item.rank === 1 ? 'bg-amber-50 text-amber-900 border-amber-200 font-black' : item.rank === 2 ? 'bg-slate-100 text-slate-700 border-slate-200 font-bold' : item.rank === 3 ? 'bg-orange-50 text-orange-950 border-orange-200 font-bold' : 'text-slate-500 font-medium';
                        return (
                          <tr key={item.name} className="hover:bg-slate-50/50">
                            <td className="p-3">
                              <span className={`px-2.5 py-1 border rounded text-[10px] inline-block mr-3 ${badgeStyle}`}>
                                {trophyBadge}
                              </span>
                              <span className="font-extrabold text-slate-950">{item.name}</span>
                            </td>
                            <td className="p-3 text-slate-600 font-bold">{item.streamName}</td>
                            <td className="p-3 text-center text-slate-400 font-mono">{item.scorePct}</td>
                            <td className="p-3 text-right text-[#9333ea] font-black font-mono text-sm">{item.kcpeScore} / 500</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </>
      )}

      {/* Floating alert notifications */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-2xl shadow-xl min-w-[280px] animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

    </div>
  );
}
