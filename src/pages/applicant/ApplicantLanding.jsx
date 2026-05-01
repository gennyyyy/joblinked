import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Building2, Users, Heart, Shield, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Label = ({ children, icon: Icon }) => (
  <div className="flex items-center gap-2 industrial-label text-slate-500 dark:text-slate-400">
    {Icon && <Icon size={14} className="text-blue-600 dark:text-blue-500" />}
    <span>{children}</span>
  </div>
);

export default function ApplicantLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-grid-pattern pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center py-16">
          <Label icon={Briefcase} className="justify-center mb-4">Job Seeker Portal</Label>
          <h1 className="industrial-heading text-5xl md:text-7xl text-slate-950 dark:text-white mb-6">
            Find Your Next <span className="text-blue-600">Career</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto mb-8">
            Discover job opportunities from top companies in Santa Maria. 
            Apply to government programs and kickstart your career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/applicants/register"
              className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-8 py-4 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all"
            >
              Create Account
            </Link>
            <Link
              to="/applicants/login"
              className="border border-slate-300 dark:border-slate-700 px-8 py-4 rounded-xl font-bold text-sm hover:border-blue-600 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Briefcase, title: 'Browse Jobs', desc: 'Search full-time, part-time, and contract opportunities across all industries.' },
            { icon: Building2, title: 'Government Programs', desc: 'Access TUPAD, SPES, and GIP programs for eligible residents.' },
            { icon: Users, title: 'Direct Applications', desc: 'Apply directly to employers and track your application status.' },
          ].map((item, i) => (
            <div key={i} className="bento-card p-8">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 mb-6">
                <item.icon size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white mb-2">{item.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bento-card p-10 mb-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4">
              <Label icon={Shield} className="text-blue-600">Government Programs</Label>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white">TUPAD • SPES • GIP</h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium max-w-md">
                Eligible residents of Santa Maria can access special employment 
                programs supported by the municipal government.
              </p>
            </div>
            <button 
              onClick={() => navigate('/browse')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-blue-500 transition-all whitespace-nowrap"
            >
              View Opportunities <ArrowRight size={16} className="inline ml-2" />
            </button>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-black text-slate-950 dark:text-white mb-4">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Register with your email and barangay details.' },
              { step: '02', title: 'Browse Jobs', desc: 'Search opportunities that match your skills.' },
              { step: '03', title: 'Apply & Track', desc: 'Submit applications and monitor your status.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <span className="text-4xl font-black text-blue-600">{item.step}</span>
                <h4 className="text-lg font-bold text-slate-950 dark:text-white mt-2">{item.title}</h4>
                <p className="text-slate-500 text-sm mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}