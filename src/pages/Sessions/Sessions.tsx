import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, BookOpen, Star, MessageSquare, Video, X } from 'lucide-react'
import { getInitials, MOCK_MENTORS } from '../../utils'
import { useAuthStore } from '../../stores'
// @ts-ignore
import { getUserBookings } from '../../lib/bookingService'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import VideoRoom from '../../components/VideoRoom'
import './Sessions.css'

const SESSIONS = [
  { id: 's1', mentor: 'Priya Sharma', domain: 'Career & Purpose', date: 'Tomorrow', time: '4:00 PM', duration: 60, status: 'confirmed', price: 349, meetingLink: '#' },
  { id: 's2', mentor: 'Rahul Verma', domain: 'Emotional Well-being', date: 'Jun 2, 2025', time: '11:00 AM', duration: 50, status: 'pending', price: 299, meetingLink: null },
]

const PAST_SESSIONS = [
  { id: 'ps1', mentor: 'Anika Patel', domain: 'Personal Growth', date: 'May 15, 2025', duration: 60, status: 'completed', price: 399, rating: 5, hasRated: true },
  { id: 'ps2', mentor: 'Dr. Sanjay Mehta', domain: 'Communication', date: 'May 8, 2025', duration: 50, status: 'completed', price: 349, rating: null, hasRated: false },
]

