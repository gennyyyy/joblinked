import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Plus, Users, Briefcase, Trash2, Loader2, X, Settings } from 'lucide-react';
import { useAuth, api } from '../../context/AuthContext';
import { BARANGAYS, JOB_TYPES, JOB_CATEGORIES } from '../../mockData';
import toast from 'react-hot-toast';

const Label = ({ children, icon: Icon }) => (
  <div className="flex items-center gap-2 industrial-label text-slate-500 dark:text-slate-400">
    {Icon && <Icon size={14} className="text-blue-600" />}
    <span>{children}</span>
  </div>
);

const formatPrice = (price) => {
  if (!price) return 'N/A';
  if (typeof price === 'string' && (price.includes('₱') || price.includes('PHP'))) return price;
  
  const num = parseFloat(String(price).replace(/,/g, ''));
  if (isNaN(num)) return price;

  return 'PHP ' + new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export default function EmployerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('jobs');
  const [showModal, setShowModal] = useState(false);
  const [applicationFilter, setApplicationFilter] = useState('all');
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedJobApplications, setSelectedJobApplications] = useState(null);
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [jobApplications, setJobApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({
    title: '',
    location: '',
    type: '',
    category: '',
    salary: '',
    description: '',
    requirements: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'employer') {
      navigate('/employers/login');
      return;
    }
    loadJobs();
  }, [user, navigate]);

  const loadJobs = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await api.getJobsByEmployer(user.id);
      setJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await api.createJob({
        employerId: user.id,
        title: newJob.title,
        company: user.company_name,
        location: newJob.location,
        type: newJob.type,
        category: newJob.category,
        salary: newJob.salary,
        description: newJob.description,
        requirements: newJob.requirements
      });
      loadJobs();
      setShowJobForm(false);
      setNewJob({
        title: '',
        location: '',
        type: '',
        category: '',
        salary: '',
        description: '',
        requirements: '',
      });
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await api.deleteJob(jobId);
      loadJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const viewApplications = async (jobId) => {
    setSelectedJobApplications(jobId);
    setApplicationFilter('all');
    const apps = await api.getApplicationsByJob(jobId);
    setJobApplications(apps);
    setShowModal(true);
  };

  const viewAllApplications = async () => {
    setSelectedJobApplications(null);
    setApplicationFilter('all');
    const apps = await api.getApplicationsByEmployer(user.id);
    setJobApplications(apps);
    setActiveTab('applications');
  };

  const handleApplicationStatus = async (appId, status) => {
    try {
      await api.updateApplicationStatus(appId, status);
      if (selectedJobApplications) {
        const apps = await api.getApplicationsByJob(selectedJobApplications);
        setJobApplications(apps);
      } else {
        const apps = await api.getApplicationsByEmployer(user.id);
        setJobApplications(apps);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const handleToggleJobStatus = async (jobId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await api.updateJobStatus(jobId, newStatus);
      if (response.success) {
        toast.success(`Job post marked as ${newStatus}`);
        loadJobs(true);
      } else {
        toast.error('Failed to update job status');
      }
    } catch (error) {
      console.error('Error toggling job status:', error);
      toast.error('Connection error');
    }
  };

  if (!user || user.role !== 'employer') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  const filteredApplications = jobApplications.filter(app => applicationFilter === 'all' || app.status === applicationFilter);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50 dark:bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div>
            <Label icon={ShieldCheck} className="mb-2">Employer Dashboard</Label>
            <h1 className="industrial-heading text-4xl text-slate-950 dark:text-white">
              {user.company_name}
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              {user.industry} • {user.address || 'Santa Maria, Bulacan'}
            </p>
          </div>
        </div>

        <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
          <button
            onClick={() => { setActiveTab('jobs'); setSelectedJobApplications(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'jobs'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            My Job Posts
          </button>
          <button
            onClick={viewAllApplications}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'applications'
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
                onClick={() => setShowJobForm(true)}
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
                        onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600"
                        placeholder="e.g. Software Developer"
                      />
                    </div>
                    <div>
                      <label className="industrial-label text-slate-500 block mb-1">Job Type</label>
                      <select
                        required
                        value={newJob.type}
                        onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600"
                      >
                        <option value="">Select Type</option>
                        {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="industrial-label text-slate-500 block mb-1">Location</label>
                      <select
                        required
                        value={newJob.location}
                        onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600"
                      >
                        <option value="">Select Location</option>
                        {BARANGAYS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="industrial-label text-slate-500 block mb-1">Category</label>
                      <select
                        required
                        value={newJob.category}
                        onChange={(e) => setNewJob({ ...newJob, category: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600"
                      >
                        <option value="">Select Category</option>
                        {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="industrial-label text-slate-500 block mb-1">Salary</label>
                      <input
                        type="text"
                        required
                        value={newJob.salary}
                        onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600"
                        placeholder="e.g. ₱25,000 - ₱35,000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="industrial-label text-slate-500 block mb-1">Description</label>
                    <textarea
                      required
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600"
                      placeholder="Job description..."
                    />
                  </div>
                  <div>
                    <label className="industrial-label text-slate-500 block mb-1">Requirements (comma-separated)</label>
                    <input
                      type="text"
                      value={newJob.requirements}
                      onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
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
                      onClick={() => setShowJobForm(false)}
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
                    onClick={() => setSelectedJobDetails(job)}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1 w-full md:w-auto">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="industrial-label text-blue-600">{job.type}</span>
                          <span className="text-slate-300">•</span>
                          <span className="industrial-label text-slate-500">{job.category}</span>
                          <span className="text-slate-300">•</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleJobStatus(job.id, job.status);
                            }}
                            title={job.status === 'active' ? 'Click to set Inactive' : 'Click to set Active'}
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
                          <span className="flex items-center gap-1"><Users size={14} /> {jobApplications.length} applicants</span>
                          <span className="flex items-center gap-1">{job.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            viewApplications(job.id);
                          }}
                          className="text-blue-600 font-bold text-sm hover:underline"
                        >
                          View Applications
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteJob(job.id);
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
              {['all', 'pending', 'accepted', 'rejected'].map(f => (
                <button
                  key={f}
                  onClick={() => setApplicationFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    applicationFilter === f 
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            {!selectedJobApplications && filteredApplications.length === 0 ? (
              <div className="bento-card p-8 text-center">
                <Users size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-slate-500 font-medium">No applications found</p>
              </div>
            ) : selectedJobApplications && filteredApplications.length === 0 ? (
              <div className="bento-card p-8 text-center">
                <Users size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-slate-500 font-medium">No applications found</p>
              </div>
            ) : (
              filteredApplications.map(app => (
                <div key={app.id} className="bento-card p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-950 dark:text-white">{app.full_name}</h4>
                      {app.job_title && (
                        <p className="text-sm font-semibold text-blue-600 mb-1">Applying for: {app.job_title}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-1">
                        <span>{app.email}</span>
                        <span>{app.phone}</span>
                        <span>{app.barangay}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      {app.status !== 'pending' && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          app.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {app.status.toUpperCase()}
                        </span>
                      )}
                      {app.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApplicationStatus(app.id, 'accepted')}
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-300 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApplicationStatus(app.id, 'rejected')}
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
                  {['all', 'pending', 'accepted', 'rejected'].map(f => (
                    <button
                      key={f}
                      onClick={() => setApplicationFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                        applicationFilter === f 
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
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
                filteredApplications.map(app => (
                  <div key={app.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h4 className="text-lg font-bold text-slate-950 dark:text-white">{app.full_name}</h4>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-1">
                          <span>{app.email}</span>
                          <span>{app.phone}</span>
                          <span>{app.barangay}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {app.status !== 'pending' && (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            app.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {app.status.toUpperCase()}
                          </span>
                        )}
                        {app.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApplicationStatus(app.id, 'accepted')}
                              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-300 dark:border-emerald-700/50 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 dark:text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApplicationStatus(app.id, 'rejected')}
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

      {/* Job Details Modal */}
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
          </div>
        </div>
      )}
    </div>
  );
}