import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, Users, Star, XCircle, Edit3, Trash2, Video } from 'lucide-react'
import { useAuthStore } from '../../stores'
import { getInitials } from '../../utils'
// @ts-ignore
import { getGuideAllBookings, acceptBookingRequest, declineBookingRequest, createGuideSlot, deleteGuideSlot, completeBookingSession } from '../../lib/bookingService'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import VideoRoom from '../../components/VideoRoom'
import './MentorPortal.css'

export default function MentorPortalPage() {
  const { user } = useAuthStore()
  
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'calendar' | 'earnings'>('overview')
  const [bookings, setBookings] = useState<any[]>([])
  const [slots, setSlots] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Slot management form state
  const [newSlotDate, setNewSlotDate] = useState('')
  const [newSlotTime, setNewSlotTime] = useState('10:00')
  const [newSlotDuration, setNewSlotDuration] = useState(60)
  const [creatingSlot, setCreatingSlot] = useState(false)
  
  // Video room state
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  // 1. Subscribe to Bookings in real-time
  useEffect(() => {
    if (!user?.uid) return

    const bookingsRef = collection(db, 'bookings')
    const q = query(bookingsRef, where('guideId', '==', user.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => {
        const t1 = a.createdAt?.toDate?.() || a.createdAt || new Date(0)
        const t2 = b.createdAt?.toDate?.() || b.createdAt || new Date(0)
        return t2 - t1 // descending
      })
      setBookings(list)
      setLoadingBookings(false)
    }, (err) => {
      console.error("Failed to listen to bookings:", err)
      setLoadingBookings(false)
    })

    return () => unsubscribe()
  }, [user?.uid])

  // 2. Subscribe to Slots in real-time
  useEffect(() => {
    if (!user?.uid) return

    const slotsRef = collection(db, 'guide_slots')
    const q = query(slotsRef, where('guideId', '==', user.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => {
        const keyA = `${a.date || ''} ${a.time || ''}`
        const keyB = `${b.date || ''} ${b.time || ''}`
        return keyA.localeCompare(keyB) // ascending by date/time
      })
      setSlots(list)
      setLoadingSlots(false)
    }, (err) => {
      console.error("Failed to listen to slots:", err)
      setLoadingSlots(false)
    })

    return () => unsubscribe()
  }, [user?.uid])

  // 3. Subscribe to Sessions in real-time
  useEffect(() => {
    if (!user?.uid) return

    const sessionsRef = collection(db, 'sessions')
    const q = query(sessionsRef, where('guideId', '==', user.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setSessions(list)
    }, (err) => {
      console.error("Failed to listen to sessions:", err)
    })

    return () => unsubscribe()
  }, [user?.uid])

  // ── Actions ──────────────────────────────────────────
  
  const handleAcceptRequest = async (bookingId: string) => {
    setActionLoading(bookingId)
    try {
      await acceptBookingRequest(bookingId)
    } catch (err) {
      console.error('Failed to accept request:', err)
      alert('Failed to accept booking request.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeclineRequest = async (bookingId: string) => {
    setActionLoading(bookingId)
    try {
      await declineBookingRequest(bookingId)
    } catch (err) {
      console.error('Failed to decline request:', err)
      alert('Failed to decline booking request.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCompleteSession = async (bookingId: string, sessionId: string) => {
    setActionLoading(bookingId)
    try {
      await completeBookingSession(bookingId, sessionId)
      alert('Session marked as completed successfully!')
    } catch (err) {
      console.error('Failed to complete session:', err)
      alert('Failed to complete session.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.uid) return
    setCreatingSlot(true)
    try {
      await createGuideSlot({
        guideId: user.uid,
        date: newSlotDate,
        time: newSlotTime,
        duration: newSlotDuration
      })
      // Reset form
      setNewSlotDate('')
      setNewSlotTime('10:00')
    } catch (err) {
      console.error('Failed to create slot:', err)
      alert('Failed to add availability slot.')
    } finally {
      setCreatingSlot(false)
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    if (!window.confirm('Are you sure you want to delete this availability slot?')) return
    try {
      await deleteGuideSlot(slotId)
    } catch (err: any) {
      console.error('Failed to delete slot:', err)
      alert(err.message || 'Failed to delete slot.')
    }
  }

  // ── Stats Calculations ───────────────────────────────
  
  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'paid' || b.status === 'completed')
  
  const totalSessionsThisMonth = activeBookings.length
  
  const uniqueClientsCount = new Set(bookings.map(b => b.userId)).size
  
  const ratedSessions = sessions.filter(s => s.userRating != null)
  const avgRating = ratedSessions.length > 0
    ? (ratedSessions.reduce((acc, s) => acc + s.userRating, 0) / ratedSessions.length).toFixed(1)
    : '4.9'

  const pendingRequests = bookings.filter(b => b.status === 'pending')
  const upcomingSessions = bookings.filter(b => b.status === 'confirmed' || b.status === 'paid')
  const completedSessions = bookings.filter(b => b.status === 'completed')

  const stats = [
    { icon: CalendarIcon, label: 'Sessions Confirmed/Completed', value: String(totalSessionsThisMonth), color: 'var(--clr-primary)', change: 'Live' },
    { icon: Users, label: 'Total Clients', value: String(uniqueClientsCount), color: 'var(--clr-accent)', change: 'Live' },
    { icon: Star, label: 'Avg Rating', value: avgRating, color: 'var(--clr-secondary)', change: ratedSessions.length > 0 ? `${ratedSessions.length} ratings` : 'Default' },
  ]

  return (
    <div className="page-wrapper">
      <div className="mentor-portal">
        <div className="container">
          <div className="mentor-portal__header animate-scaleIn">
            <div>
              <div className="badge badge-primary" style={{ marginBottom: 'var(--sp-2)' }}>Mentor Dashboard</div>
              <h1 className="display-2">Welcome back, <span className="text-gradient">{user?.displayName || 'Mentor'}</span> 👋</h1>
              <p className="text-muted">You have <strong>{pendingRequests.length} pending requests</strong> awaiting your response.</p>
            </div>
            <button className="btn btn-outline" id="edit-profile-btn" onClick={() => alert("Profile editing will be connected by your senior developer.")}>
              <Edit3 size={16} /> Manage Profile
            </button>
          </div>

          {/* Tabs */}
          <div className="mentor-portal__tabs animate-fadeInUp">
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

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="mentor-portal__content">
              {/* Stats Cards */}
              <div className="mentor-portal__stats animate-scaleIn">
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
                <div className="portal-section animate-fadeInUp">
                  <h2 className="heading-2">Pending Requests</h2>
                  <div className="flex-col gap-3" style={{ marginTop: 'var(--sp-4)' }}>
                    {loadingBookings ? (
                      <p className="text-muted">Loading requests...</p>
                    ) : pendingRequests.length > 0 ? (
                      pendingRequests.map(req => (
                        <div key={req.id} className="request-card" id={`request-${req.id}`}>
                          <div className="avatar avatar-md" style={{ background: 'var(--clr-primary)' }}>
                            {getInitials(req.userId.substring(0, 5))}
                          </div>
                          <div className="request-card__info">
                            <p className="request-card__user">Client (ID: {req.userId.substring(0, 6)})</p>
                            <div className="flex gap-3">
                              <span className="body-sm text-muted">{req.domain}</span>
                              <span className="body-sm text-muted"><Clock size={12} style={{ display: 'inline' }} /> {req.sessionDate}, {req.sessionTime}</span>
                            </div>
                            {req.issueSummary && (
                              <p className="body-sm text-muted" style={{ marginTop: '4px', fontStyle: 'italic' }}>
                                "{req.issueSummary}"
                              </p>
                            )}
                          </div>
                          <div className="request-card__actions">
                            <button 
                              className="btn btn-primary btn-sm" 
                              onClick={() => handleAcceptRequest(req.id)} 
                              id={`accept-${req.id}`}
                              disabled={actionLoading === req.id}
                            >
                              Accept
                            </button>
                            <button 
                              className="btn btn-ghost btn-sm" 
                              onClick={() => handleDeclineRequest(req.id)} 
                              id={`decline-${req.id}`}
                              disabled={actionLoading === req.id}
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted" style={{ padding: '2rem 0' }}>No pending requests.</p>
                    )}
                  </div>
                </div>

                {/* Upcoming Sessions */}
                <div className="portal-section animate-fadeInUp">
                  <h2 className="heading-2">Upcoming Sessions</h2>
                  <div className="flex-col gap-3" style={{ marginTop: 'var(--sp-4)' }}>
                    {loadingBookings ? (
                      <p className="text-muted">Loading sessions...</p>
                    ) : upcomingSessions.length > 0 ? (
                      upcomingSessions.map(session => (
                        <div key={session.id} className="request-card" id={`upcoming-${session.id}`}>
                          <div className="avatar avatar-md" style={{ background: 'var(--clr-secondary)' }}>
                            {getInitials(session.userId.substring(0, 5))}
                          </div>
                          <div className="request-card__info">
                            <p className="request-card__user">Client (ID: {session.userId.substring(0, 6)})</p>
                            <div className="flex gap-3">
                              <span className="body-sm text-muted">{session.domain}</span>
                              <span className="body-sm text-muted"><Clock size={12} style={{ display: 'inline' }} /> {session.sessionDate}, {session.sessionTime}</span>
                            </div>
                          </div>
                          <div className="request-card__actions" style={{ flexDirection: 'column', gap: '4px' }}>
                            <button 
                              className="btn btn-primary btn-sm" 
                              onClick={() => setActiveSessionId(session.sessionId)} 
                              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Video size={14} /> Start Call
                            </button>
                            <button 
                              className="btn btn-outline btn-sm" 
                              onClick={() => handleCompleteSession(session.id, session.sessionId)}
                              disabled={actionLoading === session.id}
                              style={{ fontSize: '0.75rem', height: '28px' }}
                            >
                              Complete
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted" style={{ padding: '2rem 0' }}>No upcoming sessions.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REQUESTS TAB */}
          {activeTab === 'requests' && (
            <div className="portal-section animate-fadeInUp" style={{ marginTop: 'var(--sp-6)' }}>
              <h2 className="heading-2">All Booking Logs & Requests</h2>
              <div className="flex-col gap-3" style={{ marginTop: 'var(--sp-4)' }}>
                {loadingBookings ? (
                  <p className="text-muted">Loading log...</p>
                ) : bookings.length > 0 ? (
                  bookings.map(req => (
                    <div key={req.id} className="request-card" id={`req-all-${req.id}`}>
                      <div className="avatar avatar-md" style={{ background: 'var(--clr-primary)' }}>
                        {getInitials(req.userId.substring(0, 5))}
                      </div>
                      <div className="request-card__info">
                        <p className="request-card__user">Client (ID: {req.userId.substring(0, 6)})</p>
                        <div className="flex gap-3">
                          <span className="body-sm text-muted">{req.domain}</span>
                          <span className="body-sm text-muted">{req.sessionDate}, {req.sessionTime}</span>
                        </div>
                      </div>
                      <span className={`badge ${req.status === 'confirmed' || req.status === 'paid' ? 'badge-primary' : req.status === 'cancelled' ? 'badge-accent' : req.status === 'completed' ? 'badge-secondary' : 'badge-secondary'}`}>
                        {req.status}
                      </span>
                      {req.status === 'pending' && (
                        <div className="request-card__actions">
                          <button className="btn btn-primary btn-sm" onClick={() => handleAcceptRequest(req.id)} disabled={actionLoading === req.id}>Accept</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleDeclineRequest(req.id)} disabled={actionLoading === req.id}>Decline</button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted" style={{ padding: '2rem 0' }}>No bookings or requests found.</p>
                )}
              </div>
            </div>
          )}

          {/* CALENDAR TAB */}
          {activeTab === 'calendar' && (
            <div className="portal-section animate-fadeInUp" style={{ marginTop: 'var(--sp-6)' }}>
              <div className="flex-between" style={{ marginBottom: 'var(--sp-4)' }}>
                <h2 className="heading-2">Manage Availability Slots</h2>
              </div>
              
              {/* Slot Creation Form */}
              <form onSubmit={handleCreateSlot} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)', background: 'var(--clr-bg-alt)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--clr-border)' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={newSlotDate} onChange={e => setNewSlotDate(e.target.value)} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Time</label>
                  <input type="time" className="form-input" value={newSlotTime} onChange={e => setNewSlotTime(e.target.value)} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Duration (mins)</label>
                  <select className="form-input" value={newSlotDuration} onChange={e => setNewSlotDuration(Number(e.target.value))}>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                    <option value={90}>90 mins</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '42px' }} disabled={creatingSlot}>
                    {creatingSlot ? 'Adding...' : 'Add Slot'}
                  </button>
                </div>
              </form>

              {/* Slots List */}
              <div className="flex-col gap-3">
                {loadingSlots ? (
                  <p className="text-muted">Loading slots...</p>
                ) : slots.length > 0 ? (
                  slots.map(slot => (
                    <div key={slot.id} className="request-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.25rem' }}>📅</span>
                        <div>
                          <p style={{ fontWeight: 600 }}>{slot.date}</p>
                          <p className="body-sm text-muted">Time: {slot.time} ({slot.duration} mins)</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
                        <span className={`badge ${slot.isBooked ? 'badge-primary' : 'badge-secondary'}`}>
                          {slot.isBooked ? 'Booked' : 'Available'}
                        </span>
                        {!slot.isBooked && (
                          <button 
                            type="button" 
                            className="btn btn-ghost btn-sm" 
                            onClick={() => handleDeleteSlot(slot.id)} 
                            style={{ color: 'var(--clr-accent)', borderColor: 'var(--clr-accent)', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted" style={{ padding: '2rem 0' }}>No availability slots defined. Use the form above to add your first slot!</p>
                )}
              </div>
            </div>
          )}

          {/* EARNINGS TAB */}
          {activeTab === 'earnings' && (
            <div className="portal-section animate-fadeInUp" style={{ marginTop: 'var(--sp-6)' }}>
              <div className="flex-between" style={{ marginBottom: 'var(--sp-4)' }}>
                <h2 className="heading-2">Session Records</h2>
              </div>

              <div className="earnings-summary" style={{ marginBottom: 'var(--sp-6)' }}>
                <div className="earnings-summary__item">
                  <p className="body-sm text-muted">Completed Sessions</p>
                  <p className="earnings-summary__value">{completedSessions.length}</p>
                </div>
                <div className="earnings-summary__item">
                  <p className="body-sm text-muted">Upcoming Sessions</p>
                  <p className="earnings-summary__value text-gradient">{upcomingSessions.length}</p>
                </div>
                <div className="earnings-summary__item">
                  <p className="body-sm text-muted">Confirmed Sessions</p>
                  <p className="earnings-summary__value">{activeBookings.length}</p>
                </div>
                <div className="earnings-summary__item">
                  <p className="body-sm text-muted">Pending Requests</p>
                  <p className="earnings-summary__value" style={{ color: 'var(--clr-secondary)' }}>
                    {pendingRequests.length}
                  </p>
                </div>
              </div>

              <h3 className="heading-3" style={{ marginBottom: 'var(--sp-3)' }}>Session History</h3>
              <div className="flex-col gap-3">
                {activeBookings.length > 0 ? (
                  activeBookings.map(b => (
                    <div key={b.id} className="request-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: 600 }}>{b.domain}</p>
                        <p className="body-sm text-muted">Client: ID {b.userId.substring(0, 6)} · Date: {b.sessionDate}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className={`badge ${b.status === 'completed' ? 'badge-primary' : 'badge-secondary'}`} style={{ fontSize: '0.75rem', padding: '2px 6px' }}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted" style={{ padding: '2rem 0' }}>No payment transactions found.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Call Modal */}
      {activeSessionId && (
        <div className="video-modal-overlay">
          <div className="video-modal-card animate-fadeInUp">
            <div className="video-modal-header">
              <span className="video-modal-title">Live Video Room — Session Call</span>
              <button 
                type="button"
                className="btn btn-ghost btn-sm video-modal-close-btn" 
                onClick={() => setActiveSessionId(null)}
                aria-label="Close video room"
              >
                <XCircle size={20} />
              </button>
            </div>
            <VideoRoom 
              sessionId={activeSessionId}
              userName={user?.displayName || 'Mentor'}
              guideName="Client"
              onLeave={() => setActiveSessionId(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
