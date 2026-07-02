import { useEffect, useState } from 'react'
import { ArrowRight, MailCheck, RefreshCw, Send, Shield } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { auth } from '../../lib/firebase'
import { ensureVerifiedEmailUserDoc, refreshVerificationStatus, resendVerificationEmail } from '../../lib/authService'
import { useAuthStore } from '../../stores'

interface VerifyEmailLocationState {
  email?: string
}

export function VerifyEmailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [email, setEmail] = useState('your email address')
  const [statusMessage, setStatusMessage] = useState('Please verify your email before continuing.')
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    const stateEmail = (location.state as VerifyEmailLocationState | null)?.email
    const storedEmail = sessionStorage.getItem('verify-email')
    const resolvedEmail = stateEmail || storedEmail || ''

    if (resolvedEmail) {
      setEmail(resolvedEmail)
      sessionStorage.setItem('verify-email', resolvedEmail)
    }
  }, [location.state])

  const routeAfterVerification = async () => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      setStatusMessage('Your email is verified. Please sign in again to continue.')
      return
    }

    const resolvedUser = await ensureVerifiedEmailUserDoc()

    setUser(resolvedUser)

    if (resolvedUser.role === 'admin') {
      navigate('/admin')
    } else if (resolvedUser.role === 'mentor') {
      navigate('/mentor-portal')
    } else if (resolvedUser.onboardingComplete) {
      navigate('/dashboard')
    } else {
      navigate('/onboarding')
    }
  }

  const checkVerificationStatus = async () => {
    if (verified) return

    try {
      const isVerified = await refreshVerificationStatus()
      if (isVerified) {
        setVerified(true)
        setStatusMessage('Email verified successfully. Redirecting you now...')
        await routeAfterVerification()
      } else {
        setStatusMessage('We are still waiting for your verification. Use the buttons below to resend or refresh.')
      }
    } catch (error: any) {
      setStatusMessage(error.message || 'We could not verify your account yet.')
    }
  }

  useEffect(() => {
    void checkVerificationStatus()
  }, [verified])

  useEffect(() => {
    const handleFocus = () => {
      void checkVerificationStatus()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [verified])

  const handleResend = async () => {
    setLoading(true)
    setStatusMessage('Sending a fresh verification email...')
    try {
      await resendVerificationEmail(email)
      setStatusMessage('A new verification email has been sent. Please check your inbox.')
    } catch (error: any) {
      setStatusMessage(error.message || 'We could not resend the verification email.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    setStatusMessage('Checking your verification status...')
    try {
      const isVerified = await refreshVerificationStatus()
      if (isVerified) {
        setVerified(true)
        setStatusMessage('Email verified successfully. Redirecting you now...')
        await routeAfterVerification()
      } else {
        setStatusMessage('Your email is still pending verification.')
      }
    } catch (error: any) {
      setStatusMessage(error.message || 'We could not refresh your verification status.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-scaleIn">
        <div className="auth-card__header">
          <div className="auth-logo">
            <img className="brand-logo auth-brand-logo" src="/logo.png" alt="LifeFundies Logo" style={{ height: '60px', objectFit: 'contain', margin: '0 auto', display: 'block' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '3.5rem', height: '3.5rem', borderRadius: '999px', background: 'rgba(59, 130, 246, 0.12)', color: 'var(--clr-primary)' }}>
              <MailCheck size={24} />
            </div>
          </div>
          <h1 className="heading-1">Check your inbox</h1>
          <p className="body-sm text-muted">
            We sent a verification link to <strong>{email}</strong>. Open it to activate your account and continue.
          </p>
        </div>

        <div className="auth-form">
          <div className="auth-success" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {statusMessage}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button type="button" className="btn btn-primary" onClick={handleResend} disabled={loading} style={{ width: '100%', padding: '0.875rem', justifyContent: 'center' }}>
              {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><Send size={16} /> Resend verification email</>}
            </button>

            <button type="button" className="btn" onClick={handleRefresh} disabled={loading} style={{ width: '100%', padding: '0.875rem', justifyContent: 'center', background: 'var(--clr-bg-card)', color: 'var(--clr-text-primary)', border: '1px solid var(--clr-border-strong)' }}>
              {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><RefreshCw size={16} /> Refresh verification status</>}
            </button>
          </div>

          <p className="auth-switch body-sm" style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/login" className="auth-switch__link">Go to sign in</Link>
          </p>
        </div>

        <div className="auth-trust">
          <Shield size={12} /> <span className="body-sm text-muted">Your sessions are 100% confidential & secure</span>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailPage
