import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/ErrorBoundary'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NavigationProvider, useLocation } from './navigation'
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

function PortalScreen({ role, children }) {
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

  const activeScreen = useMemo(() => {
    switch (pathname) {
      case '/':
      case '/home':
        return <Home />
      case '/login':
        return <LoginPage />
      case '/browse':
        return <Browse />
      case '/platform':
        return <PlatformPage />
      case '/sectors':
        return <SectorsPage />
      case '/applicants':
        return <ApplicantLanding />
      case '/applicant/login':
        return <ApplicantLogin />
      case '/applicants/register':
        return <ApplicantRegister />
      case '/applicant/dashboard':
        return (
          <PortalScreen role="applicant">
            <ApplicantDashboard />
          </PortalScreen>
        )
      case '/employers':
        return <EmployerLanding />
      case '/employer/login':
        return <EmployerLogin />
      case '/employers/register':
        return <EmployerRegister />
      case '/employer/dashboard':
        return (
          <PortalScreen role="employer">
            <EmployerDashboard />
          </PortalScreen>
        )
      case '/admin/login':
        return <AdminLogin />
      case '/admin/dashboard':
        return (
          <PortalScreen role="admin">
            <AdminDashboard />
          </PortalScreen>
        )
      default:
        return <Home />
    }
  }, [pathname])

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
        <ErrorBoundary key={pathname}>
          {activeScreen}
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}

export default function Root() {
  return (
    <NavigationProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NavigationProvider>
  )
}
