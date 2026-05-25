import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Shield } from 'lucide-react'
import { useAuthStore } from '../../stores'
import type { User as UserType } from '../../types'
import './Auth.css'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    // Simulate auth — replace with Firebase signInWithEmailAndPassword
    await new Promise(r => setTimeout(r, 1200))
    const mockUser: UserType = {
      uid: 'demo-user',
      displayName: 'Demo User',
      email,
      role: 'user',
      domains: ['career', 'confidence'],
      isAnonymous: false,
      onboardingComplete: true,
      createdAt: new Date(),
    }
    setUser(mockUser)
    navigate('/dashboard')
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-scaleIn">
        <div className="auth-card__header">
          <div className="auth-logo">
            <div className="auth-logo__icon">LF</div>
          </div>
          <h1 className="heading-1">Welcome back</h1>
          <p className="body-sm text-muted">Sign in to continue your journey</p>
        </div>

        <div className="auth-social">
          <button className="auth-social-btn" id="google-login" type="button">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
            Continue with Google
          </button>
        </div>

        <div className="auth-divider"><span>or sign in with email</span></div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="login-email"
                type="email"
                className="form-input input-with-icon"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="flex-between">
              <label className="form-label" htmlFor="login-password">Password</label>
              <Link to="/forgot-password" className="auth-forgot">Forgot password?</Link>
            </div>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                className="form-input input-with-icon input-with-icon-right"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" className="input-toggle" onClick={() => setShowPass(!showPass)} aria-label="Toggle password visibility">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" id="login-submit" disabled={loading} style={{ width: '100%', padding: '0.875rem' }}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <>Sign In <ArrowRight size={16} /></>}
          </button>
        </form>

        <p className="auth-switch body-sm">
          Don't have an account? <Link to="/register" className="auth-switch__link">Create one free</Link>
        </p>

        <div className="auth-trust">
          <Shield size={12} /> <span className="body-sm text-muted">Your sessions are 100% confidential & secure</span>
        </div>
      </div>
    </div>
  )
}

export function RegisterPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'user' as 'user' | 'mentor' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    const mockUser: UserType = {
      uid: 'new-user',
      displayName: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      domains: [],
      isAnonymous: false,
      onboardingComplete: false,
      createdAt: new Date(),
    }
    setUser(mockUser)
    navigate('/onboarding')
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide animate-scaleIn">
        <div className="auth-card__header">
          <div className="auth-logo">
            <div className="auth-logo__icon">LF</div>
          </div>
          <h1 className="heading-1">Join LifeFundies</h1>
          <p className="body-sm text-muted">Start your journey to life clarity today</p>
        </div>

        {/* Role selector */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${form.role === 'user' ? 'role-btn--active' : ''}`}
            id="role-user"
            onClick={() => update('role', 'user')}
          >
            <span className="role-btn__icon">🙋</span>
            <div>
              <p className="role-btn__label">Seeker</p>
              <p className="body-sm text-muted">I want guidance & support</p>
            </div>
          </button>
          <button
            type="button"
            className={`role-btn ${form.role === 'mentor' ? 'role-btn--active' : ''}`}
            id="role-mentor"
            onClick={() => update('role', 'mentor')}
          >
            <span className="role-btn__icon">👨‍💼</span>
            <div>
              <p className="role-btn__label">Mentor</p>
              <p className="body-sm text-muted">I want to guide others</p>
            </div>
          </button>
        </div>

        <div className="auth-social">
          <button className="auth-social-btn" id="google-register" type="button">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
            Continue with Google
          </button>
        </div>

        <div className="auth-divider"><span>or register with email</span></div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input id="reg-name" type="text" className="form-input input-with-icon" placeholder="Asmit Sharma" value={form.name} onChange={e => update('name', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">Phone Number</label>
              <div className="input-wrapper">
                <Phone size={16} className="input-icon" />
                <input id="reg-phone" type="tel" className="form-input input-with-icon" placeholder="+91 98765 43210" value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input id="reg-email" type="email" className="form-input input-with-icon" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="reg-password"
                type={showPass ? 'text' : 'password'}
                className="form-input input-with-icon input-with-icon-right"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                minLength={8}
                required
              />
              <button type="button" className="input-toggle" onClick={() => setShowPass(!showPass)} aria-label="Toggle password">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" id="register-submit" disabled={loading} style={{ width: '100%', padding: '0.875rem' }}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <>Create Account <ArrowRight size={16} /></>}
          </button>

          <p className="body-sm text-muted" style={{ textAlign: 'center' }}>
            By registering you agree to our{' '}
            <Link to="/terms" style={{ color: 'var(--clr-primary-light)' }}>Terms</Link> &{' '}
            <Link to="/privacy" style={{ color: 'var(--clr-primary-light)' }}>Privacy Policy</Link>
          </p>
        </form>

        <p className="auth-switch body-sm">
          Already have an account? <Link to="/login" className="auth-switch__link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
