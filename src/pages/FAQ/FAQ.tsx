import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import './FAQ.css'

interface FAQItem {
  question: string
  answer: React.ReactNode
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0) // Default first open

  const faqItems: FAQItem[] = [
    {
      question: 'What is LifeFundies?',
      answer: (
        <p>
          <strong>LifeFundies</strong> is India's first <em>Life-Readiness Platform</em> — a safe space where you can get guidance for anything that bothers you: relationships, career confusion, mental well-being, or just life in general. It's not therapy, not edtech — it's a holistic guidance buddy.
        </p>
      ),
    },
    {
      question: 'How is LifeFundies different from therapy or counselling platforms?',
      answer: (
        <p>
          We're not just about mental health. LifeFundies offers <em>peer-based guidance</em>, <em>mentorship from seniors</em>, <em>anonymous safe spaces</em>, and <em>real-life problem solving</em> — not just psychological diagnosis. Think of it like talking to someone who gets it, with the wisdom to help.
        </p>
      ),
    },
    {
      question: 'Is this platform anonymous?',
      answer: (
        <p>
          <strong>Yes.</strong> You can choose to stay anonymous during sessions. We respect privacy and never judge. Your problems are safe with us.
        </p>
      ),
    },
    {
      question: 'Who are the people guiding me?',
      answer: (
        <div>
          <p style={{ marginBottom: 'var(--sp-2)' }}>Our guides include:</p>
          <ul className="faq-list">
            <li>Trained peer mentors</li>
            <li>Senior citizens with life experience</li>
            <li>LifeFundies-trained professionals</li>
          </ul>
          <p style={{ marginTop: 'var(--sp-2)' }}>
            Each guide is handpicked and trained under our internal process. No random volunteers — only people with empathy, experience, and clarity.
          </p>
        </div>
      ),
    },
    {
      question: 'Is there a free session?',
      answer: (
        <p>
          <strong>Yes!</strong> Your <strong>first session (20 min)</strong> is absolutely free. It helps you understand how we work and if LifeFundies is the right space for you.
        </p>
      ),
    },
    {
      question: 'How will the session happen?',
      answer: (
        <p>
          Sessions are held online via Google Meet or Zoom. You'll receive the link in your email/WhatsApp once your booking is confirmed.
        </p>
      ),
    },
    {
      question: 'What will I get after the session?',
      answer: (
        <div>
          <p style={{ marginBottom: 'var(--sp-2)' }}>You'll receive a:</p>
          <ul className="faq-list">
            <li>Personalized <strong>Session Summary</strong></li>
            <li>Your unique <strong>LF-ID</strong> (for progress tracking)</li>
            <li>A <strong>Next Steps Plan</strong> (goals, habits, tools)</li>
          </ul>
        </div>
      ),
    },
    {
      question: 'Can I cancel or reschedule a session?',
      answer: (
        <p>
          You can reschedule <strong>up to 12 hours</strong> before your session. Cancellations aren't refunded, but missed sessions can be rescheduled once.
        </p>
      ),
    },
    {
      question: 'Can I refer a friend?',
      answer: (
        <p>
          Of course! And you should. Earn discounts, free sessions, or exclusive resources when your friends book using your <strong>LF-ID code</strong>.
        </p>
      ),
    },
  ]

  return (
    <div className="page-wrapper">
      {/* Hero Banner */}
      <section className="faq-hero">
        <div className="faq-hero__overlay" />
        <div className="container faq-hero__content">
          <h1 className="faq-hero__title">Faqs</h1>
          <p className="faq-hero__subtitle">Frequently Ask Questions</p>
        </div>
      </section>

      {/* Accordion Section */}
      <section className="section faq-section">
        <div className="container">
          <div className="faq-container">
            <span className="faq-eyebrow">COMMON QUESTIONS</span>
            <h2 className="heading-1 faq-title">
              Everything you need to know before booking your first session.
            </h2>

            <div className="faq-accordion">
              {faqItems.map((item, index) => {
                const isOpen = openIndex === index
                return (
                  <div
                    key={index}
                    className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}
                  >
                    <button
                      type="button"
                      className="faq-item__header"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      aria-expanded={isOpen}
                    >
                      <span className="faq-item__question">{item.question}</span>
                      <span className="faq-item__icon-wrapper">
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="faq-item__body animate-fadeIn">
                        {item.answer}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
