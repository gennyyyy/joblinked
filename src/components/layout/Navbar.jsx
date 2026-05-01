import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Sun, Moon } from 'lucide-react';

const useScroll = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return scrolled;
};

const IconButton = ({ icon: Icon, onClick, active }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-lg border transition-all ${
      active
        ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
        : 'bg-transparent text-slate-600 border-slate-200 hover:border-slate-400 dark:text-slate-400 dark:border-slate-800 dark:hover:border-slate-600'
    }`}
  >
    {Icon && <Icon size={16} />}
  </button>
);

export default function Navbar({ darkMode, toggleDarkMode }) {
  const scrolled = useScroll();
  const location = useLocation();

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${scrolled ? 'glass-nav py-3' : 'bg-transparent py-6'}`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-slate-950 dark:bg-white rounded flex items-center justify-center transition-transform group-hover:scale-105">
            <Layers size={16} className="text-white dark:text-slate-950" />
          </div>
          <span className="industrial-heading text-xl text-slate-950 dark:text-white tracking-tight">
            JOBLINKED<span className="text-blue-600">.</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-slate-950 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
          >
            Home
          </Link>
          <Link
            to="/platform"
            className={`text-sm font-medium transition-colors ${location.pathname === '/platform' ? 'text-slate-950 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
          >
            Platform
          </Link>
          <Link
            to="/browse"
            className={`text-sm font-medium transition-colors ${location.pathname === '/browse' ? 'text-slate-950 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
          >
            Jobs
          </Link>
          <Link
            to="/sectors"
            className={`text-sm font-medium transition-colors ${location.pathname === '/sectors' ? 'text-slate-950 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
          >
            Sectors
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <IconButton icon={darkMode ? Sun : Moon} onClick={toggleDarkMode} />
          <Link
            to="/login"
            className="btn-shimmer bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-sm font-semibold px-5 py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-all"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}