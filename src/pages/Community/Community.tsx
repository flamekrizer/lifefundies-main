import { useState, useEffect } from 'react'
import { MessageSquare, TrendingUp, Search, ThumbsUp, MessageCircle, Plus, Eye, EyeOff, X, Loader, Send } from 'lucide-react'
import { LIFE_DOMAINS } from '../../types'
import { getInitials } from '../../utils'
import { useAuthStore } from '../../stores'
import { addComment, createPost, getComments, getPosts, upvoteComment, upvotePost } from '../../lib/communityRepository'
import type { Comment, Post } from '../../types'

const CHAT_ROOM_GROUPS = [
  {
    title: 'Support Chat Rooms',
    desc: 'For people who need emotional support.',
    rooms: ['Depression support', 'Anxiety support', 'Breakup / heartbreak support', 'Grief & loss', 'Loneliness support'],
  },
  {
    title: 'Mental Health Chat Rooms',
    desc: 'Focused on psychological well-being.',
    rooms: ['Stress management', 'Therapy discussion rooms', 'PTSD support', 'Panic attack support', 'Self-care communities'],
  },
  {
    title: 'Relationship Chat Rooms',
    desc: 'For emotional relationship matters.',
    rooms: ['Dating advice', 'Marriage issues', 'Friendship problems', 'Toxic relationship support', 'Trust & betrayal discussions'],
  },
  {
    title: 'Motivation & Positivity Rooms',
    desc: 'To uplift mood and mindset.',
    rooms: ['Daily motivation', 'Life goals', 'Success stories', 'Self-love rooms', 'Confidence building'],
  },
  {
    title: 'Anonymous Venting Rooms',
    desc: 'Where users can freely express.',
    rooms: ['Rant rooms', 'Secret confession rooms', 'Emotional release rooms', 'Judgment-free zones'],
  },
  {
    title: 'Peer-to-Peer Healing Rooms',
    desc: 'People helping people.',
    rooms: ['Survivor communities', 'Life struggles', 'Career stress', 'Student pressure rooms'],
  },
  {
    title: 'AI Emotional Chat Rooms',
    desc: 'Chat with bots for emotional relief.',
    rooms: ['AI therapist', 'Mood tracker bot', 'Emotional companion bot', 'Meditation assistant'],
  },
  {
    title: 'Age-Based Emotional Rooms',
    desc: 'Support based on life stage.',
    rooms: ['Teen emotional support', 'College stress rooms', 'Adult life struggles', 'Senior loneliness rooms'],
  },
  {
    title: 'Topic-Based Emotional Rooms',
    desc: 'Focused rooms for specific life concerns.',
    rooms: ['Family issues', 'Financial stress', 'Health anxiety', 'Spiritual healing'],
  },
  {
    title: 'Crisis Chat Rooms',
    desc: 'For urgent emotional support and safety routing.',
    rooms: ['Suicide prevention', 'Panic crisis rooms', 'Abuse help'],
  },
]

interface ChatRoomSelection {
  groupTitle: string
  room: string
}

interface ChatRoomMessage {
  id: string
  roomId: string
  authorId: string
  authorName: string
  message: string
  createdAt: string
}

const getRoomId = (room: string) =>
  room.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'general'

