export const CONTENT_MODERATION_ERROR_MESSAGE =
  'Please avoid abusive, hateful, or harassing language before posting.'

const ENGLISH_WORDS = [
  'asshole', 'bastard', 'bitch', 'bitches', 'bullshit', 'cunt', 'dickhead',
  'douchebag', 'faggot', 'fuck', 'fucked', 'fucker', 'fucking', 'motherfucker',
  'nigga', 'nigger', 'prick', 'retard', 'shit', 'slut', 'whore', 'cock', 'dick',
  'pussy', 'twat', 'wanker', 'bollocks', 'arse', 'arsehole', 'bugger', 'crap',
  'damn', 'goddamn', 'piss', 'pissed', 'sonofabitch',
]

const HINDI_WORDS = [
  'bhadwe', 'bhadwa', 'bhosdi', 'bhosdike', 'benchod', 'bhenchod', 'behenchod',
  'behen chod', 'bhen chod', 'chut', 'chutia', 'chutiya', 'chutiye', 'gandu',
  'gaand', 'gand', 'harami', 'kamina', 'kamine', 'kutti', 'kutta', 'lauda',
  'lund', 'madarchod', 'randi', 'saala', 'saali', 'teri maa', 'maa ki', 'bhen ki',
]

const BANNED_WORDS = [...new Set([...ENGLISH_WORDS, ...HINDI_WORDS])]

const BANNED_PHRASES = [
  'behen chod', 'bhen chod', 'benchod', 'bhosdi ke', 'bhosdike',
  'kill yourself', 'mother fucker', 'motherfucker', 'son of a bitch',
  'suck my dick', 'fuck you', 'fuck off', 'fuck up', 'shit face',
  'bastard child', 'kys',
]

const LEET_MAP: Readonly<Record<string, string>> = {
  '@': 'a', '4': 'a', '3': 'e', '1': 'i', '!': 'i', '0': 'o',
  '$': 's', '5': 's', '7': 't', '2': 'z', '6': 'g', '8': 'b',
  '9': 'g', '+': 't', '|': 'i',
}

// Precompile leet regex once
const LEET_PATTERN = new RegExp(
  Object.keys(LEET_MAP).map(escapeRegex).join('|'),
  'g'
)

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const WORD_REGEX = BANNED_WORDS.map(
  (word) => new RegExp(`\\b${escapeRegex(word)}\\b`, 'i')
)

const PHRASE_REGEX = BANNED_PHRASES.map((phrase) => {
  const words = phrase.split(/\s+/).map(escapeRegex)
  return new RegExp(`\\b${words.join('\\s+')}\\b`, 'i')
})

const CONDENSED_SET = new Set<string>(
  BANNED_WORDS.map((w) => w.replace(/\s+/g, ''))
)
BANNED_PHRASES.forEach((p) => {
  CONDENSED_SET.add(p.replace(/\s+/g, ''))
})

function normalizeText(text: string): string {
  let normalized = text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  // Single‑pass leet replacement
  normalized = normalized.replace(LEET_PATTERN, (match) => LEET_MAP[match] || match)

  // Collapse repeated letters (3+ → 1)
  normalized = normalized.replace(/(.)\1{2,}/g, '$1')

  // Replace non‑alphanumeric with space
  normalized = normalized.replace(/[^a-z0-9]+/g, ' ')

  // Collapse multiple spaces
  normalized = normalized.replace(/\s{2,}/g, ' ').trim()

  return normalized
}

function removeWhitespace(text: string): string {
  return text.replace(/\s+/g, '')
}

export function containsBannedLanguage(text: string): boolean {
  if (!text || typeof text !== 'string') return false
  const normalized = normalizeText(text)
  if (!normalized) return false

  if (WORD_REGEX.some((regex) => regex.test(normalized))) return true
  if (PHRASE_REGEX.some((regex) => regex.test(normalized))) return true

  const condensed = removeWhitespace(normalized)
  if (condensed.length >= 3) {
    for (const banned of CONDENSED_SET) {
      if (banned.length >= 3 && condensed.includes(banned)) return true
    }
  }

  return false
}

export function assertAllowedCommunityText(text: string): void {
  if (containsBannedLanguage(text)) {
    throw new Error(CONTENT_MODERATION_ERROR_MESSAGE)
  }
}

export function sanitizeCommunityText(text: string): string {
  if (!text || typeof text !== 'string') return ''
  return text.trim().replace(/\s{2,}/g, ' ')
}