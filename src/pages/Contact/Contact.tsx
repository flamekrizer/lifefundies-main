import { useState } from 'react'
import { Mail, Phone, MapPin, Loader2, Send } from 'lucide-react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError('Please fill in all the required fields.')
      return
    }

    try {
      setLoading(true)

      // Save the message in the contacts collection in Firestore
      await addDoc(collection(db, 'contacts'), {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        createdAt: serverTimestamp(),
      })

      setSuccess('Your message has been sent successfully! We will get back to you shortly.')
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    } catch (err: any) {
      console.error('Error saving contact message:', err)
      setError('Failed to send your message. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper animate-fadeIn">
      {/* Hero Banner */}
      <section
        className="contact-hero"
        style={{
          backgroundImage: "url('/Contact us.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="contact-hero__overlay" />
        <div className="container contact-hero__content">
          <h1 className="contact-hero__title">Contact Us</h1>
          <p className="contact-hero__subtitle">We are here to support you on your life journey</p>
        </div>
      </section>

      {/* Main Section */}
      <section className="section contact-section">
        <div className="container">
          <div className="contact-grid">
            {/* Left Column: Info Card */}
            <div className="contact-info">
              <span className="contact-eyebrow">GET IN TOUCH</span>
              <h2 className="heading-1 contact-title">We'd love to hear from you.</h2>
              <p className="body-lg text-muted contact-desc" style={{ marginBottom: 'var(--sp-6)' }}>
                Have questions about our peer-guidance sessions, domain matching, or corporate packages? Drop us a message, and our team will get in touch with you within 24 hours.
              </p>

              <div className="contact-details-list">
                <div className="contact-detail-item">
                  <div className="contact-detail-icon">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600 }}>Email Us</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <a href="mailto:support@lifefundies.in" className="contact-detail-link">
                        support@lifefundies.in
                      </a>
                      <a href="mailto:lifefundies@gmail.com" className="contact-detail-link">
                        lifefundies@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="contact-detail-item">
                  <div className="contact-detail-icon">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600 }}>Call Us</h4>
                    <a href="tel:+917055984498" className="contact-detail-link">
                      +91-7055984498
                    </a>
                  </div>
                </div>

                <div className="contact-detail-item">
                  <div className="contact-detail-icon">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600 }}>Our Location</h4>
                    <p className="body-sm text-muted">Online Services</p>
                  </div>
                </div>
              </div>

              <div className="contact-founder-box">
                <p className="body-sm text-muted" style={{ fontWeight: 500 }}>
                  Registered as LifeFundies Private Limited (Proposed)
                </p>
                <p className="body-sm text-muted" style={{ marginTop: '0.25rem' }}>
                  Founder: Asmit Sharma, B.Tech CSE, Sharda University
                </p>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="contact-form-container card" style={{ padding: 'var(--sp-6)' }}>
              <h3 className="heading-3" style={{ marginBottom: 'var(--sp-4)' }}>Send us a Message</h3>
              
              {success && <div className="contact-status-msg text-success">{success}</div>}
              {error && <div className="contact-status-msg text-error">{error}</div>}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-name">Full Name *</label>
                  <input
                    type="text"
                    id="contact-name"
                    className="form-input"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginTop: 'var(--sp-4)' }}>
                  <label className="form-label" htmlFor="contact-email">Email Address *</label>
                  <input
                    type="email"
                    id="contact-email"
                    className="form-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginTop: 'var(--sp-4)' }}>
                  <label className="form-label" htmlFor="contact-subject">Subject *</label>
                  <input
                    type="text"
                    id="contact-subject"
                    className="form-input"
                    placeholder="What is this regarding?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginTop: 'var(--sp-4)' }}>
                  <label className="form-label" htmlFor="contact-message">Message *</label>
                  <textarea
                    id="contact-message"
                    className="form-input"
                    rows={5}
                    placeholder="Write your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={loading}
                    style={{ resize: 'none' }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: 'var(--sp-6)' }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
