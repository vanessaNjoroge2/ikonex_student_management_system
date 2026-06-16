import React, { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, Users, Waves, BookOpen, GraduationCap, ChevronRight, 
  Menu, PlusCircle, CheckCircle2, ShieldAlert, Sparkles, LayoutDashboard,
  Settings as SettingsIcon, LogOut, Bell, ChevronDown, User, X, AlertTriangle
} from 'lucide-react';
import { Student, Stream, Assessment, Activity, Subject } from './types';

// Import Views
import DashboardView from './components/DashboardView';
import StudentsView from './components/StudentsView';
import StreamsView from './components/StreamsView';
import ScoresView from './components/ScoresView';
import ReportsView from './components/ReportsView';
import SubjectsView from './components/SubjectsView';
import SettingsView from './components/SettingsView';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import LandingPage from './components/LandingPage';
import VerifyEmailView from './components/VerifyEmailView';
import VerifyLoginView from './components/VerifyLoginView';
import { RouterProvider, useRouter, useNavigate } from './components/Router';
import AuthGuard from './components/AuthGuard';
import AdminLoginView from './components/AdminLoginView';
import AccountsView from './components/AccountsView';

import { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";

const initParticles = async (engine: Engine): Promise<void> => {
  await loadSlim(engine);
};

export default function App() {
  return (
    <ParticlesProvider init={initParticles}>
      <RouterProvider>
        <MainApp />
      </RouterProvider>
    </ParticlesProvider>
  );
}

function MainApp() {
  const navigate = useNavigate();
  const { path } = useRouter();

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ikonex_access_token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('ikonex_refresh_token'));
  const [user, setUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('ikonex_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<string>('home');
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  // Real stats state
  const [stats, setStats] = useState<any | null>(null);
  // Prefilled subject for cross-tab marks input navigation
  const [prefilledSubject, setPrefilledSubject] = useState<string | null>(null);

  // Navigation state parameters
  const [openAddModalOnLoad, setOpenAddModalOnLoad] = useState(false);
  
  // Interactive navigation header elements
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutPromptOpen, setIsLogoutPromptOpen] = useState(false);
  const [isNotificationPaneOpen, setIsNotificationPaneOpen] = useState(false);

  // Toast feedback state
  const [globalToast, setGlobalToast] = useState<{ show: boolean; msg: string } | null>(null);

  const triggerToast = (msg: string) => {
    setGlobalToast({ show: true, msg });
    setTimeout(() => setGlobalToast(null), 3000);
  };

  const attemptTokenRefresh = async (): Promise<boolean> => {
    if (!refreshToken) return false;

    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        const { token: newAccessToken, refreshToken: newRefreshToken } = result.data;
        setToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        localStorage.setItem('ikonex_access_token', newAccessToken);
        localStorage.setItem('ikonex_refresh_token', newRefreshToken);
        return true;
      }
    } catch (e) {
      console.error('Refresh token error:', e);
    }
    return false;
  };

  const fetchAllData = async () => {
    if (!token) return;

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch students, streams, subjects, assessments, activities, stats
      const [studentsRes, streamsRes, subjectsRes, scoresRes, activitiesRes, statsRes] = await Promise.all([
        fetch('/api/students?limit=100', { headers }),
        fetch('/api/streams', { headers }),
        fetch('/api/subjects', { headers }),
        fetch('/api/scores', { headers }),
        fetch('/api/dashboard/activity', { headers }),
        fetch('/api/dashboard/stats', { headers })
      ]);

      if (studentsRes.status === 401 || streamsRes.status === 401 || subjectsRes.status === 401 || scoresRes.status === 401 || statsRes.status === 401) {
        const refreshed = await attemptTokenRefresh();
        if (refreshed) {
          // Retry fetching
          return fetchAllData();
        } else {
          handleLogoutConfirmSubmit();
          return;
        }
      }

      const studentsData = await studentsRes.json();
      const streamsData = await streamsRes.json();
      const subjectsData = await subjectsRes.json();
      const scoresData = await scoresRes.json();
      const activitiesData = await activitiesRes.json();
      const statsData = await statsRes.json();

      if (studentsData.success) setStudents(studentsData.data);
      if (streamsData.success) setStreams(streamsData.data);
      if (subjectsData.success) setSubjects(subjectsData.data);
      if (scoresData.success) setAssessments(scoresData.data);
      if (activitiesData.success) setActivities(activitiesData.data);
      if (statsData.success) setStats(statsData.data);

    } catch (error) {
      console.error('Error fetching data:', error);
      triggerToast('Failed to connect to the backend server.');
    }
  };

  // Load datasets initially
  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token]);

  const handleLogin = (
    authToken: string, 
    authRefreshToken: string, 
    authUser: { id: string; name: string; email: string; role: string }
  ) => {
    setToken(authToken);
    setRefreshToken(authRefreshToken);
    setUser(authUser);
    localStorage.setItem('ikonex_access_token', authToken);
    localStorage.setItem('ikonex_refresh_token', authRefreshToken);
    localStorage.setItem('ikonex_user', JSON.stringify(authUser));
    triggerToast(`Welcome to Ikonex Academy, ${authUser.name}!`);
    setActiveTab('home');
    navigate('/dashboard');
  };

  const handleLogoutConfirmSubmit = async () => {
    setIsLogoutPromptOpen(false);
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (e) {
      console.error('Logout error:', e);
    }
    
    // Clear credentials on client side
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('ikonex_access_token');
    localStorage.removeItem('ikonex_refresh_token');
    localStorage.removeItem('ikonex_user');
    triggerToast('Logged out successfully from Ikonex Academy.');
    navigate('/login', { replace: true });
  };

  const handleUpdateUser = (updatedUser: any) => {
    setUser(updatedUser);
    localStorage.setItem('ikonex_user', JSON.stringify(updatedUser));
  };

  const handleUpdateStudents = async (updated: Student[]) => {
    if (!token) return;

    // If deleted
    if (updated.length < students.length) {
      const deleted = students.find(s => !updated.some(u => u.id === s.id));
      if (deleted) {
        try {
          const res = await fetch(`/api/students/${deleted.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            triggerToast(`Student ${deleted.fullName || deleted.name} deleted successfully.`);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    // If added
    else if (updated.length > students.length) {
      const added = updated.find(u => !students.some(s => s.id === u.id));
      if (added) {
        try {
          const res = await fetch('/api/students', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              fullName: added.fullName,
              admissionNumber: added.admissionNumber,
              gender: added.gender,
              dateOfBirth: added.dateOfBirth,
              nationality: added.nationality,
              formLevel: added.formLevel,
              stream: added.stream,
              kcpeScore: added.kcpeScore,
              enrollmentStatus: added.enrollmentStatus,
              admissionDate: added.admissionDate,
              parentName: added.parentName,
              relationship: added.relationship,
              parentPhone: added.parentPhone,
              altPhone: added.altPhone || undefined,
              attendancePercentage: added.attendancePercentage,
              remarks: added.remarks || undefined,
              email: added.email || undefined,
              image: added.image || undefined,
            })
          });
          const resData = await res.json();
          if (resData.success) {
            triggerToast(`Student ${added.fullName} added successfully.`);
          } else {
            triggerToast(resData.error?.message || `Failed to add student ${added.fullName}.`);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    // If edited
    else {
      const edited = updated.find(u => {
        const original = students.find(s => s.id === u.id);
        return original && (
          original.fullName !== u.fullName ||
          original.admissionNumber !== u.admissionNumber ||
          original.gender !== u.gender ||
          original.dateOfBirth !== u.dateOfBirth ||
          original.nationality !== u.nationality ||
          original.formLevel !== u.formLevel ||
          original.stream !== u.stream ||
          original.kcpeScore !== u.kcpeScore ||
          original.enrollmentStatus !== u.enrollmentStatus ||
          original.admissionDate !== u.admissionDate ||
          original.parentName !== u.parentName ||
          original.relationship !== u.relationship ||
          original.parentPhone !== u.parentPhone ||
          original.altPhone !== u.altPhone ||
          original.attendancePercentage !== u.attendancePercentage ||
          original.remarks !== u.remarks ||
          original.email !== u.email ||
          original.image !== u.image
        );
      });
      if (edited) {
        try {
          const res = await fetch(`/api/students/${edited.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              fullName: edited.fullName,
              admissionNumber: edited.admissionNumber,
              gender: edited.gender,
              dateOfBirth: edited.dateOfBirth,
              nationality: edited.nationality,
              formLevel: edited.formLevel,
              stream: edited.stream,
              kcpeScore: edited.kcpeScore,
              enrollmentStatus: edited.enrollmentStatus,
              admissionDate: edited.admissionDate,
              parentName: edited.parentName,
              relationship: edited.relationship,
              parentPhone: edited.parentPhone,
              altPhone: edited.altPhone || undefined,
              attendancePercentage: edited.attendancePercentage,
              remarks: edited.remarks || undefined,
              email: edited.email || undefined,
              image: edited.image || undefined,
            })
          });
          const resData = await res.json();
          if (resData.success) {
            triggerToast(`Student ${edited.fullName} updated successfully.`);
          } else {
            triggerToast(resData.error?.message || `Failed to update student ${edited.fullName}.`);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    await fetchAllData();
  };

  const handleAddAssessment = async (newScore: any) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      const promises = [];
      
      if (newScore.catScore !== undefined && newScore.catScore !== null && newScore.catScore !== '' && !isNaN(parseFloat(newScore.catScore))) {
        promises.push(
          fetch('/api/scores', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              studentId: newScore.studentId,
              subjectName: newScore.subject,
              examType: 'CA',
              term: newScore.term,
              score: parseFloat(newScore.catScore),
              maxScore: 30,
              year: 2026
            })
          })
        );
      }
      
      if (newScore.examScore !== undefined && newScore.examScore !== null && newScore.examScore !== '' && !isNaN(parseFloat(newScore.examScore))) {
        promises.push(
          fetch('/api/scores', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              studentId: newScore.studentId,
              subjectName: newScore.subject,
              examType: 'Exam',
              term: newScore.term,
              score: parseFloat(newScore.examScore),
              maxScore: 70,
              year: 2026
            })
          })
        );
      }

      const results = await Promise.all(promises);
      let success = true;
      let errorMsg = '';
      for (const res of results) {
        const resData = await res.json();
        if (!res.ok || !resData.success) {
          success = false;
          errorMsg = resData.error?.message || errorMsg || 'Failed to save score component';
        }
      }
      
      if (success) {
        triggerToast('Scores recorded successfully.');
      } else {
        triggerToast(errorMsg || 'Failed to record scores.');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error connecting to the server.');
    }
    await fetchAllData();
  };

  const handleUpdateAssessment = async (updatedRec: any) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      const promises = [];

      // Handle CAT component
      if (updatedRec.catId) {
        promises.push(
          fetch(`/api/scores/${updatedRec.catId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              score: parseFloat(updatedRec.catScore),
              maxScore: 30,
              term: updatedRec.term
            })
          })
        );
      } else if (updatedRec.catScore !== undefined && updatedRec.catScore !== null && updatedRec.catScore !== '' && !isNaN(parseFloat(updatedRec.catScore))) {
        promises.push(
          fetch('/api/scores', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              studentId: updatedRec.studentId,
              subjectName: updatedRec.subject,
              examType: 'CA',
              term: updatedRec.term,
              score: parseFloat(updatedRec.catScore),
              maxScore: 30,
              year: 2026
            })
          })
        );
      }

      // Handle Exam component
      if (updatedRec.examId) {
        promises.push(
          fetch(`/api/scores/${updatedRec.examId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              score: parseFloat(updatedRec.examScore),
              maxScore: 70,
              term: updatedRec.term
            })
          })
        );
      } else if (updatedRec.examScore !== undefined && updatedRec.examScore !== null && updatedRec.examScore !== '' && !isNaN(parseFloat(updatedRec.examScore))) {
        promises.push(
          fetch('/api/scores', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              studentId: updatedRec.studentId,
              subjectName: updatedRec.subject,
              examType: 'Exam',
              term: updatedRec.term,
              score: parseFloat(updatedRec.examScore),
              maxScore: 70,
              year: 2026
            })
          })
        );
      }

      const results = await Promise.all(promises);
      let success = true;
      let errorMsg = '';
      for (const res of results) {
        const resData = await res.json();
        if (!res.ok || !resData.success) {
          success = false;
          errorMsg = resData.error?.message || errorMsg || 'Failed to update score component';
        }
      }
      
      if (success) {
        triggerToast('Scores updated successfully.');
      } else {
        triggerToast(errorMsg || 'Failed to update scores.');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error updating scores.');
    }
    await fetchAllData();
  };

  const handleDeleteAssessment = async (catId?: string, examId?: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this score record?");
    if (!confirmed) return;
    
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const promises = [];
      if (catId) {
        promises.push(fetch(`/api/scores/${catId}`, { method: 'DELETE', headers }));
      }
      if (examId) {
        promises.push(fetch(`/api/scores/${examId}`, { method: 'DELETE', headers }));
      }
      const results = await Promise.all(promises);
      let success = true;
      for (const res of results) {
        if (!res.ok) success = false;
      }
      
      if (success) {
        triggerToast('Score record deleted successfully.');
      } else {
        triggerToast('Failed to delete some score components.');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error deleting score record.');
    }
    await fetchAllData();
  };

  // Subjects updates
  const handleAddSubject = async (newSub: Subject) => {
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newSub.name,
          teacherName: newSub.teacherName,
          assignedStreams: newSub.assignedStreams,
          teacherId: newSub.teacherId
        })
      });
      if (res.ok) {
        triggerToast(`Subject ${newSub.name} registered.`);
      }
    } catch (e) {
      console.error(e);
    }
    await fetchAllData();
  };

  const handleUpdateSubject = async (updatedSub: Subject) => {
    try {
      const res = await fetch(`/api/subjects/${updatedSub.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: updatedSub.name,
          teacherName: updatedSub.teacherName,
          assignedStreams: updatedSub.assignedStreams,
          teacherId: updatedSub.teacherId
        })
      });
      if (res.ok) {
        triggerToast(`Subject ${updatedSub.name} updated.`);
      }
    } catch (e) {
      console.error(e);
    }
    await fetchAllData();
  };

  const handleDeleteSubject = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this subject?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/subjects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        triggerToast('Subject deleted.');
      }
    } catch (e) {
      console.error(e);
    }
    await fetchAllData();
  };

  const handleTabNavigation = (tab: string, extra?: any) => {
    setActiveTab(tab);
    if (extra?.openAddModal) {
      setOpenAddModalOnLoad(true);
    } else {
      setOpenAddModalOnLoad(false);
    }
  };

  if (path === '/') {
    return <LandingPage />;
  }

  if (path === '/admin-login') {
    return (
      <AuthGuard token={token} requireAuth={false}>
        <AdminLoginView onLogin={handleLogin} />
      </AuthGuard>
    );
  }

  if (path === '/login') {
    return (
      <AuthGuard token={token} requireAuth={false}>
        <LoginView onLogin={handleLogin} />
      </AuthGuard>
    );
  }

  if (path === '/register') {
    return (
      <AuthGuard token={token} requireAuth={false}>
        <RegisterView />
      </AuthGuard>
    );
  }

  if (path === '/verify-email') {
    return (
      <VerifyEmailView />
    );
  }

  if (path === '/verify-login') {
    return (
      <VerifyLoginView onLogin={handleLogin} />
    );
  }

  return (
    <AuthGuard token={token} requireAuth={true}>
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col lg:flex-row antialiased">
      
      {/* SIDEBAR FOR DESKTOP - STRICT ORDER OF MENU ITEMS */}
      <aside className="hidden lg:flex flex-col h-screen sticky top-0 p-6 w-[260px] border-r border-slate-200/80 bg-white shadow-sm shrink-0 justify-between">
        <div className="space-y-6">
          <div className="px-2 space-y-1">
            <h1 className="text-xl font-extrabold text-[#9333ea] tracking-tight flex items-center gap-2">
              <GraduationCap className="w-6 h-6 stroke-[1.8] text-[#9333ea]" />
              Ikonex Academy
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-8">
              School Administration
            </p>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs tracking-tight cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#f3e8ff] text-[#9333ea] font-black'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#9333ea]" />
              <span>Home</span>
            </button>
            
            <button 
              onClick={() => handleTabNavigation('students')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs tracking-tight cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-[#f3e8ff] text-[#9333ea] font-black'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-[#9333ea]" />
              <span>Students</span>
            </button>

            <button 
              onClick={() => setActiveTab('streams')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs tracking-tight cursor-pointer ${
                activeTab === 'streams'
                  ? 'bg-[#f3e8ff] text-[#9333ea] font-black'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Waves className="w-4 h-4 text-[#9333ea]" />
              <span>Streams</span>
            </button>

            <button 
              onClick={() => setActiveTab('scores')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs tracking-tight cursor-pointer ${
                activeTab === 'scores'
                  ? 'bg-[#f3e8ff] text-[#9333ea] font-black'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#9333ea]" />
              <span>Scores</span>
            </button>

            <button 
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs tracking-tight cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-[#f3e8ff] text-[#9333ea] font-black'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-[#9333ea]" />
              <span>Reports</span>
            </button>

            {/* SUBJECTS INTERACTIVE TAB */}
            <button 
              onClick={() => setActiveTab('subjects')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs tracking-tight cursor-pointer ${
                activeTab === 'subjects'
                  ? 'bg-[#f3e8ff] text-[#9333ea] font-black'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Subjects</span>
            </button>

            {/* ACCOUNTS INTERACTIVE TAB FOR ADMIN ONLY */}
            {user?.role === 'ADMIN' && (
              <button 
                onClick={() => setActiveTab('accounts')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs tracking-tight cursor-pointer ${
                  activeTab === 'accounts'
                    ? 'bg-[#f3e8ff] text-[#9333ea] font-black'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4 text-[#9333ea]" />
                <span>Manage Accounts</span>
              </button>
            )}

            {/* SETTINGS INTERACTIVE TAB */}
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs tracking-tight cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#f3e8ff] text-[#9333ea] font-black'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <SettingsIcon className="w-4 h-4 text-slate-500" />
              <span>Settings</span>
            </button>

            {/* LOGOUT BUTTON MODAL */}
            <button 
              onClick={() => setIsLogoutPromptOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs tracking-tight text-rose-600 hover:bg-rose-50/50 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-200/65 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-[#9333ea] font-extrabold text-xs">
            {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'AD'}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 leading-none">{user?.name || 'John Miller'}</p>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block capitalize">{user?.role ? `${user.role.toLowerCase()} Account` : 'Admin Account'}</span>
          </div>
        </div>
      </aside>

      {/* MOBILE APPLICATION HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex justify-between items-center lg:hidden">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-[#9333ea]" />
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            Ikonex Academy
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsNotificationPaneOpen(true)}
            className="p-1 text-slate-600 hover:text-[#9333ea] relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full" />
          </button>
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 cursor-pointer flex items-center justify-center bg-purple-550 text-white bg-purple-650 text-xs font-bold"
          >
            {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'AD'}
          </div>
        </div>
      </header>

      {/* PRIMARY WORKSPACE MAIN VIEWPORT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* TOP-RIGHT CORNER USER MENU AND SEARCH ACTION HEADER FOR DESKTOP */}
        <header className="hidden lg:flex bg-white/70 backdrop-blur-md px-8 py-4 border-b border-slate-200/80 justify-between items-center z-10 sticky top-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Official Registries</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[#9333ea] font-bold capitalize">{activeTab} tab active</span>
          </div>

          <div className="flex items-center gap-4 relative">
            
            {/* Bell triggers notifications activity panel */}
            <button 
              onClick={() => setIsNotificationPaneOpen(true)}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer relative transition"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
            </button>

            {/* Avatar Dropdown wrapper */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#f3e8ff] text-[#9333ea] font-bold text-xs flex items-center justify-center border border-[#9333ea]/10">
                  {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'AD'}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 leading-none">{user?.name || 'John Miller'}</p>
                    <p className="text-[9px] text-[#9333ea] font-bold font-mono mt-1 capitalize">{user?.role ? `${user.role.toLowerCase()} Account` : 'Admin Account'}</p>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setActiveTab('settings');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile details</span>
                  </button>

                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setActiveTab('accounts');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>Manage Accounts</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsNotificationPaneOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Bell className="w-4 h-4 text-slate-400" />
                    <span>Academy Notifications</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsLogoutPromptOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50/50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* CONTROLLER MAIN VIEW COMPONENT DISPATCHER */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 pb-28 lg:pb-8">
          
          {activeTab === 'home' && (
            <DashboardView 
              students={students}
              streams={streams}
              activities={activities}
              onNavigate={handleTabNavigation}
              stats={stats}
            />
          )}

          {activeTab === 'students' && (
            <StudentsView 
              students={students}
              streams={streams}
              onUpdateStudents={handleUpdateStudents}
              openAddModalInitially={openAddModalOnLoad}
              assessments={assessments}
              subjects={subjects}
            />
          )}

          {activeTab === 'streams' && (
            <StreamsView 
              streams={streams}
              students={students}
              currentUser={user}
              token={token}
              onRefresh={fetchAllData}
            />
          )}

          {activeTab === 'scores' && (
            <ScoresView 
              students={students}
              assessments={assessments}
              streams={streams}
              subjects={subjects}
              onAddAssessment={handleAddAssessment}
              onUpdateAssessment={handleUpdateAssessment}
              onDeleteAssessment={handleDeleteAssessment}
              prefilledSubject={prefilledSubject}
              onClearPrefill={() => setPrefilledSubject(null)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView 
              students={students}
              streams={streams}
              subjects={subjects}
              assessments={assessments}
              token={token}
            />
          )}

          {activeTab === 'subjects' && (
            <SubjectsView
              subjects={subjects}
              streams={streams}
              students={students}
              assessments={assessments}
              onAddSubject={handleAddSubject}
              onUpdateSubject={handleUpdateSubject}
              onDeleteSubject={handleDeleteSubject}
              onInputMarks={(subjName) => {
                setPrefilledSubject(subjName);
                setActiveTab('scores');
              }}
              currentUser={user}
              token={token}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView token={token} currentUser={user} onUpdateUser={handleUpdateUser} />
          )}

          {activeTab === 'accounts' && user?.role === 'ADMIN' && (
            <AccountsView token={token} />
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR - RECONSTRUCT FOR PRESERVED CONSISTENCY */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex justify-around items-center h-16 shadow-lg lg:hidden">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center flex-1 h-full font-medium transition-all ${
            activeTab === 'home' ? 'text-[#9333ea]' : 'text-slate-400'
          }`}
        >
          <HomeIcon className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1">Home</span>
        </button>

        <button 
          onClick={() => handleTabNavigation('students')}
          className={`flex flex-col items-center justify-center flex-1 h-full font-medium transition-all ${
            activeTab === 'students' ? 'text-[#9333ea]' : 'text-slate-400'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1">Students</span>
        </button>

        <button 
          onClick={() => setActiveTab('streams')}
          className={`flex flex-col items-center justify-center flex-1 h-full font-medium transition-all ${
            activeTab === 'streams' ? 'text-[#9333ea]' : 'text-slate-400'
          }`}
        >
          <Waves className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1">Streams</span>
        </button>

        <button 
          onClick={() => setActiveTab('scores')}
          className={`flex flex-col items-center justify-center flex-1 h-full font-medium transition-all ${
            activeTab === 'scores' ? 'text-[#9333ea]' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1">Scores</span>
        </button>

        <button 
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center justify-center flex-1 h-full font-medium transition-all ${
            activeTab === 'reports' ? 'text-[#9333ea]' : 'text-slate-400'
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1">Reports</span>
        </button>

        {/* MOBILE SUBJECTS CONTROL */}
        <button 
          onClick={() => setActiveTab('subjects')}
          className={`flex flex-col items-center justify-center flex-1 h-full font-medium transition-all ${
            activeTab === 'subjects' ? 'text-emerald-700' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1">Subjects</span>
        </button>

        {/* MOBILE ACCOUNTS CONTROL FOR ADMIN ONLY */}
        {user?.role === 'ADMIN' && (
          <button 
            onClick={() => setActiveTab('accounts')}
            className={`flex flex-col items-center justify-center flex-1 h-full font-medium transition-all ${
              activeTab === 'accounts' ? 'text-[#9333ea]' : 'text-slate-400'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-1">Accounts</span>
          </button>
        )}
      </nav>

      {/* RE-USABLE LOGOUT PROMPT CONFIRMATION MODAL DIALOGUE */}
      {isLogoutPromptOpen && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm border border-slate-200/80 shadow-2xl p-6 text-center space-y-4 scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">Sign Out Confirmation</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to log out of the Ikonex Academy Student Management System?
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsLogoutPromptOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
              >
                No, Stay
              </button>
              <button
                onClick={handleLogoutConfirmSubmit}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS BAR DRAWER PANEL */}
      {isNotificationPaneOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#9333ea]" />
                Recent System Log Alerts
              </h3>
              <button 
                onClick={() => setIsNotificationPaneOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activities.map(act => (
                <div key={act.id} className="p-4 bg-slate-50 hover:bg-purple-50/20 border border-slate-100 rounded-2xl transition space-y-1">
                  <div className="flex justify-between items-start">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      act.type === 'enrollment' ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-[#9333ea]'
                    }`}>
                      {act.type}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium font-mono">{act.time}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">{act.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-normal">{act.description}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100/80 bg-slate-50/60 flex text-center">
              <button 
                onClick={() => setIsNotificationPaneOpen(false)}
                className="w-full py-2.5 text-xs text-[#9333ea] font-bold"
              >
                Close Logs Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC TOAST FEEDBACK FOR GLOBAL UPDATES */}
      {globalToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{globalToast.msg}</span>
        </div>
      )}

    </div>
    </AuthGuard>
  );
}