export default function SessionsPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [ratings, setRatings] = useState<Record<string, number>>({})
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [sessionMentorName, setSessionMentorName] = useState('Priya Sharma')
  const [bookings, setBookings] = useState<any[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)

  const handleRateSession = async (bookingId: string, ratingValue: number) => {
    setRatings(prev => ({ ...prev, [bookingId]: ratingValue }))
    
    // Update local bookings state
    setBookings(prev => prev.map(b => {
      const currentId = b.id || b.bookingId
      if (currentId === bookingId) {
        return { ...b, rating: ratingValue }
      }
      return b
    }))

    if (bookingId.startsWith('ps')) {
      console.log('Skipping Firestore rating sync for mock past session')
      return
    }

    try {
      const bookingRef = doc(db, 'bookings', bookingId)
      await updateDoc(bookingRef, { rating: ratingValue })
      console.log(`Successfully persisted rating ${ratingValue} for booking ${bookingId}`)
    } catch (err) {
      console.error('Failed to sync rating with Firestore:', err)
    }
  }

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
        price: b.price || b.finalAmount,
        meetingLink: b.status === 'confirmed' ? '#' : null
      }
    })

  const pastSessions = bookings
    .filter(b => b.status === 'completed')
    .map(b => {
      const mentor = MOCK_MENTORS.find(m => m.uid === b.guideId)
      return {
        id: b.id || b.bookingId,
        mentor: mentor?.displayName || 'LifeFundies Mentor',
        domain: b.domain,
        date: b.sessionDate,
        duration: b.sessionDuration,
        status: 'completed',
        price: b.price || b.finalAmount,
        rating: b.rating || null,
        hasRated: !!b.rating
      }
    })

  const displayUpcoming = upcomingSessions
  const displayPast = pastSessions

  const handleJoinSession = (mentorName: string, id: string) => {
    setSessionMentorName(mentorName)
    setActiveSessionId(id)
  }

  return (
    <div className="page-wrapper">
      <div className="sessions-page">
        <div className="container">
          <div className="sessions-page__header animate-fadeInUp">
            <div>
              <h1 className="display-2">My <span className="text-gradient">Sessions</span></h1>
              <p className="text-muted">Track your guidance journey</p>
            </div>
            <Link to="/mentors" className="btn btn-primary" id="book-new-session">
              Book New Session
            </Link>
          </div>

          <div className="community__tabs animate-fadeInUp delay-100" style={{ marginBottom: 'var(--sp-6)' }}>
            <button className={`community__tab ${activeTab === 'upcoming' ? 'community__tab--active' : ''}`} onClick={() => setActiveTab('upcoming')} id="tab-upcoming">
              <Calendar size={14} /> Upcoming ({displayUpcoming.length})
            </button>
            <button className={`community__tab ${activeTab === 'past' ? 'community__tab--active' : ''}`} onClick={() => setActiveTab('past')} id="tab-past">
              <BookOpen size={14} /> Past ({displayPast.length})
            </button>
          </div>

          {activeTab === 'upcoming' && (
            <div className="sessions-list animate-fadeInUp delay-200">
              {displayUpcoming.map(session => (
                <div key={session.id} className="session-detail-card" id={`session-detail-${session.id}`}>
                  <div className="session-detail-card__left">
                    <div className="avatar avatar-xl" style={{ overflow: 'hidden', border: '1px solid var(--clr-border)' }}>
                      {(() => {
                        const mentor = MOCK_MENTORS.find(m => m.displayName === session.mentor);
                        return mentor?.photoURL ? (
                          <img src={mentor.photoURL} alt={session.mentor} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          getInitials(session.mentor)
                        );
                      })()}
                    </div>
                    <span className={`badge ${session.status === 'confirmed' ? 'badge-primary' : 'badge-secondary'}`}>
                      {session.status}
                    </span>
                  </div>
                  <div className="session-detail-card__info">
                    <h3 className="heading-3">{session.mentor}</h3>
                    <p className="body-sm text-muted">{session.domain}</p>
                    <div className="session-detail-card__meta">
                      <span><Calendar size={14} /> {session.date}</span>
                      <span><Clock size={14} /> {session.time}</span>
                      <span><BookOpen size={14} /> {session.duration} min</span>
                    </div>
                  </div>
                  <div className="session-detail-card__actions">
                    <p style={{ fontWeight: 700, color: 'var(--clr-primary-light)', marginBottom: 'var(--sp-3)' }}>₹{session.price}</p>
                    {session.status === 'confirmed' ? (
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleJoinSession(session.mentor, session.id)}
                        id={`join-${session.id}`}
                      >
                        <Video size={16} /> Join Session
                      </button>
                    ) : (
                      <button className="btn btn-outline" disabled>Awaiting Confirmation</button>
                    )}
                    <button className="btn btn-ghost btn-sm">Reschedule</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'past' && (
            <div className="sessions-list animate-fadeInUp delay-200">
              {displayPast.map(session => (
                <div key={session.id} className="session-detail-card session-detail-card--past" id={`past-session-${session.id}`}>
                  <div className="session-detail-card__left">
                    <div className="avatar avatar-xl" style={{ overflow: 'hidden', border: '1px solid var(--clr-border)' }}>
                      {(() => {
                        const mentor = MOCK_MENTORS.find(m => m.displayName === session.mentor);
                        return mentor?.photoURL ? (
                          <img src={mentor.photoURL} alt={session.mentor} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          getInitials(session.mentor)
                        );
                      })()}
                    </div>
                    <span className="badge badge-secondary">Completed</span>
                  </div>
                  <div className="session-detail-card__info">
                    <h3 className="heading-3">{session.mentor}</h3>
                    <p className="body-sm text-muted">{session.domain}</p>
                    <div className="session-detail-card__meta">
                      <span><Calendar size={14} /> {session.date}</span>
                      <span><Clock size={14} /> {session.duration} min</span>
                    </div>
                    {session.hasRated && session.rating && (
                      <div className="stars" style={{ marginTop: 'var(--sp-2)' }}>
                        {Array.from({ length: session.rating }).map((_, i) => <span key={i} className="star">★</span>)}
                        <span className="body-sm text-muted" style={{ marginLeft: 'var(--sp-2)' }}>Your rating</span>
                      </div>
                    )}
                    {!session.hasRated && (
                      <div className="session-rate">
                        <p className="body-sm text-muted">Rate this session:</p>
                        <div className="stars">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button
                              key={i}
                              className={`star-btn ${(ratings[session.id] || 0) > i ? 'star-btn--active' : ''}`}
                              onClick={() => handleRateSession(session.id, i + 1)}
                              aria-label={`Rate ${i + 1} stars`}
                            >★</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="session-detail-card__actions">
                    <p style={{ fontWeight: 700, color: 'var(--clr-primary-light)', marginBottom: 'var(--sp-3)' }}>₹{session.price}</p>
                    <Link to="/mentors" className="btn btn-outline btn-sm" id={`rebook-${session.id}`}>
                      Book Again
                    </Link>
                    <button className="btn btn-ghost btn-sm" id={`notes-${session.id}`}>
                      <MessageSquare size={14} /> View Notes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {((activeTab === 'upcoming' && displayUpcoming.length === 0) || (activeTab === 'past' && displayPast.length === 0)) && (
            <div className="sessions-page__empty">
              <Calendar size={48} style={{ color: 'var(--clr-text-subtle)' }} />
              <h3 className="heading-2">No sessions yet</h3>
              <p className="text-muted">Start your journey by booking your first session</p>
              <Link to="/mentors" className="btn btn-primary">Find a Mentor</Link>
            </div>
          )}
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
