import { useState } from 'react'
import { Calendar, Clock, Users, TrendingUp, Star, DollarSign, CheckCircle, XCircle, Edit3 } from 'lucide-react'
import { formatCurrency, getInitials } from '../../utils'
import './MentorPortal.css'

const MOCK_REQUESTS = [
  { id: 'r1', user: 'Anonymous User', domain: 'Career & Purpose', date: 'Jun 1', time: '3:00 PM', price: 349, status: 'pending' },
  { id: 'r2', user: 'Shreya A.', domain: 'Emotional Well-being', date: 'Jun 3', time: '11:00 AM', price: 299, status: 'pending' },
  { id: 'r3', user: 'Vikram N.', domain: 'Relationships', date: 'Jun 5', time: '5:00 PM', price: 349, status: 'confirmed' },
]

const MOCK_PAST = [
  { id: 's1', user: 'Tanvi J.', domain: 'Confidence & Self-Image', date: 'May 20', rating: 5, price: 349 },
  { id: 's2', user: 'Arjun S.', domain: 'Career & Purpose', date: 'May 18', rating: 4, price: 349 },
  { id: 's3', user: 'Preethi R.', domain: 'Motivation & Discipline', date: 'May 15', rating: 5, price: 299 },
]

export default function MentorPortalPage() {
  const [requests, setRequests] = useState(MOCK_REQUESTS)
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'calendar' | 'earnings'>('overview')

  const respond = (id: string, action: 'confirmed' | 'cancelled') => {
    setRequests(r => r.map(req => req.id === id ? { ...req, status: action } : req))
  }

  const stats = [
    { icon: Calendar, label: 'Sessions This Month', value: '24', color: 'var(--clr-primary)', change: '+12%' },
    { icon: Users, label: 'Total Clients', value: '87', color: 'var(--clr-accent)', change: '+5' },
    { icon: Star, label: 'Avg Rating', value: '4.9', color: 'var(--clr-secondary)', change: '+0.1' },
    { icon: DollarSign, label: 'Earnings (May)', value: '₹8,400', color: 'var(--clr-purple)', change: '+24%' },
  ]

  return (
    <div className="page-wrapper">
      <div className="mentor-portal">
        <div className="container">
          <div className="mentor-portal__header animate-fadeInUp">
            <div>
              <div className="badge badge-primary" style={{ marginBottom: 'var(--sp-2)' }}>Mentor Dashboard</div>
              <h1 className="display-2">Welcome back, <span className="text-gradient">Priya</span> 👋</h1>
              <p className="text-muted">You have <strong>2 pending requests</strong> awaiting your response.</p>
            </div>
            <button className="btn btn-outline" id="edit-profile-btn">
              <Edit3 size={16} /> Edit Profile
            </button>
          </div>

          {/* Tabs */}
          <div className="mentor-portal__tabs animate-fadeInUp delay-100">
            {(['overview', 'requests', 'calendar', 'earnings'] as const).map(tab => (
              <button
                key={tab}
                className={`community__tab ${activeTab === tab ? 'community__tab--active' : ''}`}
                onClick={() => setActiveTab(tab)}
                id={`portal-tab-${tab}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="mentor-portal__content">
              {/* Stats */}
              <div className="mentor-portal__stats animate-fadeInUp delay-200">
                {stats.map((stat, i) => (
                  <div key={i} className="mentor-stat-card" id={`mentor-stat-${i}`}>
                    <div className="mentor-stat-card__icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                      <stat.icon size={20} />
                    </div>
                    <div>
                      <p className="mentor-stat-card__value">{stat.value}</p>
                      <p className="body-sm text-muted">{stat.label}</p>
                    </div>
                    <span className="mentor-stat-card__change">{stat.change}</span>
                  </div>
                ))}
              </div>

              <div className="mentor-portal__grid">
                {/* Pending Requests */}
                <div className="portal-section animate-fadeInUp delay-300">
                  <h2 className="heading-2">Pending Requests</h2>
                  <div className="flex-col gap-3" style={{ marginTop: 'var(--sp-4)' }}>
                    {requests.filter(r => r.status === 'pending').map(req => (
                      <div key={req.id} className="request-card" id={`request-${req.id}`}>
                        <div className="avatar avatar-md" style={{ background: 'var(--clr-primary)' }}>
                          {req.user === 'Anonymous User' ? '?' : getInitials(req.user)}
                        </div>
                        <div className="request-card__info">
                          <p className="request-card__user">{req.user}</p>
                          <div className="flex gap-3">
                            <span className="body-sm text-muted">{req.domain}</span>
                            <span className="body-sm text-muted"><Clock size={12} style={{ display: 'inline' }} /> {req.date}, {req.time}</span>
                          </div>
                        </div>
                        <p className="request-card__price">{formatCurrency(req.price)}</p>
                        <div className="request-card__actions">
                          <button className="btn btn-primary btn-sm" onClick={() => respond(req.id, 'confirmed')} id={`accept-${req.id}`}>
                            <CheckCircle size={14} /> Accept
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => respond(req.id, 'cancelled')} id={`decline-${req.id}`}>
                            <XCircle size={14} /> Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Sessions */}
                <div className="portal-section animate-fadeInUp delay-400">
                  <h2 className="heading-2">Recent Sessions</h2>
                  <div className="flex-col gap-3" style={{ marginTop: 'var(--sp-4)' }}>
                    {MOCK_PAST.map(session => (
                      <div key={session.id} className="past-session-card" id={`past-${session.id}`}>
                        <div className="avatar avatar-sm" style={{ background: `hsl(${session.id.charCodeAt(1) * 50}, 55%, 40%)` }}>
                          {getInitials(session.user)}
                        </div>
                        <div className="past-session-card__info">
                          <p className="past-session-card__user">{session.user}</p>
                          <p className="body-sm text-muted">{session.domain} · {session.date}</p>
                        </div>
                        <div className="past-session-card__rating">
                          {Array.from({ length: session.rating }).map((_, i) => (
                            <span key={i} className="star">★</span>
                          ))}
                        </div>
                        <span className="body-sm text-muted">{formatCurrency(session.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Earnings Chart Placeholder */}
              <div className="portal-section animate-fadeInUp delay-400" id="earnings-section">
                <div className="flex-between" style={{ marginBottom: 'var(--sp-4)' }}>
                  <h2 className="heading-2">Earnings Overview</h2>
                  <span className="badge badge-primary">May 2025</span>
                </div>
                <div className="earnings-chart">
                  {[40, 65, 50, 80, 70, 90, 75, 85, 60, 95, 88, 72].map((h, i) => (
                    <div key={i} className="earnings-chart__bar-wrapper">
                      <div className="earnings-chart__bar" style={{ height: `${h}%` }} />
                      <span className="earnings-chart__label">{i + 1}</span>
                    </div>
                  ))}
                </div>
                <div className="earnings-summary">
                  <div className="earnings-summary__item">
                    <p className="body-sm text-muted">Total Sessions</p>
                    <p className="earnings-summary__value">24</p>
                  </div>
                  <div className="earnings-summary__item">
                    <p className="body-sm text-muted">Total Earnings</p>
                    <p className="earnings-summary__value text-gradient">₹8,400</p>
                  </div>
                  <div className="earnings-summary__item">
                    <p className="body-sm text-muted">Avg/Session</p>
                    <p className="earnings-summary__value">₹350</p>
                  </div>
                  <div className="earnings-summary__item">
                    <p className="body-sm text-muted">Pending Payout</p>
                    <p className="earnings-summary__value" style={{ color: 'var(--clr-secondary)' }}>₹1,200</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="portal-section animate-fadeInUp" style={{ marginTop: 'var(--sp-6)' }}>
              <h2 className="heading-2">All Booking Requests</h2>
              <div className="flex-col gap-3" style={{ marginTop: 'var(--sp-4)' }}>
                {requests.map(req => (
                  <div key={req.id} className="request-card" id={`req-all-${req.id}`}>
                    <div className="avatar avatar-md" style={{ background: 'var(--clr-primary)' }}>
                      {req.user === 'Anonymous User' ? '?' : getInitials(req.user)}
                    </div>
                    <div className="request-card__info">
                      <p className="request-card__user">{req.user}</p>
                      <div className="flex gap-3">
                        <span className="body-sm text-muted">{req.domain}</span>
                        <span className="body-sm text-muted">{req.date}, {req.time}</span>
                      </div>
                    </div>
                    <p className="request-card__price">{formatCurrency(req.price)}</p>
                    <span className={`badge ${req.status === 'confirmed' ? 'badge-primary' : req.status === 'cancelled' ? 'badge-accent' : 'badge-secondary'}`}>
                      {req.status}
                    </span>
                    {req.status === 'pending' && (
                      <div className="request-card__actions">
                        <button className="btn btn-primary btn-sm" onClick={() => respond(req.id, 'confirmed')}>Accept</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => respond(req.id, 'cancelled')}>Decline</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'calendar' || activeTab === 'earnings') && (
            <div className="portal-section animate-fadeInUp" style={{ marginTop: 'var(--sp-6)' }}>
              <div className="portal-coming-soon">
                <span style={{ fontSize: '3rem' }}>{activeTab === 'calendar' ? '📅' : '💰'}</span>
                <h3 className="heading-2">{activeTab === 'calendar' ? 'Calendar' : 'Earnings'} — Coming Soon</h3>
                <p className="text-muted">This feature is under development. Check back soon!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
