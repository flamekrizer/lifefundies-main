import { useState } from 'react'
import { MessageSquare, TrendingUp, Filter, Search, ThumbsUp, MessageCircle, Plus, Eye, EyeOff, X } from 'lucide-react'
import { LIFE_DOMAINS } from '../../types'
import { getInitials } from '../../utils'
import './Community.css'

const MOCK_POSTS = [
  {
    id: 'p1', authorName: 'Anonymous', isAnonymous: true, domain: 'career',
    title: 'Confused between MBA and job offer — need real perspectives',
    content: 'I just got a 6LPA offer from a decent startup but also got into a Tier-2 MBA. My parents want me to go for MBA but I feel like hands-on experience matters more at 23. What would you do?',
    upvotes: 47, commentCount: 23, tags: ['career', 'decision'], createdAt: new Date(Date.now() - 2 * 3600000),
    hasUpvoted: false,
  },
  {
    id: 'p2', authorName: 'Shreya A.', isAnonymous: false, domain: 'emotional',
    title: 'How I stopped my anxiety spiral — what actually worked for me',
    content: 'Sharing this because I wish someone had told me this earlier. After trying various things for 2 years, here\'s what genuinely helped me manage daily anxiety as a student...',
    upvotes: 89, commentCount: 41, tags: ['anxiety', 'mental-health', 'tips'], createdAt: new Date(Date.now() - 5 * 3600000),
    hasUpvoted: true,
  },
  {
    id: 'p3', authorName: 'Vikram N.', isAnonymous: false, domain: 'relationships',
    title: 'Long-distance relationship with a toxic dynamic — hard truth needed',
    content: 'Been 2 years of LDR. We fight every week but can\'t imagine my life without her. My friends say leave but she says I\'m the problem. I genuinely don\'t know what\'s right anymore.',
    upvotes: 34, commentCount: 67, tags: ['relationships', 'ldr'], createdAt: new Date(Date.now() - 8 * 3600000),
    hasUpvoted: false,
  },
  {
    id: 'p4', authorName: 'Anonymous', isAnonymous: true, domain: 'confidence',
    title: 'I froze during my first ever client presentation — how to bounce back?',
    content: 'Complete blank. 12 people in the room. I just stood there for 30 seconds. My manager covered for me but I\'ve been replaying it in my head for 3 days. How do I get past this?',
    upvotes: 62, commentCount: 38, tags: ['confidence', 'professional'], createdAt: new Date(Date.now() - 12 * 3600000),
    hasUpvoted: false,
  },
]

