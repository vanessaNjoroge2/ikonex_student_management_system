import React, { useState, useEffect } from 'react';
import {
  BookOpen, Plus, Edit, Trash2, ChevronRight, X, User, Users,
  Award, TrendingUp, Sparkles, Check, CheckCircle2, Loader2, ArrowLeft
} from 'lucide-react';
import { Subject, Stream, Student, Assessment } from '../types';

interface SubjectsViewProps {
  subjects: Subject[];
  streams: Stream[];
  students: Student[];
  assessments: Assessment[];
  onAddSubject: (newSubject: Subject) => void;
  onUpdateSubject: (updatedSubject: Subject) => void;
  onDeleteSubject: (id: string) => void;
  onInputMarks: (subjectName: string) => void;
  currentUser: any;
  token: string | null;
}

export default function SubjectsView({
  subjects,
  streams,
  students,
  assessments,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onInputMarks,
  currentUser,
  token
}: SubjectsViewProps) {
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form states
  const [subjectName, setSubjectName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedStreams, setSelectedStreams] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  // Teachers list state for admins
  const [teachers, setTeachers] = useState<any[]>([]);

  // Toast feedback state
  const [toast, setToast] = useState<{ show: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (currentUser?.role === 'ADMIN' && token) {
      fetch('/api/accounts', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            const filtered = result.data.filter((u: any) => u.role === 'TEACHER' || u.role === 'ADMIN');
            setTeachers(filtered);
          }
        })
        .catch(err => console.error('Failed to load teachers:', err));
    }
  }, [currentUser, token]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const triggerToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setSubjectName('');
    setTeacherName('');
    setSelectedTeacherId('');
    setSelectedStreams([]);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (sub: Subject, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSubject(sub);
    setSubjectName(sub.name);
    setTeacherName(sub.teacherName);
    setSelectedTeacherId(sub.teacherId || '');
    setSelectedStreams(sub.assignedStreams);
    setFormError('');
    setIsFormOpen(true);
  };

  const toggleStreamOption = (streamId: string) => {
    if (selectedStreams.includes(streamId)) {
      setSelectedStreams(selectedStreams.filter(id => id !== streamId));
    } else {
      setSelectedStreams([...selectedStreams, streamId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      setFormError('Subject Name is required');
      return;
    }

    let finalTeacherName = teacherName.trim();
    let finalTeacherId = selectedTeacherId;

    if (currentUser?.role === 'ADMIN') {
      if (!selectedTeacherId) {
        setFormError('Please select a teacher');
        return;
      }
      const found = teachers.find(t => t.id === selectedTeacherId);
      finalTeacherName = found ? found.name : '';
    } else {
      if (!finalTeacherName) {
        setFormError('Teacher Name is required');
        return;
      }
    }

    if (selectedStreams.length === 0) {
      setFormError('Please assign at least one stream class');
      return;
    }

    if (editingSubject) {
      const updated: Subject = {
        ...editingSubject,
        name: subjectName.trim(),
        teacherName: finalTeacherName,
        teacherId: finalTeacherId || undefined,
        assignedStreams: selectedStreams,
      };
      onUpdateSubject(updated);
      setIsFormOpen(false);
      triggerToast(`Subject "${updated.name}" updated successfully.`);
      if (selectedSubject?.id === updated.id) {
        setSelectedSubject(updated);
      }
    } else {
      const isDuplicate = subjects.some(s => s.name.toLowerCase() === subjectName.trim().toLowerCase());
      if (isDuplicate) {
        setFormError('A subject with this name already exists.');
        return;
      }
      const newSub: Subject = {
        id: `sub-${Date.now()}`,
        name: subjectName.trim(),
        teacherName: finalTeacherName,
        teacherId: finalTeacherId || undefined,
        assignedStreams: selectedStreams,
      };
      onAddSubject(newSub);
      setIsFormOpen(false);
      triggerToast(`Subject "${newSub.name}" created successfully.`);
    }
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the subject "${name}"? This action is irreversible.`)) {
      onDeleteSubject(id);
      triggerToast(`Subject "${name}" has been deleted.`);
      if (selectedSubject?.id === id) {
        setSelectedSubject(null);
      }
    }
  };

  const getSubjectStats = (subject: Subject) => {
    const subAssessments = assessments.filter(a => a.subject.toLowerCase() === subject.name.toLowerCase());

    const studentTotals: { [studentId: string]: number } = {};
    subAssessments.forEach(a => {
      if (!studentTotals[a.studentId]) studentTotals[a.studentId] = 0;
      studentTotals[a.studentId] += a.score;
    });

    const totalsArray = Object.values(studentTotals);

    const avgScore = totalsArray.length > 0
      ? Math.round(totalsArray.reduce((acc, curr) => acc + curr, 0) / totalsArray.length)
      : 0;

    const topScore = totalsArray.length > 0
      ? Math.round(Math.max(...totalsArray))
      : 0;

    const totalStudentsInStreams = students.filter(student =>
      subject.assignedStreams.includes(student.streamId)
    ).length;

    const passingStudentsCount = Object.keys(studentTotals).filter(sId => {
      const student = students.find(s => s.id === sId);
      if (!student || !subject.assignedStreams.includes(student.streamId)) return false;
      return studentTotals[sId] >= 45;
    }).length;

    return { avgScore, topScore, passingStudentsCount, totalStudentsInStreams };
  };

  const getSubjectEnrolleesPerformance = (subject: Subject) => {
    const subjectStudents = students.filter(student =>
      subject.assignedStreams.includes(student.streamId)
    );

    const performance = subjectStudents.map(student => {
      const studentAss = assessments.filter(a =>
        a.studentId === student.id &&
        a.subject.toLowerCase() === subject.name.toLowerCase()
      );

      const caRec = studentAss.find(a => a.examType === 'CA');
      const examRec = studentAss.find(a => a.examType === 'Exam');

      const caScore = caRec ? caRec.score : 0;
      const examScore = examRec ? examRec.score : 0;
      const total = caScore + examScore;

      return {
        id: student.id,
        name: student.name,
        streamName: streams.find(s => s.id === student.streamId)?.name || 'Stream A',
        caScore,
        examScore,
        total
      };
    });

    return performance.sort((a, b) => b.total - a.total);
  };

  return (
    <div className="space-y-6 animate-in duration-500 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            School Subjects
          </h2>
          <p className="text-xs font-semibold text-slate-500">
            Manage academic curriculum and teacher assignments for fixed Stream classes A, B, and C.
          </p>
        </div>
        {!selectedSubject && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 bg-[#3525cd] hover:bg-[#4f46e5] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 cursor-pointer active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4 text-white" />
            Add New Subject
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-52 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-52 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-52 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      ) : selectedSubject ? (
        /* SUBJECT DETAIL VIEW */
        <div className="space-y-6 animate-in duration-300 slide-in-from-left-4 fade-in">
          <button
            onClick={() => setSelectedSubject(null)}
            className="flex items-center gap-2 text-xs font-bold text-[#3525cd] hover:text-[#4f46e5]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Subjects Directory
          </button>

          <header className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#3525cd] flex items-center justify-center font-black">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedSubject.name}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1 font-semibold">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Teacher: {selectedSubject.teacherName}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onInputMarks(selectedSubject.name)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#3525cd] hover:bg-[#4f46e5] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                Input Marks
              </button>
              <button
                onClick={(e) => handleOpenEdit(selectedSubject, e)}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Subject Details
              </button>
              <button
                onClick={(e) => handleDelete(selectedSubject.id, selectedSubject.name, e)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100/70 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* PERFORMANCE SNAPSHOT CARD */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              <div>
                <span className="text-[10px] font-bold text-[#3525cd] tracking-widest uppercase">
                  Academic Insights
                </span>
                <h4 className="text-base font-extrabold text-slate-900 mt-0.5">Performance Snapshot</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50 text-center space-y-1">
                  <TrendingUp className="w-5 h-5 text-[#3525cd] mx-auto" />
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Average Score</p>
                  <p className="text-2xl font-black text-[#3525cd]">{getSubjectStats(selectedSubject).avgScore}%</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 text-center space-y-1">
                  <Award className="w-5 h-5 text-emerald-600 mx-auto" />
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Top Score</p>
                  <p className="text-2xl font-black text-emerald-700">{getSubjectStats(selectedSubject).topScore}%</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 text-center space-y-1">
                  <Users className="w-5 h-5 text-slate-600 mx-auto" />
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Total Candidates</p>
                  <p className="text-2xl font-black text-slate-800">
                    {getSubjectStats(selectedSubject).totalStudentsInStreams}
                  </p>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3">Passing Status</h5>
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                  <span>Enrolled Passing Rate</span>
                  <span className="text-[#3525cd] font-bold">
                    {getSubjectStats(selectedSubject).totalStudentsInStreams > 0
                      ? Math.round((getSubjectStats(selectedSubject).passingStudentsCount / getSubjectStats(selectedSubject).totalStudentsInStreams) * 100)
                      : 94}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#3525cd] h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${getSubjectStats(selectedSubject).totalStudentsInStreams > 0
                        ? (getSubjectStats(selectedSubject).passingStudentsCount / getSubjectStats(selectedSubject).totalStudentsInStreams) * 100
                        : 94}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ASSIGNED STREAMS BREAKDOWN */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Assigned Streams</h4>
              <p className="text-xs text-slate-500">
                This subject is actively taught across these fixed student streams:
              </p>

              <div className="space-y-2">
                {streams.map(str => {
                  const assigned = selectedSubject.assignedStreams.includes(str.id);
                  return (
                    <div
                      key={str.id}
                      className={`p-3 rounded-xl border flex justify-between items-center text-xs font-semibold ${assigned
                          ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
                          : 'bg-slate-50 border-slate-200/60 text-slate-400'
                        }`}
                    >
                      <span>{str.name} ({str.gradeLevel})</span>
                      {assigned ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-[9px] uppercase">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Unassigned</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PER-SUBJECT PERFORMANCE TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <div>
              <h4 className="text-base font-extrabold text-slate-900">Student Subject Rankings</h4>
              <p className="text-xs text-slate-500">Ranks of all enrollees in assigned streams, sorted descending by Total marks.</p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-150 bg-white">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-150">
                    <th className="p-3">Rank / Student Name</th>
                    <th className="p-3">Stream</th>
                    <th className="p-3 text-center">CAT Score (30)</th>
                    <th className="p-3 text-center">Exam Score (70)</th>
                    <th className="p-3 text-right">Total (100)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {getSubjectEnrolleesPerformance(selectedSubject).map((player, idx) => {
                    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
                    return (
                      <tr key={player.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-800 flex items-center gap-2">
                          <span className="font-black text-xs min-w-[20px]">{medal}</span>
                          <span>{player.name}</span>
                        </td>
                        <td className="p-3 text-slate-500 font-semibold">{player.streamName}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-700">{player.caScore}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-700">{player.examScore}</td>
                        <td className="p-3 text-right font-black text-xs text-slate-900 font-mono">{player.total} / 100</td>
                      </tr>
                    );
                  })}
                  {getSubjectEnrolleesPerformance(selectedSubject).length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-semibold">No students enrolled in assigned streams.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* SUBJECTS MAIN LIST DIRECTORY */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {subjects.map(sub => {
            const streamNames = sub.assignedStreams.map(sid => {
              const str = streams.find(s => s.id === sid);
              return str ? str.name : 'Stream';
            });

            return (
              <div
                key={sub.id}
                onClick={() => setSelectedSubject(sub)}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#3525cd]/30 transition-all cursor-pointer flex flex-col justify-between group min-h-[13rem] relative"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 bg-indigo-50 text-[#3525cd] rounded-xl flex items-center justify-center group-hover:bg-[#3525cd] group-hover:text-white transition-colors shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleOpenEdit(sub, e)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-[#3525cd]"
                        title="Edit Subject"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(sub.id, sub.name, e)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-rose-600"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 group-hover:text-[#3525cd] transition-colors line-clamp-1 block text-sm">
                      {sub.name}
                    </h4>
                    <p className="text-[11px] font-semibold text-slate-400 mt-1 flex items-center gap-1 font-sans">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      {sub.teacherName}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                  <div className="flex flex-wrap gap-1.5 max-w-[85%]">
                    {streamNames.map((n, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-[#3525cd] rounded text-[10px] font-extrabold font-mono whitespace-nowrap"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 ml-auto shrink-0 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#3525cd]" />
                {editingSubject ? 'Edit Subject Curricula' : 'Add Academic Subject'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2 animate-bounce">
                  <span>⚠️</span>
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                  Subject Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Theoretical Biology"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#3525cd] focus:ring-4 focus:ring-indigo-100 text-xs outline-none transition-all font-semibold text-slate-800"
                />
              </div>

              {currentUser?.role === 'ADMIN' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                    Assign Teacher
                  </label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#3525cd] outline-none text-xs font-semibold text-slate-800"
                  >
                    <option value="">-- Choose Teacher --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.role.toLowerCase()})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                    Teacher Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mrs. Rosalin Franklin"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#3525cd] focus:ring-4 focus:ring-indigo-100 text-xs outline-none transition-all font-semibold text-slate-800"
                    disabled
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                  Assign Stream Classes
                </label>
                <p className="text-[10px] text-slate-500 mb-2">Select which fixed streams offer this course:</p>

                <div className="max-h-36 overflow-y-auto pr-1">
                  <div className="grid grid-cols-3 gap-2">
                    {streams.map(str => {
                      const isSelected = selectedStreams.includes(str.id);
                      return (
                        <button
                          type="button"
                          key={str.id}
                          onClick={() => toggleStreamOption(str.id)}
                          className={`py-2 rounded-xl border text-xs font-black transition-all cursor-pointer text-center ${isSelected
                              ? 'bg-[#3525cd] text-white border-transparent shadow shadow-indigo-600/30'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                            }`}
                        >
                          {str.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#3525cd] hover:bg-[#4f46e5] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 cursor-pointer transition-all"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Toasts */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl min-w-[280px] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}