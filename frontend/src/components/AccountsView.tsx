import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, ShieldAlert, Key, Plus, Trash2, Search, 
  ShieldOff, Activity, X, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle
} from 'lucide-react';

interface Account {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  isSuspended: boolean;
  createdAt: string;
}

interface LoginLog {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  timestamp: string;
}

interface AccountsViewProps {
  token: string | null;
}

export default function AccountsView({ token }: AccountsViewProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'TEACHER' | 'STUDENT'>('TEACHER');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAccounts = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/accounts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setAccounts(result.data);
      }
    } catch (e) {
      console.error(e);
      triggerToast('Failed to load accounts', 'error');
    }
  };

  const fetchLogs = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/accounts/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setLogs(result.data);
      }
    } catch (e) {
      console.error(e);
      triggerToast('Failed to load activity logs', 'error');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (activeTab === 'users') {
        await fetchAccounts();
      } else {
        await fetchLogs();
      }
      setLoading(false);
    };
    loadData();
  }, [activeTab, token]);

  const handleOpenCreate = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('TEACHER');
    setFormError('');
    setShowPassword(false);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      setFormError('All fields are required');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    setFormError('');
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, password, role })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        triggerToast(`Account created for ${name}`);
        setIsCreateOpen(false);
        fetchAccounts();
      } else {
        setFormError(result.error?.message || 'Failed to create account');
      }
    } catch (e) {
      setFormError('Network error. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenEdit = (acc: Account) => {
    setSelectedAccount(acc);
    setName(acc.name);
    setEmail(acc.email);
    setRole(acc.role);
    setFormError('');
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !name || !email || !role) {
      setFormError('All fields are required');
      return;
    }

    setFormError('');
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/accounts/${selectedAccount.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, role })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        triggerToast(`Account updated for ${name}`);
        setIsEditOpen(false);
        fetchAccounts();
      } else {
        setFormError(result.error?.message || 'Failed to update account');
      }
    } catch (e) {
      setFormError('Network error. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleSuspension = async (acc: Account) => {
    try {
      const res = await fetch(`/api/accounts/${acc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isSuspended: !acc.isSuspended })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        triggerToast(
          acc.isSuspended 
            ? `Account unsuspended for ${acc.name}`
            : `Account suspended for ${acc.name}`
        );
        fetchAccounts();
      } else {
        triggerToast(result.error?.message || 'Operation failed', 'error');
      }
    } catch (e) {
      triggerToast('Network error', 'error');
    }
  };

  const handleOpenReset = (acc: Account) => {
    setSelectedAccount(acc);
    setPassword('');
    setFormError('');
    setShowPassword(false);
    setIsResetOpen(true);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !password) {
      setFormError('Password is required');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    setFormError('');
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/accounts/${selectedAccount.id}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        triggerToast(`Password reset for ${selectedAccount.name}`);
        setIsResetOpen(false);
      } else {
        setFormError(result.error?.message || 'Failed to reset password');
      }
    } catch (e) {
      setFormError('Network error. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async (acc: Account) => {
    if (!confirm(`Are you sure you want to delete the account for "${acc.name}"? This is permanent.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/accounts/${acc.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        triggerToast(`Account deleted successfully`);
        fetchAccounts();
      } else {
        triggerToast(result.error?.message || 'Failed to delete account', 'error');
      }
    } catch (e) {
      triggerToast('Network error', 'error');
    }
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    acc.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    acc.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in duration-500 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
            Account Management
          </h2>
          <p className="text-xs font-semibold text-slate-500">
            View, edit, suspend, promote registered user credentials, or inspect active login sessions.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex p-1 bg-slate-100 rounded-xl w-full sm:w-auto self-start sm:self-center">
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex-1 sm:flex-initial px-4 py-2 font-bold text-xs rounded-lg transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-white text-[#9333ea] shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Accounts Registry
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`flex-1 sm:flex-initial px-4 py-2 font-bold text-xs rounded-lg transition-all cursor-pointer ${
              activeTab === 'logs' ? 'bg-white text-[#9333ea] shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Access logs
          </button>
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Action Header */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-80 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-707 focus:border-[#9333ea] outline-none"
              />
            </div>
            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-2 bg-[#9333ea] hover:bg-[#7e22ce] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-purple-600/10 cursor-pointer active:scale-95 transition"
            >
              <Plus className="w-4 h-4 text-white" />
              Create Account
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200/50 p-12 text-center">
              <Loader2 className="w-8 h-8 text-[#9333ea] animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-400">Syncing registry...</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/85 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-150">
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Registered Date</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredAccounts.map(acc => (
                      <tr key={acc.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-slate-900">{acc.name}</td>
                        <td className="p-4 text-slate-500 font-mono text-[11px]">{acc.email}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider ${
                            acc.role === 'ADMIN' 
                              ? 'bg-purple-50 text-[#9333ea]' 
                              : acc.role === 'TEACHER' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-slate-100 text-slate-600'
                          }`}>
                            {acc.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wide ${
                            acc.isSuspended 
                              ? 'bg-rose-50 text-rose-700' 
                              : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {acc.isSuspended ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 font-mono text-[11px]">
                          {new Date(acc.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleSuspension(acc)}
                            className={`p-1.5 rounded-lg border text-xs font-bold cursor-pointer transition ${
                              acc.isSuspended 
                                ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' 
                                : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                            }`}
                            title={acc.isSuspended ? 'Unsuspend account' : 'Suspend account'}
                          >
                            {acc.isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleOpenEdit(acc)}
                            className="p-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg transition"
                            title="Edit user details"
                          >
                            <Users className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenReset(acc)}
                            className="p-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg transition"
                            title="Reset password"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(acc)}
                            className="p-1.5 border border-rose-100 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredAccounts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <Users className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                          <p className="text-xs font-semibold">No accounts match the active search filter.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#9333ea]" />
              System Login Activity Logs
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Showing last 100 entries</span>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 text-[#9333ea] animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-400">Syncing audit logs...</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50 font-bold border-b border-slate-150 text-slate-500">
                    <th className="p-3">User</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Account Type</th>
                    <th className="p-3 text-right">Login Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-900">{log.name}</td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{log.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider ${
                          log.role === 'ADMIN' 
                            ? 'bg-purple-50 text-[#9333ea]' 
                            : log.role === 'TEACHER' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          {log.role}
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-400 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-semibold">No login activities logged yet.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-[#9333ea]" />
                Register New User Account
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs font-bold flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vanessa Njoroge"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. v.njoroge@ikonex.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-850"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-850 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-707"
                >
                  <option value="TEACHER">Teacher Account</option>
                  <option value="ADMIN">Admin Account</option>
                  <option value="STUDENT">Student Account</option>
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
                  disabled={isActionLoading}
                  className="flex-1 py-2.5 bg-[#9333ea] hover:bg-[#7e22ce] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Register Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-[#9333ea]" />
                Edit User Details
              </h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-707 text-xs font-bold flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vanessa Njoroge"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. v.njoroge@ikonex.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-850"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-707"
                >
                  <option value="TEACHER">Teacher Account</option>
                  <option value="ADMIN">Admin Account</option>
                  <option value="STUDENT">Student Account</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-650 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="flex-1 py-2.5 bg-[#9333ea] hover:bg-[#7e22ce] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Save Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {isResetOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm border border-slate-200 shadow-2xl overflow-hidden scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                <Key className="w-4 h-4 text-[#9333ea]" />
                Reset Password
              </h3>
              <button
                onClick={() => setIsResetOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs font-bold flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <p className="text-xs text-slate-500">
                Type the new credentials password for <span className="font-bold text-slate-800">{selectedAccount?.name}</span>.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#9333ea] outline-none text-xs font-semibold text-slate-850 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsResetOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-650 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Reset Password'}
                </button>
              </div>
            </form>
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
