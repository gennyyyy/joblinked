import { Building2, Layers, Shield, User } from 'lucide-react'
import { Link } from 'react-router-dom'

function PortalCard({ description, icon, title, to }) {
  const PortalIcon = icon

  return (
    <Link
      to={to}
      className="bento-card p-8 text-center group hover:border-blue-600/30 transition-all hover:-translate-y-1"
    >
      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
        <PortalIcon size={32} className="text-blue-600" />
      </div>
      <h3 className="text-xl font-black text-slate-950 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
        {description}
      </p>
    </Link>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-grid-pattern flex flex-col items-center justify-center p-6 py-12 md:py-20">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-950 dark:bg-white rounded-xl mb-6">
            <Layers size={32} className="text-white dark:text-slate-950" />
          </div>
          <h1 className="industrial-heading text-4xl md:text-5xl text-slate-950 dark:text-white mb-4">
            JOBLINKED<span className="text-blue-600">.</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
            Santa Maria Digital Employment Gateway
          </p>
        </div>

        <h2 className="text-center text-xl font-bold text-slate-700 dark:text-slate-300 mb-8">
          Select Your Portal
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PortalCard
            title="Job Seeker"
            description="Find jobs, apply to programs, track applications"
            icon={User}
            to="/applicant/login"
          />
          <PortalCard
            title="Employer"
            description="Post jobs, manage applications, hire talent"
            icon={Building2}
            to="/employer/login"
          />
          <PortalCard
            title="Admin"
            description="Manage users, jobs, and system settings"
            icon={Shield}
            to="/admin/login"
          />
        </div>

        <div className="text-center mt-12">
          <Link
            to="/home"
            className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors"
          >
            Learn more about JobLinked {'->'}
          </Link>
        </div>
      </div>
    </div>
  )
}
