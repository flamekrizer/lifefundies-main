import { FormEvent, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Play, CheckCircle, Target, Zap, X, MessageCircle, Send, Bot, Loader2, Sparkles } from 'lucide-react'
import { LIFE_DOMAINS } from '../../types'
import type { IRAMessage, IRASuggestedAction } from '../../types/fundoo'
import { MOCK_TESTIMONIALS, formatCurrency, getInitials } from '../../utils'
import { useAuthStore } from '../../stores'
import { subscribeToMentors } from '../../lib/userRepository'
import { callIRA, getIRAStatus } from '../../lib/iraClient'

const DOMAIN_IMAGES: Record<string, string> = {
  career: '/All The Hints In Your Natal Chart That Can Help You Crystalize Your Career and Purpose  — Holisticism.jpg',
  emotional: '/Inner peace.jpg',
  relationships: '/Family.jpg',
  confidence: '/Health & fitness.jpg',
  communication: '/learning 2.jpg',
  productivity: '/Is content marketing different from SEO or are….jpg',
  stress: '/Financial.jpg',
  decisions: '/You and Me💕.jpg',
  motivation: '/Dreams fuel success by expanding possibilities….jpg',
  growth: '/Personal Growth.jpeg',
  social: '/Social life.jpg',
  academic: '/Technology.jpg',
  professional: '/Family 2.jpg',
  lifestyle: '/Creativity.jpg',
  transitions: '/Netflix + Binge.jpg',
  values: '/Contribution.jpg',
  financial: '/self identity.jpg',
  clarity: '/Dreams & challenges.jpg',
}

const FALLBACK_DOMAIN_IMAGES = Object.values(DOMAIN_IMAGES)

const getDomainImage = (domainId?: string, offset = 0) => {
  if (domainId && DOMAIN_IMAGES[domainId]) return DOMAIN_IMAGES[domainId]
  return FALLBACK_DOMAIN_IMAGES[offset % FALLBACK_DOMAIN_IMAGES.length]
}

