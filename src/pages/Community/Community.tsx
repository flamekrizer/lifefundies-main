import { useState, useEffect } from 'react'
import { MessageSquare, TrendingUp, Search, ThumbsUp, MessageCircle, Plus, Eye, EyeOff, X, Loader } from 'lucide-react'
import { LIFE_DOMAINS } from '../../types'
import { getInitials } from '../../utils'
import { useAuthStore } from '../../stores'
import { addComment, createPost, getComments, getPosts, upvoteComment, upvotePost } from '../../lib/communityRepository'
import type { Comment, Post } from '../../types'
import './Community.css'

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'trending' | 'recent' | 'my-posts'>('trending')
  const [selectedDomain, setSelectedDomain] = useState('')
  const [showNewPost, setShowNewPost] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, setAuthModalOpen } = useAuthStore()

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const fetchedPosts = await getPosts(undefined, 'recent', 100)
      setPosts(fetchedPosts)
    } catch (error) {
      console.error('Failed to load posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUpvote = async (postId: string) => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }

    setPosts(prevPosts => prevPosts.map(p => {
      if (p.id === postId) {
        const upvoters = p.upvoters || []
        const isCurrentlyUpvoted = upvoters.includes(user.uid)
        const newUpvoters = isCurrentlyUpvoted 
          ? upvoters.filter((id: string) => id !== user.uid)
          : [...upvoters, user.uid]
        return {
          ...p,
          upvotes: isCurrentlyUpvoted ? p.upvotes - 1 : p.upvotes + 1,
          upvoters: newUpvoters
        }
      }
      return p
    }))

    try {
      await upvotePost(postId, user.uid)
    } catch (error) {
      console.error('Failed to upvote:', error)
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === postId) {
          const upvoters = p.upvoters || []
          const isCurrentlyUpvoted = upvoters.includes(user.uid)
          const newUpvoters = isCurrentlyUpvoted 
            ? upvoters.filter((id: string) => id !== user.uid)
            : [...upvoters, user.uid]
          return {
            ...p,
            upvotes: isCurrentlyUpvoted ? p.upvotes - 1 : p.upvotes + 1,
            upvoters: newUpvoters
          }
        }
        return p
      }))
    }
  }

  const filtered = posts.filter(p =>
    (!selectedDomain || p.domain === selectedDomain) &&
    (!searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.content.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const sortedPosts = [...filtered].sort((a, b) => {
    if (activeTab === 'trending') return b.upvotes - a.upvotes
    if (activeTab === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (activeTab === 'my-posts') return user ? (a.authorId === user.uid ? -1 : 1) : 1
    return 0
  }).filter(p => activeTab !== 'my-posts' || (user && p.authorId === user.uid))

  const timeAgo = (date: Date) => {
    const h = Math.floor((Date.now() - new Date(date).getTime()) / 3600000)
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
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (!user) {
                      setAuthModalOpen(true)
                    } else {
                      setShowNewPost(true)
                    }
                  }}
                  id="new-post-btn"
                >
                  <Plus size={16} /> New Post
                </button>
              </div>

              {/* Search */}
              <div className="community__search animate-fadeInUp delay-100">
                <Search size={16} className="community__search-icon" />
                <input
                  id="community-search"
                  type="search"
                  className="form-input input-with-icon"
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
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <Loader size={24} className="animate-spin" style={{ margin: '0 auto' }} />
                  </div>
                ) : sortedPosts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--clr-text-muted)' }}>
                    <p>No posts yet. Be the first to share!</p>
                  </div>
                ) : (
                  sortedPosts.map((post, i) => {
                    const domain = LIFE_DOMAINS.find(d => d.id === post.domain)
                    return (
                      <div key={post.id} className={`post-card animate-fadeInUp delay-${((i % 3 + 1) * 100) as 100 | 200 | 300}`} id={`post-${post.id}`}>
                        <div className="post-card__header">
                          <div className="post-card__author">
                            {post.isAnonymous ? (
                              <div className="avatar avatar-sm" style={{ background: 'var(--clr-bg-alt)', border: '1px solid var(--clr-border)' }}>
                                <EyeOff size={12} />
                              </div>
                            ) : post.authorPhotoURL ? (
                              <img src={post.authorPhotoURL} alt={post.authorName} className="avatar avatar-sm" style={{ objectFit: 'cover' }} />
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
                            className={`post-card__action ${user && post.upvoters?.includes(user.uid) ? 'post-card__action--active' : ''}`}
                            onClick={() => toggleUpvote(post.id)}
                            id={`upvote-${post.id}`}
                            aria-label={`Upvote: ${post.upvotes}`}
                          >
                            <ThumbsUp size={15} /> {post.upvotes}
                          </button>
                          <button
                            className="post-card__action"
                            id={`comment-${post.id}`}
                            onClick={() => {
                              if (!user) {
                                setAuthModalOpen(true)
                              } else {
                                setSelectedPost(post)
                              }
                            }}
                          >
                            <MessageCircle size={15} /> {post.commentCount} comments
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
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
      {showNewPost && (
        <NewPostModal 
          onClose={() => setShowNewPost(false)} 
          onSubmit={(newPost) => {
            setPosts(prev => [newPost, ...prev])
            loadPosts()
          }}
        />
      )}
      {selectedPost && (
        <CommentsModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onChanged={() => loadPosts()}
        />
      )}
    </div>
  )
}

function CommentsModal({ post, onClose, onChanged }: { post: Post; onClose: () => void; onChanged: () => void }) {
  const { user, setAuthModalOpen } = useAuthStore()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadComments = async () => {
    setLoading(true)
    try {
      setComments(await getComments(post.id))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComments()
  }, [post.id])

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setAuthModalOpen(true)
      return
    }
    if (!content.trim()) return

    setSubmitting(true)
    try {
      const newComment = await addComment({
        postId: post.id,
        authorId: user.uid,
        authorName: isAnonymous ? 'Anonymous' : user.displayName,
        authorPhotoURL: isAnonymous ? undefined : user.photoURL,
        isAnonymous,
        content: content.trim(),
        upvotes: 0,
      })
      setComments(prev => [newComment, ...prev])
      setContent('')
      onChanged()
    } catch (error) {
      console.error('Failed to add comment:', error)
      alert('Failed to save comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleCommentUpvote = async (commentId: string) => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }

    setComments(prevComments => prevComments.map(c => {
      if (c.id === commentId) {
        const upvoters = c.upvoters || []
        const isCurrentlyUpvoted = upvoters.includes(user.uid)
        const newUpvoters = isCurrentlyUpvoted
          ? upvoters.filter((id: string) => id !== user.uid)
          : [...upvoters, user.uid]
        return {
          ...c,
          upvotes: isCurrentlyUpvoted ? c.upvotes - 1 : c.upvotes + 1,
          upvoters: newUpvoters
        }
      }
      return c
    }))

    try {
      await upvoteComment(commentId, user.uid)
    } catch (error) {
      console.error('Failed to upvote comment:', error)
      // Rollback
      setComments(prevComments => prevComments.map(c => {
        if (c.id === commentId) {
          const upvoters = c.upvoters || []
          const isCurrentlyUpvoted = upvoters.includes(user.uid)
          const newUpvoters = isCurrentlyUpvoted
            ? upvoters.filter((id: string) => id !== user.uid)
            : [...upvoters, user.uid]
          return {
            ...c,
            upvotes: isCurrentlyUpvoted ? c.upvotes - 1 : c.upvotes + 1,
            upvoters: newUpvoters
          }
        }
        return c
      }))
    }
  }

  const timeAgo = (date: Date) => {
    const h = Math.floor((Date.now() - new Date(date).getTime()) / 3600000)
    if (h < 1) return 'Just now'
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Comments">
      <div className="modal modal--comments animate-scaleIn" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <h2 className="heading-2">Comments</h2>
            <p className="body-sm text-muted">{post.title}</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close comments"><X size={18} /></button>
        </div>
        <div className="modal__body">
          <form className="comment-form" onSubmit={submitComment}>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Write a thoughtful reply..."
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
            <div className="comment-form__footer">
              <label className="comment-form__anon">
                <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
                <span className="body-sm">Comment anonymously</span>
              </label>
              <button className="btn btn-primary btn-sm" type="submit" disabled={submitting || !content.trim()}>
                {submitting ? <Loader size={16} className="animate-spin" /> : 'Save Comment'}
              </button>
            </div>
          </form>

          <div className="comments-list">
            {loading ? (
              <Loader size={20} className="animate-spin" />
            ) : comments.length === 0 ? (
              <p className="body-sm text-muted">No comments yet. Start the conversation.</p>
            ) : comments.map(comment => (
              <article className="comment-item" key={comment.id}>
                <div className="comment-item__header">
                  <div className="post-card__author">
                    {comment.isAnonymous ? (
                      <div className="avatar avatar-sm" style={{ background: 'var(--clr-bg-alt)', border: '1px solid var(--clr-border)' }}>
                        <EyeOff size={12} />
                      </div>
                    ) : comment.authorPhotoURL ? (
                      <img src={comment.authorPhotoURL} alt={comment.authorName} className="avatar avatar-sm" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="avatar avatar-sm" style={{ background: 'var(--clr-primary)', border: '1px solid var(--clr-border)' }}>
                        {getInitials(comment.authorName)}
                      </div>
                    )}
                    <div>
                      <p className="post-card__name body-sm">{comment.authorName}</p>
                      <p className="body-sm text-subtle">{timeAgo(comment.createdAt)}</p>
                    </div>
                  </div>
                  <button
                    className={`post-card__action ${user && comment.upvoters?.includes(user.uid) ? 'post-card__action--active' : ''}`}
                    onClick={() => toggleCommentUpvote(comment.id)}
                    type="button"
                  >
                    <ThumbsUp size={14} /> {comment.upvotes}
                  </button>
                </div>
                <p className="body-sm text-muted">{comment.content}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function NewPostModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (post: any) => void }) {
  const { user } = useAuthStore()
  const [form, setForm] = useState({ title: '', content: '', domain: '', isAnonymous: false })
  const [submitting, setSubmitting] = useState(false)
  const update = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim() || !form.domain || !user) {
      alert('Please fill out all fields.')
      return
    }

    setSubmitting(true)
    try {
      const newPost = await createPost({
        authorId: user.uid,
        authorName: form.isAnonymous ? 'Anonymous' : user.displayName,
        authorPhotoURL: form.isAnonymous ? undefined : user.photoURL,
        isAnonymous: form.isAnonymous,
        domain: form.domain as any,
        title: form.title,
        content: form.content,
        upvotes: 0,
        commentCount: 0,
        tags: [form.domain],
      })
      onSubmit(newPost)
      onClose()
    } catch (error) {
      console.error('Failed to create post:', error)
      alert('Failed to create post. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="New post">
      <div className="modal animate-scaleIn" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal__header">
            <h2 className="heading-2">Create a Post</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close modal"><X size={18} /></button>
          </div>
          <div className="modal__body">
            <div className="form-group">
              <label className="form-label" htmlFor="new-post-title">Title</label>
              <input className="form-input" placeholder="What's on your mind?" value={form.title} onChange={e => update('title', e.target.value)} id="new-post-title" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="new-post-content">Your story</label>
              <textarea className="form-input" rows={5} placeholder="Share your experience, question or insight..." value={form.content} onChange={e => update('content', e.target.value)} id="new-post-content" style={{ resize: 'vertical' }} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="new-post-domain">Life Domain</label>
              <select className="form-input" value={form.domain} onChange={e => update('domain', e.target.value)} id="new-post-domain" required>
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
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="submit-post" disabled={submitting}>
              {submitting ? <Loader size={16} className="animate-spin" /> : 'Post to Community'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
