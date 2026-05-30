import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowRight, ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react'
import { LIFE_DOMAINS, type DomainId } from '../../types'
import { useAuthStore } from '../../stores'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import './Onboarding.css'

const STEPS = ['Welcome', 'About You', 'Your Domains', 'Your Challenge', 'Preferences']

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    city: '',
    profession: '',
    ageGroup: '',
    domains: [] as DomainId[],
    challenge: '',
    isAnonymous: false,
    sessionPreference: 'one-on-one' as string,
  })
  const { user, setUser } = useAuthStore()
  const navigate = useNavigate()

  const update = (field: string, value: unknown) => setData(d => ({ ...d, [field]: value }))

  const toggleDomain = (id: DomainId) => {
    const existing = data.domains
    if (existing.includes(id)) {
      update('domains', existing.filter(d => d !== id))
    } else if (existing.length < 3) {
      update('domains', [...existing, id])
    }
  }

  const handleFinish = async () => {
    if (user) {
      const updatedUser = { ...user, ...data, onboardingComplete: true }
      
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          ...data,
          onboardingComplete: true
        })
        setUser(updatedUser)
        navigate('/dashboard')
      } catch (err) {
        console.error('Failed to save onboarding data', err)
        alert('Could not save your data. Please try again.')
      }
    } else {
      navigate('/login')
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="onboarding">
      <div className="onboarding__container">
        {/* Progress */}
        <div className="onboarding__progress">
          <div className="onboarding__steps">
            {STEPS.map((s, i) => (
              <div key={i} className={`onboarding__step ${i <= step ? 'onboarding__step--done' : ''} ${i === step ? 'onboarding__step--active' : ''}`}>
                <div className="onboarding__step-dot">
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                <span className="onboarding__step-label hide-mobile">{s}</span>
              </div>
            ))}
          </div>
          <div className="progress-bar" style={{ marginTop: 'var(--sp-4)' }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Step Content */}
        <div className="onboarding__card animate-scaleIn">
          {step === 0 && <WelcomeStep name={user?.displayName || 'there'} />}
          {step === 1 && <AboutStep data={data} update={update} />}
          {step === 2 && <DomainsStep selected={data.domains} toggle={toggleDomain} />}
          {step === 3 && (
            <ChallengeStep 
              value={data.challenge} 
              onChange={v => update('challenge', v)} 
              isAnonymous={data.isAnonymous}
              onAnonymousChange={v => update('isAnonymous', v)}
            />
          )}
          {step === 4 && <PrefsStep data={data} update={update} />}

          <div className="onboarding__nav">
            {step > 0 && (
              <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)} id="onboarding-back">
                <ArrowLeft size={16} /> Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < STEPS.length - 1 ? (
              <button className="btn btn-primary btn-lg" onClick={() => setStep(s => s + 1)} id="onboarding-next">
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={handleFinish} id="onboarding-finish">
                Go to Dashboard <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function WelcomeStep({ name }: { name: string }) {
  return (
    <div className="ob-step animate-fadeInUp">
      <div className="ob-step__icon">🎉</div>
      <h2 className="heading-1">Welcome, {name}!</h2>
      <p className="body-lg text-muted">
        We're excited to have you here. Let's take 2 minutes to personalise your LifeFundies experience so we can connect you with the right mentors and support.
      </p>
      <div className="ob-features">
        {[
          { icon: '🎭', text: 'Completely anonymous option' },
          { icon: '🔒', text: 'Private & secure conversations' },
          { icon: '🎯', text: 'Personalised mentor matching' },
        ].map((f, i) => (
          <div key={i} className="ob-feature">
            <span>{f.icon}</span>
            <span className="body-sm">{f.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AboutStep({ data, update }: { data: { city: string; profession: string; ageGroup: string }; update: (f: string, v: string) => void }) {
  const ageGroups = ['16–20', '21–25', '26–30', '31–35', '35+']
  return (
    <div className="ob-step animate-fadeInUp">
      <div className="ob-step__icon">👤</div>
      <h2 className="heading-1">Tell us about yourself</h2>
      <p className="body-sm text-muted">This helps us match you with the most relevant mentors.</p>
      <div className="ob-form">
        <div className="form-group">
          <label className="form-label">Your City</label>
          <input className="form-input" placeholder="e.g. Delhi, Mumbai, Bangalore..." value={data.city} onChange={e => update('city', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Profession / Status</label>
          <input className="form-input" placeholder="e.g. Engineering student, Marketing exec..." value={data.profession} onChange={e => update('profession', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Age Group</label>
          <div className="ob-chips">
            {ageGroups.map(g => (
              <button
                key={g}
                type="button"
                className={`ob-chip ${data.ageGroup === g ? 'ob-chip--active' : ''}`}
                onClick={() => update('ageGroup', g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DomainsStep({ selected, toggle }: { selected: DomainId[]; toggle: (id: DomainId) => void }) {
  return (
    <div className="ob-step animate-fadeInUp">
      <div className="ob-step__icon">🎯</div>
      <h2 className="heading-1">Choose your domains</h2>
      <p className="body-sm text-muted">Select up to 3 life areas you want to focus on. You can always change this later.</p>
      <div className="ob-domains">
        {LIFE_DOMAINS.map(domain => (
          <button
            key={domain.id}
            type="button"
            className={`ob-domain-card ${selected.includes(domain.id) ? 'ob-domain-card--selected' : ''} ${selected.length >= 3 && !selected.includes(domain.id) ? 'ob-domain-card--disabled' : ''}`}
            onClick={() => toggle(domain.id)}
            style={{ '--domain-color': domain.color } as React.CSSProperties}
          >
            <span className="ob-domain-card__icon">{domain.icon}</span>
            <span className="ob-domain-card__label">{domain.label}</span>
            {selected.includes(domain.id) && <Check size={14} className="ob-domain-card__check" />}
          </button>
        ))}
      </div>
      <p className="body-sm text-muted" style={{ textAlign: 'center' }}>
        {selected.length}/3 selected
      </p>
    </div>
  )
}

function ChallengeStep({ 
  value, 
  onChange, 
  isAnonymous, 
  onAnonymousChange 
}: { 
  value: string; 
  onChange: (v: string) => void; 
  isAnonymous: boolean; 
  onAnonymousChange: (v: boolean) => void 
}) {
  return (
    <div className="ob-step animate-fadeInUp">
      <div className="ob-step__icon">💬</div>
      <h2 className="heading-1">What's on your mind?</h2>
      <p className="body-sm text-muted">
        Briefly describe what you're going through. This is completely optional and helps mentors prepare for your session.
      </p>
      <div className="form-group">
        <textarea
          className="form-input"
          rows={5}
          placeholder="e.g. I'm a final-year student confused about whether to go for a job or MBA. I feel lost when my friends seem to have everything figured out..."
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ resize: 'vertical' }}
        />
      </div>
      <div className="ob-anon-toggle">
        <button
          type="button"
          className={`ob-toggle ${isAnonymous ? 'ob-toggle--on' : ''}`}
          onClick={() => onAnonymousChange(!isAnonymous)}
          id="anon-toggle"
          aria-pressed={isAnonymous}
        >
          <div className="ob-toggle__thumb" />
        </button>
        <div>
          <div className="flex gap-2">
            {isAnonymous ? <EyeOff size={14} style={{ color: 'var(--clr-primary-light)' }} /> : <Eye size={14} />}
            <span className="body-sm font-medium">Share anonymously</span>
          </div>
          <p className="body-sm text-muted">Your name won't be shown to the mentor until you're ready</p>
        </div>
      </div>
      <div className="ob-tip">
        <Shield size={14} style={{ color: 'var(--clr-primary-light)' }} />
        <span className="body-sm text-muted">This info is only shared with the mentor you book a session with</span>
      </div>
    </div>
  )
}

function PrefsStep({ data, update }: { data: { sessionPreference: string; isAnonymous: boolean }; update: (f: string, v: unknown) => void }) {
  const sessionTypes = [
    { id: 'one-on-one', icon: '👤', label: '1-on-1 Session', desc: 'Private session with a dedicated mentor' },
    { id: 'peer', icon: '👥', label: 'Peer Support', desc: 'Connect with someone who has been through similar experiences' },
    { id: 'group', icon: '🎯', label: 'Group Session', desc: 'Learn and grow with a small group facing similar challenges' },
  ]

  return (
    <div className="ob-step animate-fadeInUp">
      <div className="ob-step__icon">⚙️</div>
      <h2 className="heading-1">Your preferences</h2>
      <p className="body-sm text-muted">Customise your experience to suit your comfort level.</p>

      <div className="form-group">
        <label className="form-label">Preferred session type</label>
        <div className="ob-session-types">
          {sessionTypes.map(t => (
            <button
              key={t.id}
              type="button"
              className={`ob-session-type ${data.sessionPreference === t.id ? 'ob-session-type--active' : ''}`}
              onClick={() => update('sessionPreference', t.id)}
            >
              <span className="ob-session-type__icon">{t.icon}</span>
              <div>
                <p className="ob-session-type__label">{t.label}</p>
                <p className="body-sm text-muted">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="ob-final-toggle">
        <div>
          <p className="font-medium">Keep my profile anonymous by default</p>
          <p className="body-sm text-muted">Your name and photo will be hidden from mentors until you choose to reveal</p>
        </div>
        <button
          type="button"
          className={`ob-toggle ${data.isAnonymous ? 'ob-toggle--on' : ''}`}
          onClick={() => update('isAnonymous', !data.isAnonymous)}
          aria-pressed={data.isAnonymous}
        >
          <div className="ob-toggle__thumb" />
        </button>
      </div>
    </div>
  )
}
