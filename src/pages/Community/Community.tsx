import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare,
  TrendingUp,
  Search,
  ThumbsUp,
  MessageCircle,
  Plus,
  X,
  Loader,
  Send,
  Phone,
  Users,
  Hash,
  LayoutGrid,
  Sparkles,
  ChevronRight,
  ChevronDown,
  BookOpen,
} from 'lucide-react'
import { LIFE_DOMAINS } from '../../types'
import { getInitials } from '../../utils'
import { useAuthStore } from '../../stores'
import { signInAnonymously } from '../../lib/authService'
import { CONTENT_MODERATION_ERROR_MESSAGE } from '../../lib/contentModeration'
import {
  addComment,
  createPost,
  getComments,
  getPosts,
  upvoteComment,
  upvotePost,
  subscribeToPosts,
  subscribeToChatMessages,
  sendChatMessage,
  getChatRoomId,
  isCrisisChatRoom,
  CHAT_MESSAGE_MAX_LENGTH,
  type ChatRoomMessage,
} from '../../lib/communityRepository'
import type { Comment, Post } from '../../types'

const CRISIS_HELPLINES = [
  { name: 'Tele MANAS', number: '1-800 891 4416', note: '24/7 mental health support' },
  { name: 'LIFEFUNDIES Helpline', number: '+91 7055984498', note: 'Mon–Sat, 8 am–10 pm' },
  { name: 'Emergency', number: '112', note: 'Immediate danger' },
]

const CHAT_ROOM_GROUPS = [
  {
    title: 'Support Chat Rooms',
    desc: 'For people who need emotional support.',
    icon: '💙',
    rooms: ['Depression support', 'Anxiety support', 'Breakup / heartbreak support', 'Grief & loss', 'Loneliness support'],
  },
  {
    title: 'Mental Health Chat Rooms',
    desc: 'Focused on psychological well-being.',
    icon: '🧠',
    rooms: ['Stress management', 'Therapy discussion rooms', 'PTSD support', 'Panic attack support', 'Self-care communities'],
  },
  {
    title: 'Relationship Chat Rooms',
    desc: 'For emotional relationship matters.',
    icon: '💞',
    rooms: ['Dating advice', 'Marriage issues', 'Friendship problems', 'Toxic relationship support', 'Trust & betrayal discussions'],
  },
  {
    title: 'Motivation & Positivity Rooms',
    desc: 'To uplift mood and mindset.',
    icon: '✨',
    rooms: ['Daily motivation', 'Life goals', 'Success stories', 'Self-love rooms', 'Confidence building'],
  },
  {
    title: 'Anonymous Venting Rooms',
    desc: 'Where users can freely express.',
    icon: '🗣️',
    rooms: ['Rant rooms', 'Secret confession rooms', 'Emotional release rooms', 'Judgment-free zones'],
  },
  {
    title: 'Peer-to-Peer Healing Rooms',
    desc: 'People helping people.',
    icon: '🤝',
    rooms: ['Survivor communities', 'Life struggles', 'Career stress', 'Student pressure rooms'],
  },
  {
    title: 'Age-Based Emotional Rooms',
    desc: 'Support based on life stage.',
    icon: '🎓',
    rooms: ['Teen emotional support', 'College stress rooms', 'Adult life struggles', 'Senior loneliness rooms'],
  },
  {
    title: 'Topic-Based Emotional Rooms',
    desc: 'Focused rooms for specific life concerns.',
    icon: '📌',
    rooms: ['Family issues', 'Financial stress', 'Health anxiety', 'Spiritual healing'],
  },
  {
    title: 'Crisis Chat Rooms',
    desc: 'For urgent emotional support and safety routing.',
    icon: '🆘',
    rooms: ['Suicide prevention', 'Panic crisis rooms', 'Abuse help'],
  },
]

type CommunityView = 'forum' | 'chat'
type ForumTab = 'trending' | 'recent' | 'my-posts'

interface ChatRoomSelection {
  groupTitle: string
  room: string
}

