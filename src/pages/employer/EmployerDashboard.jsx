import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Briefcase, Loader2, Plus, ShieldCheck, Trash2, Users, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { BARANGAYS, JOB_CATEGORIES, JOB_TYPES } from '../../mockData'

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

const getStatusClasses = (status) => {
  if (status === 'approved') {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  }

  if (status === 'pending') {
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  }

  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
}

const MOCK_EMPLOYER_ID = 1

export default function EmployerDashboard() {
  const { api } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [showModal, setShowModal] = useState(false)
  const [jobApplications, setJobApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState([])
  const [newJob, setNewJob] = useState({
    title: '',
    location: '',
    type: '',
    category: '',
    salary: '',
    description: '',
    requirements: '',
  })

  const activeTab = searchParams.get('tab') || 'jobs'
  const showJobForm = searchParams.get('action') === 'create-job'
  const applicationFilter = searchParams.get('filter') || 'all'
  const selectedJobApplications = searchParams.get('applications')
  const jobIdParam = searchParams.get('details')
  const selectedJobDetails = jobIdParam ? jobs.find(j => j.id === parseInt(jobIdParam)) : null

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (!value) {
      newParams.delete(key)
    } else {
      newParams.set(key, value)
    }
    setSearchParams(newParams)
  }

  const setTab = (tab) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('tab', tab)
    newParams.delete('applications')
    setSearchParams(newParams)
  }

  const closeJobModal = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('details')
    setSearchParams(newParams)
  }

  const closeApplicationsModal = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('applications')
    setSearchParams(newParams)
  }

  const loadJobs = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const employerJobs = await api.getJobsByEmployer(MOCK_EMPLOYER_ID)
      setJobs(employerJobs)
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  useEffect(() => {
    if (selectedJobApplications) {
      const loadApplications = async () => {
        const apps = await api.getApplicationsByJob(parseInt(selectedJobApplications))
        setJobApplications(apps)
        setShowModal(true)
      }
      loadApplications()
    }
  }, [selectedJobApplications])

  const handleCreateJob = async (event) => {
    event.preventDefault()

    try {
      await api.createJob({
        employerId: MOCK_EMPLOYER_ID,
        title: newJob.title,
        company: 'Santa Maria Builders Corp.',
        location: newJob.location,
        type: newJob.type,
        category: newJob.category,
        salary: newJob.salary,
        description: newJob.description,
        requirements: newJob.requirements,
      })

      await loadJobs(true)
      updateParam('action', '')
      setNewJob({
        title: '',
        location: '',
        type: '',
        category: '',
        salary: '',
        description: '',
        requirements: '',
      })
      toast.success('Job post created')
    } catch (error) {
      console.error('Error creating job:', error)
      toast.error('Unable to create the job post')
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return

    try {
      await api.deleteJob(jobId)
      await loadJobs(true)
      if (selectedJobApplications === jobId.toString()) {
        setJobApplications([])
        closeApplicationsModal()
      }
      toast.success('Job post removed')
    } catch (error) {
      console.error('Error deleting job:', error)
      toast.error('Unable to delete the job post')
    }
  }

  const viewApplications = async (jobId) => {
    updateParam('applications', jobId)
  }

  const viewAllApplications = async () => {
    closeApplicationsModal()
    updateParam('filter', 'all')
    const applications = await api.getApplicationsByEmployer(MOCK_EMPLOYER_ID)
    setJobApplications(applications)
    updateParam('tab', 'applications')
  }

  const handleApplicationStatus = async (applicationId, status) => {
    try {
      await api.updateApplicationStatus(applicationId, status)

      if (selectedJobApplications) {
        const applications = await api.getApplicationsByJob(parseInt(selectedJobApplications))
        setJobApplications(applications)
      } else {
        const applications = await api.getApplicationsByEmployer(MOCK_EMPLOYER_ID)
        setJobApplications(applications)
      }

      await loadJobs(true)
      toast.success(`Application marked as ${status}`)
    } catch (error) {
      console.error('Error updating application status:', error)
      toast.error('Unable to update application status')
    }
  }

  const handleToggleJobStatus = async (jobId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'active' ? 'inactive' : 'active'
      const response = await api.updateJobStatus(jobId, nextStatus)

      if (!response.success) {
        toast.error('Failed to update job status')
        return
      }

      toast.success(`Job post marked as ${nextStatus}`)
      await loadJobs(true)
    } catch (error) {
      console.error('Error toggling job status:', error)
      toast.error('Unable to update job status')
    }
  }

  const filteredApplications = useMemo(() => {
    return jobApplications.filter(application => {
      return applicationFilter === 'all' || application.status === applicationFilter
    })
  }, [applicationFilter, jobApplications])

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
            <Label icon={ShieldCheck} className="mb-2">Employer Dashboard</Label>
            <h1 className="industrial-heading text-4xl text-slate-950 dark:text-white">
              Santa Maria Builders Corp.
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Construction | Poblacion, Sta. Maria
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusClasses('approved')}`}>
            approved
          </span>
        </div>

        <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
          <button
            onClick={() => {
              setTab('jobs')
              closeApplicationsModal()
            }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              activeTab === 'jobs'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            My Job Posts
          </button>
          <button
            onClick={viewAllApplications}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              activeTab === 'applications'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Applications
          </button>
        </div>

        {activeTab === 'jobs' && (
          <div className="space-y-6">
            {!showJobForm ? (
              <button
                onClick={() => updateParam('action', 'create-job')}
                className="w-full bento-card p-6 flex items-center justify-center gap-3 hover:border-blue-600/30 transition-all"
              >
                <Plus size={24} className="text-blue-600" />
                <span className="font-bold text-slate-900 dark:text-white">Post New Job</span>
              </button>
            ) : (
              <div className="bento-card p-8">
                <h3 className="text-xl font-black text-slate-950 dark:text-white mb-6">Post New Job</h3>
                <form onSubmit={handleCreateJob} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="industrial-label text-slate-500 block mb-1">Job Title</label>
                      <input
                        type="text"
                        required
                        value={newJob.title}
                        onChange={(event) => setNewJob({ ...newJob, title: event.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600"
                        placeholder="e.g. Site Engineer"
                      />
                    </div>
                    <div>
                      <label className="industrial-label text-slate-500 block mb-1">Job Type</label>
                      <select
                        required
                        value={newJob.type}
                        onChange={(event) => setNewJob({ ...newJob, type: event.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600"
                      >
                        <option value="">Select Type</option>
                        {JOB_TYPES.map(jobType => (
                          <option key={jobType} value={jobType}>{jobType}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="industrial-label text-slate-500 block mb-1">Location</label>
                      <select
                        required
                        value={newJob.location}
                        onChange={(event) => setNewJob({ ...newJob, location: event.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600"
                      >
                        <option value="">Select Location</option>
                        {BARANGAYS.map(barangay => (
                          <option key={barangay} value={barangay}>{barangay}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="industrial-label text-slate-500 block mb-1">Category</label>
                      <select
                        required
                        value={newJob.category}
                        onChange={(event) => setNewJob({ ...newJob, category: event.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600"
                      >
                        <option value="">Select Category</option>
                        {JOB_CATEGORIES.map(jobCategory => (
                          <option key={jobCategory} value={jobCategory}>{jobCategory}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="industrial-label text-slate-500 block mb-1">Salary</label>
                      <input
                        type="text"
                        required
                        value={newJob.salary}
                        onChange={(event) => setNewJob({ ...newJob, salary: event.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600"
                        placeholder="e.g. PHP 25,000 - 35,000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="industrial-label text-slate-500 block mb-1">Description</label>
                    <textarea
                      required
                      value={newJob.description}
                      onChange={(event) => setNewJob({ ...newJob, description: event.target.value })}
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600"
                      placeholder="Job description..."
                    />
                  </div>
                  <div>
                    <label className="industrial-label text-slate-500 block mb-1">Requirements</label>
                    <input
                      type="text"
                      value={newJob.requirements}
                      onChange={(event) => setNewJob({ ...newJob, requirements: event.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600"
                      placeholder="e.g. BS Degree, 2 years experience"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-500"
                    >
                      Post Job
                    </button>
                    <button
                      type="button"
                      onClick={() => updateParam('action', '')}
                      className="border border-slate-300 dark:border-slate-700 px-6 py-2 rounded-lg font-bold text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {jobs.length === 0 ? (
                <div className="bento-card p-8 text-center">
                  <Briefcase size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                  <p className="text-slate-500 font-medium">No jobs posted yet</p>
                </div>
              ) : (
                jobs.map(job => (
                  <div
                    key={job.id}
                    className="bento-card p-6 cursor-pointer group/details hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all"
                    onClick={() => updateParam('details', job.id)}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1 w-full md:w-auto">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="industrial-label text-blue-600">{job.type}</span>
                          <span className="text-slate-300">|</span>
                          <span className="industrial-label text-slate-500">{job.category}</span>
                          <span className="text-slate-300">|</span>
                          <button
                            onClick={(event) => {
                              event.stopPropagation()
                              handleToggleJobStatus(job.id, job.status)
                            }}
                            title={job.status === 'active' ? 'Click to set inactive' : 'Click to set active'}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-sm ${
                              job.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                            }`}
                          >
                            {job.status}
                          </button>
                        </div>
                        <h4 className="text-lg font-bold text-slate-950 dark:text-white group-hover/details:text-blue-600 transition-colors">{job.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-1">
                          <span className="flex items-center gap-1"><Users size={14} /> {job.application_count || 0} applicants</span>
                          <span>{job.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <button
                          onClick={(event) => {
                            event.stopPropagation()
                            viewApplications(job.id)
                          }}
                          className="text-blue-600 font-bold text-sm hover:underline"
                        >
                          View Applications
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation()
                            handleDeleteJob(job.id)
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['all', 'pending', 'accepted', 'rejected'].map(filterValue => (
                <button
                  key={filterValue}
                  onClick={() => updateParam('filter', filterValue)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    applicationFilter === filterValue
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {filterValue.charAt(0).toUpperCase() + filterValue.slice(1)}
                </button>
              ))}
            </div>

            {filteredApplications.length === 0 ? (
              <div className="bento-card p-8 text-center">
                <Users size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-slate-500 font-medium">No applications found</p>
              </div>
            ) : (
              filteredApplications.map(application => (
                <div key={application.id} className="bento-card p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-950 dark:text-white">{application.full_name}</h4>
                      {application.job_title && (
                        <p className="text-sm font-semibold text-blue-600 mb-1">Applying for: {application.job_title}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-1">
                        <span>{application.email}</span>
                        <span>{application.phone}</span>
                        <span>{application.barangay}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      {application.status !== 'pending' && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          application.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {application.status.toUpperCase()}
                        </span>
                      )}
                      {application.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApplicationStatus(application.id, 'accepted')}
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-300 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApplicationStatus(application.id, 'rejected')}
                            className="bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0B0F19] rounded-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start p-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-black text-slate-950 dark:text-white mb-3">Job Applications</h3>
                <div className="flex gap-2 overflow-x-auto">
                  {['all', 'pending', 'accepted', 'rejected'].map(filterValue => (
                    <button
                      key={filterValue}
                      onClick={() => updateParam('filter', filterValue)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                        applicationFilter === filterValue
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {filterValue.charAt(0).toUpperCase() + filterValue.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={closeApplicationsModal}
                className="text-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors self-start"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {filteredApplications.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                  <p className="text-slate-500 font-medium">No applications found</p>
                </div>
              ) : (
                filteredApplications.map(application => (
                  <div key={application.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h4 className="text-lg font-bold text-slate-950 dark:text-white">{application.full_name}</h4>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-1">
                          <span>{application.email}</span>
                          <span>{application.phone}</span>
                          <span>{application.barangay}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {application.status !== 'pending' && (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            application.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {application.status.toUpperCase()}
                          </span>
                        )}
                        {application.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApplicationStatus(application.id, 'accepted')}
                              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-300 dark:border-emerald-700/50 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 dark:text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApplicationStatus(application.id, 'rejected')}
                              className="bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 dark:border-red-700/50 dark:bg-red-900/40 dark:hover:bg-red-900/60 dark:text-red-400 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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