import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  BarChart,
  Briefcase,
  CheckCircle,
  Filter,
  Loader2,
  MapPin,
  Search,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { JOB_CATEGORIES, JOB_TYPES } from '../../mockData'

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

const Label = ({ children, icon: Icon, className = '' }) => (
  <div className={`flex items-center gap-2 industrial-label text-slate-500 dark:text-slate-400 ${className}`}>
    {Icon && <Icon size={14} className="text-blue-600" />}
    <span>{children}</span>
  </div>
)

export default function Browse() {
  const [term, setTerm] = useState('')
  const [type, setType] = useState('')
  const [category, setCategory] = useState('')
  const [jobs, setJobs] = useState([])
  const [selectedJobDetails, setSelectedJobDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [applyingJobId, setApplyingJobId] = useState(null)
  const [appliedJobs, setAppliedJobs] = useState(new Map())
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('all')
  const navigate = useNavigate()
  const { api, user } = useAuth()
  const isApplicant = user?.role === 'applicant'

  const handleApply = async (jobId) => {
    if (!isApplicant) {
      toast.error('Enter the applicant portal to submit applications')
      navigate('/login')
      return
    }

    if (appliedJobs.has(jobId)) {
      toast.error('You have already applied to this job.')
      return
    }

    try {
      setApplyingJobId(jobId)
      const response = await api.createApplication(jobId, user.id)

      if (response && !response.success) {
        toast.error(response.error || 'Failed to submit application')
        return
      }

      setAppliedJobs(previous => {
        const nextJobs = new Map(previous)
        nextJobs.set(jobId, {
          id: response.application.id,
          status: response.application.status,
        })
        return nextJobs
      })
      toast.success('Application submitted successfully!')
    } catch {
      toast.error('Failed to submit application.')
    } finally {
      setApplyingJobId(null)
    }
  }

  const handleRevert = async (event, jobId, applicationId) => {
    event.stopPropagation()
    if (!confirm('Are you sure you want to revert this application?')) return

    try {
      const response = await api.deleteApplication(applicationId)
      if (!response.success) {
        toast.error(response.error || 'Failed to revert application')
        return
      }

      setAppliedJobs(previous => {
        const nextJobs = new Map(previous)
        nextJobs.delete(jobId)
        return nextJobs
      })
      toast.success('Application reverted successfully')
    } catch {
      toast.error('Unable to update the application')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const jobsData = await api.getJobs()
        setJobs(jobsData)

        if (isApplicant) {
          const applicationsData = await api.getApplicationsByUser(user.id)
          const applicationsMap = new Map()
          applicationsData.forEach(application => {
            applicationsMap.set(application.job_id, application)
          })
          setAppliedJobs(applicationsMap)
        } else {
          setAppliedJobs(new Map())
        }

        setError(null)
      } catch (loadError) {
        console.error(loadError)
        setError('Unable to load the job registry')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [api, isApplicant, user])

  const filtered = useMemo(() => {
    return jobs.filter(job => {
      const matchesTerm = job.title.toLowerCase().includes(term.toLowerCase())
        || job.company.toLowerCase().includes(term.toLowerCase())
      const matchesType = type ? job.type === type : true
      const matchesCategory = category ? job.category === category : true

      let matchesApplicationStatus = true
      if (applicationStatusFilter === 'applied') {
        matchesApplicationStatus = appliedJobs.has(job.id)
      } else if (applicationStatusFilter === 'not_applied') {
        matchesApplicationStatus = !appliedJobs.has(job.id)
      }

      return matchesTerm && matchesType && matchesCategory && matchesApplicationStatus
    })
  }, [appliedJobs, applicationStatusFilter, category, jobs, term, type])

  const renderApplyButton = (jobId) => {
    const application = appliedJobs.get(jobId)

    if (applyingJobId === jobId) {
      return <Loader2 size={16} className="animate-spin" />
    }

    if (!isApplicant) {
      return (
        <>
          Applicant Portal <ArrowUpRight size={16} />
        </>
      )
    }

    if (!application) {
      return (
        <>
          Apply <ArrowUpRight size={16} />
        </>
      )
    }

    if (application.status === 'pending') {
      return (
        <>
          <span className="flex items-center gap-2 group-hover/btn:hidden">
            <CheckCircle size={16} /> Applied
          </span>
          <span className="hidden items-center gap-2 group-hover/btn:flex">
            <X size={16} /> Revert
          </span>
        </>
      )
    }

    if (application.status === 'accepted') {
      return (
        <>
          <CheckCircle size={16} /> Accepted
        </>
      )
    }

    return (
      <>
        <X size={16} /> Rejected
      </>
    )
  }

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <Label icon={Search} className="mb-4">
              Job Registry
            </Label>
            <h1 className="industrial-heading text-4xl text-slate-950 dark:text-white">
              Active Positions.
            </h1>
          </div>

          <div className="w-full md:w-96 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search registry..."
              className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-blue-600 transition-colors"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 shrink-0 space-y-8">
            <div>
              <Label className="mb-4">Employment Classification</Label>
              <div className="space-y-2">
                {JOB_TYPES.map(jobType => (
                  <button
                    key={jobType}
                    onClick={() => setType(jobType === type ? '' : jobType)}
                    className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      type === jobType
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {jobType}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1 space-y-4">
            <div className="bento-card p-4 flex flex-wrap gap-4 items-center bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-slate-500">
                <Filter size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Additional Filters:</span>
              </div>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="">All Categories</option>
                {JOB_CATEGORIES.map(jobCategory => (
                  <option key={jobCategory} value={jobCategory}>{jobCategory}</option>
                ))}
              </select>

              {isApplicant && (
                <select
                  value={applicationStatusFilter}
                  onChange={(event) => setApplicationStatusFilter(event.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  <option value="all">All Jobs</option>
                  <option value="not_applied">Not Applied Yet</option>
                  <option value="applied">Already Applied</option>
                </select>
              )}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800">
              {loading && (
                <div className="py-20 text-center text-slate-500">
                  <Loader2 className="mx-auto mb-4 animate-spin" size={32} />
                  <p className="font-medium">Loading job registry...</p>
                </div>
              )}

              {error && (
                <div className="py-20 text-center text-red-500">
                  <BarChart className="mx-auto mb-4 opacity-20" size={48} />
                  <p className="font-medium">Error: {error}</p>
                </div>
              )}

              {!loading && !error && filtered.map(job => {
                const application = appliedJobs.get(job.id)
                const isLocked = Boolean(application && application.status !== 'pending')

                return (
                  <div
                    key={job.id}
                    className="group py-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors px-4 -mx-4 rounded-lg"
                  >
                    <div
                      className="space-y-2 flex-1 cursor-pointer group/details"
                      onClick={() => setSelectedJobDetails(job)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="industrial-label text-blue-600">
                          {job.type}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <span className="industrial-label text-slate-500">
                          {job.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-950 dark:text-white group-hover/details:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Briefcase size={14} /> {job.company}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} /> {job.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="text-right hidden sm:block">
                        <p className="industrial-label text-slate-400 mb-1">
                          Compensation
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {formatPrice(job.salary)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(event) => {
                            event.stopPropagation()
                            if (application?.status === 'pending') {
                              handleRevert(event, job.id, application.id)
                              return
                            }

                            handleApply(job.id)
                          }}
                          disabled={applyingJobId === job.id || isLocked}
                          className={`group/btn w-full md:w-auto px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed ${
                            application
                              ? application.status === 'pending'
                                ? 'bg-emerald-600 text-white hover:bg-red-600'
                                : application.status === 'accepted'
                                  ? 'bg-emerald-600 text-white cursor-default'
                                  : 'bg-red-600 text-white cursor-default'
                              : applyingJobId === job.id
                                ? 'bg-slate-400 text-white cursor-wait'
                                : 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600'
                          }`}
                        >
                          {renderApplyButton(job.id)}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {!loading && !error && filtered.length === 0 && (
                <div className="py-20 text-center text-slate-500">
                  <BarChart className="mx-auto mb-4 opacity-20" size={48} />
                  <p className="font-medium">
                    No records found matching query parameters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
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
                onClick={() => setSelectedJobDetails(null)}
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
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end sticky bottom-0 bg-white dark:bg-[#0B0F19] rounded-b-2xl z-10 gap-2">
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  const application = appliedJobs.get(selectedJobDetails.id)

                  if (application?.status === 'pending') {
                    handleRevert(event, selectedJobDetails.id, application.id)
                    return
                  }

                  handleApply(selectedJobDetails.id)
                }}
                disabled={
                  applyingJobId === selectedJobDetails.id
                  || Boolean(
                    appliedJobs.has(selectedJobDetails.id)
                    && appliedJobs.get(selectedJobDetails.id).status !== 'pending',
                  )
                }
                className={`group/btn px-8 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed ${
                  appliedJobs.has(selectedJobDetails.id)
                    ? appliedJobs.get(selectedJobDetails.id).status === 'pending'
                      ? 'bg-emerald-600 text-white hover:bg-red-600'
                      : appliedJobs.get(selectedJobDetails.id).status === 'accepted'
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-red-600 text-white cursor-default'
                    : applyingJobId === selectedJobDetails.id
                      ? 'bg-slate-400 text-white cursor-wait'
                      : 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600'
                }`}
              >
                {renderApplyButton(selectedJobDetails.id)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
