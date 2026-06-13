import { FormEvent, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { LIFE_DOMAINS } from '../types'
import type { IRAMessage, IRASuggestedAction } from '../types/fundoo'
import { useAuthStore } from '../stores'
import { callIRA, getIRAStatus } from '../lib/iraClient'

const DOMAIN_ALIASES: Record<string, string> = {
  // Primary mappings: production label string → domain ID
  // (label is what users see; id is what LIFE_DOMAINS uses internally)
  'career & profession': 'career',
  career: 'career',
  'mental well-being': 'emotional',
  relationships: 'relationships',
  'health & fitness': 'confidence',
  'education & learning': 'communication',
  'business & entrepreneurship': 'productivity',
  'finance & wealth': 'stress',
  'love & intimacy': 'decisions',
  'social life & networking': 'motivation',
  'personal growth': 'growth',
  'spirituality & purpose': 'social',
  'technology & digital life': 'academic',
  'family responsibilities': 'professional',
  'creativity & innovation': 'lifestyle',
  'entertainment & fun': 'transitions',
  'society & contribution': 'values',
  'self-identity': 'financial',
  'dreams & aspirations': 'clarity',
}

const STARTER_PROMPTS = [
  'I feel confused about my career',
  'Help me manage overthinking',
  'Which guide should I choose?',
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

function ChatBubble({ message }: { message: IRAMessage }) {
  const domainId = getDomainId(message.domain)
  const domain = LIFE_DOMAINS.find(item => item.id === domainId)

  return (
    <article className={`fundoo-chatbot__message fundoo-chatbot__message--${message.sender}`}>
      <p>{message.content}</p>
      {message.sender === 'fundoo' && message.domain && domain && (
        <Link className="fundoo-chatbot__domain" to={`/mentors?domain=${domain.id}`}>
          {domain.label} guides
        </Link>
      )}
    </article>
  )
}

export default function LFBuddyChatbot() {
  const { user } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sessionId, setSessionId] = useState<string>()
  const [statusText, setStatusText] = useState('IRA ready')
  const [messages, setMessages] = useState<IRAMessage[]>([
    createChatMessage(
      'fundoo',
      'Hi, I am LF Buddy. Tell me what feels stuck right now, and I will guide you to the right LifeFundies domain or guide path.'
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
        userId: user?.uid || 'site_guest',
        message: text,
        sessionId,
        conversationContext: nextMessages.slice(-10),
        userProfile: {
          id: user?.uid || 'site_guest',
          name: user?.displayName || 'Guest',
          email: user?.email || 'guest@lifefundies.local',
          avatar: user?.photoURL,
          emotionState: undefined,
          recentDomains: user?.domains || [],
          sessionHistory: [],
          preferences: {
            source: 'global_chatbot',
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
    } catch {
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