export default function CommunityPage() {
  const [posts, setPosts] = useState(MOCK_POSTS)
  const [activeTab, setActiveTab] = useState<'trending' | 'recent' | 'my-posts'>('trending')
  const [selectedDomain, setSelectedDomain] = useState('')
  const [showNewPost, setShowNewPost] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const toggleUpvote = (id: string) => {
    setPosts(p => p.map(post =>
      post.id === id
        ? { ...post, upvotes: post.hasUpvoted ? post.upvotes - 1 : post.upvotes + 1, hasUpvoted: !post.hasUpvoted }
        : post
    ))
  }

  const filtered = posts.filter(p =>
    (!selectedDomain || p.domain === selectedDomain) &&
    (!searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.content.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const timeAgo = (date: Date) => {
    const h = Math.floor((Date.now() - date.getTime()) / 3600000)
    if (h < 1) return 'Just now'
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <div className="page-wrapper">
      <div className="community-page">
        <div className="container">
          <div className="community__layout">
            {/* Main */}
            <div className="community__main">
              <div className="community__header animate-fadeInUp">
                <div>
                  <h1 className="display-2">Community <span className="text-gradient">Forum</span></h1>
                  <p className="text-muted">A safe space to share, learn, and connect with peers on the same journey.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowNewPost(true)} id="new-post-btn">
                  <Plus size={16} /> New Post
                </button>
              </div>

              {/* Search */}
              <div className="community__search animate-fadeInUp delay-100">
                <Search size={16} className="community__search-icon" />
                <input
                  id="community-search"
                  type="search"
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Tabs */}
              <div className="community__tabs animate-fadeInUp delay-100">
                {(['trending', 'recent', 'my-posts'] as const).map(tab => (
                  <button
                    key={tab}
                    className={`community__tab ${activeTab === tab ? 'community__tab--active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                    id={`tab-${tab}`}
                  >
                    {tab === 'trending' && <TrendingUp size={14} />}
                    {tab === 'recent' && <MessageSquare size={14} />}
                    {tab === 'my-posts' && <MessageCircle size={14} />}
                    {tab.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </button>
                ))}
              </div>

              {/* Posts */}
              <div className="community__posts">
                {filtered.map((post, i) => {
                  const domain = LIFE_DOMAINS.find(d => d.id === post.domain)
                  return (
                    <div key={post.id} className={`post-card animate-fadeInUp delay-${((i % 3 + 1) * 100) as 100 | 200 | 300}`} id={`post-${post.id}`}>
                      <div className="post-card__header">
                        <div className="post-card__author">
                          {post.isAnonymous ? (
                            <div className="avatar avatar-sm" style={{ background: 'var(--clr-bg-alt)', border: '1px solid var(--clr-border)' }}>
                              <EyeOff size={12} />
                            </div>
                          ) : (
                            <div className="avatar avatar-sm" style={{ background: `hsl(${i * 90}, 55%, 40%)` }}>
                              {getInitials(post.authorName)}
                            </div>
                          )}
                          <div>
                            <p className="post-card__name body-sm">{post.authorName}</p>
                            <p className="body-sm text-subtle">{timeAgo(post.createdAt)}</p>
                          </div>
                        </div>
                        {domain && (
                          <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                            {domain.icon} {domain.label}
                          </span>
                        )}
                      </div>

                      <h3 className="post-card__title">{post.title}</h3>
                      <p className="post-card__content body-sm text-muted">{post.content}</p>

                      <div className="post-card__tags">
                        {post.tags.map(tag => (
                          <span key={tag} className="post-card__tag">#{tag}</span>
                        ))}
                      </div>

                      <div className="post-card__actions">
                        <button
                          className={`post-card__action ${post.hasUpvoted ? 'post-card__action--active' : ''}`}
                          onClick={() => toggleUpvote(post.id)}
                          id={`upvote-${post.id}`}
                          aria-label={`Upvote: ${post.upvotes}`}
                        >
                          <ThumbsUp size={15} /> {post.upvotes}
                        </button>
                        <button className="post-card__action" id={`comment-${post.id}`}>
                          <MessageCircle size={15} /> {post.commentCount} comments
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div className="community__sidebar">
              <div className="community__widget animate-fadeInUp delay-200">
                <h3 className="heading-3">Filter by Domain</h3>
                <div className="flex-col gap-2" style={{ marginTop: 'var(--sp-4)' }}>
                  <button
                    className={`community__domain-filter ${!selectedDomain ? 'community__domain-filter--active' : ''}`}
                    onClick={() => setSelectedDomain('')}
                    id="community-domain-all"
                  >
                    🌐 All Domains
                    <span className="community__domain-count">{posts.length}</span>
                  </button>
                  {LIFE_DOMAINS.map(d => {
                    const count = posts.filter(p => p.domain === d.id).length
                    if (!count) return null
                    return (
                      <button
                        key={d.id}
                        className={`community__domain-filter ${selectedDomain === d.id ? 'community__domain-filter--active' : ''}`}
                        onClick={() => setSelectedDomain(selectedDomain === d.id ? '' : d.id)}
                        id={`community-domain-${d.id}`}
                      >
                        {d.icon} {d.label}
                        <span className="community__domain-count">{count}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="community__widget community__widget--cta animate-fadeInUp delay-300">
                <div style={{ fontSize: '2rem' }}>🎯</div>
                <h3 className="heading-3">Need Expert Help?</h3>
                <p className="body-sm text-muted">Connect with a verified mentor for a 1-on-1 guidance session.</p>
                <a href="/mentors" className="btn btn-primary btn-sm" style={{ marginTop: 'var(--sp-3)' }}>
                  Find a Mentor
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPost && <NewPostModal onClose={() => setShowNewPost(false)} />}
    </div>
  )
}

function NewPostModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ title: '', content: '', domain: '', isAnonymous: false })
  const update = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }))

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="New post">
      <div className="modal animate-scaleIn" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="heading-2">Create a Post</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close modal"><X size={18} /></button>
        </div>
        <div className="modal__body">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" placeholder="What's on your mind?" value={form.title} onChange={e => update('title', e.target.value)} id="new-post-title" />
          </div>
          <div className="form-group">
            <label className="form-label">Your story</label>
            <textarea className="form-input" rows={5} placeholder="Share your experience, question or insight..." value={form.content} onChange={e => update('content', e.target.value)} id="new-post-content" style={{ resize: 'vertical' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Life Domain</label>
            <select className="form-input" value={form.domain} onChange={e => update('domain', e.target.value)} id="new-post-domain">
              <option value="">Select a domain</option>
              {LIFE_DOMAINS.map(d => <option key={d.id} value={d.id}>{d.icon} {d.label}</option>)}
            </select>
          </div>
          <div className="ob-anon-toggle">
            <button
              type="button"
              className={`ob-toggle ${form.isAnonymous ? 'ob-toggle--on' : ''}`}
              onClick={() => update('isAnonymous', !form.isAnonymous)}
              id="post-anon-toggle"
              aria-pressed={form.isAnonymous}
            >
              <div className="ob-toggle__thumb" />
            </button>
            <div>
              <div className="flex gap-2">
                {form.isAnonymous ? <EyeOff size={14} /> : <Eye size={14} />}
                <span className="body-sm">Post anonymously</span>
              </div>
              <p className="body-sm text-muted">Your name won't be displayed</p>
            </div>
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" id="submit-post">Post to Community</button>
        </div>
      </div>
    </div>
  )
}
