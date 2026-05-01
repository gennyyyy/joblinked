import { Activity, ShieldCheck } from 'lucide-react';

const Label = ({ children, icon: Icon, className = "" }) => (
  <div className={`flex items-center gap-2 industrial-label text-slate-500 dark:text-slate-400 ${className}`}>
    {Icon && <Icon size={14} className="text-blue-600" />}
    <span>{children}</span>
  </div>
);

export default function PlatformPage() {
  return (
    <div className="bg-grid-pattern min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-4xl mb-16 space-y-6">
          <Label icon={Activity}>Core System: JobLinked Architecture</Label>
          <h1 className="industrial-heading text-6xl md:text-8xl text-slate-950 dark:text-white">
            Digital Governance<span className="text-blue-600">.</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
            A centralized, high-performance ecosystem designed to streamline the
            economic integration of Sta. Maria, Bulacan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bento-card col-span-1 md:col-span-2 p-10 border-blue-600/20">
            <div className="flex items-start gap-8">
              <div className="hidden sm:flex w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-2xl items-center justify-center text-blue-600">
                <Activity size={40} />
              </div>
              <div className="space-y-4">
                <Label>Real-time Integration</Label>
                <h3 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                  Barangay Data Link
                </h3>
                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  JobLinked connects directly with local barangay registries,
                  ensuring every applicant is a verified resident of Sta. Maria.
                  This protocol eliminates data redundancy and enhances screening
                  security.
                </p>
              </div>
            </div>
          </div>

          <div className="bento-card p-10 flex flex-col justify-between">
            <div className="space-y-6">
              <ShieldCheck size={40} className="text-blue-600" />
              <h3 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                Data Sovereignty
              </h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                All employment data is hosted on secured local infrastructure,
                compliant with national data privacy standards.
              </p>
            </div>
          </div>

          <div className="bento-card col-span-1 md:col-span-3 p-12 bg-white dark:bg-slate-900 text-center space-y-8">
            <Label className="justify-center">System Evolution</Label>
            <h3 className="text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tighter">
              Unified Workforce Monitoring.
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { label: "Uptime", val: "99.9%" },
                { label: "Sync Latency", val: "< 50ms" },
                { label: "Encrypted", val: "AES-256" },
                { label: "Active Nodes", val: "24" },
              ].map((s) => (
                <div key={s.label} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-2xl font-black text-blue-600">{s.val}</p>
                  <p className="industrial-label text-[10px] mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}