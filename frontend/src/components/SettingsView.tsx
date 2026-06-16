import React, { useState, useEffect } from 'react';
import { 
  Settings, Award, Bell, Shield, CheckCircle2, 
  RefreshCw, Save, GraduationCap, Users, Key, Mail, User, AlertTriangle,
  Plus, Trash2, Edit, RotateCcw
} from 'lucide-react';

interface SettingsViewProps {
  token: string | null;
  currentUser: { id: string; name: string; email: string; role: string } | null;
  onUpdateUser: (updatedUser: any) => void;
}

export default function SettingsView({ token, currentUser, onUpdateUser }: SettingsViewProps) {
  const [loading, setLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSchool, setIsSavingSchool] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' } | null>(null);

  // States for Profile details
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');

  // States for School settings (saved to localStorage for persistence)
  const [schoolName, setSchoolName] = useState(() => localStorage.getItem('ikonex_school_name') || 'Ikonex Academy');
  const [term, setTerm] = useState(() => localStorage.getItem('ikonex_term') || 'Term 1');
  const [academicYear, setAcademicYear] = useState(() => localStorage.getItem('ikonex_academic_year') || '2025/2026');

  // Notification states
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [notifyGrades, setNotifyGrades] = useState(true);

  // System preferences
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');

  // States for Grading Scales
  const [scales, setScales] = useState<any[]>([]);
  const [loadingScales, setLoadingScales] = useState(false);
  const [isResettingScales, setIsResettingScales] = useState(false);

  // States for Scale Form
  const [editingScaleId, setEditingScaleId] = useState<string | null>(null);
  const [scaleLetter, setScaleLetter] = useState('');
  const [scaleMinScore, setScaleMinScore] = useState<number>(0);
  const [scaleStatus, setScaleStatus] = useState<'Pass' | 'Fail'>('Pass');
  const [scaleRemarks, setScaleRemarks] = useState('');

  const fetchScales = async () => {
    if (!token) return;
    setLoadingScales(true);
    try {
      const res = await fetch('/api/grading-scales', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setScales(result.data);
      }
    } catch (err) {
      console.error('Failed to load grading scales:', err);
    } finally {
      setLoadingScales(false);
    }
  };

  const handleSaveScale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scaleLetter.trim() || scaleMinScore < 0 || scaleMinScore > 100 || !scaleRemarks.trim()) {
      triggerToast('All fields are required, min score must be 0-100', 'error');
      return;
    }

    try {
      const url = editingScaleId ? `/api/grading-scales/${editingScaleId}` : '/api/grading-scales';
      const method = editingScaleId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          letter: scaleLetter.trim(),
          minScore: Number(scaleMinScore),
          status: scaleStatus,
          remarks: scaleRemarks.trim()
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        triggerToast(editingScaleId ? 'Grading scale updated' : 'Grading scale created');
        fetchScales();
        resetScaleForm();
      } else {
        triggerToast(result.error?.message || 'Failed to save scale', 'error');
      }
    } catch (err) {
      triggerToast('Network error', 'error');
    }
  };

  const handleDeleteScale = async (id: string) => {
    if (!confirm('Are you sure you want to delete this grading scale?')) return;
    try {
      const res = await fetch(`/api/grading-scales/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        triggerToast('Grading scale deleted');
        fetchScales();
      } else {
        triggerToast(result.error?.message || 'Failed to delete scale', 'error');
      }
    } catch (err) {
      triggerToast('Network error', 'error');
    }
  };

  const handleResetScales = async () => {
    if (!confirm('Reset all grading scales to default? This will overwrite existing customized scales.')) return;
    setIsResettingScales(true);
    try {
      const res = await fetch('/api/grading-scales/reset', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        triggerToast('Grading scales reset to defaults');
        fetchScales();
      } else {
        triggerToast(result.error?.message || 'Failed to reset scales', 'error');
      }
    } catch (err) {
      triggerToast('Network error', 'error');
    } finally {
      setIsResettingScales(false);
    }
  };

  const startEditScale = (scale: any) => {
    setEditingScaleId(scale.id);
    setScaleLetter(scale.letter);
    setScaleMinScore(scale.minScore);
    setScaleStatus(scale.status);
    setScaleRemarks(scale.remarks);
  };

  const resetScaleForm = () => {
    setEditingScaleId(null);
    setScaleLetter('');
    setScaleMinScore(0);
    setScaleStatus('Pass');
    setScaleRemarks('');
  };

  useEffect(() => {
    if (currentUser?.role === 'ADMIN' && token) {
      fetchScales();
    }
  }, [currentUser, token]);

  // Load animation
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName || !profileEmail) {
      triggerToast('Name and email are required', 'error');
      return;
    }
    if (profilePassword && profilePassword !== profileConfirmPassword) {
      triggerToast('Passwords do not match', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/accounts/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          password: profilePassword || undefined
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        onUpdateUser(result.data);
        triggerToast('Profile updated successfully');
        setProfilePassword('');
        setProfileConfirmPassword('');
      } else {
        triggerToast(result.error?.message || 'Failed to update profile', 'error');
      }
    } catch (e) {
      triggerToast('Network error', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSchool(true);
    setTimeout(() => {
      localStorage.setItem('ikonex_school_name', schoolName);
      localStorage.setItem('ikonex_term', term);
      localStorage.setItem('ikonex_academic_year', academicYear);
      setIsSavingSchool(false);
      triggerToast('School settings updated');
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in duration-500 fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Academia Settings
        </h2>
        <p className="text-xs font-semibold text-slate-500">
          Configure academic profiles, notification templates, and update your user settings.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl h-44 animate-pulse border border-slate-200/50" />
          <div className="bg-white p-6 rounded-2xl h-60 animate-pulse border border-slate-200/50" />
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* SECTION 1: MY PROFILE DETAILS (Accessible to all accounts) */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-5 h-5 text-[#9333ea]" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                My Profile Details
              </h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    Change Password (Leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={profileConfirmPassword}
                    onChange={(e) => setProfileConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 bg-[#9333ea] hover:bg-[#7e22ce] disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/10 flex items-center gap-2 cursor-pointer active:scale-95 transition"
                >
                  {isSavingProfile ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Details</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* SECTION 2: SCHOOL INFO (Admin Only) */}
          {currentUser?.role === 'ADMIN' && (
            <>
              <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <GraduationCap className="w-5 h-5 text-[#9333ea]" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  School Information & Terms
                </h3>
              </div>

              <form onSubmit={handleSaveSchool} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Brand Logo Box */}
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="w-16 h-16 rounded-full bg-[#f3e8ff] flex items-center justify-center text-[#9333ea] text-xl font-black mb-2 shadow-inner border border-[#9333ea]/15">
                      IK
                    </div>
                    <span className="text-[10px] font-bold text-[#9333ea] tracking-wide">Logo Brand Installed</span>
                    <span className="text-[9px] text-slate-400 font-medium">System setup complete</span>
                  </div>

                  {/* School inputs */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">School Name</label>
                      <input
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Current Term</label>
                        <select
                          value={term}
                          onChange={(e) => setTerm(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-800"
                        >
                          <option value="Term 1">Term 1 (Winter)</option>
                          <option value="Term 2">Term 2 (Spring)</option>
                          <option value="Term 3">Term 3 (Autumn)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Academic Year</label>
                        <select
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-800"
                        >
                          <option value="2025/2026">2025/2026</option>
                          <option value="2026/2027">2026/2027</option>
                          <option value="2024/2025">2024/2025</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingSchool}
                    className="px-5 py-2.5 bg-[#9333ea] hover:bg-[#7e22ce] disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/10 flex items-center gap-2 cursor-pointer active:scale-95 transition"
                  >
                    {isSavingSchool ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving School Setup...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Term Settings</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* SECTION: GRADING SYSTEM CONFIGURATION */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#9333ea]" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Grading Scale Configuration
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleResetScales}
                  disabled={isResettingScales}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 disabled:bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Defaults</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List / Table of Scales */}
                <div className="lg:col-span-2 space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Active Grading Criteria</span>
                  
                  {loadingScales ? (
                    <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#9333ea] mb-2" />
                      Loading grading ranges...
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-150 bg-white">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-150">
                            <th className="p-3">Grade</th>
                            <th className="p-3">Min Score</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Remarks</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {scales.map((scale) => (
                            <tr key={scale.id || scale.letter} className="hover:bg-slate-50/50">
                              <td className="p-3 font-extrabold text-slate-900 text-sm">{scale.letter}</td>
                              <td className="p-3 text-slate-600 font-mono font-bold">{scale.minScore}%</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  scale.status === 'Pass' 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                    : 'bg-rose-50 text-rose-700 border border-rose-100'
                                }`}>
                                  {scale.status}
                                </span>
                              </td>
                              <td className="p-3 text-slate-500 text-[10px] max-w-[150px] truncate" title={scale.remarks}>
                                {scale.remarks}
                              </td>
                              <td className="p-3 text-right flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => startEditScale(scale)}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-[#9333ea] cursor-pointer"
                                  title="Edit Scale"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                {scale.id && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteScale(scale.id)}
                                    className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                                    title="Delete Scale"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}

                          {scales.length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-400">
                                No grading scales configured. Click "Reset to Defaults" to load ranges.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Add / Edit Form */}
                <div className="bg-slate-50/50 border border-slate-200/80 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      {editingScaleId ? 'Modify Grading Rule' : 'Add Grading Rule'}
                    </span>
                    {editingScaleId && (
                      <button
                        type="button"
                        onClick={resetScaleForm}
                        className="text-[10px] font-bold text-[#9333ea] hover:underline"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSaveScale} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">Grade Letter</label>
                        <input
                          type="text"
                          placeholder="e.g. A+"
                          value={scaleLetter}
                          onChange={(e) => setScaleLetter(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#9333ea] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">Minimum Score %</label>
                        <input
                          type="number"
                          placeholder="e.g. 85"
                          min="0"
                          max="100"
                          value={scaleMinScore}
                          onChange={(e) => setScaleMinScore(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#9333ea] outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block">Status Outcome</label>
                      <select
                        value={scaleStatus}
                        onChange={(e) => setScaleStatus(e.target.value as 'Pass' | 'Fail')}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#9333ea] outline-none"
                      >
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block">Remarks / Comments</label>
                      <textarea
                        rows={2}
                        placeholder="Remarks displayed on report cards..."
                        value={scaleRemarks}
                        onChange={(e) => setScaleRemarks(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#9333ea] outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-[#9333ea] hover:bg-[#7e22ce] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{editingScaleId ? 'Apply Update' : 'Insert Grade Rule'}</span>
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </>
        )}

          {/* SECTION 3: SYSTEM PREFERENCES & NOTIFICATION TOGGLES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* NOTIFICATIONS CONTAINER */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Bell className="w-4 h-4 text-[#9333ea]" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Notifications Controls
                </h3>
              </div>

              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Email Grade Reports</p>
                    <p className="text-[10px] text-slate-400">Email transcripts directly on term finalizations.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notifyEmail} 
                      onChange={(e) => setNotifyEmail(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9333ea]" />
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">SMS Score Warning</p>
                    <p className="text-[10px] text-slate-400">Warn parents immediately on weak test scores.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notifySms} 
                      onChange={(e) => setNotifySms(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9333ea]" />
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Teacher Update Alerts</p>
                    <p className="text-[10px] text-slate-400">Broadcasting updates for curriculum edits.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notifyGrades} 
                      onChange={(e) => setNotifyGrades(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9333ea]" />
                  </label>
                </div>
              </div>
            </div>

            {/* SYSTEM CONFIGS CONTAINER */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Settings className="w-4 h-4 text-[#9333ea]" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  System Preferences
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Academic Dark Mode</p>
                    <p className="text-[10px] text-slate-400">Toggle dark visual mode (UI only preview).</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer border ${
                      themeMode === 'dark' 
                        ? 'bg-slate-900 border-transparent text-white' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {themeMode === 'light' ? 'Light Mode' : 'Dark Mode Active'}
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Date Convention format</label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#9333ea] outline-none"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD (Standard ISO)</option>
                    <option value="DD-MM-YYYY">DD-MM-YYYY (European)</option>
                    <option value="MM-DD-YYYY">MM-DD-YYYY (US Standard)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Floating Action Toasts */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 border px-5 py-3.5 rounded-2xl shadow-2xl min-w-[280px] animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          toast.type === 'success' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-rose-600 border-rose-500 text-white'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-100 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
