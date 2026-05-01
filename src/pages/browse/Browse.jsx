import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Briefcase, MapPin, ArrowUpRight, BarChart, Loader2, CheckCircle, Filter, X } from 'lucide-react';
import { api, useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

import { JOB_TYPES, JOB_CATEGORIES } from '../../mockData';

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

const Label = ({ children, icon: Icon, className = "" }) => (
  <div className={`flex items-center gap-2 industrial-label text-slate-500 dark:text-slate-400 ${className}`}>
    {Icon && <Icon size={14} className="text-blue-600" />}
    <span>{children}</span>
  </div>
);

export default function Browse() {
  const [term, setTerm] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [jobs, setJobs] = useState([]);
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Map());
  const [applicationStatusFilter, setApplicationStatusFilter] = useState("all");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleApply = async (jobId) => {
    if (!user) {
      toast.error("Please login as a job seeker to apply.");
      navigate("/applicants/login");
      return;
    }
    
    if (user.role !== 'applicant') {
      toast.error("Only registered job seekers can apply for jobs.");
      return;
    }

    if (appliedJobs.has(jobId)) {
      toast.error("You have already applied to this job.");
      return;
    }

    try {
      setApplyingJobId(jobId);
      const response = await api.createApplication(jobId, user.id);
      if (response && !response.success) {
        toast.error(response.error || "Failed to submit application");
      } else {
        setAppliedJobs(prev => {
          const newMap = new Map(prev);
          newMap.set(jobId, { id: response.applicationId, status: 'pending' });
          return newMap;
        });
        toast.success("Application submitted successfully!");
      }
    } catch {
      toast.error("Failed to submit application.");
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleRevert = async (e, jobId, appId) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to revert this application?')) return;
    try {
      const response = await api.deleteApplication(appId);
      if (response.success) {
        setAppliedJobs(prev => {
          const newMap = new Map(prev);
          newMap.delete(jobId);
          return newMap;
        });
        toast.success('Application reverted successfully');
      } else {
        toast.error(response.error || 'Failed to revert application');
      }
    } catch (err) {
      toast.error('Connection error');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await api.getJobs();
        setJobs(data);

        if (user && user.role === 'applicant') {
          const appsData = await api.getApplicationsByUser(user.id);
          const appsMap = new Map();
          appsData.forEach(app => appsMap.set(app.job_id, app));
          setAppliedJobs(appsMap);
        }

        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to connect to database");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.id]);

  const filtered = useMemo(() => {
    return jobs.filter(
      (j) => {
        const matchesTerm = j.title.toLowerCase().includes(term.toLowerCase()) || j.company.toLowerCase().includes(term.toLowerCase());
        const matchesType = type ? j.type === type : true;
        const matchesCategory = category ? j.category === category : true;
        
        let matchesAppStatus = true;
        if (applicationStatusFilter === 'applied') {
          matchesAppStatus = appliedJobs.has(j.id);
        } else if (applicationStatusFilter === 'not_applied') {
          matchesAppStatus = !appliedJobs.has(j.id);
        }

        return matchesTerm && matchesType && matchesCategory && matchesAppStatus;
      }
    );
  }, [jobs, term, type, category, applicationStatusFilter, appliedJobs]);

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <Label icon={Search} className="mb-4">
              Database Query
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
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 shrink-0 space-y-8">
            <div>
              <Label className="mb-4">Employment Classification</Label>
              <div className="space-y-2">
                {JOB_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t === type ? "" : t)}
                    className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      type === t
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    }`}
                  >
                    {t}
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
                onChange={(e) => setCategory(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="">All Categories</option>
                {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              
              {user && user.role === 'applicant' && (
                <select 
                  value={applicationStatusFilter}
                  onChange={(e) => setApplicationStatusFilter(e.target.value)}
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
                  <p className="font-medium">Connecting to database...</p>
                </div>
              )}

              {error && (
                <div className="py-20 text-center text-red-500">
                  <BarChart className="mx-auto mb-4 opacity-20" size={48} />
                  <p className="font-medium">Error: {error}</p>
                </div>
              )}

              {!loading && !error && filtered.map((job) => (
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
                      <span className="text-slate-300 dark:text-slate-700">•</span>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          if (appliedJobs.has(job.id)) {
                            if (appliedJobs.get(job.id).status === 'pending') {
                              handleRevert(e, job.id, appliedJobs.get(job.id).id);
                            }
                          } else {
                            handleApply(job.id);
                          }
                        }}
                        disabled={applyingJobId === job.id || (appliedJobs.has(job.id) && appliedJobs.get(job.id).status !== 'pending')}
                        className={`group/btn w-full md:w-auto px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed ${
                          appliedJobs.has(job.id)
                            ? appliedJobs.get(job.id).status === 'pending'
                              ? 'bg-emerald-600 text-white hover:bg-red-600'
                              : appliedJobs.get(job.id).status === 'accepted'
                                ? 'bg-emerald-600 text-white cursor-default'
                                : 'bg-red-600 text-white cursor-default'
                            : applyingJobId === job.id
                              ? 'bg-slate-400 text-white cursor-wait'
                              : 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600'
                        }`}
                      >
                        {applyingJobId === job.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : appliedJobs.has(job.id) ? (
                          appliedJobs.get(job.id).status === 'pending' ? (
                            <>
                              <span className="flex items-center gap-2 group-hover/btn:hidden">
                                <CheckCircle size={16} /> Applied
                              </span>
                              <span className="hidden items-center gap-2 group-hover/btn:flex">
                                <X size={16} /> Revert
                              </span>
                            </>
                          ) : appliedJobs.get(job.id).status === 'accepted' ? (
                            <>
                              <CheckCircle size={16} /> Accepted
                            </>
                          ) : (
                            <>
                              <X size={16} /> Rejected
                            </>
                          )
                        ) : (
                          <>
                            Apply <ArrowUpRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

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
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end sticky bottom-0 bg-white dark:bg-[#0B0F19] rounded-b-2xl z-10 gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (appliedJobs.has(selectedJobDetails.id)) {
                    if (appliedJobs.get(selectedJobDetails.id).status === 'pending') {
                      handleRevert(e, selectedJobDetails.id, appliedJobs.get(selectedJobDetails.id).id);
                    }
                  } else {
                    handleApply(selectedJobDetails.id);
                  }
                }}
                disabled={applyingJobId === selectedJobDetails.id || (appliedJobs.has(selectedJobDetails.id) && appliedJobs.get(selectedJobDetails.id).status !== 'pending')}
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
                {applyingJobId === selectedJobDetails.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : appliedJobs.has(selectedJobDetails.id) ? (
                  appliedJobs.get(selectedJobDetails.id).status === 'pending' ? (
                    <>
                      <span className="flex items-center gap-2 group-hover/btn:hidden">
                        <CheckCircle size={16} /> Applied
                      </span>
                      <span className="hidden items-center gap-2 group-hover/btn:flex">
                        <X size={16} /> Revert
                      </span>
                    </>
                  ) : appliedJobs.get(selectedJobDetails.id).status === 'accepted' ? (
                    <>
                      <CheckCircle size={16} /> Accepted
                    </>
                  ) : (
                    <>
                      <X size={16} /> Rejected
                    </>
                  )
                ) : (
                  <>
                    Apply <ArrowUpRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}