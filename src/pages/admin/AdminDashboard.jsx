import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Briefcase,
  Building2,
  Check,
  FileText,
  Filter,
  Loader2,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { INDUSTRIES, JOB_CATEGORIES, JOB_TYPES } from '../../mockData'

const Label = ({ children, icon: Icon, className = '' }) => (
  <div className={`flex items-center gap-2 industrial-label text-slate-500 dark:text-slate-400 ${className}`}>
    {Icon && <Icon size={14} className="text-blue-600" />}
    <span>{children}</span>
  </div>
)

export default function AdminDashboard() {
  const { api } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [stats, setStats] = useState({
    userCount: 0,
    employerCount: 0,
    jobCount: 0,
    applicationCount: 0,
  })
  const [users, setUsers] = useState([])
  const [employers, setEmployers] = useState([])
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  const activeTab = searchParams.get('tab') || 'overview'

  const jobFilter = {
    status: searchParams.get('jobStatus') || 'all',
    type: searchParams.get('jobType') || 'all',
    category: searchParams.get('jobCategory') || 'all',
  }

  const appFilter = {
    status: searchParams.get('appStatus') || 'all',
    applicant: searchParams.get('appApplicant') || '',
    company: searchParams.get('appCompany') || '',
    category: searchParams.get('appCategory') || 'all',
    type: searchParams.get('appType') || 'all',
  }

  const employerFilter = {
    status: searchParams.get('empStatus') || 'all',
    industry: searchParams.get('empIndustry') || 'all',
    search: searchParams.get('empSearch') || '',
  }

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value === 'all' || value === '') {
      newParams.delete(key)
    } else {
      newParams.set(key, value)
    }
    setSearchParams(newParams)
  }

  const setTab = (tab) => {
    const newParams = new URLSearchParams(searchParams)
    if (tab === 'overview') {
      newParams.delete('tab')
    } else {
      newParams.set('tab', tab)
    }
    setSearchParams(newParams)
  }

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [statsData, usersData, employersData, jobsData, applicationsData] = await Promise.all([
        api.getStats(),
        api.getAllUsers(),
        api.getAllEmployers(),
        api.getJobs(),
        api.getApplications(),
      ])

      setStats(statsData)
      setUsers(usersData)
      setEmployers(employersData)
      setJobs(jobsData)
      setApplications(applicationsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleEmployerStatus = async (employerId, status) => {
    await api.updateEmployerStatus(employerId, status)
    await loadData()
  }

  const handleJobDelete = async (jobId) => {
    if (!confirm('Delete this job?')) return

    await api.deleteJob(jobId)
    await loadData()
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      return (jobFilter.status === 'all' || job.status === jobFilter.status)
        && (jobFilter.type === 'all' || job.type === jobFilter.type)
        && (jobFilter.category === 'all' || job.category === jobFilter.category)
    })
  }, [jobFilter, jobs])

  const filteredApplications = useMemo(() => {
    return applications.filter(application => {
      const matchesStatus = appFilter.status === 'all' || application.status === appFilter.status
      const matchesApplicant = !appFilter.applicant.trim()
        || application.full_name?.toLowerCase().includes(appFilter.applicant.toLowerCase())
        || application.email?.toLowerCase().includes(appFilter.applicant.toLowerCase())
      const matchesCompany = !appFilter.company.trim()
        || application.company?.toLowerCase().includes(appFilter.company.toLowerCase())
      const matchesCategory = appFilter.category === 'all' || application.category === appFilter.category
      const matchesType = appFilter.type === 'all' || application.type === appFilter.type

      return matchesStatus && matchesApplicant && matchesCompany && matchesCategory && matchesType
    })
  }, [appFilter, applications])

  const filteredEmployers = useMemo(() => {
    return employers.filter(employer => {
      const matchesStatus = employerFilter.status === 'all' || employer.status === employerFilter.status
      const matchesIndustry = employerFilter.industry === 'all' || employer.industry === employerFilter.industry
      const searchTerm = employerFilter.search.toLowerCase().trim()
      const matchesSearch = !searchTerm
        || employer.company_name?.toLowerCase().includes(searchTerm)
        || employer.email?.toLowerCase().includes(searchTerm)
        || employer.contact_person?.toLowerCase().includes(searchTerm)
        || employer.industry?.toLowerCase().includes(searchTerm)

      return matchesStatus && matchesIndustry && matchesSearch
    })
  }, [employerFilter, employers])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50 dark:bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div>
            <Label icon={ShieldCheck} className="mb-2">Admin Dashboard</Label>
            <h1 className="industrial-heading text-4xl text-slate-950 dark:text-white">
              Admin User
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Manage applicants, employers, jobs, and applications from the mock registry.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => setTab('users')}
            className="bento-card p-6 text-left hover:border-blue-600/30 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
              <Label>Applicants</Label>
            </div>
            <p className="text-3xl font-black text-slate-950 dark:text-white">{stats.userCount}</p>
          </button>
          <button
            onClick={() => setTab('employers')}
            className="bento-card p-6 text-left hover:border-blue-600/30 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Building2 size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
              <Label>Employers</Label>
            </div>
            <p className="text-3xl font-black text-slate-950 dark:text-white">{stats.employerCount}</p>
          </button>
          <button
            onClick={() => setTab('jobs')}
            className="bento-card p-6 text-left hover:border-blue-600/30 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Briefcase size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
              <Label>Jobs</Label>
            </div>
            <p className="text-3xl font-black text-slate-950 dark:text-white">{stats.jobCount}</p>
          </button>
          <button
            onClick={() => setTab('applications')}
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
              onClick={() => setTab(tab)}
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
                  {stats.applicationCount} total applications | {stats.userCount} registered applicants
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setTab('jobs')} className="text-blue-600 text-sm hover:underline">View Jobs</button>
                  <button onClick={() => setTab('employers')} className="text-blue-600 text-sm hover:underline">View Employers</button>
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
              users.map(applicant => (
                <div key={applicant.id} className="bento-card p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-950 dark:text-white">{applicant.full_name}</h4>
                    <p className="text-sm text-slate-500">{applicant.email} | {applicant.barangay}</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(applicant.created_at).toLocaleDateString()}
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
                onChange={(event) => updateFilter('empStatus', event.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={employerFilter.industry}
                onChange={(event) => updateFilter('empIndustry', event.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Industries</option>
                {INDUSTRIES.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>

              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={employerFilter.search}
                  onChange={(event) => updateFilter('empSearch', event.target.value)}
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
              filteredEmployers.map(employer => (
                <div key={employer.id} className="bento-card p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-slate-950 dark:text-white">{employer.company_name}</h4>
                    <p className="text-sm text-slate-500">{employer.email} | {employer.industry}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      employer.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : employer.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                    }`}>
                      {employer.status}
                    </span>
                    {employer.status === 'pending' && (
                      <>
                        <button onClick={() => handleEmployerStatus(employer.id, 'approved')} className="text-emerald-600 hover:text-emerald-700">
                          <Check size={18} />
                        </button>
                        <button onClick={() => handleEmployerStatus(employer.id, 'rejected')} className="text-red-600 hover:text-red-700">
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
                onChange={(event) => updateFilter('jobStatus', event.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={jobFilter.type}
                onChange={(event) => updateFilter('jobType', event.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Types</option>
                {JOB_TYPES.map(jobType => (
                  <option key={jobType} value={jobType}>{jobType}</option>
                ))}
              </select>
              <select
                value={jobFilter.category}
                onChange={(event) => updateFilter('jobCategory', event.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Categories</option>
                {JOB_CATEGORIES.map(jobCategory => (
                  <option key={jobCategory} value={jobCategory}>{jobCategory}</option>
                ))}
              </select>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="bento-card p-8 text-center">
                <Briefcase size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-slate-500 font-medium">No jobs matching your filters</p>
              </div>
            ) : (
              filteredJobs.map(job => (
                <div key={job.id} className="bento-card p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-slate-950 dark:text-white">{job.title}</h4>
                    <p className="text-sm text-slate-500">{job.company} | {job.type} | {job.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      job.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {job.status}
                    </span>
                    <button onClick={() => handleJobDelete(job.id)} className="text-red-600 hover:text-red-700">
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
                onChange={(event) => updateFilter('appStatus', event.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={appFilter.category}
                onChange={(event) => updateFilter('appCategory', event.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Categories</option>
                {JOB_CATEGORIES.map(jobCategory => (
                  <option key={jobCategory} value={jobCategory}>{jobCategory}</option>
                ))}
              </select>

              <select
                value={appFilter.type}
                onChange={(event) => updateFilter('appType', event.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Types</option>
                {JOB_TYPES.map(jobType => (
                  <option key={jobType} value={jobType}>{jobType}</option>
                ))}
              </select>

              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={appFilter.applicant}
                  onChange={(event) => updateFilter('appApplicant', event.target.value)}
                  placeholder="Search applicant name or email..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded pl-8 pr-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 placeholder:text-slate-400"
                />
              </div>

              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={appFilter.company}
                  onChange={(event) => updateFilter('appCompany', event.target.value)}
                  placeholder="Search employer or company..."
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
              filteredApplications.map(application => (
                <div key={application.id} className="bento-card p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-slate-950 dark:text-white">{application.full_name}</h4>
                    <p className="text-sm text-slate-500">Applied for: {application.title} at {application.company}</p>
                    <p className="text-xs text-slate-400">{application.email} | {application.barangay}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      application.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : application.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                    }`}>
                      {application.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}