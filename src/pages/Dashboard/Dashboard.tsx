import { Link } from 'react-router-dom'
import { Calendar, Clock, Star, TrendingUp, Users, ArrowRight, Bell, BookOpen, Heart } from 'lucide-react'
import { useAuthStore } from '../../stores'
import { LIFE_DOMAINS } from '../../types'
import { MOCK_MENTORS, formatCurrency, getInitials } from '../../utils'
import './Dashboard.css'

const MOCK_UPCOMING = [
  { id: 's1', mentor: 'Priya Sharma', domain: 'Career & Purpose', date: 'Tomorrow', time: '4:00 PM', duration: 60, status: 'confirmed' },
  { id: 's2', mentor: 'Rahul Verma', domain: 'Emotional Well-being', date: 'Jun 2', time: '11:00 AM', duration: 50, status: 'pending' },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const userDomains = user?.domains?.map(id => LIFE_DOMAINS.find(d => d.id === id)).filter(Boolean) || []

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="page-wrapper">
      <div className="dashboard">
        <div className="container">
          {/* Header */}
          <div className="dashboard__header animate-fadeInUp">
            <div>
              <p className="text-muted body-sm">{greeting()},</p>
              <h1 className="display-2 dashboard__name">{user?.displayName || 'Explorer'} 👋</h1>
              <p className="text-muted">Continue your journey to life clarity.</p>
            </div>
            <div className="dashboard__header-actions">
              <button className="btn btn-outline" id="notification-btn" aria-label="Notifications">
                <Bell size={16} /> <span className="badge badge-accent" style={{ padding: '0.1rem 0.4rem' }}>3</span>
              </button>
              <Link to="/mentors" className="btn btn-primary" id="book-session-btn">
                Book a Session <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="dashboard__grid">
            {/* Left column */}
            <div className="dashboard__main">
              {/* Stats row */}
              <div className="dashboard__stats animate-fadeInUp delay-100">
                {[
                  { icon: Calendar, label: 'Sessions Done', value: '3', color: 'var(--clr-primary)' },
                  { icon: Star, label: 'Avg Rating Given', value: '4.8', color: 'var(--clr-secondary)' },
                  { icon: TrendingUp, label: 'Domains Explored', value: userDomains.length.toString(), color: 'var(--clr-accent)' },
                  { icon: Heart, label: 'Community Posts', value: '7', color: 'var(--clr-purple)' },
                ].map((stat, i) => (
                  <div key={i} className="dashboard__stat-card">
                    <div className="dashboard__stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                      <stat.icon size={20} />
                    </div>
                    <div>
                      <p className="dashboard__stat-value">{stat.value}</p>
                      <p className="body-sm text-muted">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upcoming Sessions */}
              <div className="dashboard__section animate-fadeInUp delay-200">
                <div className="flex-between" style={{ marginBottom: 'var(--sp-4)' }}>
                  <h2 className="heading-2">Upcoming Sessions</h2>
                  <Link to="/sessions" className="btn btn-ghost btn-sm">View all</Link>
                </div>
                {MOCK_UPCOMING.length > 0 ? (
                  <div className="flex-col gap-3">
                    {MOCK_UPCOMING.map(session => (
                      <div key={session.id} className="session-card" id={`session-${session.id}`}>
                        <div className="avatar avatar-md" style={{ background: `hsl(${Math.random() * 360}, 60%, 40%)` }}>
                          {getInitials(session.mentor)}
                        </div>
                        <div className="session-card__info">
                          <p className="session-card__mentor">{session.mentor}</p>
                          <div className="flex gap-3">
                            <span className="body-sm text-muted flex gap-1"><Calendar size={13} /> {session.date}</span>
                            <span className="body-sm text-muted flex gap-1"><Clock size={13} /> {session.time}</span>
                            <span className="body-sm text-muted flex gap-1"><BookOpen size={13} /> {session.domain}</span>
                          </div>
                        </div>
                        <div className="session-card__actions">
                          <span className={`badge ${session.status === 'confirmed' ? 'badge-primary' : 'badge-secondary'}`}>
                            {session.status}
                          </span>
                          <button className="btn btn-outline btn-sm">Join</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dashboard__empty">
                    <Calendar size={32} />
                    <p>No upcoming sessions</p>
                    <Link to="/mentors" className="btn btn-primary btn-sm">Book your first session</Link>
                  </div>
                )}
              </div>

              {/* Recommended Mentors */}
              <div className="dashboard__section animate-fadeInUp delay-300">
                <div className="flex-between" style={{ marginBottom: 'var(--sp-4)' }}>
                  <h2 className="heading-2">Recommended for You</h2>
                  <Link to="/mentors" className="btn btn-ghost btn-sm">See all</Link>
                </div>
                <div className="dashboard__mentor-list">
                  {MOCK_MENTORS.slice(0, 3).map((mentor, i) => (
                    <div key={mentor.uid} className="dashboard__mentor-card" id={`rec-mentor-${mentor.uid}`}>
                      <div className="avatar avatar-lg" style={{ background: `hsl(${i * 80 + 40}, 60%, 40%)` }}>
                        {getInitials(mentor.displayName)}
                      </div>
                      <div className="dashboard__mentor-info">
                        <p className="dashboard__mentor-name">{mentor.displayName}</p>
                        <div className="flex gap-2">
                          {mentor.domains.slice(0, 2).map(d => {
                            const domain = LIFE_DOMAINS.find(x => x.id === d)
                            return domain ? <span key={d} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{domain.icon} {domain.label}</span> : null
                          })}
                        </div>
                        <div className="flex gap-3" style={{ marginTop: 'var(--sp-1)' }}>
                          <span className="body-sm text-muted"><Star size={12} style={{ display: 'inline' }} /> {mentor.rating}</span>
                          <span className="body-sm text-muted"><Users size={12} style={{ display: 'inline' }} /> {mentor.totalSessions} sessions</span>
                        </div>
                      </div>
                      <div className="dashboard__mentor-cta">
                        <p className="mentor-card__price">{formatCurrency(mentor.sessionPrice)}</p>
                        <Link to={`/mentors/${mentor.uid}`} className="btn btn-outline btn-sm">Book</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="dashboard__sidebar">
              {/* My Domains */}
              <div className="dashboard__widget animate-fadeInUp delay-200" id="my-domains-widget">
                <h3 className="heading-3">My Domains</h3>
                {userDomains.length > 0 ? (
                  <div className="flex-col gap-3" style={{ marginTop: 'var(--sp-4)' }}>
                    {userDomains.map(domain => domain && (
                      <Link key={domain.id} to={`/mentors?domain=${domain.id}`} className="domain-pill">
                        <span>{domain.icon}</span>
                        <span>{domain.label}</span>
                        <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--clr-text-subtle)' }} />
                      </Link>
                    ))}
                    <Link to="/settings" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>Edit domains</Link>
                  </div>
                ) : (
                  <div className="dashboard__empty">
                    <p className="body-sm text-muted">No domains selected yet</p>
                    <Link to="/onboarding" className="btn btn-primary btn-sm">Set up</Link>
                  </div>
                )}
              </div>

              {/* Progress Tracker */}
              <div className="dashboard__widget animate-fadeInUp delay-300" id="progress-widget">
                <h3 className="heading-3">Your Progress</h3>
                <div className="flex-col gap-4" style={{ marginTop: 'var(--sp-4)' }}>
                  {[
                    { label: 'Profile complete', value: 80 },
                    { label: 'Onboarding done', value: 100 },
                    { label: 'Sessions attended', value: 30 },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex-between" style={{ marginBottom: 'var(--sp-2)' }}>
                        <span className="body-sm">{item.label}</span>
                        <span className="body-sm text-muted">{item.value}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Teaser */}
              <div className="dashboard__widget dashboard__widget--accent animate-fadeInUp delay-400" id="community-widget">
                <div className="widget-accent__icon">💬</div>
                <h3 className="heading-3">Join the Community</h3>
                <p className="body-sm text-muted">Connect with peers who are on the same journey. Share, learn, and grow together.</p>
                <Link to="/community" className="btn btn-accent btn-sm" style={{ marginTop: 'var(--sp-4)', width: '100%' }}>
                  Explore Community
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