const DOMAIN_PROBLEM_AREAS: Record<string, Array<{ title: string; desc: string }>> = {
  career: [
    { title: 'Career Planning', desc: 'Career direction, goal setting, job switching, resume guidance, and long-term professional growth.' },
    { title: 'Skill Development', desc: 'Learning technical, creative, communication, or leadership skills for career advancement.' },
    { title: 'Work-Life Balance', desc: 'Managing burnout, productivity, time management, and personal wellbeing alongside work.' },
    { title: 'Networking', desc: 'Building professional relationships, LinkedIn presence, communication confidence, and industry connections.' },
  ],
  emotional: [
    { title: 'Mental Health', desc: 'Stress management, emotional wellbeing, anxiety support, self-awareness, and mindset improvement.' },
    { title: 'Coping Strategies', desc: 'Healthy ways to manage stress, emotional overwhelm, and difficult life situations.' },
    { title: 'Support Systems', desc: 'Building reliable emotional and social support through friends, family, mentors, and communities.' },
    { title: 'Professional Help', desc: 'Accessing counselors, therapists, coaches, or experts for guidance during difficult situations.' },
  ],
  relationships: [
    { title: 'Family', desc: 'Handling family relationships, communication gaps, emotional bonding, and responsibilities.' },
    { title: 'Friends', desc: 'Building healthy friendships, social boundaries, trust, and support systems.' },
    { title: 'Romantic Relationships', desc: 'Love, dating, emotional compatibility, relationship growth, and conflict resolution.' },
    { title: 'Community Involvement', desc: 'Connecting with people through social groups, volunteering, and shared activities.' },
  ],
  confidence: [
    { title: 'Confidence Building', desc: 'Developing self-belief, expression, and courage in everyday decisions.' },
    { title: 'Self-Awareness', desc: 'Understanding emotions, thoughts, behaviors, and personal patterns.' },
    { title: 'Strengths', desc: 'Recognizing natural talents, abilities, positive qualities, and areas where one excels.' },
    { title: 'Weaknesses', desc: 'Understanding limitations, challenges, and growth areas with honesty and self-acceptance.' },
  ],
  communication: [
    { title: 'Social Skills', desc: 'Communication, confidence, conversation skills, and interpersonal growth.' },
    { title: 'Networking', desc: 'Building social and professional circles through authentic interactions.' },
    { title: 'Emotional Connection', desc: 'Building emotional safety, understanding, empathy, and closeness.' },
    { title: 'Conflict Resolution', desc: 'Improving honesty, listening skills, conflict handling, and mutual understanding.' },
  ],
  productivity: [
    { title: 'Discipline', desc: 'Creating routines and consistency around important personal or professional goals.' },
    { title: 'Productivity', desc: 'Managing focus, time, priorities, and distractions.' },
    { title: 'Habit Formation', desc: 'Building sustainable habits and reducing patterns that hold you back.' },
    { title: 'Work Environment', desc: 'Creating healthier, productive, and inspiring workspaces.' },
  ],
  stress: [
    { title: 'Coping Strategies', desc: 'Healthy ways to manage stress, anxiety, emotional overwhelm, and difficult life situations.' },
    { title: 'Resilience Building', desc: 'Developing mental strength, adaptability, confidence, and recovery after setbacks.' },
    { title: 'Support Systems', desc: 'Building reliable emotional and social support through friends, family, mentors, and communities.' },
    { title: 'Mental Health', desc: 'Guidance for stress management, emotional wellbeing, self-awareness, and mindset improvement.' },
  ],
  decisions: [
    { title: 'Values', desc: 'Identifying beliefs, principles, ethics, and priorities that guide life decisions.' },
    { title: 'Long-term Planning', desc: 'Setting future goals, building roadmaps, and making strategic life and career decisions.' },
    { title: 'Self Awareness', desc: 'Understanding emotions, thoughts, behaviors, and patterns before choosing.' },
    { title: 'Overcoming Obstacles', desc: 'Handling fear, self-doubt, failures, distractions, and setbacks.' },
  ],
  motivation: [
    { title: 'Motivation', desc: 'Maintaining focus, discipline, consistency, and inspiration while pursuing goals.' },
    { title: 'Vision Boarding', desc: 'Creating visual representations of goals, dreams, lifestyle aspirations, and future success.' },
    { title: 'Discipline', desc: 'Following through even when energy, clarity, or confidence is low.' },
    { title: 'Overcoming Obstacles', desc: 'Handling fear, self-doubt, failures, distractions, and setbacks.' },
  ],
  growth: [
    { title: 'Confidence Building', desc: 'Developing inner confidence, self-trust, and stronger personal presence.' },
    { title: 'Emotional Intelligence', desc: 'Understanding feelings, reactions, and relationships with maturity.' },
    { title: 'Habit Formation', desc: 'Building routines that support long-term personal growth.' },
    { title: 'Self-Awareness', desc: 'Understanding patterns, values, strengths, and growth areas.' },
  ],
  social: [
    { title: 'Parenting', desc: 'Guidance for raising children, emotional support, discipline, and family bonding.' },
    { title: 'Elder Care', desc: 'Supporting aging parents or elders with empathy, care planning, and emotional support.' },
    { title: 'Household Management', desc: 'Managing chores, routines, budgeting, and family coordination.' },
    { title: 'Family Health', desc: 'Health awareness, emotional wellness, and healthy family habits.' },
  ],
  academic: [
    { title: 'Formal Education', desc: 'School, college, academic performance, exams, assignments, and study planning.' },
    { title: 'Online Courses', desc: 'Finding and completing online certifications, courses, and self-paced learning programs.' },
    { title: 'Reading', desc: 'Book recommendations, reading habits, knowledge retention, and intellectual growth.' },
    { title: 'Skill Acquisition', desc: 'Learning practical life skills, digital skills, or career-based expertise efficiently.' },
  ],
  professional: [
    { title: 'Career Planning', desc: 'Career direction, goal setting, job switching, resume guidance, and long-term professional growth.' },
    { title: 'Skill Development', desc: 'Learning technical, creative, communication, or leadership skills for career advancement.' },
    { title: 'Networking', desc: 'Building industry connections and professional relationships.' },
    { title: 'Digital Literacy', desc: 'Understanding digital tools, apps, internet usage, and online productivity.' },
  ],
  lifestyle: [
    { title: 'Home Organization', desc: 'Decluttering, productivity spaces, cleanliness, and lifestyle organization.' },
    { title: 'Sustainable Living', desc: 'Eco-friendly habits, mindful consumption, and responsible living practices.' },
    { title: 'Travel', desc: 'Travel planning, solo trips, experiences, and travel lifestyle guidance.' },
    { title: 'Work Environment', desc: 'Creating healthier, productive, and inspiring workspaces.' },
  ],
  transitions: [
    { title: 'Long-term Planning', desc: 'Setting future goals, building roadmaps, and making strategic life and career decisions.' },
    { title: 'Resilience Building', desc: 'Developing mental strength, adaptability, confidence, and the ability to recover from change.' },
    { title: 'Support Systems', desc: 'Building reliable emotional and social support during life shifts.' },
    { title: 'Overcoming Obstacles', desc: 'Handling fear, self-doubt, failures, distractions, and setbacks while moving forward.' },
  ],
  values: [
    { title: 'Self Awareness', desc: 'Understanding emotions, thoughts, behaviors, and patterns to develop clarity.' },
    { title: 'Values', desc: 'Identifying personal beliefs, principles, ethics, and priorities that guide decisions.' },
    { title: 'Strengths', desc: 'Recognizing natural talents, positive qualities, and areas where one excels.' },
    { title: 'Life Purpose', desc: 'Exploring meaning, values, direction, and personal fulfillment in life.' },
  ],
  financial: [
    { title: 'Budgeting', desc: 'Planning spending, tracking money, and creating healthier financial habits.' },
    { title: 'Saving Habits', desc: 'Building consistency around saving and financial discipline.' },
    { title: 'Financial Planning', desc: 'Planning goals, investments, debt management, and long-term security.' },
    { title: 'Financial Literacy', desc: 'Understanding money basics, investments, passive income, and smarter decisions.' },
  ],
  clarity: [
    { title: 'Vision Boarding', desc: 'Creating visual representations of goals, dreams, lifestyle aspirations, and future success.' },
    { title: 'Long-term Planning', desc: 'Setting future goals, building roadmaps, and making strategic decisions.' },
    { title: 'Motivation', desc: 'Maintaining focus, discipline, consistency, and inspiration.' },
    { title: 'Life Purpose', desc: 'Exploring meaning, values, direction, and personal fulfillment in life.' },
  ],
}

