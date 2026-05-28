import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Star, Users, Play, CheckCircle, Zap, Heart, Target } from 'lucide-react'
import { LIFE_DOMAINS } from '../../types'
import { MOCK_MENTORS, MOCK_TESTIMONIALS, formatCurrency, getInitials } from '../../utils'
import './Landing.css'

export default function LandingPage() {
  return (
    <main className="landing">
      <HeroSection />
      <StatsBar />
      <DomainsSection />
      <HowItWorksSection />
      <MentorsSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
    </main>
  )
}

function HeroSection() {
  return (
    <section className="hero" id="home">
      {/* Background orbs */}
      <div className="hero__orb hero__orb--1" />
      <div className="hero__orb hero__orb--2" />
      <div className="hero__orb hero__orb--3" />

      <div className="container hero__container">
        <div className="hero__content animate-fadeInUp">
          <div className="section-eyebrow">
            <Shield size={14} />
            Safe · Anonymous · Non-Judgmental
          </div>

          <h1 className="display-1 hero__title">
            Find Your Direction.<br />
            <span className="text-gradient">Live Your Fullest Life.</span>
          </h1>

          <p className="body-lg text-muted hero__desc">
            India's most trusted holistic life-guidance platform. Connect with expert mentors across <strong>18 life domains</strong> — from career clarity to emotional well-being — in a completely safe and anonymous space.
          </p>

          <div className="hero__cta-group">
            <Link to="/register" className="btn btn-primary btn-xl animate-pulse-glow" id="hero-cta-primary">
              Start Your Journey <ArrowRight size={20} />
            </Link>
            <Link to="/#how-it-works" className="btn btn-outline btn-xl" id="hero-cta-secondary">
              <Play size={18} /> How It Works
            </Link>
          </div>

          <div className="hero__trust">
            <div className="hero__trust-avatars">
              {[
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=faces&q=80',
                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50&h=50&fit=crop&crop=faces&q=80',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&crop=faces&q=80',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=faces&q=80',
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=faces&q=80'
              ].map((url, i) => (
                <div key={i} className="avatar avatar-sm hero__trust-avatar" style={{ marginLeft: i ? '-8px' : 0, overflow: 'hidden', border: '2px solid var(--clr-bg-card)' }}>
                  <img src={url} alt="User profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
            <div>
              <div className="stars">{Array.from({ length: 5 }).map((_, i) => <span key={i} className="star">★</span>)}</div>
              <p className="body-sm text-muted">Trusted by <strong>2,000+</strong> students & professionals</p>
            </div>
          </div>
        </div>

        <div className="hero__visual animate-fadeIn delay-300">
          <div className="hero__card-stack">
            <div className="hero__card-bg" />
            <div className="hero__card">
              <div className="hero__card-header">
                <div className="avatar avatar-md" style={{ background: 'linear-gradient(135deg, #0D7377, #14A9AE)', overflow: 'hidden' }}>
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces&q=80" alt="Priya Sharma" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <p className="hero__card-name">Priya Sharma</p>
                  <p className="body-sm text-muted">Career & Purpose Mentor</p>
                </div>
                <span className="badge badge-primary hero__card-badge">Live</span>
              </div>
              <div className="hero__card-domain">
                <Target size={16} style={{ color: 'var(--clr-primary-light)' }} />
                <span className="body-sm">Career Clarity Session</span>
              </div>
              <div className="hero__card-stats">
                <div className="hero__card-stat">
                  <Star size={14} style={{ color: 'var(--clr-secondary)' }} /> 4.9
                </div>
                <div className="hero__card-stat">
                  <Users size={14} /> 420+ sessions
                </div>
                <div className="hero__card-stat">
                  <Heart size={14} style={{ color: 'var(--clr-accent)' }} /> 127 reviews
                </div>
              </div>
              <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>Book Session • ₹349</Link>
            </div>

            <div className="hero__floating-badge hero__floating-badge--1">
              <CheckCircle size={14} style={{ color: 'var(--clr-primary-light)' }} />
              <span className="body-sm">Anonymous & Safe</span>
            </div>
            <div className="hero__floating-badge hero__floating-badge--2">
              <Zap size={14} style={{ color: 'var(--clr-secondary)' }} />
              <span className="body-sm">₹299 onwards</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StatsBar() {
  const stats = [
    { value: '18', label: 'Life Domains', icon: '🎯' },
    { value: '50+', label: 'Expert Mentors', icon: '👨‍💼' },
    { value: '2000+', label: 'Happy Users', icon: '😊' },
    { value: '4.9★', label: 'Average Rating', icon: '⭐' },
    { value: '₹299', label: 'Starting Price', icon: '💰' },
  ]
  return (
    <div className="stats-bar">
      <div className="container stats-bar__inner">
        {stats.map((stat, i) => (
          <div key={i} className="stats-bar__item">
            <span className="stats-bar__icon">{stat.icon}</span>
            <span className="stats-bar__value">{stat.value}</span>
            <span className="stats-bar__label text-muted body-sm">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DomainsSection() {
  return (
    <section className="section domains-section" id="domains">
      <div className="container">
        <div className="section-header animate-fadeInUp">
          <div className="section-eyebrow">🌐 Holistic Approach</div>
          <h2 className="display-2">18 Life Domains, <span className="text-gradient">One Platform</span></h2>
          <p className="body-lg text-muted">
            LifeFundies operates on a comprehensive 18-domain life model — covering every dimension of human development and growth.
          </p>
        </div>
        <div className="domains-grid">
          {LIFE_DOMAINS.map((domain, i) => (
            <Link
              key={domain.id}
              to={`/mentors?domain=${domain.id}`}
              className={`domain-card animate-fadeInUp delay-${Math.min((i % 6 + 1) * 100, 600) as 100 | 200 | 300 | 400 | 500 | 600}`}
              style={{ '--domain-color': domain.color } as React.CSSProperties}
              id={`domain-${domain.id}`}
            >
              <span className="domain-card__icon">{domain.icon}</span>
              <h3 className="domain-card__label">{domain.label}</h3>
              <p className="domain-card__desc body-sm text-muted">{domain.description}</p>
              <div className="domain-card__arrow">→</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      step: '01', icon: '🎭',
      title: 'Choose Your Space',
      desc: 'Share as much or as little as you want. Use a pseudonym. Complete anonymity is always an option — your comfort comes first.',
    },
    {
      step: '02', icon: '🎯',
      title: 'Pick Your Domain',
      desc: 'Select the life area you want guidance in — from 18 domains covering career, emotions, relationships, growth, and more.',
    },
    {
      step: '03', icon: '👨‍💼',
      title: 'Match with a Mentor',
      desc: 'Browse verified mentors who specialize in your domain. Read their stories, ratings, and book a time that works for you.',
    },
    {
      step: '04', icon: '💬',
      title: 'Have a Real Conversation',
      desc: 'A structured, empathetic 1-on-1 session. Get listened to, gain clarity, and walk away with practical action steps.',
    },
  ]
  return (
    <section className="section" id="how-it-works" style={{ background: 'var(--clr-bg-alt)' }}>
      <div className="container">
        <div className="section-header animate-fadeInUp">
          <div className="section-eyebrow">🔄 Simple Process</div>
          <h2 className="display-2">How <span className="text-gradient">LifeFundies</span> Works</h2>
          <p className="body-lg text-muted">
            Four simple steps from confusion to clarity. No complicated forms, no clinical judgement — just real guidance.
          </p>
        </div>
        <div className="how-grid">
          {steps.map((step, i) => (
            <div key={i} className={`how-card animate-fadeInUp delay-${((i + 1) * 100) as 100 | 200 | 300 | 400}`} id={`how-step-${i + 1}`}>
              <div className="how-card__step">{step.step}</div>
              <div className="how-card__icon">{step.icon}</div>
              <h3 className="heading-3">{step.title}</h3>
              <p className="body-sm text-muted">{step.desc}</p>
              {i < steps.length - 1 && <div className="how-card__connector" aria-hidden="true">→</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MentorsSection() {
  return (
    <section className="section mentors-section" id="mentors">
      <div className="container">
        <div className="section-header animate-fadeInUp">
          <div className="section-eyebrow">👨‍💼 Expert Guidance</div>
          <h2 className="display-2">Meet Our <span className="text-gradient">Mentors</span></h2>
          <p className="body-lg text-muted">
            Real people, real journeys. Our verified mentors bring lived experience and structured frameworks to every session.
          </p>
        </div>
        <div className="mentors-grid">
          {MOCK_MENTORS.map((mentor, i) => (
            <div key={mentor.uid} className={`mentor-card animate-fadeInUp delay-${((i % 4 + 1) * 100) as 100 | 200 | 300 | 400}`} id={`mentor-${mentor.uid}`}>
              <div className="mentor-card__header">
                <div className="avatar avatar-lg" style={{ background: `hsl(${i * 80}, 60%, 40%)`, overflow: 'hidden' }}>
                  {mentor.photoURL ? (
                    <img src={mentor.photoURL} alt={mentor.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    getInitials(mentor.displayName)
                  )}
                </div>
                <div>
                  <p className="mentor-card__name">{mentor.displayName}</p>
                  <p className="body-sm text-muted">{mentor.yearsOfExperience}+ years experience</p>
                  <div className="stars" style={{ marginTop: '2px' }}>
                    {Array.from({ length: 5 }).map((_, j) => <span key={j} className="star">★</span>)}
                    <span className="body-sm text-muted" style={{ marginLeft: '4px' }}>{mentor.rating} ({mentor.reviewCount})</span>
                  </div>
                </div>
                {mentor.isVerified && <span className="badge badge-primary mentor-card__verified">✓ Verified</span>}
              </div>

              <div className="mentor-card__domains">
                {mentor.domains.map(d => {
                  const domain = LIFE_DOMAINS.find(x => x.id === d)
                  return domain ? <span key={d} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{domain.icon} {domain.label}</span> : null
                })}
              </div>

              <p className="body-sm text-muted mentor-card__bio">{mentor.bio}</p>

              <div className="mentor-card__stats">
                <span className="body-sm text-muted">{mentor.totalSessions}+ sessions</span>
                <span className="mentor-card__price">{formatCurrency(mentor.sessionPrice)}/session</span>
              </div>

              <Link to={`/mentors/${mentor.uid}`} className="btn btn-outline" style={{ width: '100%' }}>
                View Profile & Book
              </Link>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 'var(--sp-10)' }}>
          <Link to="/mentors" className="btn btn-primary btn-lg" id="view-all-mentors">
            View All Mentors <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className="section" style={{ background: 'var(--clr-bg-alt)' }} id="testimonials">
      <div className="container">
        <div className="section-header animate-fadeInUp">
          <div className="section-eyebrow">❤️ Real Stories</div>
          <h2 className="display-2">Lives <span className="text-gradient">Transformed</span></h2>
          <p className="body-lg text-muted">
            Don't take our word for it. Hear from the students and professionals who found their direction with LifeFundies.
          </p>
        </div>
        <div className="testimonials-grid">
          {MOCK_TESTIMONIALS.map((t, i) => (
            <div key={i} className={`testimonial-card animate-fadeInUp delay-${((i % 4 + 1) * 100) as 100 | 200 | 300 | 400}`} id={`testimonial-${i + 1}`}>
              <div className="stars testimonial-card__stars">
                {Array.from({ length: 5 }).map((_, j) => <span key={j} className="star">★</span>)}
              </div>
              <p className="testimonial-card__text">"{t.text}"</p>
              <div className="testimonial-card__author">
                <div className="avatar avatar-md" style={{ overflow: 'hidden' }}>
                  <img src={t.avatar} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <p className="testimonial-card__name">{t.name}</p>
                  <p className="body-sm text-muted">{t.role}</p>
                  <span className="badge badge-primary" style={{ fontSize: '0.7rem', marginTop: '4px' }}>{t.domain}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: 299,
      badge: 'Most Accessible',
      badgeClass: 'badge-primary',
      features: [
        '50-minute 1-on-1 session',
        'Choose from 18 life domains',
        'Verified mentor',
        'Session summary notes',
        'Anonymous option available',
      ],
      cta: 'Book a Session',
      highlight: false,
    },
    {
      name: 'Growth',
      price: 349,
      badge: 'Most Popular',
      badgeClass: 'badge-accent',
      features: [
        '60-minute deep-dive session',
        'Senior mentor access',
        'Pre-session questionnaire',
        'Session recording (optional)',
        'Follow-up check-in (15 min)',
        'Personalised action plan',
      ],
      cta: 'Get Started',
      highlight: true,
    },
    {
      name: 'Premium',
      price: 399,
      badge: 'Best Value',
      badgeClass: 'badge-secondary',
      features: [
        '75-minute expert session',
        'Top-rated mentor',
        'Priority scheduling',
        'Detailed written guidance',
        '1 follow-up session (30 min)',
        'Access to resource library',
        'Community mentor access',
      ],
      cta: 'Go Premium',
      highlight: false,
    },
  ]

  return (
    <section className="section pricing-section" id="pricing">
      <div className="container">
        <div className="section-header animate-fadeInUp">
          <div className="section-eyebrow">💰 Affordable Guidance</div>
          <h2 className="display-2">Invest in <span className="text-gradient">Yourself</span></h2>
          <p className="body-lg text-muted">
            Expert life guidance, priced for students and young professionals. No hidden charges, no long commitments.
          </p>
        </div>
        <div className="pricing-grid">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`pricing-card animate-fadeInUp delay-${((i + 1) * 100) as 100 | 200 | 300} ${plan.highlight ? 'pricing-card--featured' : ''}`}
              id={`pricing-${plan.name.toLowerCase()}`}
            >
              {plan.highlight && <div className="pricing-card__glow" />}
              <div className="pricing-card__header">
                <span className={`badge ${plan.badgeClass}`}>{plan.badge}</span>
                <h3 className="heading-2 pricing-card__name">{plan.name}</h3>
                <div className="pricing-card__price">
                  <span className="pricing-card__currency">₹</span>
                  <span className="pricing-card__amount">{plan.price}</span>
                  <span className="text-muted body-sm">/session</span>
                </div>
              </div>
              <ul className="pricing-card__features">
                {plan.features.map((f, j) => (
                  <li key={j} className="pricing-card__feature">
                    <CheckCircle size={16} style={{ color: 'var(--clr-primary-light)', flexShrink: 0 }} />
                    <span className="body-sm">{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className={`btn btn-xl ${plan.highlight ? 'btn-primary' : 'btn-outline'}`} style={{ width: '100%' }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="body-sm text-muted" style={{ textAlign: 'center', marginTop: 'var(--sp-6)' }}>
          🔒 All payments secured via Razorpay · 30-minute money-back guarantee for first sessions
        </p>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="cta-section" id="cta">
      <div className="cta-section__bg" />
      <div className="container cta-section__inner">
        <div className="animate-fadeInUp">
          <h2 className="display-2 cta-section__title">
            Ready to Find Your <span className="text-gradient">Clarity</span>?
          </h2>
          <p className="body-lg text-muted cta-section__desc">
            Join thousands of students and professionals who have already found their direction. Your first step towards a more fulfilling life starts here.
          </p>
          <div className="cta-section__actions">
            <Link to="/register" className="btn btn-accent btn-xl" id="final-cta">
              Start for Free <ArrowRight size={20} />
            </Link>
            <Link to="/mentors" className="btn btn-outline btn-xl" id="browse-mentors-cta">
              Browse Mentors
            </Link>
          </div>
          <p className="body-sm text-muted" style={{ marginTop: 'var(--sp-4)' }}>
            No credit card required · Anonymous option available · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}
