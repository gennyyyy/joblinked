import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Briefcase, FileText, Filter, Loader2, MapPin, ShieldCheck, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Label = ({ children, icon: Icon }) => (
  <div className="flex items-center gap-2 industrial-label text-slate-500 dark:text-slate-400">
    {Icon && <Icon size={14} className="text-blue-600" />}
    <span>{children}</span>
  </div>
)

const formatPrice = (price) => {
  if (!price) return 'N/A'
  if (typeof price === 'string' && price.includes('PHP')) return price

  const num = parseFloat(String(price).replace(/,/g, ''))
  if (Number.isNaN(num)) return price

  return 'PHP ' + new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

const MOCK_USER_ID = 1

export default function ApplicantDashboard() {
  const { api } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState([])

  const activeTab = searchParams.get('tab') || 'overview'
  const statusFilter = searchParams.get('status') || 'all'
  const jobIdParam = searchParams.get('jobId')

  const selectedJobDetails = jobIdParam ? applications.find(a => a.id === parseInt(jobIdParam)) : null

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value === 'all' || !value) {
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

  const closeJobModal = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('jobId')
    setSearchParams(newParams)
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const applicantApplications = await api.getApplicationsByUser(MOCK_USER_ID)
        setApplications(applicantApplications)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredApplications = useMemo(() => {
    if (statusFilter === 'all') return applications
    return applications.filter(application => application.status === statusFilter)
  }, [applications, statusFilter])

  const handleRevert = async (applicationId) => {
    if (!confirm('Are you sure you want to revert this application?')) return

    try {
      const response = await api.deleteApplication(applicationId)
      if (!response.success) {
        toast.error(response.error || 'Failed to revert application')
        return
      }

      toast.success('Application reverted successfully')
      const applicantApplications = await api.getApplicationsByUser(MOCK_USER_ID)
      setApplications(applicantApplications)
    } catch (error) {
      console.error('Error reverting application:', error)
      toast.error('Unable to update the application')
    }
  }

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
            <Label icon={ShieldCheck} className="mb-2">Applicant Dashboard</Label>
            <h1 className="industrial-heading text-4xl text-slate-950 dark:text-white">
              Welcome, Job Seeker
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Track your applications and review your mock profile data.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bento-card p-6">
            <Label>Total Applications</Label>
            <p className="text-3xl font-black text-slate-950 dark:text-white mt-2">
              {applications.length}
            </p>
          </div>
          <div className="bento-card p-6">
            <Label>Pending</Label>
            <p className="text-3xl font-black text-slate-950 dark:text-white mt-2">
              {applications.filter(application => application.status === 'pending').length}
            </p>
          </div>
          <div className="bento-card p-6">
            <Label>Accepted</Label>
            <p className="text-3xl font-black text-emerald-600 mt-2">
              {applications.filter(application => application.status === 'accepted').length}
            </p>
          </div>
        </div>

        <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
          {['overview', 'applications'].map(tab => (
            <button
              key={tab}
              onClick={() => setTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
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
          <div className="space-y-6">
            <div className="bento-card p-8">
              <h3 className="text-xl font-black text-slate-950 dark:text-white mb-4">Profile Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <p className="text-slate-900 dark:text-white font-medium">John Applicant</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-slate-900 dark:text-white font-medium">user@demo.com</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-slate-900 dark:text-white font-medium">09123456789</p>
                </div>
                <div>
                  <Label>Barangay</Label>
                  <p className="text-slate-900 dark:text-white font-medium">Poblacion</p>
                </div>
              </div>
            </div>

            <div className="bento-card p-8 bg-blue-50 dark:bg-blue-900/10">
              <h3 className="text-xl font-black text-slate-950 dark:text-white mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/browse"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-blue-500 transition-all"
                >
                  Browse Jobs
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-4">
            <div className="bento-card p-4 flex flex-wrap gap-4 items-center bg-slate-50 dark:bg-slate-900/50 mb-2">
              <div className="flex items-center gap-2 text-slate-500">
                <Filter size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Filter Status:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(event) => updateFilter('status', event.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="all">All Applications</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="bento-card p-8 text-center">
                <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-slate-500 font-medium">No applications yet</p>
                <Link
                  to="/browse"
                  className="text-blue-600 font-bold text-sm mt-2 inline-block"
                >
                  Browse jobs to apply
                </Link>
              </div>
            ) : (
              filteredApplications.map(application => (
                <div
                  key={application.id}
                  className="bento-card p-6 cursor-pointer group/details hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all"
                  onClick={() => updateFilter('jobId', application.id)}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1 w-full md:w-auto">
                      <h4 className="text-lg font-bold text-slate-950 dark:text-white group-hover/details:text-blue-600 transition-colors">{application.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1.5"><Briefcase size={14} /> {application.company}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={14} /> {application.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        application.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : application.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {application.status.toUpperCase()}
                      </span>
                      <span className="text-slate-500 text-sm whitespace-nowrap">
                        {new Date(application.applied_at).toLocaleDateString()}
                      </span>
                      {application.status === 'pending' && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation()
                            handleRevert(application.id)
                          }}
                          className="ml-2 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Revert Application"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {selectedJobDetails && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B0F19] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start sticky top-0 bg-white dark:bg-[#0B0F19] rounded-t-2xl z-10">
              <div>
                <h3 className="text-2xl font-black text-slate-950 dark:text-white">Job Details</h3>
                <p className="text-slate-500 font-medium mt-1">{selectedJobDetails.title}</p>
              </div>
              <button
                onClick={closeJobModal}
                className="text-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bento-card p-4">
                  <Label>Type</Label>
                  <p className="font-bold text-slate-900 dark:text-white mt-1">{selectedJobDetails.type}</p>
                </div>
                <div className="bento-card p-4">
                  <Label>Category</Label>
                  <p className="font-bold text-slate-900 dark:text-white mt-1">{selectedJobDetails.category}</p>
                </div>
                <div className="bento-card p-4">
                  <Label>Salary</Label>
                  <p className="font-bold text-slate-900 dark:text-white mt-1">{formatPrice(selectedJobDetails.salary)}</p>
                </div>
                <div className="bento-card p-4">
                  <Label>Location</Label>
                  <p className="font-bold text-slate-900 dark:text-white mt-1">{selectedJobDetails.location}</p>
                </div>
              </div>

              <div>
                <Label className="mb-2">Description</Label>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">{selectedJobDetails.description}</p>
              </div>

              <div>
                <Label className="mb-2">Requirements</Label>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">{selectedJobDetails.requirements}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}