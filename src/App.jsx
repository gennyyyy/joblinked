import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'
import { AuthProvider, useAuth } from './context/AuthContext'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminLogin from './pages/admin/AdminLogin'
import ApplicantDashboard from './pages/applicant/ApplicantDashboard'
import ApplicantLanding from './pages/applicant/ApplicantLanding'
import ApplicantLogin from './pages/applicant/ApplicantLogin'
import ApplicantRegister from './pages/applicant/ApplicantRegister'
import Browse from './pages/browse/Browse'
import EmployerDashboard from './pages/employer/EmployerDashboard'
import EmployerLanding from './pages/employer/EmployerLanding'
import EmployerLogin from './pages/employer/EmployerLogin'
import EmployerRegister from './pages/employer/EmployerRegister'
import Home from './pages/home/Home'
import LoginPage from './pages/login/LoginPage'
import PlatformPage from './pages/platform/PlatformPage'
import SectorsPage from './pages/sectors/SectorsPage'

function PortalRoute({ role, children }) {
  const { signInAsRole, user } = useAuth()

  useEffect(() => {
    if (!user || user.role !== role) {
      signInAsRole(role)
    }
  }, [role, signInAsRole, user])

  if (!user || user.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    )
  }

  return children
}

function AppContent() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('joblinked_theme') === 'dark'
  })
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('joblinked_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-300">
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'dark:bg-slate-900 dark:text-white dark:border-slate-800 border font-medium',
          duration: 4000,
        }}
      />
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/platform" element={<PlatformPage />} />
            <Route path="/sectors" element={<SectorsPage />} />
            <Route path="/applicant/login" element={<ApplicantLogin />} />
            <Route path="/employers" element={<EmployerLanding />} />
            <Route path="/employer/login" element={<EmployerLogin />} />
            <Route path="/employers/register" element={<EmployerRegister />} />
            <Route path="/applicants" element={<ApplicantLanding />} />
            <Route path="/applicants/register" element={<ApplicantRegister />} />
            <Route
              path="/applicant/dashboard"
              element={(
                <PortalRoute role="applicant">
                  <ApplicantDashboard />
                </PortalRoute>
              )}
            />
            <Route
              path="/employer/dashboard"
              element={(
                <PortalRoute role="employer">
                  <EmployerDashboard />
                </PortalRoute>
              )}
            />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={(
                <PortalRoute role="admin">
                  <AdminDashboard />
                </PortalRoute>
              )}
            />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}

export default function Root() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}
