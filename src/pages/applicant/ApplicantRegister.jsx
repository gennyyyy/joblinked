import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { BARANGAYS } from '../../mockData';

export default function ApplicantRegister() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    barangay: '',
  });
  const [error, setError] = useState('');
  const { registerUser, dbReady } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dbReady) {
      toast.error('Database is loading...');
      setError('Database is loading...');
      return;
    }

    if (!formData.email || !formData.password || !formData.fullName || !formData.barangay) {
      toast.error('Please fill in all required fields');
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setError('Password must be at least 6 characters');
      return;
    }

    const result = await registerUser(
      formData.email,
      formData.password,
      formData.fullName,
      formData.phone,
      formData.barangay
    );

    if (result.success) {
      toast.success('Account created! Please sign in with your credentials.');
      navigate('/applicants/login');
    } else {
      toast.error(result.error);
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-grid-pattern p-6 py-12 md:py-20">
      <div className="w-full max-w-md">
        <Link 
          to="/applicants/login" 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">Back to Login</span>
        </Link>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-blue-600" />

          <div className="mb-8">
            <Layers size={32} className="text-slate-950 dark:text-white mb-6" />
            <h2 className="industrial-heading text-3xl text-slate-950 dark:text-white mb-2">
              Create Account
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Register as a job seeker in Santa Maria.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="industrial-label text-slate-500 block">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                placeholder="Juan dela Cruz"
              />
            </div>

            <div className="space-y-1.5">
              <label className="industrial-label text-slate-500 block">Email</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="industrial-label text-slate-500 block">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                placeholder="0912 345 6789"
              />
            </div>

            <div className="space-y-1.5">
              <label className="industrial-label text-slate-500 block">Barangay</label>
              <select
                name="barangay"
                value={formData.barangay}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              >
                <option value="">Select Barangay</option>
                {BARANGAYS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="industrial-label text-slate-500 block">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-1.5">
              <label className="industrial-label text-slate-500 block">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold py-3 rounded-lg mt-4 hover:bg-blue-600 hover:text-white transition-colors"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm font-medium mt-6">
            Already have an account?{' '}
            <Link to="/applicants/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}