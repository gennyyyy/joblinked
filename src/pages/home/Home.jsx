import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, Globe, Cpu } from 'lucide-react';
import municipalHallImg from '../../assets/municipal_hall.png';

const Label = ({ children, icon: Icon, className = "" }) => (
  <div className={`flex items-center gap-2 industrial-label text-slate-500 dark:text-slate-400 ${className}`}>
    {Icon && <Icon size={14} className="text-blue-600" />}
    <span>{children}</span>
  </div>
);

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-grid-pattern min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-4xl mb-16 space-y-6">
          <Label icon={Activity}>System Status: Optimal</Label>
          <h1 className="industrial-heading text-6xl md:text-8xl lg:text-[100px] text-slate-950 dark:text-white text-gradient gradient-dark">
            Santa Maria's <br /> Engine for Growth.
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
            The infrastructure connecting local talent with industrial scale
            opportunities. Streamlined, verified, and built for the modern
            workforce.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="bento-card col-span-1 md:col-span-2 lg:col-span-2 aspect-[4/3] md:aspect-auto md:h-[400px] group">
            <div className="absolute inset-0 z-0 overflow-hidden bg-slate-900">
              <img
                src={municipalHallImg}
                alt="Municipal Hall"
                className="w-full h-full object-cover opacity-40 mix-blend-overlay animate-slow-pan grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
            </div>
            <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-md text-white text-xs font-mono flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  LIVE INFRASTRUCTURE
                </div>
                <Globe className="text-white/30" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white mb-2">
                  Centralized Talent Hub
                </h3>
                <p className="text-slate-400 font-medium max-w-sm">
                  Direct integration with 24 barangay registries and 120+ local
                  enterprises.
                </p>
              </div>
            </div>
          </div>

          <div className="bento-card col-span-1 p-8 flex flex-col justify-between !bg-blue-600 border-none shadow-xl shadow-blue-900/20">
            <div className="space-y-4">
              <Cpu className="text-white/60" size={32} />
              <h3 className="text-3xl font-black text-white tracking-tight leading-none">
                Deploy Your <br /> Career.
              </h3>
              <p className="text-blue-50/80 text-sm font-medium leading-relaxed">
                Access the live database of local vacancies and government
                programs.
              </p>
            </div>
            <button
              onClick={() => navigate("/browse")}
              className="mt-8 w-full bg-white text-blue-700 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-all shadow-lg active:scale-95"
            >
              Initialize Search <ArrowRight size={18} />
            </button>
          </div>

          <div className="bento-card col-span-1 p-8 flex flex-col justify-between hover:border-blue-600/30">
            <div>
              <Label className="mb-1 text-blue-600">Metric Output</Label>
              <h4 className="industrial-label text-slate-400">
                Placement Rate
              </h4>
            </div>
            <div className="py-6">
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black text-slate-950 dark:text-white tracking-tighter">
                  94
                </span>
                <span className="text-2xl font-bold text-blue-600">%</span>
              </div>
              <p className="text-xs font-bold text-slate-500 mt-2 leading-relaxed uppercase tracking-wider">
                Verified deployments <br /> Q3 2024 fiscal year.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
                ↑ 2.4% from Q2
              </span>
            </div>
          </div>

          <div className="bento-card col-span-1 md:col-span-2 p-8 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-8">
              <Label icon={Activity}>Registry Status</Label>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Real-time Data
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: "Industrial Mfg", count: "342", color: "text-blue-600" },
                { title: "Tech & Services", count: "128", color: "text-slate-900 dark:text-white" },
                { title: "Gov't Programs", count: "84", color: "text-slate-900 dark:text-white" },
              ].map((stat) => (
                <div
                  key={stat.title}
                  className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-blue-600/20 transition-colors"
                >
                  <p className={`text-3xl font-black ${stat.color} tracking-tighter`}>
                    {stat.count}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mt-2 leading-tight">
                    {stat.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bento-card col-span-1 md:col-span-4 lg:col-span-2 p-8 flex items-center overflow-hidden bg-slate-50/50 dark:bg-slate-900/20">
            <div className="flex items-center gap-16 whitespace-nowrap animate-ticker font-black text-xl tracking-tighter text-slate-300 dark:text-slate-700">
              <span className="hover:text-blue-600/50 transition-colors">WALTERMART</span>
              <span className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <span className="hover:text-blue-600/50 transition-colors">PUREGOLD</span>
              <span className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <span className="hover:text-blue-600/50 transition-colors">BULACAN METAL</span>
              <span className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <span className="hover:text-blue-600/50 transition-colors">WALTERMART</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
