import React, { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, RefreshCw, BarChart2, Award,
  ArrowLeft, Search, Filter, Sparkles, Trophy, User, BookOpen, Edit, X, Loader2, CheckCircle2
} from 'lucide-react';
import { Stream, Student } from '../types';

interface StreamsViewProps {
  streams: Stream[];
  students: Student[];
  currentUser?: any;
  token?: string | null;
  onRefresh?: () => void;
}

export default function StreamsView({ streams, students, currentUser, token, onRefresh }: StreamsViewProps) {
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // States for Teacher Assignment
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string } | null>(null);

  // States for Stream Creation
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newStreamName, setNewStreamName] = useState('');
  const [newStreamRoom, setNewStreamRoom] = useState('');
  const [newStreamGradeLevel, setNewStreamGradeLevel] = useState('Form 1');
  const [newStreamType, setNewStreamType] = useState<'Science' | 'Arts' | 'Commercial'>('Science');
  const [newStreamTeacherId, setNewStreamTeacherId] = useState('');

  const triggerToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast(null), 3000);
  };

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

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStreamId || !token) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/streams/${activeStreamId}/teacher`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ teacherId: selectedTeacherId || null })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        triggerToast('Class teacher assigned successfully.');
        setIsAssignOpen(false);
        if (onRefresh) onRefresh();
      } else {
        alert(result.error?.message || 'Failed to assign teacher.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreamName.trim() || !newStreamRoom.trim() || !token) {
      alert('Stream Name and Room are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/streams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newStreamName.trim(),
          room: newStreamRoom.trim(),
          gradeLevel: newStreamGradeLevel,
          type: newStreamType,
          teacherId: newStreamTeacherId || undefined
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        triggerToast(`Class stream ${newStreamName} created successfully.`);
        setIsCreateOpen(false);
        setNewStreamName('');
        setNewStreamRoom('');
        setNewStreamGradeLevel('Form 1');
        setNewStreamType('Science');
        setNewStreamTeacherId('');
        if (onRefresh) onRefresh();
      } else {
        alert(result.error?.message || 'Failed to create stream.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeStream = streams.find(s => s.id === activeStreamId);

  // Filter students belonging to active stream
  const activeStreamStudents = activeStream 
    ? students.filter(s => s.streamId === activeStream.id && 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const enrolledStudents = activeStream
    ? students.filter(s => s.streamId === activeStream.id)
    : [];

  const avgAttendance = enrolledStudents.length > 0
    ? (enrolledStudents.reduce((sum, s) => sum + (s.attendanceRate || 0), 0) / enrolledStudents.length).toFixed(1)
    : '0.0';

  const honorsCount = enrolledStudents.filter(s => (s.kcpeScore || 0) >= 350).length;
  const honorsRatio = enrolledStudents.length > 0
    ? Math.round((honorsCount / enrolledStudents.length) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-in duration-500 fade-in">
      
      {activeStream ? (
        /* STREAM DETAIL AND REAL CLASS ROSTER */
        <div className="animate-in duration-400 fade-in slide-in-from-right-4 space-y-6">
          <header className="sticky top-0 bg-white/95 backdrop-blur-md p-4 flex flex-col sm:flex-row sm:items-center justify-between border border-slate-200/80 rounded-2xl shadow-sm z-30 gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setActiveStreamId(null);
                  setSearchQuery('');
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer border border-slate-100"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {activeStream.name} Class Cohort
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono pt-0.5">
                  Room {activeStream.room} • {activeStream.gradeLevel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Class Cumulative Average:</span>
              <div className="flex bg-purple-50 text-[#9333ea] px-3 py-1.5 rounded-xl items-center gap-1.5 text-xs font-black">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{activeStream.avgPerformance}%</span>
              </div>
            </div>
          </header>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-gradient-to-br from-[#7e22ce] to-[#9333ea] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="relative z-10 space-y-4">
                <p className="text-[10px] font-bold tracking-widest uppercase text-purple-100">Enrolment Summary</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tight">
                    {students.filter(s => s.streamId === activeStream.id).length}
                  </span>
                  <span className="text-xs text-purple-100 font-semibold">Active Candidates</span>
                </div>
                <div className="pt-2 border-t border-white/20 flex justify-between text-[11px] text-purple-100">
                  <span>Classroom Attendance</span>
                  <span className="font-extrabold text-white">{avgAttendance}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Classroom Headmaster</span>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400" />
                    {activeStream.teacherName || 'Not Assigned'}
                  </p>
                  {currentUser?.role === 'ADMIN' && (
                    <button
                      onClick={() => {
                        setSelectedTeacherId(activeStream.teacherId || '');
                        setIsAssignOpen(true);
                      }}
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-[#9333ea] cursor-pointer"
                      title="Assign Class Teacher"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="text-[10px] text-[#9333ea] font-bold">Primary Guidance Counsellor</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Passing Criteria KCPE</span>
                <p className="text-sm font-extrabold text-emerald-800 pt-1 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  350+ Honors Ratio
                </p>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">{honorsRatio}% of cohort exceeds margin</div>
            </div>

          </div>

          {/* Class Student Roster Table list with filter query */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h4 className="text-base font-extrabold text-slate-900 tracking-tight">Stream Enrollees Roster</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Students currently grouped in {activeStream.name}.</p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search stream roster..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-705 outline-none focus:border-[#9333ea] transition"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-150 bg-white shadow-sm">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-150">
                    <th className="p-3">Student Name</th>
                    <th className="p-3 text-center">Overall Rank</th>
                    <th className="p-3">Parent Information</th>
                    <th className="p-3 text-center">Contact</th>
                    <th className="p-3 text-right">Academic Stand KCPE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {activeStreamStudents.map((st, i) => {
                    const badgeColor = st.kcpeScore >= 360 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                      : st.kcpeScore >= 280 
                        ? 'bg-purple-50 text-purple-800 border border-purple-100' 
                        : 'bg-rose-50 text-rose-805 border border-rose-100';

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/50">
                        <td className="p-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-150">
                            <img 
                              alt={st.fullName || st.name} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${st.fullName || st.name}`} 
                            />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 leading-none">{st.fullName || st.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-1">ID: #{st.id}</p>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2.5 py-1 bg-purple-50 text-[#9333ea] font-black rounded-lg text-[10px] font-mono border border-purple-100">
                            {st.overallPosition ? `#${st.overallPosition}` : 'N/A'}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="text-slate-800 font-semibold">{st.parentName || 'N/A'}</p>
                          <p className="text-[9px] text-[#9333ea] font-bold font-mono">Guardian</p>
                        </td>
                        <td className="p-3 text-center text-slate-500 font-mono text-[11px]">
                          {st.parentPhone || '(234) 555-0192'}
                        </td>
                        <td className="p-3 text-right">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-black font-mono ${badgeColor}`}>
                            {st.kcpeScore} pts
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {activeStreamStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-semibold">No students discovered matching filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* MAIN STREAM COMPARISONS GRID - STANDARD HOVER FLOW */
        <div className="space-y-6 animate-in duration-500 fade-in">
          {currentUser?.role === 'ADMIN' && (
            <div className="flex justify-between items-center bg-white p-4 border border-slate-200/80 rounded-2xl shadow-sm flex-col sm:flex-row gap-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Class Streams Directory</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Create academic class streams and manage class teacher assignments.</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 bg-[#9333ea] hover:bg-[#7e22ce] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-purple-600/10 active:scale-95"
              >
                Create Stream
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {streams.map(stream => {
              // dynamic count of student
              const enrolledCount = students.filter(s => s.streamId === stream.id).length;
              
              return (
                <div
                  key={stream.id}
                  onClick={() => setActiveStreamId(stream.id)}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#9333ea]/40 hover:bg-slate-50/20 active:scale-[0.98] cursor-pointer transition-all flex flex-col justify-between h-56"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 bg-purple-50 text-[#9333ea] rounded-2xl flex items-center justify-center font-black">
                        {stream.name.slice(-1)}
                      </div>

                      <span className="px-3 py-1 bg-purple-55/10 text-[#9333ea] bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase font-mono">
                        Avg: {stream.avgPerformance}%
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-extrabold text-slate-905">{stream.name}</h4>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Room {stream.room} • {stream.gradeLevel}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        Class Teacher: {stream.teacherName || 'Not Assigned'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                      <Users className="w-4 h-4 text-slate-400 shrink-0" />
                      {enrolledCount} Students Enrolled
                    </span>
                    <span className="text-[#9333ea] font-bold flex items-center gap-1 group-hover:underline">
                      Roster directory &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ASSIGN TEACHER MODAL */}
      {isAssignOpen && activeStream && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                <User className="w-4 h-4 text-[#9333ea]" />
                Assign Teacher to {activeStream.name}
              </h3>
              <button
                onClick={() => setIsAssignOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignTeacher} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                  Select Class Teacher
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-800"
                >
                  <option value="">-- Unassigned / No Teacher --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAssignOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-650 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-[#9333ea] hover:bg-[#7e22ce] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Assign Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE STREAM MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#9333ea]" />
                Create New Class Stream
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStream} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                  Stream Name (e.g. Form 1E)
                </label>
                <input
                  type="text"
                  placeholder="Form 1E"
                  value={newStreamName}
                  onChange={(e) => setNewStreamName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                  Classroom (e.g. Room 105)
                </label>
                <input
                  type="text"
                  placeholder="Room 105"
                  value={newStreamRoom}
                  onChange={(e) => setNewStreamRoom(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                    Form Level
                  </label>
                  <select
                    value={newStreamGradeLevel}
                    onChange={(e) => setNewStreamGradeLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-800"
                  >
                    <option value="Form 1">Form 1</option>
                    <option value="Form 2">Form 2</option>
                    <option value="Form 3">Form 3</option>
                    <option value="Form 4">Form 4</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                    Stream Type
                  </label>
                  <select
                    value={newStreamType}
                    onChange={(e) => setNewStreamType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-800"
                  >
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                  Assign Class Teacher (Optional)
                </label>
                <select
                  value={newStreamTeacherId}
                  onChange={(e) => setNewStreamTeacherId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-800"
                >
                  <option value="">-- Unassigned --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-650 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-[#9333ea] hover:bg-[#7e22ce] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Create Stream'}
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
