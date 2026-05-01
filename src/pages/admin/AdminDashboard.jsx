import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, Building2, Briefcase, FileText, Trash2, Check, X, Loader2, Filter, Search } from 'lucide-react';
import { useAuth, api } from '../../context/AuthContext';
import { JOB_TYPES, JOB_CATEGORIES, INDUSTRIES } from '../../mockData';

const Label = ({ children, icon: Icon, className = "" }) => (
  <div className={`flex items-center gap-2 industrial-label text-slate-500 dark:text-slate-400 ${className}`}>
    {Icon && <Icon size={14} className="text-blue-600" />}
    <span>{children}</span>
  </div>
);

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ userCount: 0, employerCount: 0, jobCount: 0, applicationCount: 0 });
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobFilter, setJobFilter] = useState({
    status: 'all',
    type: 'all',
    category: 'all'
  });
  const [appFilter, setAppFilter] = useState({
    status: 'all',
    applicant: '',
    company: '',
    category: 'all',
    type: 'all'
  });
  const [employerFilter, setEmployerFilter] = useState({
    status: 'all',
    industry: 'all',
    search: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, employersData, jobsData, applicationsData] = await Promise.all([
        api.getStats(),
        api.getAllUsers(),
        api.getAllEmployers(),
        api.getJobs(),
        api.getApplications()
      ]);
      setStats(statsData);
      setUsers(usersData);
      setEmployers(employersData);
      setJobs(jobsData);
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployerStatus = async (id, status) => {
    await api.updateEmployerStatus(id, status);
    loadData();
  };

  const handleJobStatus = async (id, status) => {
    await api.updateJobStatus(id, status);
    loadData();
  };

  const handleJobDelete = async (id) => {
    if (!confirm('Delete this job?')) return;
    await api.deleteJob(id);
    loadData();
  };



  // ── All hooks must be called before any early returns (Rules of Hooks) ──────

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      return (jobFilter.status === 'all' || j.status === jobFilter.status) &&
             (jobFilter.type === 'all' || j.type === jobFilter.type) &&
             (jobFilter.category === 'all' || j.category === jobFilter.category);
    });
  }, [jobs, jobFilter]);

  const filteredApplications = useMemo(() => {
    if (!Array.isArray(applications)) return [];
    return applications.filter(a => {
      const matchesStatus = appFilter.status === 'all' || a.status === appFilter.status;
      const matchesApplicant = !appFilter.applicant.trim() || 
        a.full_name?.toLowerCase().includes(appFilter.applicant.toLowerCase()) ||
        a.email?.toLowerCase().includes(appFilter.applicant.toLowerCase());
      const matchesCompany = !appFilter.company.trim() ||
        a.company?.toLowerCase().includes(appFilter.company.toLowerCase());
      const matchesCategory = appFilter.category === 'all' || a.category === appFilter.category;
      const matchesType = appFilter.type === 'all' || a.type === appFilter.type;
      
      return matchesStatus && matchesApplicant && matchesCompany && matchesCategory && matchesType;
    });
  }, [applications, appFilter]);

  const uniqueCompanies = useMemo(() => {
    if (!Array.isArray(applications)) return [];
    return [...new Set(applications.map(a => a.company).filter(Boolean))].sort();
  }, [applications]);

  const uniqueApplicants = useMemo(() => {
    if (!Array.isArray(applications)) return [];
    return [...new Set(applications.map(a => a.full_name).filter(Boolean))].sort();
  }, [applications]);

  const filteredEmployers = useMemo(() => {
    if (!Array.isArray(employers)) return [];
    return employers.filter(e => {
      const matchesStatus = employerFilter.status === 'all' || e.status === employerFilter.status;
      const matchesIndustry = employerFilter.industry === 'all' || e.industry === employerFilter.industry;
      const searchTerm = employerFilter.search.toLowerCase().trim();
      const matchesSearch = !searchTerm ||
        e.company_name?.toLowerCase().includes(searchTerm) ||
        e.email?.toLowerCase().includes(searchTerm) ||
        e.contact_person?.toLowerCase().includes(searchTerm) ||
        e.industry?.toLowerCase().includes(searchTerm);
      return matchesStatus && matchesIndustry && matchesSearch;
    });
  }, [employers, employerFilter]);

  // ── Early returns after all hooks ────────────────────────────────────────────

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50 dark:bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div>
            <Label icon={ShieldCheck} className="mb-2">Admin Dashboard</Label>
            <h1 className="industrial-heading text-4xl text-slate-950 dark:text-white">
              System Administration
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Manage users, employers, jobs, and applications
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <button 
            onClick={() => setActiveTab('users')}
            className="bento-card p-6 text-left hover:border-blue-600/30 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
              <Label>Applicants</Label>
            </div>
            <p className="text-3xl font-black text-slate-950 dark:text-white">{stats.userCount}</p>
          </button>
          <button 
            onClick={() => setActiveTab('employers')}
            className="bento-card p-6 text-left hover:border-blue-600/30 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Building2 size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
              <Label>Employers</Label>
            </div>
            <p className="text-3xl font-black text-slate-950 dark:text-white">{stats.employerCount}</p>
          </button>
          <button 
            onClick={() => setActiveTab('jobs')}
            className="bento-card p-6 text-left hover:border-blue-600/30 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Briefcase size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
              <Label>Active Jobs</Label>
            </div>
            <p className="text-3xl font-black text-slate-950 dark:text-white">{stats.jobCount}</p>
          </button>
          <button 
            onClick={() => setActiveTab('applications')}
            className="bento-card p-6 text-left hover:border-blue-600/30 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <FileText size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
              <Label>Applications</Label>
            </div>
            <p className="text-3xl font-black text-slate-950 dark:text-white">{stats.applicationCount}</p>
          </button>
        </div>

        <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4 overflow-x-auto">
          {['overview', 'users', 'employers', 'jobs', 'applications'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="bento-card p-8">
            <h3 className="text-xl font-black text-slate-950 dark:text-white mb-4">System Overview</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Recent Activity</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {stats.applicationCount} total applications • {stats.userCount} registered applicants
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setActiveTab('jobs')} className="text-blue-600 text-sm hover:underline">View Jobs</button>
                  <button onClick={() => setActiveTab('employers')} className="text-blue-600 text-sm hover:underline">View Employers</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="bento-card p-8 text-center">
                <Users size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-slate-500 font-medium">No registered applicants</p>
              </div>
            ) : (
              users.map(u => (
                <div key={u.id} className="bento-card p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-950 dark:text-white">{u.full_name}</h4>
                    <p className="text-sm text-slate-500">{u.email} • {u.barangay}</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'employers' && (
          <div className="space-y-4">
            <div className="bento-card p-4 flex flex-wrap gap-4 items-center bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-slate-500">
                <Filter size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Filters:</span>
              </div>

              <select
                value={employerFilter.status}
                onChange={(e) => setEmployerFilter({...employerFilter, status: e.target.value})}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={employerFilter.industry}
                onChange={(e) => setEmployerFilter({...employerFilter, industry: e.target.value})}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Industries</option>
                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>

              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={employerFilter.search}
                  onChange={(e) => setEmployerFilter({...employerFilter, search: e.target.value})}
                  placeholder="Search company, email, industry..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded pl-8 pr-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 placeholder:text-slate-400"
                />
              </div>
            </div>

            {filteredEmployers.length === 0 ? (
              <div className="bento-card p-8 text-center">
                <Building2 size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-slate-500 font-medium">No matching employers found</p>
              </div>
            ) : (
              filteredEmployers.map(e => (
                <div key={e.id} className="bento-card p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-slate-950 dark:text-white">{e.company_name}</h4>
                    <p className="text-sm text-slate-500">{e.email} • {e.industry}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      e.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      e.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {e.status}
                    </span>
                    {e.status === 'pending' && (
                      <>
                        <button onClick={() => handleEmployerStatus(e.id, 'approved')} className="text-emerald-600 hover:text-emerald-700">
                          <Check size={18} />
                        </button>
                        <button onClick={() => handleEmployerStatus(e.id, 'rejected')} className="text-red-600 hover:text-red-700">
                          <X size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="bento-card p-4 flex flex-wrap gap-4 items-center bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-slate-500">
                <Filter size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Filters:</span>
              </div>
              <select 
                value={jobFilter.status}
                onChange={(e) => setJobFilter({...jobFilter, status: e.target.value})}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select 
                value={jobFilter.type}
                onChange={(e) => setJobFilter({...jobFilter, type: e.target.value})}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Types</option>
                {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select 
                value={jobFilter.category}
                onChange={(e) => setJobFilter({...jobFilter, category: e.target.value})}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Categories</option>
                {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="bento-card p-8 text-center">
                <Briefcase size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-slate-500 font-medium">No jobs matching your filters</p>
              </div>
            ) : (
              filteredJobs.map(j => (
                <div key={j.id} className="bento-card p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-slate-950 dark:text-white">{j.title}</h4>
                    <p className="text-sm text-slate-500">{j.company} • {j.type} • {j.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      j.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-200 text-slate-600'
                    }`}>
                      {j.status}
                    </span>
                    <button onClick={() => handleJobDelete(j.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-4">
            <div className="bento-card p-4 flex flex-wrap gap-4 items-center bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-slate-500">
                <Filter size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Filters:</span>
              </div>
              
              <select 
                value={appFilter.status}
                onChange={(e) => setAppFilter({...appFilter, status: e.target.value})}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>

              <select 
                value={appFilter.category}
                onChange={(e) => setAppFilter({...appFilter, category: e.target.value})}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Categories</option>
                {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select 
                value={appFilter.type}
                onChange={(e) => setAppFilter({...appFilter, type: e.target.value})}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Types</option>
                {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={appFilter.applicant}
                  onChange={(e) => setAppFilter({...appFilter, applicant: e.target.value})}
                  placeholder="Search applicant name or email..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded pl-8 pr-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 placeholder:text-slate-400"
                />
              </div>

              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={appFilter.company}
                  onChange={(e) => setAppFilter({...appFilter, company: e.target.value})}
                  placeholder="Search employer / company..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded pl-8 pr-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 placeholder:text-slate-400"
                />
              </div>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="bento-card p-8 text-center">
                <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-slate-500 font-medium">No matching applications found</p>
              </div>
            ) : (
              filteredApplications.map(a => (
                <div key={a.id} className="bento-card p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-slate-950 dark:text-white">{a.full_name}</h4>
                    <p className="text-sm text-slate-500">Applied for: {a.title} at {a.company}</p>
                    <p className="text-xs text-slate-400">{a.email} • {a.barangay}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      a.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      a.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {a.status}
                    </span>

                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}