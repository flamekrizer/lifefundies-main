import { useState, useEffect } from 'react'
import { Link, useSearchParams, useParams, useNavigate } from 'react-router-dom'
import { Search, Filter, Star, Users, CheckCircle, X } from 'lucide-react'
import { LIFE_DOMAINS, type DomainId } from '../../types'
import { MOCK_MENTORS, formatCurrency, getInitials } from '../../utils'
import BookingModal from '../../components/BookingModal'
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

  useEffect(() => {
    if (id) {
      const mentor = MOCK_MENTORS.find(m => m.uid === id)
      if (mentor) {
        setBookingMentor(mentor)
      }
    } else {
      setBookingMentor(null)
    }
  }, [id])

  const filtered = MOCK_MENTORS.filter(m => {
    const matchSearch = !search || m.displayName.toLowerCase().includes(search.toLowerCase()) ||
      m.bio.toLowerCase().includes(search.toLowerCase()) || m.expertise.some(e => e.toLowerCase().includes(search.toLowerCase()))
    const matchDomain = !selectedDomain || m.domains.includes(selectedDomain)
    const matchPrice = priceRange === 'all' ||
      (priceRange === 'budget' && m.sessionPrice <= 299) ||
      (priceRange === 'mid' && m.sessionPrice > 299 && m.sessionPrice <= 349) ||
      (priceRange === 'premium' && m.sessionPrice > 349)
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
              <span className="badge badge-primary">{MOCK_MENTORS.length} Mentors</span>
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
              {filtered.map((mentor, i) => (
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
                      {mentor.domains.map(d => {
                        const domain = LIFE_DOMAINS.find(x => x.id === d)
                        return domain ? (
                          <span key={d} className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                            {domain.icon} {domain.label}
                          </span>
                        ) : null
                      })}
                    </div>

                    <div className="mentor-card-full__expertise">
                      {mentor.expertise.map(e => (
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
                        <Link to={`/mentors/${mentor.uid}`} className="btn btn-primary" id={`book-${mentor.uid}`}>
                          Book Session
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
