import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, Users, Star, XCircle, Edit3, Trash2, Video, Save, FileText, StickyNote, IndianRupee, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../../stores'
import { getInitials } from '../../utils'
import {
  acceptBookingRequest,
  declineBookingRequest,
  createGuideSlot,
  deleteGuideSlot,
  completeBookingSessionWithSummary,
  getGuideBookings,
  getGuideSlotsAll,
  getSessionsForGuide,
  getGuideNotesForLFID,
  getGuideSessionHistoryForLFID,
  saveGuideSessionNote
} from '../../lib/bookingRepository'
import { publishMentorGuideProfile, updateMentorProfile } from '../../lib/userRepository'
import { MENTOR_CATEGORIES, getCategoryPrices, getSessionPrice, normalizeMentorCategories } from '../../lib/pricing'
import VideoRoom from '../../components/VideoRoom'

export default function MentorPortalPage() {
  const { user } = useAuthStore()

  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'calendar' | 'earnings' | 'profile'>('overview')
  const [bookings, setBookings] = useState<any[]>([])
  const [slots, setSlots] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])

  const [loadingBookings, setLoadingBookings] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Slot management form state
  const [newSlotDate, setNewSlotDate] = useState('')
  const [newSlotTime, setNewSlotTime] = useState('10:00')
  const [newSlotDuration, setNewSlotDuration] = useState(30)
  const [newSlotCategory, setNewSlotCategory] = useState('peer-buddy')
  const [creatingSlot, setCreatingSlot] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any | null>(null)
  const [lfidNotes, setLfidNotes] = useState<any[]>([])
  const [lfidHistory, setLfidHistory] = useState<any[]>([])
  const [preparingSession, setPreparingSession] = useState(false)
  const [privateNote, setPrivateNote] = useState('')
  const [completionForm, setCompletionForm] = useState({ summary: '', recommendations: '', followUp: '' })
  const [profileForm, setProfileForm] = useState({
    photoURL: '',
    fullName: '',
    displayName: '',
    bio: '',
    qualification: '',
    experience: '',
    languages: '',
    expertise: '',
    certifications: '',
    categories: ['peer-buddy'] as string[],
  })

  // Video room state
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setProfileForm({
      photoURL: (user as any).photoURL || '',
      fullName: (user as any).fullName || user.displayName || '',
      displayName: user.displayName || '',
      bio: (user as any).bio || '',
      qualification: (user as any).qualification || (user as any).education || '',
      experience: String((user as any).experience || (user as any).yearsOfExperience || ''),
      languages: ((user as any).languages || (user as any).languagesKnown || []).join(', '),
      expertise: ((user as any).expertise || (user as any).expertiseDomains || []).join(', '),
      certifications: ((user as any).certifications || []).join(', '),
      categories: normalizeMentorCategories((user as any).categories),
    })
  }, [user])


  const fetchPortalData = async () => {
    if (!user?.uid) return
    try {
      setLoadingBookings(true)
      setLoadingSlots(true)
      const [bookingsData, slotsData, sessionsData] = await Promise.all([
        getGuideBookings(user.uid),
        getGuideSlotsAll(user.uid),
        getSessionsForGuide(user.uid)
      ])
      setBookings(bookingsData)
      setSlots(slotsData)
      setSessions(sessionsData)
    } catch (err) {
      console.error('Error fetching portal data:', err)
    } finally {
      setLoadingBookings(false)
      setLoadingSlots(false)
    }
  }

  useEffect(() => {
    fetchPortalData()
  }, [user?.uid])

  useEffect(() => {
    if (!user?.uid || user.role !== 'mentor') return
    publishMentorGuideProfile(user.uid, user).catch((error) => {
      console.error('Failed to publish mentor profile:', error)
    })
  }, [user?.uid, user?.role, user?.displayName])



  const handleAcceptRequest = async (bookingId: string) => {
    setActionLoading(bookingId)
    try {
      await acceptBookingRequest(bookingId)
      await fetchPortalData()
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
      await fetchPortalData()
    } catch (err) {
      console.error('Failed to decline request:', err)
      alert('Failed to decline booking request.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleOpenPreparation = async (session: any) => {
    if (!user?.uid || !session?.userId) return
    setSelectedSession(session)
    setPreparingSession(true)
    try {
      const [notesData, historyData] = await Promise.all([
        getGuideNotesForLFID(user.uid, session.userId),
        getGuideSessionHistoryForLFID(user.uid, session.userId),
      ])
      setLfidNotes(notesData)
      setLfidHistory(historyData)
      setCompletionForm({
        summary: session.completionSummary || '',
        recommendations: session.recommendations || '',
        followUp: session.followUpSuggestions || '',
      })
      setPrivateNote('')
    } finally {
      setPreparingSession(false)
    }
  }

  const handleSavePrivateNote = async () => {
    if (!user?.uid || !selectedSession?.userId || !privateNote.trim()) return
    setActionLoading(selectedSession.id)
    try {
      await saveGuideSessionNote({
        guideId: user.uid,
        userId: selectedSession.userId,
        bookingId: selectedSession.id,
        sessionId: selectedSession.sessionId,
        note: privateNote.trim(),
      })
      setPrivateNote('')
      const notesData = await getGuideNotesForLFID(user.uid, selectedSession.userId)
      setLfidNotes(notesData)
    } catch (error) {
      console.error('Failed to save private note:', error)
      alert('Failed to save private note.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCompleteSession = async (session: any) => {
    if (!user?.uid) return
    if (!completionForm.summary.trim()) {
      alert('Add a session summary before completing.')
      return
    }

    setActionLoading(session.id)
    try {
      await completeBookingSessionWithSummary({
        bookingId: session.id,
        sessionId: session.sessionId,
        guideId: user.uid,
        userId: session.userId,
        summary: completionForm.summary.trim(),
        recommendations: completionForm.recommendations.trim(),
        followUp: completionForm.followUp.trim(),
        privateNote: privateNote.trim(),
      })
      alert('Session completed with summary and earnings marked pending.')
      setSelectedSession(null)
      setPrivateNote('')
      setCompletionForm({ summary: '', recommendations: '', followUp: '' })
      await fetchPortalData()
    } catch (err) {
      console.error('Failed to complete session:', err)
      alert('Failed to complete session.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleQuickCompleteSession = async (session: any) => {
    setSelectedSession(session)
    setCompletionForm({
      summary: session.completionSummary || '',
      recommendations: session.recommendations || '',
      followUp: session.followUpSuggestions || '',
    })
    await handleOpenPreparation(session)
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
        duration: newSlotDuration,
        category: newSlotCategory,
        price: getSessionPrice(newSlotCategory, newSlotDuration)
      })
      // Reset form
      setNewSlotDate('')
      setNewSlotTime('10:00')
      await fetchPortalData()
    } catch (err) {
      console.error('Failed to create slot:', err)
      alert('Failed to add availability slot.')
    } finally {
      setCreatingSlot(false)
    }
  }

  const toggleProfileCategory = (categoryId: string) => {
    setProfileForm(prev => {
      const exists = prev.categories.includes(categoryId)
      const categories = exists ? prev.categories.filter(id => id !== categoryId) : [...prev.categories, categoryId]
      return { ...prev, categories }
    })
  }

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user?.uid) return
    if (profileForm.categories.length === 0) {
      alert('Select at least one mentor category.')
      return
    }

    setSavingProfile(true)
    try {
      await updateMentorProfile(user.uid, profileForm)
      alert('Mentor profile updated.')
    } catch (error) {
      console.error('Failed to save mentor profile:', error)
      alert('Failed to save mentor profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    if (!window.confirm('Are you sure you want to delete this availability slot?')) return
    try {
      await deleteGuideSlot(slotId)
      await fetchPortalData()
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
  const todayKey = new Date().toISOString().split('T')[0]
  const todaysSessions = upcomingSessions.filter(b => b.sessionDate === todayKey)
  const pendingEarnings = completedSessions.reduce((sum, b) => sum + Number(b.earningAmount || b.finalAmount || b.price || 0), 0)
  const guideStatus = (user as any)?.guideStatus || ((user as any)?.role === 'mentor' ? 'verified' : 'inactive')
  const profileComplete = Boolean((user as any)?.bio && (user as any)?.expertise?.length && (user as any)?.languages?.length)
  const isActiveGuide = profileComplete && slots.some(slot => slot.isActive !== false && slot.isBlocked !== true && !slot.isBooked)

  const stats = [
    { icon: CalendarIcon, label: 'Sessions Confirmed/Completed', value: String(totalSessionsThisMonth), color: 'var(--clr-primary)', change: 'Live' },
    { icon: Users, label: 'Total Clients', value: String(uniqueClientsCount), color: 'var(--clr-accent)', change: 'Live' },
    { icon: Star, label: 'Avg Rating', value: avgRating, color: 'var(--clr-secondary)', change: ratedSessions.length > 0 ? `${ratedSessions.length} ratings` : 'Default' },
    { icon: IndianRupee, label: 'Pending Earnings', value: `Rs ${pendingEarnings}`, color: 'var(--clr-purple)', change: 'After completion' },
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
            <button className="btn btn-outline" id="edit-profile-btn" onClick={() => setActiveTab('profile')}>
              <Edit3 size={16} /> Manage Profile
            </button>
          </div>

          <div className="mentor-portal__stats animate-fadeInUp" style={{ marginBottom: 'var(--sp-6)' }}>
            {[
              { label: 'Verification', value: guideStatus === 'verified' || guideStatus === 'profile_complete' ? 'Verified' : 'Inactive', done: guideStatus !== 'inactive' },
              { label: 'Profile', value: profileComplete ? 'Complete' : 'Needs setup', done: profileComplete },
              { label: 'Availability', value: isActiveGuide ? 'Active' : 'Add slots', done: isActiveGuide },
              { label: 'Privacy', value: 'LFID only', done: true },
            ].map(item => (
              <div key={item.label} className="mentor-stat-card">
                <div className="mentor-stat-card__icon" style={{ background: item.done ? 'var(--clr-primary-glow)' : 'var(--clr-accent-glow)', color: item.done ? 'var(--clr-primary)' : 'var(--clr-accent-dark)' }}>
                  <CheckCircle size={18} />
                </div>
                <div>
                  <p className="mentor-stat-card__value" style={{ fontSize: '1rem' }}>{item.value}</p>
                  <p className="body-sm text-muted">{item.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mentor-portal__tabs animate-fadeInUp">
            {(['overview', 'requests', 'calendar', 'earnings', 'profile'] as const).map(tab => (
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
                          <div className="avatar avatar-md" style={{ overflow: 'hidden', border: '1px solid var(--clr-border)' }}>
                            {getInitials(req.lfid || req.clientName || 'LF')}
                          </div>
                          <div className="request-card__info">
                            <p className="request-card__user">{req.lfid || req.clientName}</p>
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
                          <div className="avatar avatar-md" style={{ overflow: 'hidden', border: '1px solid var(--clr-border)' }}>
                            {getInitials(session.lfid || session.clientName || 'LF')}
                          </div>
                          <div className="request-card__info">
                            <p className="request-card__user">{session.lfid || session.clientName}</p>
                            <div className="flex gap-3">
                              <span className="body-sm text-muted">{session.domain}</span>
                              <span className="body-sm text-muted"><Clock size={12} style={{ display: 'inline' }} /> {session.sessionDate}, {session.sessionTime}</span>
                            </div>
                            {session.issueSummary && <p className="body-sm text-muted" style={{ marginTop: 4 }}>{session.issueSummary}</p>}
                          </div>
                          <div className="request-card__actions" style={{ flexDirection: 'column', gap: '4px' }}>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleOpenPreparation(session)}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <FileText size={14} /> Prepare
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setActiveSessionId(session.sessionId)}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Video size={14} /> Start Call
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleQuickCompleteSession(session)}
                              disabled={actionLoading === session.id}
                              style={{ fontSize: '0.75rem', height: '28px' }}
                            >
                              Complete Flow
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

              <div className="portal-section animate-fadeInUp">
                <h2 className="heading-2">Today's Sessions</h2>
                <div className="flex-col gap-3" style={{ marginTop: 'var(--sp-4)' }}>
                  {todaysSessions.length > 0 ? todaysSessions.map(session => (
                    <div key={`today-${session.id}`} className="request-card">
                      <div className="request-card__info">
                        <p className="request-card__user">{session.lfid || session.clientName}</p>
                        <p className="body-sm text-muted">{session.domain} · {session.sessionTime}</p>
                      </div>
                      <button className="btn btn-outline btn-sm" onClick={() => handleOpenPreparation(session)}>Review LFID Details</button>
                    </div>
                  )) : (
                    <p className="text-center text-muted" style={{ padding: '1rem 0' }}>No sessions scheduled today.</p>
                  )}
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
                      <div className="avatar avatar-md" style={{ overflow: 'hidden', border: '1px solid var(--clr-border)' }}>
                        {getInitials(req.lfid || req.clientName || 'LF')}
                      </div>
                      <div className="request-card__info">
                        <p className="request-card__user">{req.lfid || req.clientName}</p>
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
                  <label className="form-label">Category</label>
                  <select
                    className="form-input"
                    value={newSlotCategory}
                    onChange={e => {
                      const categoryId = e.target.value
                      setNewSlotCategory(categoryId)
                      setNewSlotDuration(getCategoryPrices(categoryId)[0].duration)
                    }}
                  >
                    {normalizeMentorCategories((user as any)?.categories).map(categoryId => {
                      const category = MENTOR_CATEGORIES.find(item => item.id === categoryId)
                      return category ? <option key={category.id} value={category.id}>{category.label}</option> : null
                    })}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Duration (mins)</label>
                  <select className="form-input" value={newSlotDuration} onChange={e => setNewSlotDuration(Number(e.target.value))}>
                    {getCategoryPrices(newSlotCategory).map(option => (
                      <option key={option.duration} value={option.duration}>{option.duration} mins - Rs {option.price}</option>
                    ))}
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
                <h2 className="heading-2">Earnings</h2>
              </div>

              <div className="earnings-summary" style={{ marginBottom: 'var(--sp-6)' }}>
                <div className="earnings-summary__item">
                  <p className="body-sm text-muted">Completed Sessions</p>
                  <p className="earnings-summary__value">{completedSessions.length}</p>
                </div>
                <div className="earnings-summary__item">
                  <p className="body-sm text-muted">Pending Earnings</p>
                  <p className="earnings-summary__value text-gradient">Rs {pendingEarnings}</p>
                </div>
                <div className="earnings-summary__item">
                  <p className="body-sm text-muted">Available Balance</p>
                  <p className="earnings-summary__value">Rs 0</p>
                </div>
                <div className="earnings-summary__item">
                  <p className="body-sm text-muted">Payout Status</p>
                  <p className="earnings-summary__value" style={{ color: 'var(--clr-secondary)' }}>
                    Pending
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
                        <p className="body-sm text-muted">LFID: {b.lfid || b.clientName} · Date: {b.sessionDate}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700 }}>Rs {b.earningAmount || b.finalAmount || b.price || 0}</p>
                        <span className={`badge ${b.status === 'completed' ? 'badge-primary' : 'badge-secondary'}`} style={{ fontSize: '0.75rem', padding: '2px 6px' }}>
                          {b.status === 'completed' ? (b.earningStatus || 'pending earning') : b.status}
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

          {activeTab === 'profile' && (
            <div className="portal-section animate-fadeInUp" style={{ marginTop: 'var(--sp-6)' }}>
              <div className="flex-between" style={{ marginBottom: 'var(--sp-4)' }}>
                <h2 className="heading-2">Manage Profile</h2>
                <span className="badge badge-primary">{profileComplete ? 'Profile Complete' : 'Complete required sections'}</span>
              </div>
              <form onSubmit={handleSaveProfile} className="flex-col gap-4">
                <div className="auth-form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-photo">Profile Photo URL</label>
                    <input id="profile-photo" className="form-input" value={profileForm.photoURL} onChange={e => setProfileForm(prev => ({ ...prev, photoURL: e.target.value }))} placeholder={(user as any)?.photoURL || 'Google profile image is used by default'} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-full-name">Full Name</label>
                    <input id="profile-full-name" className="form-input" value={profileForm.fullName} onChange={e => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))} required />
                  </div>
                </div>
                <div className="auth-form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-display-name">Display Name</label>
                    <input id="profile-display-name" className="form-input" value={profileForm.displayName} onChange={e => setProfileForm(prev => ({ ...prev, displayName: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-qualification">Qualification</label>
                    <input id="profile-qualification" className="form-input" value={profileForm.qualification} onChange={e => setProfileForm(prev => ({ ...prev, qualification: e.target.value }))} required />
                  </div>
                </div>
                <div className="auth-form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-experience">Experience (years)</label>
                    <input id="profile-experience" type="number" min="0" className="form-input" value={profileForm.experience} onChange={e => setProfileForm(prev => ({ ...prev, experience: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-languages">Languages Known</label>
                    <input id="profile-languages" className="form-input" value={profileForm.languages} onChange={e => setProfileForm(prev => ({ ...prev, languages: e.target.value }))} placeholder="Hindi, English" required />
                  </div>
                </div>
                <div className="auth-form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-expertise">Expertise Domains</label>
                    <input id="profile-expertise" className="form-input" value={profileForm.expertise} onChange={e => setProfileForm(prev => ({ ...prev, expertise: e.target.value }))} placeholder="Career, Confidence" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-certifications">Certifications</label>
                    <input id="profile-certifications" className="form-input" value={profileForm.certifications} onChange={e => setProfileForm(prev => ({ ...prev, certifications: e.target.value }))} placeholder="Certification names, separated by commas" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-bio">Bio / About Me</label>
                  <textarea id="profile-bio" className="form-input" rows={4} value={profileForm.bio} onChange={e => setProfileForm(prev => ({ ...prev, bio: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Mentor Categories</label>
                  <div className="mentors-filters__chips">
                    {MENTOR_CATEGORIES.map(category => (
                      <button type="button" key={category.id} className={`ob-chip ${profileForm.categories.includes(category.id) ? 'ob-chip--active' : ''}`} onClick={() => toggleProfileCategory(category.id)}>
                        {category.label}
                      </button>
                    ))}
                  </div>
                  <p className="body-sm text-muted">Select at least one category. These categories control booking prices and available slot durations.</p>
                </div>
                <button type="submit" className="btn btn-primary" disabled={savingProfile} style={{ alignSelf: 'flex-start' }}>
                  <Save size={16} /> {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {selectedSession && (
        <div className="video-modal-overlay">
          <div className="video-modal-card animate-fadeInUp" style={{ maxWidth: 960 }}>
            <div className="video-modal-header">
              <span className="video-modal-title">LFID Preparation · {selectedSession.lfid || selectedSession.clientName}</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm video-modal-close-btn"
                onClick={() => setSelectedSession(null)}
                aria-label="Close preparation panel"
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="mentor-reviews" style={{ padding: 'var(--sp-4)', maxHeight: '76vh', overflow: 'auto' }}>
              <section className="mentor-review-form">
                <h3 className="heading-3">Session Context</h3>
                {preparingSession ? (
                  <p className="body-sm text-muted">Loading LFID history...</p>
                ) : (
                  <>
                    <p className="body-sm text-muted"><strong>LFID:</strong> {selectedSession.lfid || selectedSession.clientName}</p>
                    <p className="body-sm text-muted"><strong>Domain:</strong> {selectedSession.domain}</p>
                    <p className="body-sm text-muted"><strong>Date:</strong> {selectedSession.sessionDate}, {selectedSession.sessionTime}</p>
                    <p className="body-sm text-muted"><strong>Query Summary:</strong> {selectedSession.issueSummary || selectedSession.userNotes || 'No summary provided.'}</p>
                  </>
                )}

                <div className="form-group" style={{ marginTop: 'var(--sp-4)' }}>
                  <label className="form-label" htmlFor="private-note">Private Guide Note</label>
                  <textarea
                    id="private-note"
                    className="form-input"
                    rows={4}
                    value={privateNote}
                    onChange={event => setPrivateNote(event.target.value)}
                    placeholder="Notes are private and attached only to this LFID."
                  />
                </div>
                <button className="btn btn-outline btn-sm" type="button" onClick={handleSavePrivateNote} disabled={!privateNote.trim() || actionLoading === selectedSession.id}>
                  <StickyNote size={14} /> Save Private Note
                </button>

                <div className="form-group" style={{ marginTop: 'var(--sp-6)' }}>
                  <label className="form-label" htmlFor="completion-summary">Completion Summary</label>
                  <textarea
                    id="completion-summary"
                    className="form-input"
                    rows={3}
                    value={completionForm.summary}
                    onChange={event => setCompletionForm(prev => ({ ...prev, summary: event.target.value }))}
                    placeholder="Key points discussed in the session."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="completion-recommendations">Recommendations</label>
                  <textarea
                    id="completion-recommendations"
                    className="form-input"
                    rows={3}
                    value={completionForm.recommendations}
                    onChange={event => setCompletionForm(prev => ({ ...prev, recommendations: event.target.value }))}
                    placeholder="Resources, action steps, or guidance for the user."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="completion-follow-up">Follow-up Suggestions</label>
                  <textarea
                    id="completion-follow-up"
                    className="form-input"
                    rows={2}
                    value={completionForm.followUp}
                    onChange={event => setCompletionForm(prev => ({ ...prev, followUp: event.target.value }))}
                    placeholder="Suggested next topic or session frequency."
                  />
                </div>
                <button className="btn btn-primary" type="button" onClick={() => handleCompleteSession(selectedSession)} disabled={actionLoading === selectedSession.id}>
                  Complete Session
                </button>
              </section>

              <section className="mentor-reviews__list">
                <h3 className="heading-3">Previous Sessions</h3>
                {lfidHistory.length > 0 ? lfidHistory.map(item => (
                  <article className="mentor-review" key={item.id}>
                    <div className="mentor-review__header">
                      <span className="body-sm" style={{ fontWeight: 700 }}>{item.sessionDate || 'No date'} · {item.status}</span>
                      <span className="body-sm text-subtle">{item.domain}</span>
                    </div>
                    <p className="body-sm text-muted">{item.issueSummary || item.completionSummary || 'No summary saved.'}</p>
                  </article>
                )) : (
                  <p className="body-sm text-muted">No previous sessions for this LFID.</p>
                )}

                <h3 className="heading-3" style={{ marginTop: 'var(--sp-4)' }}>Private Notes</h3>
                {lfidNotes.length > 0 ? lfidNotes.map(note => (
                  <article className="mentor-review" key={note.id}>
                    <div className="mentor-review__header">
                      <span className="body-sm" style={{ fontWeight: 700 }}>Private note</span>
                      <span className="body-sm text-subtle">{note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Recently'}</span>
                    </div>
                    <p className="body-sm text-muted">{note.note}</p>
                  </article>
                )) : (
                  <p className="body-sm text-muted">No private notes for this LFID yet.</p>
                )}
              </section>
            </div>
          </div>
        </div>
      )}

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