function timeAgo(date: Date | string) {
  const d = new Date(date)
  const h = Math.floor((Date.now() - d.getTime()) / 3600000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const getCommunityErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message === CONTENT_MODERATION_ERROR_MESSAGE
    ? error.message
    : fallback

function AuthorAvatar({
  name,
  photoURL,
  index = 0,
}: {
  name: string
  photoURL?: string
  index?: number
}) {
  if (photoURL) {
    return <img src={photoURL} alt={name} className="avatar avatar-sm community-avatar" />
  }
  return (
    <div
      className="avatar avatar-sm community-avatar community-avatar--initials"
      style={{ background: `hsl(${(index * 67) % 360}, 52%, 42%)` }}
    >
      {getInitials(name)}
    </div>
  )
}

export default function CommunityPage() {
  const { user, setUser, setAuthModalOpen } = useAuthStore()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [communityView, setCommunityView] = useState<CommunityView>('forum')
  const [activeTab, setActiveTab] = useState<ForumTab>('trending')
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
  const [expandedChatGroup, setExpandedChatGroup] = useState<string | null>(CHAT_ROOM_GROUPS[0].title)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const totalRooms = useMemo(
    () => CHAT_ROOM_GROUPS.reduce((sum, group) => sum + group.rooms.length, 0),
    []
  )

  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    posts.forEach(p => {
      counts[p.domain] = (counts[p.domain] || 0) + 1
    })
    return counts
  }, [posts])

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const fetchedPosts = await getPosts(undefined, 'recent', 100)
      setPosts(fetchedPosts)
    } catch (error) {
      console.error('Failed to load posts:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToPosts(
      (fetchedPosts) => {
        setPosts(fetchedPosts)
        setLoading(false)
      },
      100,
      () => setLoading(false)
    )
    return () => unsubscribe()
  }, [])

  const ensureChatAuth = useCallback(async () => {
    if (user) return user
    try {
      const anonymousUser = await signInAnonymously()
      setUser(anonymousUser)
      return anonymousUser
    } catch (error) {
      console.error('Anonymous sign-in failed:', error)
      setAuthModalOpen(true)
      return null
    }
  }, [user, setUser, setAuthModalOpen])

  useEffect(() => {
    if (!activeChatRoom) return

    const roomId = getChatRoomId(activeChatRoom.room)
    setChatMessages([])
    setChatLoading(true)
    setChatError('')

    const unsubscribe = subscribeToChatMessages(
      roomId,
      (messages) => {
        setChatMessages(messages)
        setChatLoading(false)
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      },
      () => {
        setChatError('Could not connect to this chat room. Please refresh and try again.')
        setChatLoading(false)
      }
    )

    return () => unsubscribe()
  }, [activeChatRoom])

  const toggleUpvote = useCallback(async (postId: string) => {
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
          upvoters: newUpvoters,
        }
      }
      return p
    }))

    try {
      await upvotePost(postId, user.uid)
    } catch (error) {
      console.error('Failed to upvote:', error)
      loadPosts()
    }
  }, [user, setAuthModalOpen, loadPosts])

  const filtered = useMemo(() => posts.filter(p =>
    (!selectedDomain || p.domain === selectedDomain) &&
    (!searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [posts, selectedDomain, searchQuery])

  const sortedPosts = useMemo(() => [...filtered].sort((a, b) => {
    if (activeTab === 'trending') return b.upvotes - a.upvotes
    if (activeTab === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (activeTab === 'my-posts') {
      if (!user) return 0
      return a.authorId === user.uid ? -1 : 1
    }
    return 0
  }).filter(p => activeTab !== 'my-posts' || (user && p.authorId === user.uid)), [filtered, activeTab, user])

  const sendChatRoomMessage = useCallback(async () => {
    if (!activeChatRoom || !chatInput.trim() || chatSending) return

    const message = chatInput.trim()
    if (message.length > CHAT_MESSAGE_MAX_LENGTH) return

    const roomId = getChatRoomId(activeChatRoom.room)
    setChatInput('')
    setChatSending(true)
    setChatError('')

    try {
      const chatUser = await ensureChatAuth()
      if (!chatUser) {
        setChatInput(message)
        return
      }

      await sendChatMessage(
        roomId,
        chatUser.uid,
        chatUser.displayName || 'Community Member',
        message
      )
    } catch (error: unknown) {
      console.error('Failed to send chat message:', error)
      setChatError(getCommunityErrorMessage(error, 'Could not send your message. Please try again.'))
      setChatInput(message)
    } finally {
      setChatSending(false)
    }
  }, [activeChatRoom, chatInput, chatSending, ensureChatAuth])

  const openChatRoom = (groupTitle: string, room: string) => {
    setCommunityView('chat')
    setActiveChatRoom({ groupTitle, room })
    setChatMessages([])
    setChatInput('')
    setChatError('')
  }

  const handleNewPost = () => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }
    setShowNewPost(true)
  }

  const handleMyPostsTab = () => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }
    setActiveTab('my-posts')
  }

  return (
    <div className="page-wrapper">
      <div className="community-page">
        <div className="container">
          {/* Hero */}
          <section className="community-hero animate-fadeInUp">
            <div className="community-hero__content">
              <span className="section-eyebrow">LifeFundies Community</span>
              <h1 className="display-2">
                Share stories. Join rooms. <span className="text-gradient">Grow together.</span>
              </h1>
              <p className="community-hero__desc text-muted">
                A safe space for forum discussions and live peer chat across every life domain.
              </p>
              <div className="community-hero__stats">
                <div className="community-stat">
                  <BookOpen size={18} />
                  <span><strong>{posts.length}</strong> forum posts</span>
                </div>
                <div className="community-stat">
                  <MessageCircle size={18} />
                  <span><strong>{totalRooms}</strong> chat rooms</span>
                </div>
                <div className="community-stat">
                  <Hash size={18} />
                  <span><strong>{LIFE_DOMAINS.length}</strong> life domains</span>
                </div>
              </div>
            </div>
            <div className="community-view-switch" role="tablist" aria-label="Community sections">
              <button
                type="button"
                role="tab"
                aria-selected={communityView === 'forum'}
                className={`community-view-switch__btn ${communityView === 'forum' ? 'community-view-switch__btn--active' : ''}`}
                onClick={() => setCommunityView('forum')}
              >
                <LayoutGrid size={16} /> Forum
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={communityView === 'chat'}
                className={`community-view-switch__btn ${communityView === 'chat' ? 'community-view-switch__btn--active' : ''}`}
                onClick={() => setCommunityView('chat')}
              >
                <MessageCircle size={16} /> Chat Rooms
              </button>
            </div>
          </section>

          <div className="community__layout">
            <div className="community__main">
              {communityView === 'forum' ? (
                <>
                  <div className="community-toolbar animate-fadeInUp delay-100">
                    <div className="community__search">
                      <Search size={16} className="community__search-icon" />
                      <input
                        id="community-search"
                        type="search"
                        className="form-input input-with-icon"
                        placeholder="Search posts by title or content..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="community__tabs">
                      {([
                        { id: 'trending' as const, label: 'Trending', icon: TrendingUp },
                        { id: 'recent' as const, label: 'Recent', icon: MessageSquare },
                        { id: 'my-posts' as const, label: 'My Posts', icon: Users },
                      ]).map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          type="button"
                          className={`community__tab ${activeTab === id ? 'community__tab--active' : ''}`}
                          onClick={() => id === 'my-posts' ? handleMyPostsTab() : setActiveTab(id)}
                          id={`tab-${id}`}
                        >
                          <Icon size={14} /> {label}
                        </button>
                      ))}
                    </div>
                    <button type="button" className="btn btn-primary community-toolbar__cta" onClick={handleNewPost} id="new-post-btn">
                      <Plus size={16} /> New Post
                    </button>
                  </div>

                  {selectedDomain && (
                    <div className="community-active-filter animate-fadeInUp">
                      <span className="body-sm">Showing posts in</span>
                      <span className="badge badge-primary">
                        {LIFE_DOMAINS.find(d => d.id === selectedDomain)?.label || selectedDomain}
                      </span>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedDomain('')}>
                        Clear
                      </button>
                    </div>
                  )}

                  <div className="community__posts">
                    {loading ? (
                      <div className="community-empty-state">
                        <Loader size={28} className="animate-spin" />
                        <p>Loading community posts...</p>
                      </div>
                    ) : sortedPosts.length === 0 ? (
                      <div className="community-empty-state">
                        <Sparkles size={32} />
                        <h3 className="heading-3">No posts yet</h3>
                        <p className="body-sm text-muted">Be the first to share your story with the community.</p>
                        <button type="button" className="btn btn-primary btn-sm" onClick={handleNewPost}>
                          <Plus size={14} /> Create first post
                        </button>
                      </div>
                    ) : (
                      sortedPosts.map((post, i) => {
                        const domain = LIFE_DOMAINS.find(d => d.id === post.domain)
                        return (
                          <article key={post.id} className={`post-card animate-fadeInUp delay-${((i % 3 + 1) * 100) as 100 | 200 | 300}`} id={`post-${post.id}`}>
                            <div className="post-card__header">
                              <div className="post-card__author">
                                <AuthorAvatar name={post.authorName} photoURL={post.authorPhotoURL} index={i} />
                                <div>
                                  <p className="post-card__name body-sm">{post.authorName}</p>
                                  <p className="body-sm text-subtle">{timeAgo(post.createdAt)}</p>
                                </div>
                              </div>
                              {domain && (
                                <span className="badge badge-primary post-card__domain">{domain.label}</span>
                              )}
                            </div>

                            <h3 className="post-card__title">{post.title}</h3>
                            <p className="post-card__content body-sm text-muted">{post.content}</p>

                            <div className="post-card__actions">
                              <button
                                type="button"
                                className={`post-card__action ${user && post.upvoters?.includes(user.uid) ? 'post-card__action--active' : ''}`}
                                onClick={() => toggleUpvote(post.id)}
                                id={`upvote-${post.id}`}
                                aria-label={`Upvote: ${post.upvotes}`}
                              >
                                <ThumbsUp size={15} /> {post.upvotes}
                              </button>
                              <button
                                type="button"
                                className="post-card__action"
                                id={`comment-${post.id}`}
                                onClick={() => {
                                  if (!user) setAuthModalOpen(true)
                                  else setSelectedPost(post)
                                }}
                              >
                                <MessageCircle size={15} /> {post.commentCount} comments
                              </button>
                            </div>
                          </article>
                        )
                      })
                    )}
                  </div>
                </>
              ) : (
                <div className="community-chat-panel animate-fadeInUp delay-100">
                  {activeChatRoom ? (
                    <section className="chat-room-live" aria-label={`${activeChatRoom.room} chat room`}>
                      <header className="chat-room-live__header">
                        <div>
                          <button
                            type="button"
                            className="community-back-link body-sm"
                            onClick={() => setActiveChatRoom(null)}
                          >
                            ← All chat rooms
                          </button>
                          <span className="section-eyebrow">{activeChatRoom.groupTitle}</span>
                          <h3 className="heading-2">{activeChatRoom.room}</h3>
                          <p className="body-sm text-muted">
                            Peer support chat. Be kind, protect personal details, and seek emergency help if anyone is in immediate danger.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="chat-room-live__close"
                          aria-label="Close chat room"
                          onClick={() => setActiveChatRoom(null)}
                        >
                          <X size={18} />
                        </button>
                      </header>

                      {isCrisisChatRoom(activeChatRoom.groupTitle) && (
                        <div className="chat-room-live__crisis" role="alert">
                          <Phone size={16} aria-hidden="true" />
                          <div>
                            <p className="body-sm community-crisis-title">
                              If you or someone else is in immediate danger, call emergency services now.
                            </p>
                            <ul className="chat-room-live__helplines">
                              {CRISIS_HELPLINES.map(line => (
                                <li key={line.number}>
                                  <strong>{line.name}:</strong>{' '}
                                  <a href={`tel:${line.number.replace(/[^0-9+]/g, '')}`}>{line.number}</a>
                                  <span className="text-muted"> — {line.note}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      <div className="chat-room-live__messages">
                        {chatLoading && chatMessages.length === 0 ? (
                          <div className="chat-room-live__state">
                            <Loader size={18} className="animate-spin" /> Loading room...
                          </div>
                        ) : chatMessages.length === 0 ? (
                          <div className="chat-room-live__state">No messages yet. Start the conversation gently.</div>
                        ) : (
                          chatMessages.map(message => {
                            const isMine = message.authorId === user?.uid
                            return (
                              <article key={message.id} className={`chat-room-live__message ${isMine ? 'chat-room-live__message--mine' : ''}`}>
                                <div className="chat-room-live__meta">
                                  <span>{message.authorName || 'Member'}</span>
                                  <time>{timeAgo(message.createdAt)}</time>
                                </div>
                                <p>{message.message}</p>
                              </article>
                            )
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {chatError && <p className="chat-room-live__error">{chatError}</p>}

                      <form
                        className="chat-room-live__form"
                        onSubmit={(event) => {
                          event.preventDefault()
                          void sendChatRoomMessage()
                        }}
                      >
                        <div className="chat-room-live__input-wrap">
                          <input
                            type="text"
                            placeholder={user ? 'Type a message...' : 'Type a message to join as guest...'}
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value.slice(0, CHAT_MESSAGE_MAX_LENGTH))}
                            disabled={chatSending}
                            className="form-input"
                            maxLength={CHAT_MESSAGE_MAX_LENGTH}
                            aria-describedby="chat-char-count"
                          />
                          <span id="chat-char-count" className="chat-room-live__char-count body-sm text-muted">
                            {chatInput.length}/{CHAT_MESSAGE_MAX_LENGTH}
                          </span>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={chatSending || !chatInput.trim()}>
                          {chatSending ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                      </form>
                    </section>
                  ) : (
                    <section className="chat-rooms-section" aria-labelledby="chat-rooms-title">
                      <div className="chat-rooms-section__header">
                        <div>
                          <span className="section-eyebrow">Live Support Spaces</span>
                          <h2 className="heading-1" id="chat-rooms-title">Choose a chat room</h2>
                          <p className="body-sm text-muted">
                            Pick a topic room for real-time peer support. All rooms are moderated by community guidelines.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => openChatRoom(CHAT_ROOM_GROUPS[0].title, CHAT_ROOM_GROUPS[0].rooms[0])}
                        >
                          <MessageCircle size={15} /> Quick start
                        </button>
                      </div>

                      <div className="chat-rooms-accordion">
                        {CHAT_ROOM_GROUPS.map((group, index) => {
                          const isOpen = expandedChatGroup === group.title
                          return (
                            <article key={group.title} className={`chat-room-card ${isOpen ? 'chat-room-card--open' : ''}`}>
                              <button
                                type="button"
                                className="chat-room-card__toggle"
                                onClick={() => setExpandedChatGroup(isOpen ? null : group.title)}
                                aria-expanded={isOpen}
                              >
                                <div className="chat-room-card__toggle-left">
                                  <span className="chat-room-card__emoji">{group.icon}</span>
                                  <div>
                                    <span className="chat-room-card__count">{String(index + 1).padStart(2, '0')}</span>
                                    <h3 className="heading-3">{group.title}</h3>
                                    <p className="body-sm text-muted">{group.desc}</p>
                                  </div>
                                </div>
                                <ChevronRight size={18} className={`chat-room-card__chevron ${isOpen ? 'chat-room-card__chevron--open' : ''}`} />
                              </button>
                              {isOpen && (
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
                              )}
                            </article>
                          )
                        })}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="community__sidebar">
              {communityView === 'forum' ? (
                <>
                  <div className="community__widget animate-fadeInUp delay-200">
                    <h3 className="heading-3"><Hash size={16} /> Filter by Domain</h3>
                    <div className="community-domain-list">
                      <button
                        type="button"
                        className={`community__domain-filter ${!selectedDomain ? 'community__domain-filter--active' : ''}`}
                        onClick={() => setSelectedDomain('')}
                        id="community-domain-all"
                      >
                        All Domains
                        <span className="community__domain-count">{posts.length}</span>
                      </button>
                      {LIFE_DOMAINS.map(d => {
                        const count = domainCounts[d.id] || 0
                        return (
                          <button
                            key={d.id}
                            type="button"
                            className={`community__domain-filter ${selectedDomain === d.id ? 'community__domain-filter--active' : ''}`}
                            onClick={() => setSelectedDomain(selectedDomain === d.id ? '' : d.id)}
                            id={`community-domain-${d.id}`}
                          >
                            <span>{d.label}</span>
                            <span className="community__domain-count">{count}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="community__widget community-guidelines animate-fadeInUp delay-250">
                    <h3 className="heading-3">Community Guidelines</h3>
                    <ul className="community-guidelines__list body-sm text-muted">
                      <li>Posts show your profile name — be respectful.</li>
                      <li>Share experiences, not medical diagnoses.</li>
                      <li>No harassment, spam, or personal contact info.</li>
                      <li>Use chat rooms for peer support, not crisis care.</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <div className="community__widget animate-fadeInUp delay-200">
                    <h3 className="heading-3"><Phone size={16} /> Crisis Helplines</h3>
                    <ul className="community-helpline-list">
                      {CRISIS_HELPLINES.map(line => (
                        <li key={line.number}>
                          <strong>{line.name}</strong>
                          <a href={`tel:${line.number.replace(/[^0-9+]/g, '')}`}>{line.number}</a>
                          <span className="body-sm text-muted">{line.note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="community__widget animate-fadeInUp delay-250">
                    <h3 className="heading-3">Popular Rooms</h3>
                    <div className="community-quick-rooms">
                      {CHAT_ROOM_GROUPS.slice(0, 4).flatMap(g => g.rooms.slice(0, 1).map(room => (
                        <button
                          key={`${g.title}-${room}`}
                          type="button"
                          className="chat-room-pill chat-room-pill--sidebar"
                          onClick={() => openChatRoom(g.title, room)}
                        >
                          {room}
                        </button>
                      )))}
                    </div>
                  </div>
                </>
              )}

              <div className="community__widget community__widget--cta animate-fadeInUp delay-300">
                <Sparkles size={24} className="community-cta-icon" />
                <h3 className="heading-3">Need Expert Help?</h3>
                <p className="body-sm text-muted">Connect with a verified mentor for a 1-on-1 guidance session.</p>
                <Link to="/mentors" className="btn btn-primary btn-sm community-cta-btn">
                  Find a Mentor
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {showNewPost && (
        <NewPostModal
          onClose={() => setShowNewPost(false)}
          onSubmit={(newPost) => {
            setPosts(prev => [{ ...newPost, createdAt: new Date() }, ...prev])
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
  const [submitting, setSubmitting] = useState(false)

  const loadComments = useCallback(async () => {
    setLoading(true)
    try {
      setComments(await getComments(post.id))
    } catch (error: unknown) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoading(false)
    }
  }, [post.id])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const submitComment = useCallback(async (e: React.FormEvent) => {
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
        authorName: user.displayName || 'User',
        authorPhotoURL: user.photoURL || '',
        isAnonymous: false,
        content: content.trim(),
        upvotes: 0,
      })
      setComments(prev => [newComment, ...prev])
      setContent('')
      onChanged()
    } catch (error: unknown) {
      console.error('Failed to add comment:', error)
      alert(getCommunityErrorMessage(error, 'Failed to save comment. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }, [post.id, user, setAuthModalOpen, content, onChanged])

  const toggleCommentUpvote = useCallback(async (commentId: string) => {
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
          upvoters: newUpvoters,
        }
      }
      return c
    }))

    try {
      await upvoteComment(commentId, user.uid)
    } catch (error: unknown) {
      console.error('Failed to upvote comment:', error)
      loadComments()
    }
  }, [user, setAuthModalOpen, loadComments])

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Comments">
      <div className="modal modal--comments animate-scaleIn" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <h2 className="heading-2">Comments</h2>
            <p className="body-sm text-muted">{post.title}</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close comments">
            <X size={18} />
          </button>
        </div>
        <div className="modal__body">
          <form className="comment-form" onSubmit={submitComment}>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Write a thoughtful reply..."
              value={content}
              onChange={e => setContent(e.target.value)}
              disabled={submitting}
              required
            />
            <div className="comment-form__footer comment-form__footer--end">
              <button className="btn btn-primary btn-sm" type="submit" disabled={submitting || !content.trim()}>
                {submitting ? <Loader size={16} className="animate-spin" /> : 'Post Comment'}
              </button>
            </div>
          </form>
          <div className="comments-list">
            {loading ? (
              <Loader size={20} className="animate-spin" />
            ) : comments.length === 0 ? (
              <p className="body-sm text-muted">No comments yet. Start the conversation.</p>
            ) : (
              comments.map((comment, i) => (
                <article className="comment-item" key={comment.id}>
                  <div className="comment-item__header">
                    <div className="post-card__author">
                      <AuthorAvatar name={comment.authorName} photoURL={comment.authorPhotoURL} index={i} />
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

type NewPost = Omit<Post, 'createdAt'> & { id: string }

function NewPostModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (post: NewPost) => void }) {
  const { user } = useAuthStore()
  const [form, setForm] = useState({ title: '', content: '', domain: '' })
  const [submitting, setSubmitting] = useState(false)
  const [domainMenuOpen, setDomainMenuOpen] = useState(false)
  const selectedDomain = LIFE_DOMAINS.find(d => d.id === form.domain)

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))
  const updateDomain = (value: string) => {
    update('domain', value)
    setDomainMenuOpen(false)
  }

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
        authorName: user.displayName || 'User',
        authorPhotoURL: user.photoURL || '',
        isAnonymous: false,
        domain: form.domain as typeof LIFE_DOMAINS[number]['id'],
        title: form.title.trim(),
        content: form.content.trim(),
        upvotes: 0,
        commentCount: 0,
        tags: [],
      })
      onSubmit(newPost)
      onClose()
    } catch (error: unknown) {
      console.error('Failed to create post:', error)
      alert(getCommunityErrorMessage(error, 'Failed to create post. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="New post"
    >
      <div className="modal animate-scaleIn" onMouseDown={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal__header">
            <h2 className="heading-2">Create a Post</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close modal">
              <X size={18} />
            </button>
          </div>

          <div className="modal__body">
            <p className="body-sm text-muted community-modal-note">
              Your profile name will be shown on this post.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="new-post-title">Title</label>
              <input
                className="form-input"
                placeholder="What's on your mind?"
                value={form.title}
                onChange={e => update('title', e.target.value)}
                id="new-post-title"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new-post-content">Your story</label>
              <textarea
                className="form-input"
                rows={5}
                placeholder="Share your experience, question or insight..."
                value={form.content}
                onChange={e => update('content', e.target.value)}
                id="new-post-content"
                style={{ resize: 'vertical' }}
                required
              />
            </div>

            <div className="form-group">
              <span className="form-label" id="new-post-domain-label">Life Domain</span>
              <input type="hidden" name="domain" value={form.domain} required />
              <button
                type="button"
                className={`form-input community-domain-select ${domainMenuOpen ? 'community-domain-select--open' : ''}`}
                id="new-post-domain"
                aria-labelledby="new-post-domain-label new-post-domain"
                aria-haspopup="listbox"
                aria-expanded={domainMenuOpen}
                onClick={() => setDomainMenuOpen(open => !open)}
              >
                <span>{selectedDomain?.label || 'Select a domain'}</span>
                <ChevronDown size={16} aria-hidden="true" />
              </button>
              {domainMenuOpen && (
                <div className="community-domain-menu" role="listbox" aria-labelledby="new-post-domain-label">
                  {LIFE_DOMAINS.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      className={`community-domain-menu__option ${form.domain === d.id ? 'community-domain-menu__option--selected' : ''}`}
                      role="option"
                      aria-selected={form.domain === d.id}
                      onClick={() => updateDomain(d.id)}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal__footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="submit-post" disabled={submitting}>
              {submitting ? <Loader size={16} className="animate-spin" /> : 'Post to Community'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
