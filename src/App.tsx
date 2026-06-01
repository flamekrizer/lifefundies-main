import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LandingPage from './pages/Landing/Landing'
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/Auth/Auth'
import OnboardingPage from './pages/Onboarding/Onboarding'
import DashboardPage from './pages/Dashboard/Dashboard'
import MentorsPage from './pages/Mentors/Mentors'
import CommunityPage from './pages/Community/Community'
import SessionsPage from './pages/Sessions/Sessions'
import SettingsPage from './pages/Settings/Settings'
import MentorPortalPage from './pages/MentorPortal/MentorPortal'
import AdminPage from './pages/Admin/Admin'
import { useAuthStore } from './stores'
import AuthModal from './components/AuthModal'

// Protected route wrapper
function ProtectedRoute({ children, requireRole }: { children: React.ReactNode; requireRole?: string }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (requireRole && user.role !== requireRole && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

// Pages that show navbar + footer
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}

// Pages that only show navbar (no footer)
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthModal />
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
        <Route path="/mentors" element={<PublicLayout><MentorsPage /></PublicLayout>} />
        <Route path="/mentors/:id" element={<PublicLayout><MentorsPage /></PublicLayout>} />
        <Route path="/community" element={<PublicLayout><CommunityPage /></PublicLayout>} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected — User */}
        <Route path="/onboarding" element={
          <ProtectedRoute><OnboardingPage /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>
        } />
        <Route path="/sessions" element={
          <ProtectedRoute><AppLayout><SessionsPage /></AppLayout></ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>
        } />

        {/* Protected — Mentor */}
        <Route path="/mentor-portal" element={
          <ProtectedRoute requireRole="mentor"><AppLayout><MentorPortalPage /></AppLayout></ProtectedRoute>
        } />

        {/* Protected — Admin */}
        <Route path="/admin" element={
          <ProtectedRoute requireRole="admin"><AppLayout><AdminPage /></AppLayout></ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

function NotFoundPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1.5rem', textAlign: 'center', padding: '2rem' }}>
      <span style={{ fontSize: '5rem' }}>🌿</span>
      <h1 className="display-2">Page Not Found</h1>
      <p className="text-muted body-lg">The page you're looking for doesn't exist.</p>
      <a href="/" className="btn btn-primary btn-lg">Go Home</a>
    </div>
  )
}
