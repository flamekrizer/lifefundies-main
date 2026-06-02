import { useState, useEffect } from 'react'
import { Link, useSearchParams, useParams, useNavigate } from 'react-router-dom'
import { Search, Filter, Star, Users, CheckCircle, X, Heart } from 'lucide-react'
import { LIFE_DOMAINS, type DomainId } from '../../types'
import { MOCK_MENTORS, formatCurrency, getInitials } from '../../utils'
import BookingModal from '../../components/BookingModal'
import { useAuthStore } from '../../stores'
import { addReview, getMentorReviews } from '../../lib/communityService'
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import './Mentors.css'

export default function MentorsPage() {
  const [search, setSearch] = useState('')
  const [searchParams] = useSearchParams()
  const [selectedDomain, setSelectedDomain] = useState<DomainId | ''>(
    (searchParams.get('domain') as DomainId) || ''
  )
  const [priceRange, setPriceRange] = useState<'all' | 'budget' | 'mid' | 'premium'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()
  const [bookingMentor, setBookingMentor] = useState<any>(null)
  const [reviewMentorId, setReviewMentorId] = useState<string | null>(null)
  const { user, setAuthModalOpen, setUser } = useAuthStore()

  const [mentors, setMentors] = useState<any[]>(MOCK_MENTORS)
  const [loadingMentors, setLoadingMentors] = useState(false)

  // Sync selected domain state with search parameter changes
  useEffect(() => {
    const domainParam = searchParams.get('domain') as DomainId | null
    if (domainParam) {
      setSelectedDomain(domainParam)
    } else {
      setSelectedDomain('')
    }
  }, [searchParams])

  // Fetch mentors from Firestore users collection
  useEffect(() => {
    const fetchMentors = async () => {
      setLoadingMentors(true)
      try {
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('role', '==', 'mentor'))
        const snapshot = await getDocs(q)
        const dbMentors = snapshot.docs.map(doc => ({
          uid: doc.id,
          id: doc.id,
          displayName: doc.data().displayName || 'Mentor',
          email: doc.data().email || '',
          photoURL: doc.data().photoURL || '',
          bio: doc.data().bio || '',
          domains: doc.data().domains || [],
          expertise: doc.data().expertise || [],
          sessionPrice: doc.data().sessionPrice || doc.data().price || 299,
          rating: doc.data().rating || 5.0,
          reviewCount: doc.data().reviewCount || 0,
          totalSessions: doc.data().totalSessions || 0,
          availability: doc.data().availability || {},
          yearsOfExperience: doc.data().yearsOfExperience || doc.data().experience || 0,
          education: doc.data().education || '',
          languages: doc.data().languages || ['English', 'Hindi'],
          isVerified: doc.data().isVerified !== undefined ? doc.data().isVerified : true,
        }))
        if (dbMentors.length > 0) {
          setMentors(dbMentors)
        }
      } catch (err) {
        console.error('Failed to fetch mentors from Firestore:', err)
      } finally {
        setLoadingMentors(false)
      }
    }
    fetchMentors()
  }, [])

  const handleToggleInterest = async (mentorId: string) => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }
    const currentInterests = (user as any).mentorInterests || []
    const updatedInterests = currentInterests.includes(mentorId)
      ? currentInterests.filter((mid: string) => mid !== mentorId)
      : [...currentInterests, mentorId]
    
    setUser({ ...user, mentorInterests: updatedInterests })

    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, { mentorInterests: updatedInterests })
    } catch (err) {
      console.error('Failed to update mentor interests:', err)
    }
  }

  useEffect(() => {
    if (id) {
      if (!user) {
        setAuthModalOpen(true)
        navigate('/mentors', { replace: true })
      } else {
        const mentor = mentors.find(m => m.uid === id)
        if (mentor) {
          setBookingMentor(mentor)
        }
      }
    } else {
      setBookingMentor(null)
    }
  }, [id, user, mentors])

  const filtered = mentors.filter(m => {
    const displayName = m.displayName || ''
    const bio = m.bio || ''
    const expertise = m.expertise || []
    const domains = m.domains || []
    const sessionPrice = m.sessionPrice || m.price || 299

    const matchSearch = !search || displayName.toLowerCase().includes(search.toLowerCase()) ||
      bio.toLowerCase().includes(search.toLowerCase()) || expertise.some((e: string) => e.toLowerCase().includes(search.toLowerCase()))
    const matchDomain = !selectedDomain || domains.includes(selectedDomain)
    const matchPrice = priceRange === 'all' ||
      (priceRange === 'budget' && sessionPrice <= 299) ||
      (priceRange === 'mid' && sessionPrice > 299 && sessionPrice <= 349) ||
      (priceRange === 'premium' && sessionPrice > 349)
    return matchSearch && matchDomain && matchPrice
  })

  return (
    <div className="page-wrapper">
      <div className="mentors-page">
        <div className="container">
          {/* Header */}
          <div className="mentors-page__header animate-fadeInUp">
            <div>
              <h1 className="display-2">Find Your <span className="text-gradient">Mentor</span></h1>
              <p className="body-lg text-muted">Connect with verified experts across 18 life domains</p>
            </div>
            <div className="mentors-page__stats">
              <span className="badge badge-primary">{mentors.length} Mentors</span>
              <span className="badge badge-secondary">All Verified</span>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mentors-page__controls animate-fadeInUp delay-100">
            <div className="mentors-search">
              <Search size={18} className="mentors-search__icon" />
              <input
                id="mentor-search"
                type="search"
                className="form-input mentors-search__input input-with-icon"
                placeholder="Search mentors, expertise, domains..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="mentors-search__clear" onClick={() => setSearch('')} aria-label="Clear search">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              className={`btn btn-outline ${showFilters ? 'btn-primary' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
              id="filter-toggle"
            >
              <Filter size={16} /> Filters
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mentors-filters animate-fadeIn">
              <div className="form-group">
                <label className="form-label">Life Domain</label>
                <div className="mentors-filters__chips">
                  <button
                    className={`ob-chip ${!selectedDomain ? 'ob-chip--active' : ''}`}
                    onClick={() => setSelectedDomain('')}
                    id="domain-filter-all"
                  >All Domains</button>
                  {LIFE_DOMAINS.map(d => (
                    <button
                      key={d.id}
                      className={`ob-chip ${selectedDomain === d.id ? 'ob-chip--active' : ''}`}
                      onClick={() => setSelectedDomain(selectedDomain === d.id ? '' : d.id)}
                      id={`domain-filter-${d.id}`}
                    >
                      {d.icon} {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Price Range</label>
                <div className="mentors-filters__chips">
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'budget', label: '₹299' },
                    { id: 'mid', label: '₹300–₹349' },
                    { id: 'premium', label: '₹350+' },
                  ].map(p => (
                    <button
                      key={p.id}
                      className={`ob-chip ${priceRange === p.id ? 'ob-chip--active' : ''}`}
                      onClick={() => setPriceRange(p.id as typeof priceRange)}
                      id={`price-filter-${p.id}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results count */}
          <p className="body-sm text-muted animate-fadeIn" style={{ marginBottom: 'var(--sp-4)' }}>
            Showing <strong>{filtered.length}</strong> mentor{filtered.length !== 1 ? 's' : ''}
            {selectedDomain && ` in ${LIFE_DOMAINS.find(d => d.id === selectedDomain)?.label}`}
          </p>

          {/* Mentor Grid */}
          {filtered.length > 0 ? (
            <div className="mentors-grid-full">
              {filtered.map((mentor, i) => {
                const isInterested = (user as any)?.mentorInterests?.includes(mentor.uid) || false
                return (
                  <div key={mentor.uid} className={`mentor-card-full animate-fadeInUp delay-${((i % 3 + 1) * 100) as 100 | 200 | 300}`} id={`mentor-full-${mentor.uid}`}>
                    <div className="mentor-card-full__left">
                      <div className="avatar avatar-xl" style={{ background: `hsl(${i * 80 + 30}, 60%, 40%)`, overflow: 'hidden' }}>
                        {mentor.photoURL ? (
                          <img src={mentor.photoURL} alt={mentor.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          getInitials(mentor.displayName)
                        )}
                      </div>
                      {mentor.isVerified && (
                        <div className="mentor-card-full__verified-badge">
                          <CheckCircle size={14} /> Verified
                        </div>
                      )}
                    </div>

                    <div className="mentor-card-full__content">
                      <div className="mentor-card-full__header">
                        <div>
                          <h3 className="mentor-card-full__name">{mentor.displayName}</h3>
                          <p className="body-sm text-muted">{mentor.education} · {mentor.yearsOfExperience}+ years</p>
                        </div>
                        <div className="mentor-card-full__rating">
                          <Star size={16} style={{ color: 'var(--clr-secondary)', fill: 'var(--clr-secondary)' }} />
                          <span className="mentor-card-full__rating-val">{mentor.rating}</span>
                          <span className="body-sm text-muted">({mentor.reviewCount} reviews)</span>
                        </div>
                      </div>

                      <p className="body-sm text-muted">{mentor.bio}</p>

                      <div className="mentor-card-full__domains">
                        {mentor.domains.map((d: any) => {
                          const domain = LIFE_DOMAINS.find(x => x.id === d)
                          return domain ? (
                            <span key={d} className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                              {domain.icon} {domain.label}
                            </span>
                          ) : null
                        })}
                      </div>

                      <div className="mentor-card-full__expertise">
                        {mentor.expertise.map((e: any) => (
                          <span key={e} className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>{e}</span>
                        ))}
                      </div>

                      <div className="mentor-card-full__footer">
                        <div className="flex gap-4">
                          <span className="body-sm text-muted"><Users size={13} style={{ display: 'inline' }} /> {mentor.totalSessions} sessions</span>
                          <span className="body-sm text-muted">🌐 {mentor.languages.join(', ')}</span>
                        </div>
                        <div className="mentor-card-full__cta">
                          <p className="mentor-card-full__price">{formatCurrency(mentor.sessionPrice)}<span className="body-sm text-muted">/session</span></p>
                          <button
                            onClick={() => setReviewMentorId(reviewMentorId === mentor.uid ? null : mentor.uid)}
                            className="btn btn-outline"
                            id={`reviews-${mentor.uid}`}
                          >
                            Reviews
                          </button>
                          <button
                            onClick={() => handleToggleInterest(mentor.uid)}
                            className={`btn ${isInterested ? 'btn-primary' : 'btn-outline'}`}
                            style={{ padding: 'var(--sp-2) var(--sp-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            id={`interest-${mentor.uid}`}
                            aria-label="Add to interests"
                          >
                            <Heart size={16} fill={isInterested ? 'currentColor' : 'none'} style={{ color: isInterested ? 'white' : 'var(--clr-accent-dark)' }} />
                          </button>
                          <button
                            onClick={() => {
                              if (!user) {
                                setAuthModalOpen(true)
                              } else {
                                navigate(`/mentors/${mentor.uid}`)
                              }
                            }}
                            className="btn btn-primary"
                            id={`book-${mentor.uid}`}
                          >
                            Book Session
                          </button>
                        </div>
                      </div>
                      {reviewMentorId === mentor.uid && (
                        <MentorReviews mentor={mentor} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="mentors-page__empty">
              <span style={{ fontSize: '3rem' }}>🔍</span>
              <h3 className="heading-2">No mentors found</h3>
              <p className="text-muted">Try adjusting your filters or search terms</p>
              <button className="btn btn-primary" onClick={() => { setSearch(''); setSelectedDomain(''); setPriceRange('all') }}>
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
      {bookingMentor && (
        <BookingModal
          guide={bookingMentor}
          isOpen={!!bookingMentor}
          onClose={() => navigate('/mentors')}
        />
      )}
    </div>
  )
}

function MentorReviews({ mentor }: { mentor: any }) {
  const { user, setAuthModalOpen } = useAuthStore()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadReviews = async () => {
    setLoading(true)
    try {
      setReviews(await getMentorReviews(mentor.uid))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [mentor.uid])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user) {
      setAuthModalOpen(true)
      return
    }
    if (!text.trim()) return

    setSubmitting(true)
    try {
      const review = await addReview(mentor.uid, user.uid, rating, text.trim())
      setReviews(prev => [{ ...review, userName: user.displayName }, ...prev])
      setText('')
      setRating(5)
    } catch (error: any) {
      console.error('Failed to add review:', error)
      alert(error.message || 'Failed to save review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mentor-reviews">
      <form className="mentor-review-form" onSubmit={handleSubmit}>
        <div className="mentor-review-form__row">
          <label className="form-label" htmlFor={`review-rating-${mentor.uid}`}>Rating</label>
          <select
            id={`review-rating-${mentor.uid}`}
            className="form-input mentor-review-form__rating"
            value={rating}
            onChange={event => setRating(Number(event.target.value))}
          >
            {[5, 4, 3, 2, 1].map(value => (
              <option key={value} value={value}>{value} stars</option>
            ))}
          </select>
        </div>
        <textarea
          className="form-input"
          rows={3}
          placeholder={`Share your experience with ${mentor.displayName}`}
          value={text}
          onChange={event => setText(event.target.value)}
          required
        />
        <button className="btn btn-primary btn-sm" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Review'}
        </button>
      </form>

      <div className="mentor-reviews__list">
        {loading ? (
          <p className="body-sm text-muted">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="body-sm text-muted">No Firebase reviews yet.</p>
        ) : reviews.map(review => (
          <article className="mentor-review" key={review.id}>
            <div className="mentor-review__header">
              <span className="mentor-review__stars">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={14}
                    style={{
                      color: 'var(--clr-secondary)',
                      fill: index < review.rating ? 'var(--clr-secondary)' : 'transparent',
                    }}
                  />
                ))}
              </span>
              <span className="body-sm text-subtle">
                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}
              </span>
            </div>
            <p className="body-sm text-muted">{review.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
