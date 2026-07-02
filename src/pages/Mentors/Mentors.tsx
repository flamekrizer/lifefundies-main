import { useState, useEffect } from 'react'
import { useSearchParams, useParams, useNavigate } from 'react-router-dom'
import { Award, CalendarDays, CheckCircle, Clock, Filter, Heart, MapPin, MessageCircle, Search, ShieldCheck, Star, Users, X } from 'lucide-react'
import { LIFE_DOMAINS, type DomainId } from '../../types'
import { formatCurrency, getInitials } from '../../utils'
import { MENTOR_CATEGORIES, normalizeMentorCategories } from '../../lib/pricing'
import BookingModal from '../../components/BookingModal'
import { useAuthStore } from '../../stores'
import { addReviewAndUpvoteMentor as addReview, getMentorReviews } from '../../lib/communityRepository'
import { subscribeToMentors, updateUserMentorInterests } from '../../lib/userRepository'

export default function MentorsPage() {
  const [search, setSearch] = useState('')
  const [searchParams] = useSearchParams()
  const [selectedDomain, setSelectedDomain] = useState<DomainId | ''>(
    (searchParams.get('domain') as DomainId) || ''
  )
  const [priceRange, setPriceRange] = useState<'all' | 'budget' | 'mid' | 'premium'>('all')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [languageFilter, setLanguageFilter] = useState('')
  const [qualificationFilter, setQualificationFilter] = useState('')
  const [experienceFilter, setExperienceFilter] = useState<'all' | '0-2' | '3-5' | '6+'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()
  const [bookingMentor, setBookingMentor] = useState<any>(null)
  const [reviewMentorId, setReviewMentorId] = useState<string | null>(null)
  const { user, setAuthModalOpen, setUser } = useAuthStore()

  const [mentors, setMentors] = useState<any[]>([])
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

  // Fetch mentors from Firestore users collection in real time.
  useEffect(() => {
    setLoadingMentors(true)
    const unsubscribe = subscribeToMentors((dbMentors) => {
      setMentors(dbMentors.map(m => ({ ...m, id: m.uid })))
      setLoadingMentors(false)
    })

    return () => unsubscribe()
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
      await updateUserMentorInterests(user.uid, updatedInterests)
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
    const categories = normalizeMentorCategories(m.categories)
    const languages = m.languages || []
    const qualification = m.qualification || m.education || ''
    const yearsOfExperience = Number(m.yearsOfExperience || 0)
    const sessionPrice = m.sessionPrice || m.price || 129

    const matchSearch = !search || displayName.toLowerCase().includes(search.toLowerCase()) ||
      bio.toLowerCase().includes(search.toLowerCase()) || expertise.some((e: string) => e.toLowerCase().includes(search.toLowerCase()))
    const matchDomain = !selectedDomain || domains.includes(selectedDomain)
    const matchCategory = !selectedCategory || categories.includes(selectedCategory as any)
    const matchLanguage = !languageFilter || languages.some((l: string) => l.toLowerCase().includes(languageFilter.toLowerCase()))
    const matchQualification = !qualificationFilter || qualification.toLowerCase().includes(qualificationFilter.toLowerCase())
    const matchExperience = experienceFilter === 'all' ||
      (experienceFilter === '0-2' && yearsOfExperience <= 2) ||
      (experienceFilter === '3-5' && yearsOfExperience >= 3 && yearsOfExperience <= 5) ||
      (experienceFilter === '6+' && yearsOfExperience >= 6)
    const matchPrice = priceRange === 'all' ||
      (priceRange === 'budget' && sessionPrice <= 149) ||
      (priceRange === 'mid' && sessionPrice > 149 && sessionPrice <= 199) ||
      (priceRange === 'premium' && sessionPrice > 199)
    return matchSearch && matchDomain && matchCategory && matchLanguage && matchQualification && matchExperience && matchPrice
  })

  const openContactGuide = (mentor: any) => {
    if (mentor.email) {
      window.location.href = `mailto:${mentor.email}?subject=${encodeURIComponent(`LifeFundies guide enquiry for ${mentor.displayName}`)}`
      return
    }
    navigate(`/contact?guide=${mentor.uid}`)
  }

  return (
    <div className="page-wrapper">
      <div className="mentors-page">
        <div className="container">
          {/* Header */}
          <div className="mentors-page__header animate-fadeInUp">
            <div>
              <h1 className="display-2">Find Your <span className="text-gradient">Guide</span></h1>
              <p className="body-lg text-muted">Connect with verified experts across 18 life domains</p>
            </div>
            <div className="mentors-page__stats">
              <span className="badge badge-primary">{mentors.length} Guides</span>
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
                placeholder="Search guides, expertise, domains..."
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
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Price Range</label>
                <div className="mentors-filters__chips">
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'budget', label: 'Rs 129' },
                    { id: 'mid', label: 'Rs 199' },
                    { id: 'premium', label: 'Rs 299' },
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
              <div className="form-group">
                <label className="form-label">Category Type</label>
                <div className="mentors-filters__chips">
                  <button className={`ob-chip ${!selectedCategory ? 'ob-chip--active' : ''}`} onClick={() => setSelectedCategory('')}>All Categories</button>
                  {MENTOR_CATEGORIES.map(category => (
                    <button key={category.id} className={`ob-chip ${selectedCategory === category.id ? 'ob-chip--active' : ''}`} onClick={() => setSelectedCategory(selectedCategory === category.id ? '' : category.id)}>
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="auth-form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="language-filter">Languages Known</label>
                  <input id="language-filter" className="form-input" value={languageFilter} onChange={e => setLanguageFilter(e.target.value)} placeholder="Hindi, English..." />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="qualification-filter">Qualification</label>
                  <input id="qualification-filter" className="form-input" value={qualificationFilter} onChange={e => setQualificationFilter(e.target.value)} placeholder="MBA, Psychology..." />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Experience</label>
                <div className="mentors-filters__chips">
                  {[
                    { id: 'all', label: 'Any Experience' },
                    { id: '0-2', label: '0-2 years' },
                    { id: '3-5', label: '3-5 years' },
                    { id: '6+', label: '6+ years' },
                  ].map(item => (
                    <button key={item.id} className={`ob-chip ${experienceFilter === item.id ? 'ob-chip--active' : ''}`} onClick={() => setExperienceFilter(item.id as typeof experienceFilter)}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results count */}
          <p className="body-sm text-muted animate-fadeIn" style={{ marginBottom: 'var(--sp-4)' }}>
            Showing <strong>{filtered.length}</strong> guide{filtered.length !== 1 ? 's' : ''}
            {selectedDomain && ` in ${LIFE_DOMAINS.find(d => d.id === selectedDomain)?.label}`}
          </p>

          {/* Mentor List */}
          {loadingMentors ? (
            <div className="mentors-page__empty">
              <span className="spinner" aria-label="Loading guides" />
              <h3 className="heading-2">Finding verified guides...</h3>
              <p className="text-muted">Pulling the latest LifeFundies guide list.</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="mentors-grid-full">
              {filtered.map((mentor, i) => {
                const isInterested = (user as any)?.mentorInterests?.includes(mentor.uid) || false
                const domains = Array.isArray(mentor.domains) ? mentor.domains : []
                const expertise = Array.isArray(mentor.expertise) ? mentor.expertise : []
                const languages = Array.isArray(mentor.languages) ? mentor.languages : []
                const categories = normalizeMentorCategories(mentor.categories)
                const primaryDomain = LIFE_DOMAINS.find(d => d.id === domains[0])
                const availabilityLabel = (mentor as any).isAvailable === false
                  ? 'Next slot soon'
                  : i % 3 === 1
                    ? 'Available Tomorrow'
                    : 'Available Today'
                const ratingScore = Math.min(100, Math.round(Number(mentor.rating || 5) * 20))
                const storyCount = Number(mentor.reviewCount || mentor.totalSessions || 0)
                const startingPrice = Number(mentor.sessionPrice || mentor.price || 129)
                const location = mentor.city || 'Online guidance'
                const qualification = mentor.qualification || mentor.education || 'LifeFundies trained guide'

                return (
                  <article key={mentor.uid} className={`mentor-card-full guide-listing animate-fadeInUp delay-${((i % 3 + 1) * 100) as 100 | 200 | 300}`} id={`mentor-full-${mentor.uid}`}>
                    <div className="mentor-card-full__left">
                      <div className="avatar avatar-xl guide-listing__avatar" style={{ background: `hsl(${i * 80 + 30}, 60%, 40%)`, overflow: 'hidden' }}>
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
                      <div className="guide-listing__main">
                        <div className="guide-listing__details">
                          <div className="mentor-card-full__header">
                            <div>
                              <h3 className="mentor-card-full__name">{mentor.displayName}</h3>
                              <p className="guide-listing__role">{primaryDomain?.label || expertise[0] || 'Life Guide'}</p>
                              <p className="body-sm text-muted">{Number(mentor.yearsOfExperience || 1)} years experience overall</p>
                            </div>
                            <button
                              onClick={() => handleToggleInterest(mentor.uid)}
                              className={`guide-listing__save ${isInterested ? 'guide-listing__save--active' : ''}`}
                              id={`interest-${mentor.uid}`}
                              aria-label={isInterested ? 'Remove from interests' : 'Add to interests'}
                            >
                              <Heart size={18} fill={isInterested ? 'currentColor' : 'none'} />
                            </button>
                          </div>

                          <p className="guide-listing__location">
                            <MapPin size={15} />
                            <strong>{location}</strong>
                            <span>{qualification}</span>
                          </p>

                          <p className="guide-listing__fee">
                            {formatCurrency(startingPrice)} consultation fee
                            {categories.length > 1 ? ` · ${categories.length} guidance formats` : ''}
                          </p>

                          <p className="guide-listing__bio">{mentor.bio || 'Warm, structured guidance for real-life decisions and day-to-day clarity.'}</p>

                          <div className="mentor-card-full__domains">
                            {domains.slice(0, 4).map((d: any) => {
                              const domain = LIFE_DOMAINS.find(x => x.id === d)
                              return domain ? (
                                <span key={d} className="badge badge-primary guide-listing__chip">
                                  {domain.label}
                                </span>
                              ) : null
                            })}
                          </div>

                          <div className="mentor-card-full__expertise">
                            {expertise.slice(0, 4).map((e: any) => (
                              <span key={e} className="badge badge-secondary guide-listing__chip">{e}</span>
                            ))}
                          </div>

                          <div className="guide-listing__proof">
                            <span className="guide-listing__score">
                              <Star size={14} fill="currentColor" /> {ratingScore}%
                            </span>
                            <button
                              type="button"
                              onClick={() => setReviewMentorId(reviewMentorId === mentor.uid ? null : mentor.uid)}
                              className="guide-listing__stories"
                              id={`reviews-${mentor.uid}`}
                            >
                              {storyCount || 'New'} Patient Stories
                            </button>
                            <span className="guide-listing__meta">
                              <Users size={14} /> {mentor.totalSessions || 0} sessions
                            </span>
                            {languages.length > 0 && (
                              <span className="guide-listing__meta">{languages.join(', ')}</span>
                            )}
                          </div>
                        </div>

                        <aside className="guide-listing__actions" aria-label={`Actions for ${mentor.displayName}`}>
                          <div className={`guide-listing__availability ${availabilityLabel === 'Available Today' ? 'guide-listing__availability--today' : ''}`}>
                            <CalendarDays size={18} />
                            <span>{availabilityLabel}</span>
                          </div>
                          <button
                            onClick={() => {
                              if (!user) {
                                setAuthModalOpen(true)
                              } else {
                                navigate(`/mentors/${mentor.uid}`)
                              }
                            }}
                            className="btn btn-primary guide-listing__book"
                            id={`book-${mentor.uid}`}
                          >
                            Book Session
                          </button>
                          <button
                            onClick={() => openContactGuide(mentor)}
                            className="btn btn-outline guide-listing__contact"
                            id={`contact-${mentor.uid}`}
                          >
                            <MessageCircle size={18} />
                            Contact Guide
                          </button>
                          <div className="guide-listing__assurance">
                            <span><ShieldCheck size={14} /> Anonymous option</span>
                            <span><Clock size={14} /> 30-45 min slots</span>
                            {mentor.isVerified && <span><Award size={14} /> Trained by LF</span>}
                          </div>
                        </aside>
                      </div>

                      {reviewMentorId === mentor.uid && (
                        <MentorReviews mentor={mentor} />
                      )}
                        </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="mentors-page__empty">
              <span style={{ fontSize: '3rem' }}>🔍</span>
              <h3 className="heading-2">No guides found</h3>
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
