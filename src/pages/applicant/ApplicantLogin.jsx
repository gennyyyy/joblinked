import { useState } from 'react'
import { ArrowLeft, Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { Link, useNavigate } from '../../navigation'

export default function ApplicantLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { signInAsRole } = useAuth()
  const navigate = useNavigate()

  const handleContinue = () => {
    const result = signInAsRole('applicant')
    if (result.success) {
      toast.success('Applicant demo portal ready')
      navigate('/applicant/dashboard')
    } else {
      toast.error(result.error)
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-grid-pattern p-6 py-12 md:py-20">
      <div className="w-full max-w-md">
        <Link 
          to="/login" 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">Back to Portal Selection</span>
        </Link>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-blue-600" />

          <div className="mb-8">
            <Layers size={32} className="text-slate-950 dark:text-white mb-6" />
            <h2 className="industrial-heading text-3xl text-slate-950 dark:text-white mb-2">
              Applicant Login
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Demo access opens the applicant dashboard using mock data only.
            </p>
          </div>

          <div className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="industrial-label text-slate-500 block">Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                placeholder="your@email.com"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="industrial-label text-slate-500 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="button"
              onClick={handleContinue}
              className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold py-3 rounded-lg mt-4 hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50"
            >
              Continue to Demo Dashboard
            </button>
          </div>

          <p className="text-center text-slate-500 text-sm font-medium mt-6">
            Don't have an account?{' '}
            <Link to="/applicants/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
