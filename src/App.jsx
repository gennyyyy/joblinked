import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ErrorBoundary from "./components/ErrorBoundary";

import LoginPage from "./pages/login/LoginPage";
import Home from "./pages/home/Home";
import Browse from "./pages/browse/Browse";
import PlatformPage from "./pages/platform/PlatformPage";
import SectorsPage from "./pages/sectors/SectorsPage";
import ApplicantLanding from "./pages/applicant/ApplicantLanding";
import ApplicantLogin from "./pages/applicant/ApplicantLogin";
import ApplicantRegister from "./pages/applicant/ApplicantRegister";
import ApplicantDashboard from "./pages/applicant/ApplicantDashboard";
import EmployerLanding from "./pages/employer/EmployerLanding";
import EmployerLogin from "./pages/employer/EmployerLogin";
import EmployerRegister from "./pages/employer/EmployerRegister";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

function AppContent() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("joblinked_theme") === "dark";
  });
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("joblinked_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const authRoutes = [
    '/login',
    '/applicants/login',
    '/applicants/register',
    '/employers/login',
    '/employers/register',
    '/admin/login'
  ];

  const showNavAndFooter = !authRoutes.includes(pathname);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-300">
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'dark:bg-slate-900 dark:text-white dark:border-slate-800 border font-medium',
          duration: 4000,
        }}
      />
      {showNavAndFooter && <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
      <main>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/platform" element={<PlatformPage />} />
            <Route path="/sectors" element={<SectorsPage />} />
            <Route path="/employers" element={<EmployerLanding />} />
            <Route path="/employers/login" element={<EmployerLogin />} />
            <Route path="/employers/register" element={<EmployerRegister />} />
            <Route path="/employer/dashboard" element={<EmployerDashboard />} />
            <Route path="/applicants" element={<ApplicantLanding />} />
            <Route path="/applicants/login" element={<ApplicantLogin />} />
            <Route path="/applicants/register" element={<ApplicantRegister />} />
            <Route path="/applicant/dashboard" element={<ApplicantDashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </ErrorBoundary>
      </main>
      {showNavAndFooter && <Footer />}
    </div>
  );
}

export default function Root() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}