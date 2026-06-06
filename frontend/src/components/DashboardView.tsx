import React, { useState, useEffect } from 'react';
import { Users, Waves, GraduationCap, PlusCircle, FileSpreadsheet, BookOpen, Sparkles, AlertCircle, BarChart2 } from 'lucide-react';
import { Student, Stream, Activity } from '../types';

interface DashboardProps {
  students: Student[];
  streams: Stream[];
  activities: Activity[];
  onNavigate: (tab: string, extra?: any) => void;
  stats: {
    totalStudents: number;
    totalSubjects: number;
    avgPerformance: number;
    studentsPerForm: Record<string, number>;
    studentsPerStream: Record<string, number>;
    statusCounts: Record<string, number>;
  } | null;
}

export default function DashboardView({ students, streams, activities, onNavigate, stats }: DashboardProps) {
  const [loadingSkeleton, setLoadingSkeleton] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingSkeleton(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const totalActive = stats?.statusCounts?.ACTIVE || 0;
  const totalInactive = stats?.statusCounts?.INACTIVE || 0;
  const totalGraduated = stats?.statusCounts?.GRADUATED || 0;
  const totalSuspended = stats?.statusCounts?.SUSPENDED || 0;

  return (
    <div className="space-y-8 animate-in duration-500 fade-in slide-in-from-bottom-4">
      {/* Welcome header in Minimal-Premium style */}
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Official Registry Overview
        </p>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 font-sans">
          Ikonex Academy Dashboard
        </h2>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Students KPI */}
        <div 
          onClick={() => onNavigate('students')}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex justify-between items-center group hover:border-[#4f46e5]/40 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.98]"
        >
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Students
            </span>
            <div className="flex items-baseline gap-2">
              {stats ? (
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {stats.totalStudents.toLocaleString()}
                </span>
              ) : (
                <div className="h-9 w-20 bg-slate-200 animate-pulse rounded-md" />
              )}
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                +4.2%
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center group-hover:bg-[#3525cd] group-hover:text-white transition-all duration-305">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Total Subjects KPI */}
        <div 
          onClick={() => onNavigate('subjects')}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex justify-between items-center group hover:border-[#4f46e5]/40 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.98]"
        >
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Academic Subjects
            </span>
            <div className="flex items-baseline gap-2">
              {stats ? (
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {stats.totalSubjects}
                </span>
              ) : (
                <div className="h-9 w-12 bg-slate-200 animate-pulse rounded-md" />
              )}
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-650 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-305">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Avg Performance Sparkline KPI */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4 group hover:border-[#4f46e5]/40 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Avg Performance
              </span>
              <div className="flex items-baseline gap-2">
                {stats ? (
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {stats.avgPerformance}%
                  </span>
                ) : (
                  <div className="h-9 w-16 bg-slate-200 animate-pulse rounded-md" />
                )}
                <span className="text-xs font-medium text-slate-400">
                  Total Term Avg
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-all duration-300">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>

          {/* Authentic SVG Sparkline Chart */}
          <div className="h-10 w-full overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient-avg" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path 
                className="path-animate"
                d="M0,32 Q15,8 30,28 T60,18 T80,8 T100,22" 
                fill="none" 
                stroke="#3525cd" 
                strokeWidth="2" 
                vectorEffect="non-scaling-stroke"
              />
              <path 
                d="M0,32 Q15,8 30,28 T60,18 T80,8 T100,22 L100,40 L0,40 Z" 
                fill="url(#gradient-avg)" 
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onNavigate('students', { openAddModal: true })}
          className="flex flex-col items-center justify-center gap-3 bg-[#3525cd] text-white p-6 rounded-2xl border border-indigo-700 shadow-sm hover:bg-[#4f46e5] hover:scale-[1.01] hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <PlusCircle className="w-7 h-7 stroke-[1.5]" />
          <span className="text-sm font-bold tracking-tight">Register Student Profile</span>
        </button>

        <button 
          onClick={() => onNavigate('scores')}
          className="flex flex-col items-center justify-center gap-3 bg-[#eaedff] text-slate-800 p-6 rounded-2xl border border-slate-200 shadow-sm hover:bg-[#e2e7ff] hover:scale-[1.01] active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <FileSpreadsheet className="w-7 h-7 text-[#3525cd] stroke-[1.5]" />
          <span className="text-sm font-bold tracking-tight text-[#3525cd]">Record Scores</span>
        </button>
      </div>

      {/* Enrollment Status Cards Breakdown */}
      {stats && (
        <div className="space-y-4">
          <h3 className="text-lg font-black tracking-tight text-slate-900">
            Student Enrollment Status
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Active Enrollment</span>
              <span className="text-2xl font-black text-slate-950 mt-1">{totalActive}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inactive Status</span>
              <span className="text-2xl font-black text-slate-950 mt-1">{totalInactive}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Graduated</span>
              <span className="text-2xl font-black text-slate-950 mt-1">{totalGraduated}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Suspended</span>
              <span className="text-2xl font-black text-slate-950 mt-1">{totalSuspended}</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid of School Demographics Breakdown */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Level Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <GraduationCap className="w-5 h-5 text-[#3525cd]" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Students Per Form Level</h3>
            </div>
            <div className="space-y-4">
              {['Form 1', 'Form 2', 'Form 3', 'Form 4'].map((form) => {
                const count = stats.studentsPerForm[form] || 0;
                const pct = stats.totalStudents > 0 ? Math.round((count / stats.totalStudents) * 100) : 0;
                return (
                  <div key={form} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-800">{form}</span>
                      <span className="font-mono text-slate-550">{count} students ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#3525cd] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stream letter Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <BarChart2 className="w-5 h-5 text-[#3525cd]" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Students Per Stream</h3>
            </div>
            <div className="space-y-4">
              {['A', 'B', 'C', 'D'].map((str) => {
                const count = stats.studentsPerStream[str] || 0;
                const pct = stats.totalStudents > 0 ? Math.round((count / stats.totalStudents) * 100) : 0;
                return (
                  <div key={str} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-800">Stream {str}</span>
                      <span className="font-mono text-slate-550">{count} students ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity List */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="text-lg font-bold tracking-tight text-slate-900">
            Recent Logs & Activity
          </h3>
          <button 
            onClick={() => onNavigate('students')}
            className="text-xs font-bold text-[#3525cd] hover:underline transition-all"
          >
            View Student registry
          </button>
        </div>

        <div className="space-y-3">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-start gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/50 hover:bg-slate-100/70 transition-all duration-200 cursor-pointer group"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                activity.type === 'enrollment' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-indigo-100 text-[#3525cd]'
              }`}>
                {activity.type === 'enrollment' ? (
                  <PlusCircle className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900 font-medium leading-tight">
                  {activity.title.split(':').map((chunk, idx) => 
                    idx === 1 ? <b key={chunk} className="text-slate-950 font-bold">{chunk}</b> : chunk
                  )}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activity.description}
                </p>
                <span className="inline-block text-[10px] text-slate-400 font-medium font-mono mt-2">
                  {activity.time}
                </span>
              </div>
            </div>
          ))}

          {activities.length === 0 && !loadingSkeleton && (
            <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <AlertCircle className="w-6 h-6 text-slate-300 mx-auto mb-2" />
              <span>No activity logs generated yet.</span>
            </div>
          )}

          {/* Skeleton Loader Placeholders */}
          {loadingSkeleton && (
            <div className="flex items-start gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200/30 opacity-60">
              <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse shrink-0" />
              <div className="flex-grow space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
