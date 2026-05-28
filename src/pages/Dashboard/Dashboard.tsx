import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Star, TrendingUp, Users, ArrowRight, Bell, BookOpen, Heart, X } from 'lucide-react'
// @ts-ignore
import { getUserBookings } from '../../lib/bookingService'
import { useAuthStore, useAppStore } from '../../stores'
import { LIFE_DOMAINS } from '../../types'
import { MOCK_MENTORS, formatCurrency, getInitials } from '../../utils'
import VideoRoom from '../../components/VideoRoom'
import './Dashboard.css'

const MOCK_UPCOMING = [
  { id: 's1', mentor: 'Priya Sharma', domain: 'Career & Purpose', date: 'Tomorrow', time: '4:00 PM', duration: 60, status: 'confirmed' },
  { id: 's2', mentor: 'Rahul Verma', domain: 'Emotional Well-being', date: 'Jun 2', time: '11:00 AM', duration: 50, status: 'pending' },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const userDomains = user?.domains?.map(id => LIFE_DOMAINS.find(d => d.id === id)).filter(Boolean) || []
  
  const [showNotifications, setShowNotifications] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [sessionMentorName, setSessionMentorName] = useState('Priya Sharma')
  const [bookings, setBookings] = useState<any[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const { notificationsList, markAllNotificationsRead, markNotificationRead } = useAppStore()

  useEffect(() => {
    if (user?.uid) {
      setLoadingBookings(true)
      getUserBookings(user.uid)
        .then((data: any) => {
          if (Array.isArray(data)) {
            setBookings(data)
          }
        })
        .catch((err: any) => {
          console.error('Failed to load user bookings:', err)
        })
        .finally(() => {
          setLoadingBookings(false)
        })
    }
  }, [user?.uid])

  const unreadCount = notificationsList.filter(n => !n.isRead).length

  const handleJoinSession = (mentorName: string, id: string) => {
    setSessionMentorName(mentorName)
    setActiveSessionId(id)
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Map bookings to upcoming sessions format
  const upcomingSessions = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'pending')
    .map(b => {
      const mentor = MOCK_MENTORS.find(m => m.uid === b.guideId)
      return {
        id: b.id || b.bookingId,
        mentor: mentor?.displayName || 'LifeFundies Mentor',
        domain: b.domain,
        date: b.sessionDate,
        time: b.sessionTime,
        duration: b.sessionDuration,
        status: b.status,
      }
    })

  // Fallback to MOCK_UPCOMING if no real bookings exist
  const displaySessions = upcomingSessions.length > 0 ? upcomingSessions : MOCK_UPCOMING

  // Dynamic progress tracker calculations
  const profileCompleteness = (() => {
    let score = 0
    if (user?.displayName) score += 30
    if (user?.email) score += 30
    if (user?.phone) score += 20
    if (user?.onboardingComplete) score += 20
    return score
  })()

  const onboardingProgress = user?.onboardingComplete ? 100 : 0

  const sessionsProgress = bookings.length > 0
    ? Math.round((bookings.filter(b => b.status === 'completed').length / bookings.length) * 100)
    : 30 // Fallback mock value

  const completedSessionsCount = bookings.length > 0
    ? bookings.filter(b => b.status === 'completed').length.toString()
    : '3' // Fallback mock value

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
            <div className="dashboard__header-actions" style={{ position: 'relative' }}>
              <button 
                className="btn btn-outline" 
                id="notification-btn" 
                aria-label="Notifications"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="badge badge-accent" style={{ padding: '0.1rem 0.4rem' }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="dashboard__notifications-dropdown animate-fadeIn">
                  <div className="flex-between" style={{ padding: 'var(--sp-3) var(--sp-4)', borderBottom: '1px solid var(--clr-border)' }}>
                    <span className="body-sm font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                      <button className="btn btn-ghost btn-sm" style={{ padding: 0, fontSize: '0.75rem' }} onClick={markAllNotificationsRead}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="dashboard__notifications-list">
                    {notificationsList.length > 0 ? (
                      notificationsList.map(n => (
                        <div 
                          key={n.id} 
                          className={`dashboard__notification-item ${!n.isRead ? 'dashboard__notification-item--unread' : ''}`}
                          onClick={() => markNotificationRead(n.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          {n.text}
                        </div>
                      ))
                    ) : (
                      <div className="dashboard__notification-item text-center text-muted" style={{ padding: 'var(--sp-4)' }}>
                        No notifications
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                  { icon: Calendar, label: 'Sessions Done', value: completedSessionsCount, color: 'var(--clr-primary)' },
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
                {displaySessions.length > 0 ? (
                  <div className="flex-col gap-3">
                    {displaySessions.map(session => (
                      <div key={session.id} className="session-card" id={`session-${session.id}`}>
                        <div className="avatar avatar-md" style={{ overflow: 'hidden', border: '1px solid var(--clr-border)' }}>
                          {(() => {
                            const mentor = MOCK_MENTORS.find(m => m.displayName === session.mentor);
                            return mentor?.photoURL ? (
                              <img src={mentor.photoURL} alt={session.mentor} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              getInitials(session.mentor)
                            );
                          })()}
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
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => handleJoinSession(session.mentor, session.id)}
                          >
                            Join
                          </button>
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
                      <div className="avatar avatar-lg" style={{ background: `hsl(${i * 80 + 40}, 60%, 40%)`, overflow: 'hidden' }}>
                        {mentor.photoURL ? (
                          <img src={mentor.photoURL} alt={mentor.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          getInitials(mentor.displayName)
                        )}
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
                    { label: 'Profile complete', value: profileCompleteness },
                    { label: 'Onboarding done', value: onboardingProgress },
                    { label: 'Sessions attended', value: sessionsProgress },
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

      {activeSessionId && (
        <div className="video-modal-overlay">
          <div className="video-modal-card animate-fadeInUp">
            <div className="video-modal-header">
              <span className="video-modal-title">Live Video Room — {sessionMentorName}</span>
              <button 
                type="button"
                className="btn btn-ghost btn-sm video-modal-close-btn" 
                onClick={() => setActiveSessionId(null)}
                aria-label="Close video room"
              >
                <X size={20} />
              </button>
            </div>
            <VideoRoom 
              sessionId={activeSessionId}
              userName={user?.displayName || 'Client'}
              guideName={sessionMentorName}
              onLeave={() => setActiveSessionId(null)}
            />
          </div>
        </div>
      )}

    </div>
  )
}
