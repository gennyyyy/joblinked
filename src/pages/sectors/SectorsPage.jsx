import { useMemo, useState, useEffect } from 'react';
import { MapPin, ArrowRight, X, Globe, Cpu, Building2, ShieldCheck, PieChart } from 'lucide-react';
import { useAuth, api } from '../../context/AuthContext';

const Label = ({ children, icon: Icon, className = "" }) => (
  <div className={`flex items-center gap-2 industrial-label text-slate-500 dark:text-slate-400 ${className}`}>
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

export default function SectorsPage() {
  const [activeSector, setActiveSector] = useState("All");
  const [jobs, setJobs] = useState([]);
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await api.getJobs();
        setJobs(data);
      } catch (error) {
        console.error('Error loading jobs:', error);
      }
    };
    loadJobs();
  }, []);

  const sectors = [
    { id: "All", title: "Global Database", icon: Globe, count: jobs.length },
    { id: "Professional", title: "Tech & Corporate", icon: Cpu, count: jobs.filter((j) => j.category === "Professional").length },
    { id: "Skilled Labor", title: "Industrial & Mfg", icon: Building2, count: jobs.filter((j) => j.category === "Skilled Labor").length },
    { id: "Student Programs", title: "Gov't & Youth", icon: ShieldCheck, count: jobs.filter((j) => j.category === "Student Programs").length },
  ];

  const filteredJobs = useMemo(() => {
    if (activeSector === "All") return jobs;
    return jobs.filter((j) => j.category === activeSector);
  }, [activeSector, jobs]);

  return (
    <div className="bg-grid-pattern min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <Label icon={PieChart}>Sector Job Viewer</Label>
          <h1 className="industrial-heading text-5xl md:text-6xl text-slate-950 dark:text-white mt-4 tracking-tighter">
            Registry Access.
          </h1>
          <p className="text-slate-500 font-medium mt-4 max-w-2xl">
            Query live opportunities directly from the municipal database.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-80 shrink-0 space-y-4">
            {sectors.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSector(sec.id)}
                className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${
                  activeSector === sec.id
                    ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-slate-950 dark:border-white shadow-xl"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-600/30 hover:shadow-lg hover:-translate-y-1"
                }`}
              >
                <div className="flex items-center gap-4">
                  <sec.icon size={20} className={activeSector === sec.id ? "" : "text-blue-600"} />
                  <span className="font-black tracking-tight">{sec.title}</span>
                </div>
                <span className={`industrial-label ${activeSector === sec.id ? "text-white/70 dark:text-slate-500" : ""}`}>
                  {sec.count}
                </span>
              </button>
            ))}
          </aside>

          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 md:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

            <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-slate-800 pb-6 relative z-10">
              <div>
                <h3 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  {sectors.find((s) => s.id === activeSector)?.title} Positions
                </h3>
                <p className="industrial-label text-slate-400 mt-2">Live Query Results</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg industrial-label text-blue-600">
                {filteredJobs.length} Found
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobDetails(job)}
                  className="group p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-600/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex flex-col md:flex-row gap-6 justify-between items-start md:items-center cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="industrial-label text-blue-600">{job.type}</span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="industrial-label text-slate-500">{job.company}</span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-950 dark:text-white group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h4>
                    <p className="text-sm text-slate-500 font-medium mt-2 flex items-center gap-2">
                      <MapPin size={14} /> {job.location}
                    </p>
                  </div>
                  <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 shrink-0">
                    <span className="font-bold text-slate-900 dark:text-white">{formatPrice(job.salary)}</span>
                    <button className="text-sm font-bold text-blue-600 flex items-center gap-1 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      View Specs <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
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
          </div>
        </div>
      )}
    </div>
  );
}