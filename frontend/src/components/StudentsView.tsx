import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Edit, Trash2, ChevronRight, ArrowLeft, MoreVertical, 
  Verified, Calendar, Award, GraduationCap, BookOpen,
  Sparkles, CheckCircle2, AlertCircle, X, Plus, User, Phone, Info, BarChart2
} from 'lucide-react';
import { Student, Stream, Grade, Assessment, Subject } from '../types';
import { getGradeLetter } from '../data';
// Recharts radar imports removed

interface StudentsViewProps {
  students: Student[];
  streams: Stream[];
  onUpdateStudents: (updatedStudents: Student[]) => void;
  openAddModalInitially?: boolean;
  assessments: Assessment[];
  subjects: Subject[];
}

export default function StudentsView({ 
  students, 
  streams, 
  onUpdateStudents,
  openAddModalInitially = false,
  assessments,
  subjects
}: StudentsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [formFilter, setFormFilter] = useState('all');
  const [streamFilter, setStreamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'personal' | 'academic' | 'guardian' | 'performance'>('personal');
  const [profileTerm, setProfileTerm] = useState('Term 1');
  const [swipedStudentId, setSwipedStudentId] = useState<string | null>(null);
  const [loadingSkeleton, setLoadingSkeleton] = useState(true);

  const [fetchedScores, setFetchedScores] = useState<Assessment[]>([]);
  const [loadingScores, setLoadingScores] = useState(false);

  const barChartRef = React.useRef<HTMLCanvasElement | null>(null);
  const lineChartRef = React.useRef<HTMLCanvasElement | null>(null);
  const barChartInstanceRef = React.useRef<any>(null);
  const lineChartInstanceRef = React.useRef<any>(null);

  // Form modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(openAddModalInitially);
  const [addForm, setAddForm] = useState({
    fullName: '',
    admissionNumber: '',
    gender: 'Male',
    dateOfBirth: new Date().toISOString().split('T')[0],
    nationality: 'Kenyan',
    formLevel: 'Form 1',
    stream: 'A',
    kcpeScore: '350',
    enrollmentStatus: 'ACTIVE',
    admissionDate: new Date().toISOString().split('T')[0],
    parentName: '',
    relationship: 'Father',
    parentPhone: '',
    altPhone: '',
    attendancePercentage: '100',
    remarks: '',
    email: '',
    image: '',
  });
  const [errorText, setErrorText] = useState('');

  // Edit states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    admissionNumber: '',
    gender: 'Male',
    dateOfBirth: '',
    nationality: 'Kenyan',
    formLevel: 'Form 1',
    stream: 'A',
    kcpeScore: '350',
    enrollmentStatus: 'ACTIVE',
    admissionDate: '',
    parentName: '',
    relationship: 'Father',
    parentPhone: '',
    altPhone: '',
    attendancePercentage: '100',
    remarks: '',
    email: '',
    image: '',
  });

  useEffect(() => {
    if (openAddModalInitially) {
      setIsAddModalOpen(true);
    }
  }, [openAddModalInitially]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingSkeleton(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!selectedStudent) {
      setFetchedScores([]);
      return;
    }

    let active = true;
    const fetchScores = async () => {
      setLoadingScores(true);
      const token = localStorage.getItem('ikonex_access_token');
      if (!token) return;
      try {
        const res = await fetch(`/api/scores?studentId=${selectedStudent.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        if (data.success && active) {
          setFetchedScores(data.data);
        }
      } catch (e) {
        console.error('Error fetching scores:', e);
      } finally {
        if (active) setLoadingScores(false);
      }
    };

    fetchScores();
    return () => {
      active = false;
    };
  }, [selectedStudent?.id, assessments]);

  const lineStyles = [
    { color: '#534AB7', dashed: false },
    { color: '#1D9E75', dashed: false },
    { color: '#D85A30', dashed: true },
    { color: '#BA7517', dashed: false },
    { color: '#185FA5', dashed: true },
  ];

  useEffect(() => {
    if (activeProfileTab !== 'performance' || loadingScores) return;

    const Chart = (window as any).Chart;
    if (!Chart) {
      console.error("Chart.js not loaded from CDN.");
      return;
    }

    let barChart: any = null;
    let lineChart: any = null;

    // --- Chart 1: Grouped Bar Chart ---
    if (barChartRef.current && chart1Subjects.length > 0) {
      if (barChartInstanceRef.current) {
        barChartInstanceRef.current.destroy();
      }

      const catData = chart1Subjects.map(subj => chart1SubjectsMap[subj].cat);
      const examData = chart1Subjects.map(subj => chart1SubjectsMap[subj].exam);
      const totalData = chart1Subjects.map(subj => chart1SubjectsMap[subj].total);

      const datalabelsPlugin = {
        id: 'customDataLabels',
        afterDatasetsDraw(chartInstance: any) {
          const { ctx } = chartInstance;
          ctx.save();
          ctx.font = 'bold 9px Inter, Roboto, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';

          chartInstance.data.datasets.forEach((dataset: any, i: number) => {
            const meta = chartInstance.getDatasetMeta(i);
            meta.data.forEach((bar: any, index: number) => {
              const dataVal = dataset.data[index];
              if (dataVal !== null && dataVal !== undefined) {
                ctx.fillStyle = '#4b5563';
                ctx.fillText(dataVal.toString(), bar.x, bar.y - 4);
              }
            });
          });
          ctx.restore();
        }
      };

      barChart = new Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels: chart1Subjects,
          datasets: [
            {
              label: 'CAT',
              data: catData,
              backgroundColor: '#534AB7',
              borderRadius: 4,
              borderWidth: 0,
            },
            {
              label: 'Exam',
              data: examData,
              backgroundColor: '#1D9E75',
              borderRadius: 4,
              borderWidth: 0,
            },
            {
              label: 'Total',
              data: totalData,
              backgroundColor: '#D85A30',
              borderRadius: 4,
              borderWidth: 0,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: true
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  family: 'Inter, Roboto, sans-serif',
                  size: 10,
                  weight: 'bold'
                },
                color: '#475569'
              }
            },
            y: {
              min: 0,
              max: 110,
              ticks: {
                stepSize: 20,
                font: {
                  family: 'Inter, Roboto, sans-serif',
                  size: 10
                },
                color: '#94a3b8'
              },
              grid: {
                color: '#f1f5f9'
              }
            }
          }
        },
        plugins: [datalabelsPlugin]
      });

      barChartInstanceRef.current = barChart;
    }

    // --- Chart 2: Line Chart ---
    if (lineChartRef.current && showLineChart) {
      if (lineChartInstanceRef.current) {
        lineChartInstanceRef.current.destroy();
      }

      const lineDatasets = chart2Lines.map((line, idx) => {
        const style = lineStyles[idx % lineStyles.length];
        return {
          label: line.subject,
          data: [line.terms["Term 1"], line.terms["Term 2"], line.terms["Term 3"]],
          borderColor: style.color,
          backgroundColor: style.color,
          borderDash: style.dashed ? [4, 3] : undefined,
          borderWidth: 2.5,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: style.color,
          spanGaps: false,
        };
      });

      lineChart = new Chart(lineChartRef.current, {
        type: 'line',
        data: {
          labels: ['Term 1', 'Term 2', 'Term 3'],
          datasets: lineDatasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: true
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  family: 'Inter, Roboto, sans-serif',
                  size: 10,
                  weight: 'bold'
                },
                color: '#475569'
              }
            },
            y: {
              min: 0,
              max: 110,
              ticks: {
                stepSize: 20,
                font: {
                  family: 'Inter, Roboto, sans-serif',
                  size: 10
                },
                color: '#94a3b8'
              },
              grid: {
                color: '#f1f5f9'
              }
            }
          }
        }
      });

      lineChartInstanceRef.current = lineChart;
    }

    return () => {
      if (barChart) {
        barChart.destroy();
        barChartInstanceRef.current = null;
      }
      if (lineChart) {
        lineChart.destroy();
        lineChartInstanceRef.current = null;
      }
    };
  }, [activeProfileTab, loadingScores, fetchedScores, profileTerm]);

  const renderLineLegend = () => {
    return (
      <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-655">
        {chart2Lines.map((line, idx) => {
          const style = lineStyles[idx % lineStyles.length];
          return (
            <div key={line.subject} className="flex items-center gap-1.5">
              <span 
                style={{
                  width: '16px',
                  height: '0px',
                  borderTop: style.dashed ? `3px dashed ${style.color}` : `3px solid ${style.color}`,
                  display: 'inline-block'
                }}
              />
              <span>{line.subject}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const handleSwipe = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening profile
    setSwipedStudentId(swipedStudentId === id ? null : id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to delete this student?");
    if (confirmed) {
      const filtered = students.filter(s => s.id !== id);
      onUpdateStudents(filtered);
      if (selectedStudent?.id === id) {
        setSelectedStudent(null);
      }
      setSwipedStudentId(null);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!addForm.fullName.trim()) {
      setErrorText('Please enter a student name.');
      return;
    }
    if (!addForm.admissionNumber.trim()) {
      setErrorText('Please enter an admission number.');
      return;
    }
    const scoreVal = parseFloat(addForm.kcpeScore);
    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 500) {
      setErrorText('KCPE Score must be between 0 and 500.');
      return;
    }
    const attVal = parseFloat(addForm.attendancePercentage);
    if (isNaN(attVal) || attVal < 0 || attVal > 100) {
      setErrorText('Attendance percentage must be between 0 and 100.');
      return;
    }
    if (!addForm.parentName.trim()) {
      setErrorText('Parent/guardian name is required.');
      return;
    }
    if (!addForm.parentPhone.trim()) {
      setErrorText('Parent/guardian phone number is required.');
      return;
    }

    const nextId = `TEMP-ID-${Date.now()}`;
    const newStudentObj: Student = {
      id: nextId,
      name: addForm.fullName,
      fullName: addForm.fullName,
      admissionNumber: addForm.admissionNumber,
      gender: addForm.gender,
      dateOfBirth: addForm.dateOfBirth,
      nationality: addForm.nationality,
      formLevel: addForm.formLevel,
      stream: addForm.stream,
      kcpeScore: scoreVal,
      enrollmentStatus: addForm.enrollmentStatus as any,
      status: addForm.enrollmentStatus === 'ACTIVE' ? 'Active' : 'Inactive',
      admissionDate: addForm.admissionDate,
      parentName: addForm.parentName,
      relationship: addForm.relationship,
      parentPhone: addForm.parentPhone,
      altPhone: addForm.altPhone || undefined,
      attendancePercentage: attVal,
      attendanceRate: attVal,
      remarks: addForm.remarks || undefined,
      image: addForm.image || undefined,
      email: addForm.email || undefined,
      gradeLevel: `${addForm.formLevel}${addForm.stream}`,
      streamId: `${addForm.formLevel.replace(' ', '')}-${addForm.stream}`,
      grades: []
    };

    onUpdateStudents([newStudentObj, ...students]);
    setIsAddModalOpen(false);
    
    // Reset addForm
    setAddForm({
      fullName: '',
      admissionNumber: '',
      gender: 'Male',
      dateOfBirth: new Date().toISOString().split('T')[0],
      nationality: 'Kenyan',
      formLevel: 'Form 1',
      stream: 'A',
      kcpeScore: '350',
      enrollmentStatus: 'ACTIVE',
      admissionDate: new Date().toISOString().split('T')[0],
      parentName: '',
      relationship: 'Father',
      parentPhone: '',
      altPhone: '',
      attendancePercentage: '100',
      remarks: '',
      email: '',
      image: '',
    });
  };

  const startEdit = (student: Student, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditMode(true);
    setErrorText('');
    setEditForm({
      fullName: student.fullName || student.name || '',
      admissionNumber: student.admissionNumber || '',
      gender: student.gender || 'Male',
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
      nationality: student.nationality || 'Kenyan',
      formLevel: student.formLevel || 'Form 1',
      stream: student.stream || 'A',
      kcpeScore: String(student.kcpeScore || 0),
      enrollmentStatus: student.enrollmentStatus || 'ACTIVE',
      admissionDate: student.admissionDate ? student.admissionDate.split('T')[0] : '',
      parentName: student.parentName || '',
      relationship: student.relationship || 'Father',
      parentPhone: student.parentPhone || '',
      altPhone: student.altPhone || '',
      attendancePercentage: String(student.attendancePercentage || 100),
      remarks: student.remarks || '',
      email: student.email || '',
      image: student.image || '',
    });
    setSelectedStudent(student);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setErrorText('');

    if (!editForm.fullName.trim()) {
      setErrorText('Please enter a student name.');
      return;
    }
    if (!editForm.admissionNumber.trim()) {
      setErrorText('Please enter an admission number.');
      return;
    }
    const scoreVal = parseFloat(editForm.kcpeScore);
    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 500) {
      setErrorText('KCPE Score must be between 0 and 500.');
      return;
    }
    const attVal = parseFloat(editForm.attendancePercentage);
    if (isNaN(attVal) || attVal < 0 || attVal > 100) {
      setErrorText('Attendance percentage must be between 0 and 100.');
      return;
    }
    if (!editForm.parentName.trim()) {
      setErrorText('Parent/guardian name is required.');
      return;
    }
    if (!editForm.parentPhone.trim()) {
      setErrorText('Parent/guardian phone number is required.');
      return;
    }

    const updated = students.map(s => {
      if (s.id === selectedStudent.id) {
        return {
          ...s,
          name: editForm.fullName,
          fullName: editForm.fullName,
          admissionNumber: editForm.admissionNumber,
          gender: editForm.gender,
          dateOfBirth: editForm.dateOfBirth,
          nationality: editForm.nationality,
          formLevel: editForm.formLevel,
          stream: editForm.stream,
          kcpeScore: scoreVal,
          enrollmentStatus: editForm.enrollmentStatus as any,
          status: (editForm.enrollmentStatus === 'ACTIVE' ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
          admissionDate: editForm.admissionDate,
          parentName: editForm.parentName,
          relationship: editForm.relationship,
          parentPhone: editForm.parentPhone,
          altPhone: editForm.altPhone || undefined,
          attendancePercentage: attVal,
          attendanceRate: attVal,
          remarks: editForm.remarks || undefined,
          email: editForm.email || undefined,
          image: editForm.image || undefined,
          gradeLevel: `${editForm.formLevel}${editForm.stream}`,
          streamId: `${editForm.formLevel.replace(' ', '')}-${editForm.stream}`,
        };
      }
      return s;
    });

    onUpdateStudents(updated);
    setIsEditMode(false);
    setSelectedStudent({
      ...selectedStudent,
      name: editForm.fullName,
      fullName: editForm.fullName,
      admissionNumber: editForm.admissionNumber,
      gender: editForm.gender,
      dateOfBirth: editForm.dateOfBirth,
      nationality: editForm.nationality,
      formLevel: editForm.formLevel,
      stream: editForm.stream,
      kcpeScore: scoreVal,
      enrollmentStatus: editForm.enrollmentStatus as any,
      status: (editForm.enrollmentStatus === 'ACTIVE' ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
      admissionDate: editForm.admissionDate,
      parentName: editForm.parentName,
      relationship: editForm.relationship,
      parentPhone: editForm.parentPhone,
      altPhone: editForm.altPhone || undefined,
      attendancePercentage: attVal,
      attendanceRate: attVal,
      remarks: editForm.remarks || undefined,
      email: editForm.email || undefined,
      image: editForm.image || undefined,
      gradeLevel: `${editForm.formLevel}${editForm.stream}`,
      streamId: `${editForm.formLevel.replace(' ', '')}-${editForm.stream}`,
    });
  };

  // Subject breakdown and cumulative totals for Selected Student profile page
  const studentTermAss = selectedStudent
    ? fetchedScores.filter(a => a.term === profileTerm)
    : [];

  const profileSubjectsMap: { [subj: string]: { cat: number; exam: number; total: number } } = {};
  studentTermAss.forEach(a => {
    if (!profileSubjectsMap[a.subject]) {
      profileSubjectsMap[a.subject] = { cat: 0, exam: 0, total: 0 };
    }
    if (a.examType === 'CA') {
      profileSubjectsMap[a.subject].cat = a.score;
    } else {
      profileSubjectsMap[a.subject].exam = a.score;
    }
    profileSubjectsMap[a.subject].total = profileSubjectsMap[a.subject].cat + profileSubjectsMap[a.subject].exam;
  });

  const profileRows = Object.keys(profileSubjectsMap).map(subj => {
    const item = profileSubjectsMap[subj];
    const { letter, status } = getGradeLetter(item.total);

    return {
      subject: subj,
      cat: item.cat,
      exam: item.exam,
      total: item.total,
      grade: letter,
      status
    };
  });

  const overallTotalScore = profileRows.reduce((acc, curr) => acc + curr.total, 0);
  const overallTotalMax = profileRows.length * 100;

  // --- Chart 1 Data: Grouped Bar Chart ---
  const chart1SubjectsMap = profileSubjectsMap;
  const chart1Subjects = Object.keys(chart1SubjectsMap);

  // --- Chart 2 Data: Line Chart ---
  const subjectTermScores: { [subj: string]: { [term: string]: { cat: number; exam: number; hasData: boolean } } } = {};
  
  fetchedScores.forEach(a => {
    const subj = a.subject;
    const term = a.term;
    if (!subjectTermScores[subj]) {
      subjectTermScores[subj] = {
        "Term 1": { cat: 0, exam: 0, hasData: false },
        "Term 2": { cat: 0, exam: 0, hasData: false },
        "Term 3": { cat: 0, exam: 0, hasData: false },
      };
    }
    if (subjectTermScores[subj][term]) {
      subjectTermScores[subj][term].hasData = true;
      if (a.examType === 'CA') {
        subjectTermScores[subj][term].cat = a.score;
      } else {
        subjectTermScores[subj][term].exam = a.score;
      }
    }
  });

  const chart2Lines = Object.keys(subjectTermScores).map(subj => {
    const termData = subjectTermScores[subj];
    return {
      subject: subj,
      terms: {
        "Term 1": termData["Term 1"].hasData ? (termData["Term 1"].cat + termData["Term 1"].exam) : null,
        "Term 2": termData["Term 2"].hasData ? (termData["Term 2"].cat + termData["Term 2"].exam) : null,
        "Term 3": termData["Term 3"].hasData ? (termData["Term 3"].cat + termData["Term 3"].exam) : null,
      }
    };
  });

  const termsWithData = new Set<string>();
  fetchedScores.forEach(a => {
    termsWithData.add(a.term);
  });
  const showLineChart = termsWithData.size > 1;

  // Filter students based on filters and search query
  const filteredStudents = students.filter(s => {
    const matchesSearch = searchQuery.trim() === '' || 
      (s.fullName || s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.admissionNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesForm = formFilter === 'all' || s.formLevel === formFilter;
    const matchesStream = streamFilter === 'all' || s.stream === streamFilter;
    
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      matchesStatus = s.enrollmentStatus === statusFilter;
    }

    return matchesSearch && matchesForm && matchesStream && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'INACTIVE':
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      case 'GRADUATED':
        return 'bg-violet-50 text-violet-700 border border-violet-200';
      case 'SUSPENDED':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Profile Mode or Master-List Mode */}
      {selectedStudent ? (
        /* SCREEN C: STUDENT PROFILE DETAIL VIEW */
        <div className="space-y-6 animate-in duration-400 fade-in">
          {/* Top Detail Navigation Header */}
          <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
            <button 
              onClick={() => {
                setSelectedStudent(null);
                setIsEditMode(false);
              }}
              className="p-2 hover:bg-slate-100 rounded-full transition-all flex items-center gap-1 text-slate-700 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-bold text-slate-600">Back to List</span>
            </button>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Student Information System
            </h3>
            <div className="relative">
              <button 
                onClick={(e) => startEdit(selectedStudent, e)}
                className="p-2.5 bg-purple-50 hover:bg-purple-100 text-[#9333ea] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold"
                title="Edit student"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Edit form integrated inline when edit mode is toggled */}
          {isEditMode ? (
            <form onSubmit={handleEditSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-[#9333ea]" />
                  <span className="text-sm font-bold text-slate-900">Modify Student Profile</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsEditMode(false)}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {errorText && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorText}</span>
                </div>
              )}

              <div className="space-y-6">
                {/* Section 1: Personal Details */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase border-l-2 border-[#9333ea] pl-2">Section 1: Personal Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Student Full Name</label>
                      <input 
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                        className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Admission Number</label>
                      <input 
                        value={editForm.admissionNumber}
                        onChange={(e) => setEditForm({...editForm, admissionNumber: e.target.value})}
                        className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-100 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Gender</label>
                      <select 
                        value={editForm.gender}
                        onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                        className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-100 outline-none bg-white font-semibold text-slate-700"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Date of Birth</label>
                      <input 
                        type="date"
                        value={editForm.dateOfBirth}
                        onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})}
                        className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nationality</label>
                      <input 
                        value={editForm.nationality}
                        onChange={(e) => setEditForm({...editForm, nationality: e.target.value})}
                        className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-100 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Email Address (Optional)</label>
                      <input 
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        placeholder="student@example.com"
                        className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Avatar Image URL (Optional)</label>
                      <input 
                        value={editForm.image}
                        onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                        placeholder="https://..."
                        className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-100 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Academic Info */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase border-l-2 border-[#9333ea] pl-2">Section 2: Academic Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Form Level</label>
                      <select 
                        value={editForm.formLevel}
                        onChange={(e) => setEditForm({...editForm, formLevel: e.target.value})}
                        className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-100 outline-none bg-white font-semibold text-slate-700"
                      >
                        <option value="Form 1">Form 1</option>
                        <option value="Form 2">Form 2</option>
                        <option value="Form 3">Form 3</option>
                        <option value="Form 4">Form 4</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Stream</label>
                      <select 
                        value={editForm.stream}
                        onChange={(e) => setEditForm({...editForm, stream: e.target.value})}
                        className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-100 outline-none bg-white font-semibold text-slate-700"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">KCPE Score (0-500)</label>
                      <input 
                        type="number"
                        value={editForm.kcpeScore}
                        onChange={(e) => setEditForm({...editForm, kcpeScore: e.target.value})}
                        className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-100 outline-none font-semibold text-purple-750"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Enrollment Status</label>
                      <select 
                        value={editForm.enrollmentStatus}
                        onChange={(e) => setEditForm({...editForm, enrollmentStatus: e.target.value})}
                        className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-100 outline-none bg-white font-semibold text-slate-700"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="GRADUATED">GRADUATED</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Admission Date</label>
                    <input 
                      type="date"
                      value={editForm.admissionDate}
                      onChange={(e) => setEditForm({...editForm, admissionDate: e.target.value})}
                      className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-100 outline-none"
                    />
                  </div>
                </div>

                {/* Section 3: Parent/Guardian Details */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase border-l-2 border-[#9333ea] pl-2">Section 3: Guardian Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Guardian Name</label>
                      <input 
                        value={editForm.parentName}
                        onChange={(e) => setEditForm({...editForm, parentName: e.target.value})}
                        className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Relationship to Student</label>
                      <select 
                        value={editForm.relationship}
                        onChange={(e) => setEditForm({...editForm, relationship: e.target.value})}
                        className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-100 outline-none bg-white font-semibold text-slate-700"
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Primary Phone Number</label>
                      <input 
                        value={editForm.parentPhone}
                        onChange={(e) => setEditForm({...editForm, parentPhone: e.target.value})}
                        placeholder="e.g. +254 700 000 000"
                        className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Alternative Phone Number</label>
                      <input 
                        value={editForm.altPhone}
                        onChange={(e) => setEditForm({...editForm, altPhone: e.target.value})}
                        placeholder="e.g. +254 711 000 000"
                        className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-100 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: School Details */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase border-l-2 border-[#9333ea] pl-2">Section 4: School Details & Remarks</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Attendance Rate (%)</label>
                      <input 
                        type="number"
                        value={editForm.attendancePercentage}
                        onChange={(e) => setEditForm({...editForm, attendancePercentage: e.target.value})}
                        className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Remarks / Academic Notes</label>
                      <textarea 
                        value={editForm.remarks}
                        onChange={(e) => setEditForm({...editForm, remarks: e.target.value})}
                        rows={2}
                        className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-100 outline-none font-sans"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-2 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 text-slate-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-[#9333ea] text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-purple-600/15 cursor-pointer hover:bg-[#7e22ce] transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          ) : null}

          {/* Hero Profile Info Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative shrink-0">
              {selectedStudent.image ? (
                <div className="w-28 h-28 rounded-3xl border border-slate-200 p-1 bg-white overflow-hidden shadow-sm">
                  <img 
                    alt={selectedStudent.fullName || selectedStudent.name} 
                    className="w-full h-full rounded-2xl object-cover" 
                    referrerPolicy="no-referrer"
                    src={selectedStudent.image} 
                  />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center font-black text-3xl text-[#9333ea] shadow-sm shrink-0">
                  {(selectedStudent.fullName || selectedStudent.name).split(' ').map(n=>n[0]).join('').slice(0, 2)}
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    {selectedStudent.fullName || selectedStudent.name}
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 font-mono mt-1">
                    System ID: {selectedStudent.id}
                  </p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black tracking-wide ${getStatusColor(selectedStudent.enrollmentStatus)}`}>
                  {selectedStudent.enrollmentStatus}
                </span>
              </div>

              <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-3">
                <div className="px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-xl text-[11px] font-bold text-slate-600">
                  Class: <span className="text-slate-900 font-extrabold">{selectedStudent.formLevel} {selectedStudent.stream}</span>
                </div>
                <div className="px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-xl text-[11px] font-bold text-slate-600">
                  Adm No: <span className="text-slate-900 font-extrabold font-mono">{selectedStudent.admissionNumber}</span>
                </div>
                <div className="px-3 py-1.5 bg-[#f3e8ff] border border-purple-100 rounded-xl text-[11px] font-bold text-purple-700">
                  KCPE: <span className="text-purple-950 font-black">{selectedStudent.kcpeScore} pts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Tabs Navigation */}
          <nav className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm gap-1">
            <button 
              onClick={() => setActiveProfileTab('personal')}
              className={`flex-1 py-2.5 text-center font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeProfileTab === 'personal'
                  ? 'bg-[#f3e8ff] text-[#9333ea]'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Personal Details</span>
            </button>
            <button 
              onClick={() => setActiveProfileTab('academic')}
              className={`flex-1 py-2.5 text-center font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeProfileTab === 'academic'
                  ? 'bg-[#f3e8ff] text-[#9333ea]'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academic Profile</span>
            </button>
            <button 
              onClick={() => setActiveProfileTab('guardian')}
              className={`flex-1 py-2.5 text-center font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeProfileTab === 'guardian'
                  ? 'bg-[#f3e8ff] text-[#9333ea]'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Guardian Details</span>
            </button>
            <button 
              onClick={() => setActiveProfileTab('performance')}
              className={`flex-1 py-2.5 text-center font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeProfileTab === 'performance'
                  ? 'bg-[#f3e8ff] text-[#9333ea]'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Grades & Performance</span>
            </button>
          </nav>

          {/* Tabs Content */}
          {activeProfileTab === 'personal' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 animate-in fade-in duration-300">
              <h4 className="text-xs font-bold tracking-widest text-slate-450 uppercase pb-2 border-b border-slate-100 flex items-center gap-2">
                <User className="w-4 h-4 text-[#9333ea]" />
                Student Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-2">
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Full Name</p>
                  <p className="font-extrabold text-slate-800 text-sm">{selectedStudent.fullName || selectedStudent.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Admission Number</p>
                  <p className="font-extrabold text-slate-800 font-mono text-sm">{selectedStudent.admissionNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Gender</p>
                  <p className="font-bold text-slate-800 text-xs">{selectedStudent.gender || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Date of Birth</p>
                  <p className="font-bold text-slate-800 font-mono text-xs">{selectedStudent.dateOfBirth ? selectedStudent.dateOfBirth.split('T')[0] : 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Nationality</p>
                  <p className="font-bold text-slate-800 text-xs">{selectedStudent.nationality || 'Kenyan'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Student Email (Optional)</p>
                  <p className="font-bold text-slate-800 font-mono text-xs">{selectedStudent.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {activeProfileTab === 'academic' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 animate-in fade-in duration-300">
              <h4 className="text-xs font-bold tracking-widest text-slate-450 uppercase pb-2 border-b border-slate-100 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#9333ea]" />
                Student Academic Profile
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-2">
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Assigned Form / Grade</p>
                  <p className="font-extrabold text-slate-800 text-xs">{selectedStudent.formLevel}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Assigned Stream</p>
                  <p className="font-extrabold text-slate-800 text-xs">Stream {selectedStudent.stream}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Admission date</p>
                  <p className="font-bold text-slate-800 font-mono text-xs">{selectedStudent.admissionDate ? selectedStudent.admissionDate.split('T')[0] : 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">KCPE Enrollment Score</p>
                  <p className="font-extrabold text-purple-700 text-sm font-mono">{selectedStudent.kcpeScore} / 500</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Attendance Percentage (%)</p>
                  <p className="font-extrabold text-slate-800 text-xs font-mono">{selectedStudent.attendancePercentage || selectedStudent.attendanceRate}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Enrollment Status</p>
                  <p className="font-bold text-slate-800 text-xs">{selectedStudent.enrollmentStatus}</p>
                </div>
              </div>
              {selectedStudent.remarks && (
                <div className="mt-4 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl">
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide mb-1">Official Remarks & Notes</p>
                  <p className="text-slate-700 text-xs font-medium leading-relaxed">{selectedStudent.remarks}</p>
                </div>
              )}
            </div>
          )}

          {activeProfileTab === 'guardian' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 animate-in fade-in duration-300">
              <h4 className="text-xs font-bold tracking-widest text-slate-450 uppercase pb-2 border-b border-slate-100 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#9333ea]" />
                Parent & Guardian Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-2">
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Guardian Name</p>
                  <p className="font-extrabold text-slate-800 text-sm">{selectedStudent.parentName || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Relationship to Student</p>
                  <p className="font-bold text-slate-800 text-xs">{selectedStudent.relationship || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Primary Contact Phone</p>
                  <p className="font-extrabold text-[#9333ea] text-xs font-mono">{selectedStudent.parentPhone || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Alternative Contact Phone</p>
                  <p className="font-bold text-slate-700 text-xs font-mono">{selectedStudent.altPhone || 'None'}</p>
                </div>
              </div>
            </div>
          )}

          {activeProfileTab === 'performance' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Term Filter dropdown */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Term Selection Filter</span>
                <select
                  value={profileTerm}
                  onChange={(e) => setProfileTerm(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>

              {/* Prominent Overall Total Display */}
              <div className="bg-gradient-to-br from-[#7e22ce] to-[#9333ea] rounded-2xl p-6 text-white shadow-md flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-purple-150">Overall Term Total</p>
                  <p className="text-3xl font-black">{overallTotalScore} / {overallTotalMax}</p>
                </div>
                <Award className="w-10 h-10 text-white/20 stroke-[1.5]" />
              </div>

              {/* Subject Breakdown Table */}
              <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-150">
                      <th className="p-3">Subject</th>
                      <th className="p-3 text-center">CAT (Max 30)</th>
                      <th className="p-3 text-center">Exam (Max 70)</th>
                      <th className="p-3 text-center">Total (Max 100)</th>
                      <th className="p-3 text-right">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {profileRows.map(row => (
                      <tr key={row.subject} className="hover:bg-slate-50/50">
                        <td className="p-3 text-slate-900 font-bold">{row.subject}</td>
                        <td className="p-3 text-center font-mono">{row.cat}</td>
                        <td className="p-3 text-center font-mono">{row.exam}</td>
                        <td className="p-3 text-center font-mono font-bold text-[#9333ea]">{row.total} / 100</td>
                        <td className="p-3 text-right font-black text-xs">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            row.grade === 'A' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            row.grade === 'B' ? 'bg-[#f3e8ff] text-[#9333ea] border border-purple-100' :
                            row.grade === 'C' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            row.grade === 'D' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {row.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {profileRows.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-semibold">No scores recorded for {profileTerm}.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Stacked Charts Container */}
              <div className="flex flex-col gap-4">
                {/* Chart 1: Grouped Bar Chart */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Subject Score Breakdown</h4>
                      <p className="text-xs text-slate-505 mt-0.5">CAT vs Exam vs Total per subject for the selected term</p>
                    </div>
                    {/* Custom Legend */}
                    <div className="flex gap-4 text-xs font-semibold text-slate-655">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#534AB7] font-bold">■</span>
                        <span>CAT (Max 30)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#1D9E75] font-bold">■</span>
                        <span>Exam (Max 70)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#D85A30] font-bold">■</span>
                        <span>Total (Max 100)</span>
                      </div>
                    </div>
                  </div>

                  {loadingScores ? (
                    <div className="h-[280px] flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <div className="text-center space-y-2">
                        <div className="w-8 h-8 rounded-full border-4 border-purple-250 border-t-[#9333ea] animate-spin mx-auto"></div>
                        <p className="text-xs font-semibold text-slate-400">Loading breakdown charts...</p>
                      </div>
                    </div>
                  ) : chart1Subjects.length > 0 ? (
                    <div className="h-[280px] w-full relative">
                      <canvas ref={barChartRef} />
                    </div>
                  ) : (
                    <div className="h-[280px] flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center p-6">
                      <BookOpen className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-xs font-semibold text-slate-505">No scores recorded for this term yet.</p>
                    </div>
                  )}
                </div>

                {/* Chart 2: Line Chart */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Term-over-Term Performance Trend</h4>
                      <p className="text-xs text-slate-550 mt-0.5">How scores have changed across Term 1, Term 2, and Term 3</p>
                    </div>
                    {/* Dynamic Custom Legend */}
                    {!loadingScores && showLineChart && renderLineLegend()}
                  </div>

                  {loadingScores ? (
                    <div className="h-[260px] flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <div className="text-center space-y-2">
                        <div className="w-8 h-8 rounded-full border-4 border-purple-250 border-t-[#9333ea] animate-spin mx-auto"></div>
                        <p className="text-xs font-semibold text-slate-400">Loading trend charts...</p>
                      </div>
                    </div>
                  ) : showLineChart ? (
                    <div className="h-[260px] w-full relative">
                      <canvas ref={lineChartRef} />
                    </div>
                  ) : (
                    <div className="h-[260px] flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center p-6">
                      <Sparkles className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-xs font-semibold text-slate-550 max-w-sm">
                        More terms needed to display trend. Data will appear as scores are recorded each term.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* SCREEN B: STUDENTS LIST WITH SKELETON, FAB, SEARCH/FILTERS */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Students Registry
            </h2>
            <div className="text-xs font-semibold text-slate-400">
              Total: <span className="text-[#9333ea] font-bold">{filteredStudents.length} students</span>
            </div>
          </div>

          {/* Search Box & Filters Container */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#9333ea] group-focus-within:scale-105 transition-all duration-300" />
                <input 
                  type="text"
                  value={searchQuery}
                  aria-label="Search students"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students by full name, admission number..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-150/15 focus:border-[#9333ea] transition-all duration-305 text-xs font-semibold shadow-inner"
                />
              </div>
              <button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`p-2.5 rounded-xl border transition-all flex items-center gap-1 text-xs font-bold shadow-sm ${
                  showAdvancedFilters || formFilter !== 'all' || streamFilter !== 'all' || statusFilter !== 'all'
                    ? 'border-[#9333ea] bg-[#f3e8ff] text-[#9333ea]'
                    : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-550'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>

            {/* Advanced Filters Expand Panel */}
            {(showAdvancedFilters || formFilter !== 'all' || streamFilter !== 'all' || statusFilter !== 'all') && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Form Level</label>
                  <select
                    value={formFilter}
                    onChange={(e) => setFormFilter(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option value="all">All Forms</option>
                    <option value="Form 1">Form 1</option>
                    <option value="Form 2">Form 2</option>
                    <option value="Form 3">Form 3</option>
                    <option value="Form 4">Form 4</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Stream</label>
                  <select
                    value={streamFilter}
                    onChange={(e) => setStreamFilter(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option value="all">All Streams</option>
                    <option value="A">Stream A</option>
                    <option value="B">Stream B</option>
                    <option value="C">Stream C</option>
                    <option value="D">Stream D</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Enrollment Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="GRADUATED">GRADUATED</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Skeleton Loaders check */}
          {loadingSkeleton ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm overflow-hidden flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl skeleton-shimmer bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse" />
                    <div className="h-3 bg-slate-100 rounded w-1/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3" id="students-container">
              {filteredStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center p-6 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                  <AlertCircle className="w-12 h-12 text-slate-350 stroke-[1.5] mb-2" />
                  <h3 className="text-sm font-bold text-slate-700">No students matching criteria</h3>
                  <p className="text-xs text-slate-400">Try adjusting your filters, reset terms, or check spelling.</p>
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div 
                    key={student.id}
                    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white group hover:border-[#7e22ce]/40 transition-all duration-300 flex shadow-sm hover:shadow-md"
                  >
                    {/* Swiped Action Overlay elements */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2 bg-slate-50 border-l border-slate-100 px-4 transition-transform z-10">
                      <button 
                        onClick={(e) => startEdit(student, e)}
                        className="p-2 rounded-xl bg-[#f3e8ff] text-[#9333ea] hover:bg-[#9333ea] hover:text-white transition-all cursor-pointer"
                        title="Edit Student"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(student.id, e)}
                        className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                        title="Delete Student"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Standard Card Front */}
                    <div 
                      onClick={() => {
                        setSelectedStudent(student);
                        setActiveProfileTab('personal');
                      }}
                      className="relative w-full bg-white p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50/40 transition-all z-20"
                      style={{
                        transform: swipedStudentId === student.id ? 'translateX(-110px)' : 'translateX(0px)',
                        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {/* Avatar initials or Image */}
                      {student.image ? (
                        <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-slate-200">
                          <img 
                            alt={student.fullName || student.name} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                            src={student.image} 
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center font-extrabold text-sm text-[#9333ea] shrink-0 border border-purple-100">
                          {(student.fullName || student.name).split(' ').map(n=>n[0]).join('').slice(0, 2)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <h3 className="text-xs font-extrabold text-slate-800 truncate tracking-tight pr-2">
                            {student.fullName || student.name}
                          </h3>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${getStatusColor(student.enrollmentStatus)}`}>
                            {student.enrollmentStatus}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold font-mono mt-0.5">
                          <span>Adm: {student.admissionNumber}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                          <span className="font-sans font-extrabold text-slate-655">{student.formLevel} {student.stream}</span>
                        </div>
                      </div>

                      {/* Right icons info */}
                      <div className="flex items-center gap-1.5 shrink-0 pl-1">
                        <button 
                          onClick={(e) => handleSwipe(student.id, e)}
                          className="p-1 text-slate-305 hover:text-slate-500 rounded-full cursor-pointer touch-none"
                          title="Actions menu"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-350" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Floating Action Button '+' for Screen B student registration */}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="fixed bottom-24 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-[#9333ea] text-white rounded-full shadow-lg hover:bg-[#7e22ce] hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-40 cursor-pointer"
            title="Add student"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Add Student Modal Backdrop */}
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
                <div className="bg-[#9333ea] text-white p-5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                     <GraduationCap className="w-5 h-5 text-[#dad7ff]" />
                     <h3 className="text-sm font-black">Register Student Profile</h3>
                  </div>
                  <button 
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setErrorText('');
                    }}
                    className="p-1 hover:bg-white/10 rounded-full text-purple-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  {errorText && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorText}</span>
                    </div>
                  )}

                  {/* Section 1: Personal Information */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase border-l-2 border-[#9333ea] pl-2 mb-2">Section 1: Personal details</h4>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Student Full Name</label>
                      <input 
                        type="text"
                        value={addForm.fullName}
                        onChange={(e) => setAddForm({...addForm, fullName: e.target.value})}
                        placeholder="e.g. Vanessa Njoroge"
                        className="w-full mt-1 p-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-100 rounded-xl text-xs outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Admission Number</label>
                        <input 
                          type="text"
                          value={addForm.admissionNumber}
                          onChange={(e) => setAddForm({...addForm, admissionNumber: e.target.value})}
                          placeholder="e.g. 8421"
                          className="w-full mt-1 p-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-100 rounded-xl text-xs font-semibold font-mono outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Gender</label>
                        <select 
                          value={addForm.gender}
                          onChange={(e) => setAddForm({...addForm, gender: e.target.value})}
                          className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white outline-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Date of Birth</label>
                        <input 
                          type="date"
                          value={addForm.dateOfBirth}
                          onChange={(e) => setAddForm({...addForm, dateOfBirth: e.target.value})}
                          className="w-full mt-1 p-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-100 rounded-xl text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Nationality</label>
                        <input 
                          type="text"
                          value={addForm.nationality}
                          onChange={(e) => setAddForm({...addForm, nationality: e.target.value})}
                          className="w-full mt-1 p-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-100 rounded-xl text-xs outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Email (Optional)</label>
                        <input 
                          type="email"
                          value={addForm.email}
                          onChange={(e) => setAddForm({...addForm, email: e.target.value})}
                          placeholder="student@example.com"
                          className="w-full mt-1 p-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-100 rounded-xl text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Image URL (Optional)</label>
                        <input 
                          type="text"
                          value={addForm.image}
                          onChange={(e) => setAddForm({...addForm, image: e.target.value})}
                          placeholder="https://..."
                          className="w-full mt-1 p-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-100 rounded-xl text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Academic Details */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase border-l-2 border-[#9333ea] pl-2 mb-2">Section 2: Academic information</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Form Assignment</label>
                        <select 
                          value={addForm.formLevel}
                          onChange={(e) => setAddForm({...addForm, formLevel: e.target.value})}
                          className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white outline-none"
                        >
                          <option value="Form 1">Form 1</option>
                          <option value="Form 2">Form 2</option>
                          <option value="Form 3">Form 3</option>
                          <option value="Form 4">Form 4</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Stream</label>
                        <select 
                          value={addForm.stream}
                          onChange={(e) => setAddForm({...addForm, stream: e.target.value})}
                          className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white outline-none"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase">KCPE Score (0-500)</label>
                        <input 
                          type="number"
                          value={addForm.kcpeScore}
                          onChange={(e) => setAddForm({...addForm, kcpeScore: e.target.value})}
                          className="w-full mt-1 p-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-100 rounded-xl text-xs font-semibold text-purple-800 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Enrollment Status</label>
                        <select 
                          value={addForm.enrollmentStatus}
                          onChange={(e) => setAddForm({...addForm, enrollmentStatus: e.target.value})}
                          className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white outline-none"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                          <option value="GRADUATED">GRADUATED</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Admission date</label>
                      <input 
                        type="date"
                        value={addForm.admissionDate}
                        onChange={(e) => setAddForm({...addForm, admissionDate: e.target.value})}
                        className="w-full mt-1 p-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-100 rounded-xl text-xs font-semibold outline-none"
                      />
                    </div>
                  </div>

                  {/* Section 3: Parent/Guardian Details */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase border-l-2 border-[#9333ea] pl-2 mb-2">Section 3: Parent/Guardian information</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Guardian Name</label>
                        <input 
                          type="text"
                          value={addForm.parentName}
                          onChange={(e) => setAddForm({...addForm, parentName: e.target.value})}
                          placeholder="e.g. Florence Njoroge"
                          className="w-full mt-1 p-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-100 rounded-xl text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Relationship</label>
                        <select 
                          value={addForm.relationship}
                          onChange={(e) => setAddForm({...addForm, relationship: e.target.value})}
                          className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white outline-none"
                        >
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Guardian">Guardian</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Phone Number</label>
                        <input 
                          type="text"
                          value={addForm.parentPhone}
                          onChange={(e) => setAddForm({...addForm, parentPhone: e.target.value})}
                          placeholder="+254 700 123 456"
                          className="w-full mt-1 p-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-100 rounded-xl text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Alt Phone (Optional)</label>
                        <input 
                          type="text"
                          value={addForm.altPhone}
                          onChange={(e) => setAddForm({...addForm, altPhone: e.target.value})}
                          placeholder="+254 711 123 456"
                          className="w-full mt-1 p-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-100 rounded-xl text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: School Info */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase border-l-2 border-[#9333ea] pl-2 mb-2">Section 4: Schooling & remarks</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Attendance (%)</label>
                        <input 
                          type="number"
                          value={addForm.attendancePercentage}
                          onChange={(e) => setAddForm({...addForm, attendancePercentage: e.target.value})}
                          className="w-full mt-1 p-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-100 rounded-xl text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Remarks</label>
                        <textarea 
                          value={addForm.remarks}
                          onChange={(e) => setAddForm({...addForm, remarks: e.target.value})}
                          rows={2}
                          className="w-full mt-1 p-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-100 rounded-xl text-xs font-sans outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#9333ea] text-white p-3.5 rounded-xl font-bold text-xs shadow-md shadow-purple-600/15 cursor-pointer hover:bg-[#7e22ce] active:scale-[0.98] transition-all"
                  >
                    Confirm Student Registration
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