export default function LandingPage() {
  return (
    <main className="landing">
      <HeroSection />
      <LogoTrail />
      <StatsBar />
      <DomainsSection />
      <HowItWorksSection />
      <MentorsSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
    </main>
  )
}

const PARTNER_LOGOS = [
  { name: 'E-Cell', src: '/e-cell.jpeg' },
  { name: 'Sharda Launchpad', src: '/sharda-launchpad-logo-png_seeklogo-428241.png' },
  { name: 'DPIIT', src: '/dpiit.png' },
  { name: 'MSME', src: '/msme.png' },
]

function LogoTrail() {
  const trail = [...PARTNER_LOGOS, ...PARTNER_LOGOS]

  return (
    <section className="logo-trail" aria-labelledby="logo-trail-title">
      <div className="container logo-trail__inner">
        <div className="logo-trail__label">
          <span className="section-eyebrow">Recognised & Supported By</span>
          <h2 id="logo-trail-title">Built around India’s startup ecosystem</h2>
        </div>

        <div className="logo-trail__viewport" aria-label="Partner and recognition logos">
          <div className="logo-trail__track">
            {trail.map((logo, index) => (
              <div className="logo-trail__item" key={`${logo.name}-${index}`}>
                <img src={logo.src} alt={logo.name} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const DOMAIN_ALIASES: Record<string, string> = {
  'Career & Profession': 'career',
  'Mental Well-being': 'emotional',
  'Relationships': 'relationships',
  'Health & Fitness': 'confidence',
  'Education & Learning': 'communication',
  'Business & Entrepreneurship': 'productivity',
  'Finance & Wealth': 'stress',
  'Love & Intimacy': 'decisions',
  'Social Life & Networking': 'motivation',
  'Personal Growth': 'growth',
  'Spirituality & Purpose': 'social',
  'Technology & Digital Life': 'academic',
  'Family Responsibilities': 'professional',
  'Creativity & Innovation': 'lifestyle',
  'Entertainment & Fun': 'transitions',
  'Society & Contribution': 'values',
  'Self-Identity': 'financial',
  'Dreams & Aspirations': 'clarity',
}

const STARTER_PROMPTS = [
  'I feel confused about my career',
  'Help me manage overthinking',
  'Which mentor should I choose?',
]

function getDomainId(domain?: string) {
  if (!domain) return 'clarity'
  const normalized = domain.toLowerCase().trim()
  return LIFE_DOMAINS.some(item => item.id === normalized)
    ? normalized
    : DOMAIN_ALIASES[normalized] || 'clarity'
}

function createChatMessage(
  sender: 'user' | 'fundoo',
  content: string,
  extra: Partial<IRAMessage> = {}
): IRAMessage {
  return {
    id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sender,
    content,
    timestamp: new Date().toISOString(),
    ...extra,
  }
}

function FundooChatbot() {
  const { user } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sessionId, setSessionId] = useState<string>()
  const [statusText, setStatusText] = useState('IRA ready')
  const [messages, setMessages] = useState<IRAMessage[]>([
    createChatMessage(
      'fundoo',
      'Hi, I am LF Buddy. Tell me what feels stuck right now, and I will guide you to the right LifeFundies domain or mentor path.'
    ),
  ])
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isOpen])

  useEffect(() => {
    if (!isOpen) return

    getIRAStatus()
      .then(status => {
        setStatusText(status.llmConfigured ? `Groq: ${status.model}` : 'Demo mode: add GROQ_API_KEY')
      })
      .catch(() => setStatusText('IRA API not connected'))
  }, [isOpen])

  const sendMessage = async (textOverride?: string) => {
    const text = (textOverride || input).trim()
    if (!text || isSending) return

    const userMessage = createChatMessage('user', text)
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setIsSending(true)

    try {
      const response = await callIRA({
        userId: user?.uid || 'landing_guest',
        message: text,
        sessionId,
        conversationContext: nextMessages.slice(-10),
        userProfile: {
          id: user?.uid || 'landing_guest',
          name: user?.displayName || 'Guest',
          email: user?.email || 'guest@lifefundies.local',
          avatar: user?.photoURL,
          emotionState: undefined,
          recentDomains: user?.domains || [],
          sessionHistory: [],
          preferences: {
            source: 'landing_chatbot',
            availableDomains: LIFE_DOMAINS.map(domain => ({
              id: domain.id,
              label: domain.label,
              description: domain.description,
            })),
          },
        },
      })

      if (response.sessionId) setSessionId(response.sessionId)

      setMessages(current => [
        ...current,
        createChatMessage('fundoo', response.message, {
          emotion: response.emotion,
          domain: response.domain,
          responseType: response.responseType,
          metadata: {
            suggestedActions: response.suggestedActions || [],
            llmConfigured: response.metadata?.llmConfigured,
          },
        }),
      ])
    } catch (error) {
      setMessages(current => [
        ...current,
        createChatMessage(
          'fundoo',
          'LF Buddy se connection nahi ho pa raha. Please thodi der baad try karein, ya support team ko bata dein.'
        ),
      ])
    } finally {
      setIsSending(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendMessage()
  }

  const latestFundooMessage = [...messages].reverse().find(message => message.sender === 'fundoo')
  const latestActions = (latestFundooMessage?.metadata?.suggestedActions || []) as IRASuggestedAction[]
  const latestDomain = LIFE_DOMAINS.find(domain => domain.id === getDomainId(latestFundooMessage?.domain))
  const recommendedDomain = latestDomain || LIFE_DOMAINS.find(domain => domain.id === 'clarity') || LIFE_DOMAINS[0]
  const chatChips: IRASuggestedAction[] = latestActions.length
    ? latestActions
    : STARTER_PROMPTS.map(label => ({ label, type: 'GUIDE' }))

  return (
    <div className={`fundoo-chatbot ${isOpen ? 'fundoo-chatbot--open' : ''}`}>
      {isOpen && (
        <section className="fundoo-chatbot__panel" aria-label="LF Buddy chatbot">
          <header className="fundoo-chatbot__header">
            <div className="fundoo-chatbot__identity">
              <span className="fundoo-chatbot__avatar"><Bot size={18} /></span>
              <div>
                <h3>LF Buddy</h3>
                <p>{statusText}</p>
              </div>
            </div>
            <button type="button" aria-label="Close chatbot" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </header>

          <div className="fundoo-chatbot__messages">
            {messages.map(message => (
              <ChatBubble key={message.id} message={message} />
            ))}
            {isSending && (
              <div className="fundoo-chatbot__typing">
                <Loader2 size={16} className="fundoo-chatbot__spin" />
                LF Buddy is thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="fundoo-chatbot__recommendation">
            <Sparkles size={16} />
            <span>Recommended: {recommendedDomain.label}</span>
            <Link to={`/mentors?domain=${recommendedDomain.id}`}>Browse</Link>
          </div>

          <div className="fundoo-chatbot__chips">
            {chatChips.slice(0, 3).map(action => (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  if (action.type === 'BOOK_MENTOR') {
                    window.location.href = `/mentors?domain=${getDomainId(action.data?.domain || latestFundooMessage?.domain)}`
                    return
                  }
                  void sendMessage(action.label)
                }}
              >
                {action.label}
              </button>
            ))}
          </div>

          <form className="fundoo-chatbot__form" onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={event => setInput(event.target.value)}
              placeholder="Ask for guidance..."
              aria-label="Ask LF Buddy for guidance"
              disabled={isSending}
            />
            <button type="submit" aria-label="Send message" disabled={isSending || !input.trim()}>
              {isSending ? <Loader2 size={18} className="fundoo-chatbot__spin" /> : <Send size={18} />}
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="fundoo-chatbot__launcher"
        aria-label="Open LF Buddy chatbot"
        onClick={() => setIsOpen(current => !current)}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={24} />}
        <span>Ask LF Buddy</span>
      </button>
    </div>
  )
}

function ChatBubble({ message }: { message: IRAMessage }) {
  const domainId = getDomainId(message.domain)
  const domain = LIFE_DOMAINS.find(item => item.id === domainId)

  return (
    <article className={`fundoo-chatbot__message fundoo-chatbot__message--${message.sender}`}>
      <p>{message.content}</p>
      {message.sender === 'fundoo' && message.domain && domain && (
        <Link className="fundoo-chatbot__domain" to={`/mentors?domain=${domain.id}`}>
          {domain.label} mentors
        </Link>
      )}
    </article>
  )
}

function HeroSection() {
  const { user } = useAuthStore()
  const [activeDomainIndex, setActiveDomainIndex] = useState(0)
  const activeDomain = LIFE_DOMAINS[activeDomainIndex]
  const activeDomainImage = getDomainImage(activeDomain.id, activeDomainIndex)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveDomainIndex(current => (current + 1) % LIFE_DOMAINS.length)
    }, 2600)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="hero" id="home">
      {/* Background orbs */}
      <div className="hero__orb hero__orb--1" />
      <div className="hero__orb hero__orb--2" />
      <div className="hero__orb hero__orb--3" />

      <div className="container hero__container">
        <div className="hero__content animate-fadeInUp">


          <h2 className="display-1 hero__title">
            Find clarity.
            <span className="text-gradient"> Feel heard.</span>
          </h2>

          <p className="body-lg text-muted hero__desc" >
            Everyone teaches academics and professional skills, but few teach us how to handle life's real challenges. At LifeFundies, we're here to listen—not judge. Explore <strong> 18 essential life domains </strong>, connect with mentors and guides, and become strong enough to face life's challenges with confidence.
          </p>

          <div className="hero__cta-group">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-xl animate-pulse-glow" id="hero-cta-primary">
                Go to Dashboard <ArrowRight size={20} />
              </Link>
            ) : (
              <Link
                to="/get-started"
                className="btn btn-primary btn-xl animate-pulse-glow"
                id="hero-cta-primary"
              >
                Start Your Journey <ArrowRight size={20} />
              </Link>
            )}
            <Link to="/#how-it-works" className="btn btn-outline btn-xl" id="hero-cta-secondary">
              <Play size={18} /> How It Works
            </Link>
          </div>

          <div className="hero__trust">
            <div className="hero__trust-avatars">
              {[
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=faces&q=80',
                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50&h=50&fit=crop&crop=faces&q=80',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&crop=faces&q=80',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=faces&q=80',
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=faces&q=80'
              ].map((url, i) => (
                <div key={i} className="avatar avatar-sm hero__trust-avatar" style={{ marginLeft: i ? '-8px' : 0, overflow: 'hidden', border: '2px solid var(--clr-bg-card)' }}>
                  <img src={url} alt="User profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
            <div>
              <div className="stars">{Array.from({ length: 5 }).map((_, i) => <span key={i} className="star">★</span>)}</div>
              <p className="body-sm text-muted">Trusted by <strong>2,000+</strong> students & professionals</p>
            </div>
          </div>
        </div>

        <div className="hero__visual animate-fadeIn delay-300">
          <div className="hero__card-stack">
            <div className="hero__card-bg" />

            <div className="hero__card hero__card--domain" aria-live="polite">
              <div className="hero__domain-card-media">
                <img
                  className="hero__domain-card-image"
                  src={activeDomainImage}
                  alt={activeDomain.label}
                  key={activeDomain.id}
                />
                <span className="hero__domain-card-count">
                  {String(activeDomainIndex + 1).padStart(2, '0')} / {LIFE_DOMAINS.length}
                </span>
              </div>
              <div className="hero__card-header">
                <div className="avatar avatar-md hero__domain-card-icon">
                  LF
                </div>
                <div>
                  <p className="hero__card-name">{activeDomain.label}</p>
                  <p className="body-sm text-muted">LifeFundies Domain</p>
                </div>
                <span className="badge badge-primary hero__card-badge">Live</span>
              </div>
              <div className="hero__card-domain">
                <Target size={16} style={{ color: 'var(--clr-primary-light)' }} />
                <span className="body-sm">{activeDomain.description}</span>
              </div>
              <Link
                to={`/mentors?domain=${activeDomain.id}`}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Explore Domain <ArrowRight size={16} />
              </Link>
            </div>

            <div className="hero__floating-badge hero__floating-badge--1">
              <CheckCircle size={14} style={{ color: 'var(--clr-primary-light)' }} />
              <span className="body-sm">Anonymous & Safe</span>
            </div>
            <div className="hero__floating-badge hero__floating-badge--2">
              <Zap size={14} style={{ color: 'var(--clr-secondary)' }} />
              <span className="body-sm">₹129 onwards</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StatsBar() {
  const stats = [
    { value: '18', label: 'Life Domains', icon: '✦' },
    { value: '20+', label: 'Expert Mentors', icon: '◉' },
    { value: '500+', label: 'Happy Users', icon: '♡' },
    { value: '4.4★', label: 'Average Rating', icon: '★' },
    { value: '₹129', label: 'Starting Price', icon: '₹' },
  ]
  return (
    <div className="stats-bar">
      <div className="container stats-bar__inner">
        {stats.map((stat, i) => (
          <div key={i} className="stats-bar__item">
            <span className="stats-bar__icon">{stat.icon}</span>
            <span className="stats-bar__value">{stat.value}</span>
            <span className="stats-bar__label text-muted body-sm">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DomainsSection() {
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null)
  const [activeStoryIndex, setActiveStoryIndex] = useState(0)
  const storyRefs = useRef<Array<HTMLButtonElement | null>>([])
  const selectedDomain = LIFE_DOMAINS.find(domain => domain.id === selectedDomainId)
  const selectedDomainIndex = selectedDomain ? LIFE_DOMAINS.findIndex(domain => domain.id === selectedDomain.id) : -1
  const selectedAreas = selectedDomain ? DOMAIN_PROBLEM_AREAS[selectedDomain.id] || [] : []

  useEffect(() => {
    if (!selectedDomain) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedDomainId(null)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selectedDomain])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visible) {
          const index = Number((visible.target as HTMLElement).dataset.domainIndex)
          if (!Number.isNaN(index)) setActiveStoryIndex(index)
        }
      },
      { threshold: [0.35, 0.6, 0.85], rootMargin: '-22% 0px -36% 0px' }
    )

    storyRefs.current.forEach(node => {
      if (node) observer.observe(node)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section className="section domains-section" id="domains">
      <div className="container">
        <div className="section-header animate-fadeInUp">
          <div className="section-eyebrow">Holistic Approach</div>
          <h2 className="display-2">18 Life Domains, <span className="domains-section__highlight">One Platform</span></h2>
          <p className="body-lg text-muted">
            LifeFundies operates on a comprehensive 18-domain life model — covering every dimension of human development and growth.
          </p>
        </div>
        <div className="domains-story">
          <div className="domains-story__bar" aria-hidden="true">
            <span>{String(activeStoryIndex + 1).padStart(2, '0')} / {LIFE_DOMAINS.length}</span>
            <div><i style={{ width: `${((activeStoryIndex + 1) / LIFE_DOMAINS.length) * 100}%` }} /></div>
          </div>

          <div className="domains-story__list">
          {LIFE_DOMAINS.map((domain, i) => (
            <button
              key={domain.id}
              type="button"
              ref={node => { storyRefs.current[i] = node }}
              data-domain-index={i}
              className={`domain-card domain-card--story animate-fadeInUp delay-${Math.min((i % 6 + 1) * 100, 600) as 100 | 200 | 300 | 400 | 500 | 600} ${activeStoryIndex === i ? 'domain-card--active' : ''}`}
              style={{
                '--domain-color': domain.color,
                '--domain-image': `url("${getDomainImage(domain.id, i)}")`,
              } as React.CSSProperties}
              id={`domain-${domain.id}`}
              onClick={() => setSelectedDomainId(domain.id)}
            >
              <h3 className="domain-card__label">{domain.label}</h3>
              <p className="domain-card__desc body-sm text-muted">{domain.description}</p>
              <div className="domain-card__arrow">View areas</div>
            </button>
          ))}
          </div>
        </div>
      </div>

      {selectedDomain && (
        <div
          className="domain-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="domain-modal-title"
          onClick={() => setSelectedDomainId(null)}
        >
          <div className="domain-modal__panel animate-scaleIn" onClick={event => event.stopPropagation()}>
            <button
              type="button"
              className="domain-modal__close"
              aria-label="Close domain details"
              onClick={() => setSelectedDomainId(null)}
            >
              <X size={26} />
            </button>

            <div className="domain-modal__header">
              <div
                className="domain-modal__media"
                style={{ '--domain-modal-image': `url("${getDomainImage(selectedDomain.id, selectedDomainIndex)}")` } as React.CSSProperties}
              >
              </div>
              <div>
                <p className="section-eyebrow domain-modal__eyebrow">Domain Details</p>
                <h3 className="display-2 domain-modal__title" id="domain-modal-title">{selectedDomain.label}</h3>
                <p className="body-lg text-muted domain-modal__desc">{selectedDomain.description}</p>
                <Link
                  to={`/mentors?domain=${selectedDomain.id}`}
                  className="btn btn-primary domain-modal__cta"
                  id={`book-domain-${selectedDomain.id}`}
                >
                  Book a Session <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="domain-modal__areas">
              {selectedAreas.map((area, areaIndex) => (
                <article
                  key={area.title}
                  className="domain-modal__area"
                  style={{ '--subdomain-image': `url("${getDomainImage(undefined, selectedDomainIndex + areaIndex)}")` } as React.CSSProperties}
                >
                  <h4>{area.title}</h4>
                  <p>{area.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}


function CTASection() {
  const { user } = useAuthStore()
  return (
    <section className="cta-section" id="cta">
      <div className="cta-section__bg" />
      <div className="container cta-section__inner">
        <div className="animate-fadeInUp">
          <h2 className="display-2 cta-section__title">
            Ready to Find Your <span className="text-gradient">Clarity</span>?
          </h2>
          <p className="body-lg text-muted cta-section__desc">
            Join thousands of students and professionals who have already found their direction. Your first step towards a more fulfilling life starts here.
          </p>
          <div className="cta-section__actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-accent btn-xl" id="final-cta">
                Go to Dashboard <ArrowRight size={20} />
              </Link>
            ) : (
              <Link
                to="/get-started"
                className="btn btn-primary btn-xl"
                id="final-cta"
              >
                Start for Free <ArrowRight size={20} />
              </Link>
            )}
            <Link to="/mentors" className="btn btn-outline btn-xl" id="browse-mentors-cta">
              Browse Mentors
            </Link>
          </div>
          <p className="body-sm text-muted" style={{ marginTop: 'var(--sp-4)' }}>
            No credit card required · Anonymous option available · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      icon: '✦',
      title: 'Choose Your Space',
      desc: 'Share as much or as little as you want. Use a pseudonym. Complete anonymity is always an option — your comfort comes first.',
    },
    {
      step: '02',
      icon: '◉',
      title: 'Pick Your Domain',
      desc: 'Select the life area you want guidance in — from 18 domains covering career, emotions, relationships, growth, and more.',
    },
    {
      step: '03',
      icon: '◇',
      title: 'Match with a Mentor',
      desc: 'Browse verified mentors who specialize in your domain. Read their stories, ratings, and book a time that works for you.',
    },
    {
      step: '04',
      icon: '✓',
      title: 'Have a Real Conversation',
      desc: 'A structured, empathetic 1-on-1 session. Get listened to, gain clarity, and walk away with practical action steps.',
    },
  ]
  return (
    <section className="section how-section" id="how-it-works">
      <div className="container">
        <div className="section-header how-section__header animate-fadeInUp">
          <div className="section-eyebrow">Simple Process</div>
          <h2 className="display-2">How <span className="text-gradient">LifeFundies</span> Works</h2>
          <p className="body-lg text-muted">
            Four simple steps from confusion to clarity. No complicated forms, no clinical judgement — just real guidance.
          </p>
        </div>
        <div className="how-grid">
          {steps.map((step, i) => (
            <div key={i} className={`how-card animate-fadeInUp delay-${((i + 1) * 100) as 100 | 200 | 300 | 400}`} id={`how-step-${i + 1}`}>
              <div className="how-card__step">{step.step}</div>
              <div className="how-card__icon">{step.icon}</div>
              <h3 className="heading-3">{step.title}</h3>
              <p className="body-sm text-muted">{step.desc}</p>
              {i < steps.length - 1 && <div className="how-card__connector" aria-hidden="true">→</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MentorsSection() {
  const [mentors, setMentors] = useState<any[]>([])

  useEffect(() => {
    const unsubscribe = subscribeToMentors((dbMentors) => {
      setMentors(dbMentors.slice(0, 4))
    })
    return () => unsubscribe()
  }, [])

  return (
    <section className="section mentors-section" id="mentors">
      <div className="container">
        <div className="section-header animate-fadeInUp">
          <div className="section-eyebrow"> Expert Guidance</div>
          <h2 className="display-2">Meet Our <span className="text-gradient">Mentors</span></h2>
          <p className="body-lg text-muted">
            Real people, real journeys. Our verified mentors bring lived experience and structured frameworks to every session.
          </p>
        </div>
        <div className="mentors-grid">
          {mentors.map((mentor, i) => (
            <div key={mentor.uid} className={`mentor-card animate-fadeInUp delay-${((i % 4 + 1) * 100) as 100 | 200 | 300 | 400}`} id={`mentor-${mentor.uid}`}>
              <div className="mentor-card__header">
                <div className="avatar avatar-lg" style={{ background: `hsl(${i * 80}, 60%, 40%)`, overflow: 'hidden' }}>
                  {mentor.photoURL ? (
                    <img src={mentor.photoURL} alt={mentor.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    getInitials(mentor.displayName)
                  )}
                </div>
                <div>
                  <p className="mentor-card__name">{mentor.displayName}</p>
                  <p className="body-sm text-muted">{mentor.yearsOfExperience}+ years experience</p>
                  <div className="stars" style={{ marginTop: '2px' }}>
                    {Array.from({ length: 5 }).map((_, j) => <span key={j} className="star">★</span>)}
                    <span className="body-sm text-muted" style={{ marginLeft: '4px' }}>{mentor.rating} ({mentor.reviewCount})</span>
                  </div>
                </div>
                {mentor.isVerified && <span className="badge badge-primary mentor-card__verified">✓ Verified</span>}
              </div>

              <div className="mentor-card__domains">
                {(mentor.domains || []).map((d: string) => {
                  const domain = LIFE_DOMAINS.find(x => x.id === d)
                  return domain ? <span key={d} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{domain.label}</span> : null
                })}
              </div>

              <p className="body-sm text-muted mentor-card__bio">{mentor.bio}</p>

              <div className="mentor-card__stats">
                <span className="body-sm text-muted">{mentor.totalSessions}+ sessions</span>
                <span className="mentor-card__price">{formatCurrency(mentor.sessionPrice)}/session</span>
              </div>

              <Link to={`/mentors/${mentor.uid}`} className="btn btn-outline" style={{ width: '100%' }}>
                View Profile & Book
              </Link>
            </div>
          ))}
        </div>
        {mentors.length === 0 && (
          <div className="mentors-page__empty">
            <h3 className="heading-2">No verified mentors yet</h3>
            <p className="text-muted">Approved real mentors will appear here automatically.</p>
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: 'var(--sp-10)' }}>
          <Link to="/mentors" className="btn btn-primary btn-lg" id="view-all-mentors">
            View All Mentors <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className="section" style={{ background: 'var(--clr-bg-alt)' }} id="testimonials">
      <div className="container">
        <div className="section-header animate-fadeInUp">
          <div className="section-eyebrow">Real Stories</div>
          <h2 className="display-2">Lives <span className="text-gradient">Transformed</span></h2>
          <p className="body-lg text-muted">
            Don't take our word for it. Hear from the students and professionals who found their direction with LifeFundies.
          </p>
        </div>
        <div className="testimonials-grid">
          {MOCK_TESTIMONIALS.map((t, i) => (
            <div key={i} className={`testimonial-card animate-fadeInUp delay-${((i % 4 + 1) * 100) as 100 | 200 | 300 | 400}`} id={`testimonial-${i + 1}`}>
              <div className="stars testimonial-card__stars">
                {Array.from({ length: 5 }).map((_, j) => <span key={j} className="star">★</span>)}
              </div>
              <p className="testimonial-card__text">"{t.text}"</p>
              <div className="testimonial-card__author">
                <div className="avatar avatar-md" style={{ overflow: 'hidden' }}>
                  <img src={t.avatar} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <p className="testimonial-card__name">{t.name}</p>
                  <p className="body-sm text-muted">{t.role}</p>
                  <span className="badge badge-primary" style={{ fontSize: '0.7rem', marginTop: '4px' }}>{t.domain}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


function PricingSection() {
  const { user } = useAuthStore()
  const plans = [
    {
      name: 'Peer Buddy',
      price: 129,
      badge: 'Most Accessible',
      badgeClass: 'badge-primary',
      features: [
        '30-minute 1-on-1 session',
        'Choose from 18 life domains',
        'Verified mentor',
        'Anonymous option available',
      ],
      cta: 'Book a Session',
      highlight: false,
    },
    {
      name: 'Young Mentor',
      price: 199,
      badge: 'Most Popular',
      badgeClass: 'badge-accent',
      features: [
        '45-minute guidance session',
        'Young mentor access',
        'Pre-session questionnaire',
        'Personalised action plan',
      ],
      cta: 'Get Started',
      highlight: true,
    },
    {
      name: 'Senior Advisor',
      price: 299,
      badge: 'Best Value',
      badgeClass: 'badge-secondary',
      features: [
        '45-minute senior advisory session',
        'Senior advisor access',
        'Priority scheduling',
        'Detailed written guidance',
      ],
      cta: 'Go Premium',
      highlight: false,
    },
  ]

  return (
    <section className="section pricing-section" id="pricing">
      <div className="container">
        <div className="section-header animate-fadeInUp">
          <div className="section-eyebrow">Affordable Guidance</div>
          <h2 className="display-2">Invest in <span className="text-gradient">Yourself</span></h2>
          <p className="body-lg text-muted">
            Expert life guidance, priced for students and young professionals. No hidden charges, no long commitments.
          </p>
        </div>
        <div className="pricing-grid">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`pricing-card animate-fadeInUp delay-${((i + 1) * 100) as 100 | 200 | 300} ${plan.highlight ? 'pricing-card--featured' : ''}`}
              id={`pricing-${plan.name.toLowerCase()}`}
            >
              {plan.highlight && <div className="pricing-card__glow" />}
              <div className="pricing-card__header">
                <span className={`badge ${plan.badgeClass}`}>{plan.badge}</span>
                <h3 className="heading-2 pricing-card__name">{plan.name}</h3>
                <div className="pricing-card__price">
                  <span className="pricing-card__currency">₹</span>
                  <span className="pricing-card__amount">{plan.price}</span>
                  <span className="text-muted body-sm">/session</span>
                </div>
              </div>
              <ul className="pricing-card__features">
                {plan.features.map((f, j) => (
                  <li key={j} className="pricing-card__feature">
                    <CheckCircle size={16} style={{ color: 'var(--clr-primary-light)', flexShrink: 0 }} />
                    <span className="body-sm">{f}</span>
                  </li>
                ))}
              </ul>
              {user ? (
                <Link to="/mentors" className={`btn btn-xl ${plan.highlight ? 'btn-primary' : 'btn-outline'}`} style={{ width: '100%' }}>
                  {plan.cta}
                </Link>
              ) : (
                <Link
                  to="/get-started"
                  className={`btn btn-xl ${plan.highlight ? 'btn-primary' : 'btn-outline'}`}
                  style={{ width: '100%' }}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
        <p className="body-sm text-muted" style={{ textAlign: 'center', marginTop: 'var(--sp-6)' }}>
          🔒 All payments secured via Cashfree · Refunds and cancellations are handled as per our policy
        </p>
      </div>
    </section>
  )
}
