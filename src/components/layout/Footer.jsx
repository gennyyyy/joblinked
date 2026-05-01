import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 py-12 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Layers size={20} className="text-slate-400" />
          <span className="industrial-heading tracking-tight text-slate-500">
            JOBLINKED.
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link to="/applicants" className="text-slate-500 hover:text-blue-600 transition-colors">
            Job Seekers
          </Link>
          <Link to="/employers" className="text-slate-500 hover:text-blue-600 transition-colors">
            Employers
          </Link>
          <Link to="/browse" className="text-slate-500 hover:text-blue-600 transition-colors">
            Browse Jobs
          </Link>
        </div>
        <p className="industrial-label text-slate-400">
          © 2024 LGU STA MARIA. INFRASTRUCTURE ACTIVE.
        </p>
      </div>
    </footer>
  );
}