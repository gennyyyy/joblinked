import { useState } from 'react'
import { ArrowLeft, Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { INDUSTRIES } from '../../mockData'

export default function EmployerRegister() {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    industry: '',
    contactPerson: '',
    businessPermit: '',
  })
  const [error, setError] = useState('')
  const { registerEmployer } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.companyName || !formData.email || !formData.password || !formData.industry) {
      toast.error('Please fill in all required fields')
      setError('Please fill in all required fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      setError('Password must be at least 6 characters')
      return
    }

    const result = await registerEmployer(formData)

    if (result.success) {
      toast.success('Employer account created')
      navigate('/employer/dashboard')
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
          <span className="text-sm font-medium">Back to Portal</span>
        </Link>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-blue-600" />

          <div className="mb-8">
            <Layers size={32} className="text-slate-950 dark:text-white mb-6" />
            <h2 className="industrial-heading text-3xl text-slate-950 dark:text-white mb-2">
              Register Company
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Create a mock employer account to start posting jobs.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="industrial-label text-slate-500 block">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                placeholder="Company Inc."
              />
            </div>

            <div className="space-y-1.5">
              <label className="industrial-label text-slate-500 block">Company Email</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                placeholder="company@email.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="industrial-label text-slate-500 block">Company Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                placeholder="Sta. Maria, Bulacan"
              />
            </div>

            <div className="space-y-1.5">
              <label className="industrial-label text-slate-500 block">Industry</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              >
                <option value="">Select Industry</option>
                {INDUSTRIES.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="industrial-label text-slate-500 block">Contact Person</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                placeholder="Full Name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="industrial-label text-slate-500 block">Business Permit Number</label>
              <input
                type="text"
                name="businessPermit"
                value={formData.businessPermit}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                placeholder="Optional"
              />
            </div>

            <div className="space-y-1.5">
              <label className="industrial-label text-slate-500 block">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                placeholder="Password"
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
                placeholder="Confirm password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold py-3 rounded-lg mt-4 hover:bg-blue-600 hover:text-white transition-colors"
            >
              Register Company
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm font-medium mt-6">
            Already have an account?{' '}
            <Link to="/employer/login" className="text-blue-600 hover:underline">
              Open Demo Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
