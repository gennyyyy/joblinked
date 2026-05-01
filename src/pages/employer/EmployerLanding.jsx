import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, BarChart, Layers, ShieldCheck, Building2 } from 'lucide-react';

const Label = ({ children, icon: Icon }) => (
  <div className="flex items-center gap-2 industrial-label text-slate-500 dark:text-slate-400">
    {Icon && <Icon size={14} className="text-blue-600" />}
    <span>{children}</span>
  </div>
);

export default function EmployerLanding() {
  return (
    <div className="min-h-screen bg-grid-pattern pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-4xl mb-16 space-y-6">
          <Label icon={ShieldCheck}>Employer Portal: v4.2</Label>
          <h1 className="industrial-heading text-6xl md:text-8xl text-slate-950 dark:text-white">
            Recruitment <br /> Infrastructure.
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
            Scale your local workforce with precision. Access the verified 
            registry of Sta. Maria's talent and streamline your acquisition pipeline.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/employers/register"
              className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-8 py-4 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all"
            >
              Register Company
            </Link>
            <Link
              to="/employers/login"
              className="border border-slate-300 dark:border-slate-700 px-8 py-4 rounded-xl font-bold text-sm hover:border-blue-600 transition-all"
            >
              Employer Login
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Talent Acquisition",
              label: "API Access",
              desc: "Direct integration with our verified applicant database. Filter by skills, barangay, and certification level.",
              icon: Cpu,
            },
            {
              title: "Tax Incentives",
              label: "Economic Zone",
              desc: "Access local municipal tax credits for businesses that prioritize hiring local residents of Sta. Maria.",
              icon: BarChart,
            },
            {
              title: "Mass Hiring",
              label: "Deployment",
              desc: "Request municipal hall support for large-scale recruitment events and job fairs in the plaza.",
              icon: Layers,
            },
          ].map((item, i) => (
            <div key={i} className="bento-card p-8 group">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-blue-600 mb-8 transition-transform group-hover:scale-110">
                <item.icon size={24} />
              </div>
              <Label className="mb-2">{item.label}</Label>
              <h3 className="text-2xl font-black text-slate-950 dark:text-white mb-4 tracking-tight">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}

          <div className="bento-card col-span-1 md:col-span-2 p-10 bg-slate-950 text-white flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4">
              <h3 className="text-3xl font-black tracking-tight">
                Accreditation Process
              </h3>
              <p className="text-slate-400 max-w-md font-medium">
                Is your company registered in Sta. Maria? Initialize your partner 
                accreditation to start posting vacancies.
              </p>
            </div>
            <Link 
              to="/employers/register"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black text-sm shadow-xl shadow-blue-900/20 hover:bg-blue-500 transition-all"
            >
              Begin Onboarding
            </Link>
          </div>
        </div>

        <div className="mt-16 bento-card p-10">
          <div className="text-center mb-8">
            <Label icon={Building2} className="justify-center mb-4">Why Hire Locally</Label>
            <h3 className="text-3xl font-black text-slate-950 dark:text-white">Benefits for Your Business</h3>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: 'Lower Recruitment Costs', desc: 'Skip agency fees and hire directly from our database' },
              { title: 'Verified Residents', desc: 'All applicants are verified Sta. Maria residents' },
              { title: 'Government Support', desc: 'Access tax incentives for local hiring' },
              { title: 'Quick Turnaround', desc: 'Fast application process with direct communication' },
            ].map((item, i) => (
              <div key={i} className="text-center p-4">
                <h4 className="font-black text-slate-950 dark:text-white mb-2">{item.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}