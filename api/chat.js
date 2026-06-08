const DOMAIN_ALIASES = [
  ['career', ['career', 'job', 'profession', 'work', 'office', 'interview']],
  ['emotional', ['stress', 'anxiety', 'sad', 'mental', 'emotion', 'overthinking']],
  ['relationships', ['family', 'parent', 'relationship', 'friend', 'conflict']],
  ['confidence', ['health', 'fitness', 'body', 'sleep', 'exercise']],
  ['communication', ['study', 'education', 'learning', 'exam', 'college']],
  ['productivity', ['business', 'startup', 'entrepreneur', 'idea']],
  ['stress', ['money', 'finance', 'wealth', 'budget', 'invest']],
  ['decisions', ['love', 'partner', 'dating', 'intimacy', 'breakup']],
  ['motivation', ['social', 'network', 'friendship', 'lonely']],
  ['growth', ['growth', 'discipline', 'habit', 'confidence', 'self improvement']],
  ['social', ['purpose', 'spiritual', 'peace', 'mindfulness']],
  ['academic', ['technology', 'digital', 'phone', 'screen', 'internet']],
  ['professional', ['responsibility', 'home', 'household']],
  ['lifestyle', ['creative', 'creativity', 'art', 'writing', 'innovation']],
  ['transitions', ['fun', 'entertainment', 'hobby', 'relax']],
  ['values', ['society', 'contribution', 'volunteer', 'impact']],
  ['financial', ['identity', 'self identity', 'who am i']],
  ['clarity', ['dream', 'goal', 'aspiration', 'future', 'confused', 'clarity']],
]

const getModel = () => process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

const classifyDomain = (message = '') => {
  const text = message.toLowerCase()
  const match = DOMAIN_ALIASES.find(([, keywords]) => keywords.some(keyword => text.includes(keyword)))
  return match?.[0] || 'clarity'
}

const fallbackResponse = (message) => {
  const domain = classifyDomain(message)
  return {
    sessionId: `fundoo_${Date.now()}`,
    message: 'Main connected hoon. Aapki baat samajh raha hoon. Is situation ko thoda calmly break karte hain: sabse pehle ek line me batao ki sabse zyada pressure kis cheez ka feel ho raha hai, phir main aapko right LifeFundies domain aur next step suggest karunga.',
    emotion: 'supportive',
    domain,
    responseType: 'GUIDE',
    suggestedActions: [
      { type: 'BOOK_MENTOR', label: 'Find matching mentors', data: { domain } },
      { type: 'CHAT', label: 'Tell me more', data: { domain } },
    ],
    metadata: {
      llmConfigured: false,
    },
  }
}

const parseGroqContent = (content, message) => {
  try {
    const parsed = JSON.parse(content)
    return {
      sessionId: parsed.sessionId || `fundoo_${Date.now()}`,
      message: parsed.message,
      emotion: parsed.emotion || 'supportive',
      domain: parsed.domain || classifyDomain(message),
      responseType: parsed.responseType || 'GUIDE',
      suggestedActions: Array.isArray(parsed.suggestedActions) ? parsed.suggestedActions : [],
      metadata: {
        ...(parsed.metadata || {}),
        llmConfigured: true,
      },
    }
  } catch {
    const domain = classifyDomain(message)
    return {
      sessionId: `fundoo_${Date.now()}`,
      message: content,
      emotion: 'supportive',
      domain,
      responseType: 'GUIDE',
      suggestedActions: [
        { type: 'BOOK_MENTOR', label: 'Find matching mentors', data: { domain } },
      ],
      metadata: {
        llmConfigured: true,
      },
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.GROQ_API_KEY
  const { message, userProfile, conversationContext = [], sessionId } = req.body || {}

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'message is required.' })
    return
  }

  if (!apiKey) {
    res.status(200).json(fallbackResponse(message))
    return
  }

  try {
    const recentMessages = conversationContext
      .slice(-8)
      .map((item) => `${item.sender === 'fundoo' ? 'LF Buddy' : 'User'}: ${item.content}`)
      .join('\n')

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: getModel(),
        temperature: Number(process.env.GROQ_TEMPERATURE || 0.65),
        max_tokens: Number(process.env.GROQ_MAX_TOKENS || 650),
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: [
              'You are LF Buddy, a warm LifeFundies guidance companion for young people.',
              'Respond in the same language style as the user, usually simple Hinglish if the user uses Hindi/Hinglish.',
              'Do not claim to be a therapist or doctor. For self-harm or emergency risk, suggest immediate trusted human/professional help.',
              'Return only JSON with keys: sessionId, message, emotion, domain, responseType, suggestedActions.',
              'domain must be one of: career, emotional, relationships, confidence, communication, productivity, stress, decisions, motivation, growth, social, academic, professional, lifestyle, transitions, values, financial, clarity.',
              'suggestedActions should be 1-3 short actions with type and label, optionally data.domain.',
            ].join(' '),
          },
          {
            role: 'user',
            content: JSON.stringify({
              sessionId,
              message,
              userName: userProfile?.name || 'Guest',
              recentDomains: userProfile?.recentDomains || [],
              recentConversation: recentMessages,
            }),
          },
        ],
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('LF Buddy Groq error:', data?.error?.message || data)
      res.status(200).json(fallbackResponse(message))
      return
    }

    const content = data?.choices?.[0]?.message?.content
    if (!content) {
      res.status(200).json(fallbackResponse(message))
      return
    }

    res.status(200).json(parseGroqContent(content, message))
  } catch (error) {
    console.error('LF Buddy serverless error:', error)
    res.status(200).json(fallbackResponse(message))
  }
}