const getGuestId = () => {
  const key = 'lifefundies-chat-guest-id'
  const existing = window.localStorage.getItem(key)
  if (existing) return existing
  const created = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  window.localStorage.setItem(key, created)
  return created
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'trending' | 'recent' | 'my-posts'>('trending')
  const [selectedDomain, setSelectedDomain] = useState('')
  const [showNewPost, setShowNewPost] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeChatRoom, setActiveChatRoom] = useState<ChatRoomSelection | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatRoomMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatSending, setChatSending] = useState(false)
  const [chatError, setChatError] = useState('')
  const { user, setAuthModalOpen } = useAuthStore()

  useEffect(() => {
    loadPosts()
  }, [])

  useEffect(() => {
    if (!activeChatRoom) return

    let cancelled = false
    const loadRoomMessages = async () => {
      setChatError('')
      setChatLoading(true)
      try {
        const response = await fetch(`/api/chatrooms/${getRoomId(activeChatRoom.room)}/messages`)
        if (!response.ok) throw new Error(`Chat room unavailable: ${response.status}`)
        const data = await response.json()
        if (!cancelled) setChatMessages(Array.isArray(data.messages) ? data.messages : [])
      } catch (error) {
        console.error('Failed to load chat room:', error)
        if (!cancelled) setChatError('Chat room connect nahi ho pa raha. Please refresh karke try karein.')
      } finally {
        if (!cancelled) setChatLoading(false)
      }
    }

    void loadRoomMessages()
    const interval = window.setInterval(loadRoomMessages, 4000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [activeChatRoom])

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

  const openChatRoom = (groupTitle: string, room: string) => {
    setActiveChatRoom({ groupTitle, room })
    setChatMessages([])
    setChatInput('')
    setChatError('')
  }

  const sendChatRoomMessage = async () => {
    if (!activeChatRoom || !chatInput.trim() || chatSending) return

    const message = chatInput.trim()
    const authorId = user?.uid || getGuestId()
    const authorName = user?.displayName || 'Anonymous'
    setChatInput('')
    setChatSending(true)
    setChatError('')

    try {
      const response = await fetch(`/api/chatrooms/${getRoomId(activeChatRoom.room)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, authorId, authorName }),
      })

      if (!response.ok) {
        const detail = await response.text().catch(() => '')
        throw new Error(detail || `Chat send failed: ${response.status}`)
      }

      const savedMessage = await response.json()
      setChatMessages(current => [...current, savedMessage])
    } catch (error) {
      console.error('Failed to send chat room message:', error)
      setChatError('Message send nahi hua. Please dobara try karein.')
      setChatInput(message)
    } finally {
      setChatSending(false)
    }
  }

  return (
    <div className="page-wrapper">
      <div className="community-page"style={{ backgroundImage: "url('/Community.jpeg')" }}>
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

              <section className="chat-rooms-section animate-fadeInUp delay-200" aria-labelledby="chat-rooms-title">
                <div className="chat-rooms-section__header">
                  <div>
                    <span className="section-eyebrow">Live Support Spaces</span>
                    <h2 className="heading-1" id="chat-rooms-title">Chat Rooms</h2>
                    <p className="body-sm text-muted">Choose a safe topic room, connect anonymously, and find peer support without judgement.</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => openChatRoom(CHAT_ROOM_GROUPS[0].title, CHAT_ROOM_GROUPS[0].rooms[0])}
                  >
                    <MessageCircle size={15} /> Start Chatting
                  </button>
                </div>

                <div className="chat-rooms-grid">
                  {CHAT_ROOM_GROUPS.map((group, index) => (
                    <article key={group.title} className="chat-room-card">
                      <div className="chat-room-card__top">
                        <span className="chat-room-card__count">{String(index + 1).padStart(2, '0')}</span>
                        <h3 className="heading-3">{group.title}</h3>
                        <p className="body-sm text-muted">{group.desc}</p>
                      </div>
                      <div className="chat-room-card__rooms">
                        {group.rooms.map(room => (
                          <button
                            key={room}
                            type="button"
                            className="chat-room-pill"
                            onClick={() => openChatRoom(group.title, room)}
                          >
                            {room}
                          </button>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              {activeChatRoom && (
                <section className="chat-room-live" aria-label={`${activeChatRoom.room} chat room`}>
                  <header className="chat-room-live__header">
                    <div>
                      <span className="section-eyebrow">{activeChatRoom.groupTitle}</span>
                      <h3 className="heading-2">{activeChatRoom.room}</h3>
                      <p className="body-sm text-muted">Anonymous peer chat. Be kind, avoid personal details, and seek local emergency help if anyone is in immediate danger.</p>
                    </div>
                    <button type="button" className="chat-room-live__close" aria-label="Close chat room" onClick={() => setActiveChatRoom(null)}>
                      <X size={18} />
                    </button>
                  </header>

                  <div className="chat-room-live__messages">
                    {chatLoading && chatMessages.length === 0 ? (
                      <div className="chat-room-live__state">
                        <Loader size={18} className="animate-spin" />
                        Loading room...
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div className="chat-room-live__state">No messages yet. Start the conversation gently.</div>
                    ) : (
                      chatMessages.map(message => {
                        const isMine = message.authorId === user?.uid || (!user && message.authorId === window.localStorage.getItem('lifefundies-chat-guest-id'))
                        return (
                          <article key={message.id} className={`chat-room-live__message ${isMine ? 'chat-room-live__message--mine' : ''}`}>
                            <div className="chat-room-live__meta">
                              <span>{message.authorName || 'Anonymous'}</span>
                              <time>{timeAgo(new Date(message.createdAt))}</time>
                            </div>
                            <p>{message.message}</p>
                          </article>
                        )
                      })
                    )}
                  </div>

                  {chatError && <p className="chat-room-live__error">{chatError}</p>}

                  <form
                    className="chat-room-live__form"
                    onSubmit={(event) => {
                      event.preventDefault()
                      void sendChatRoomMessage()
                    }}
                  >
                    <input
                      value={chatInput}
                      onChange={event => setChatInput(event.target.value)}
                      placeholder={`Message ${activeChatRoom.room}...`}
                      maxLength={800}
                      aria-label="Chat room message"
                      disabled={chatSending}
                    />
                    <button type="submit" className="btn btn-primary" disabled={chatSending || !chatInput.trim()}>
                      {chatSending ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                      Send
                    </button>
                  </form>
                </section>
              )}

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
                              {domain.label}
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
                        {d.label}
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
                {LIFE_DOMAINS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
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
