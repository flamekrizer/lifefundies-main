import { Link } from 'react-router-dom'
import { Heart, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react'
import { LIFE_DOMAINS } from '../../types'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo">
              <div className="footer__logo-icon">LF</div>
              <span className="footer__logo-name">LifeFundies</span>
            </div>
            <p className="footer__tagline body-sm text-muted">
              India's most trusted holistic life-guidance platform. Empowering individuals across 18 life domains with clarity, confidence, and direction.
            </p>
            <div className="footer__social">
              <a href="https://instagram.com" className="footer__social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><Instagram size={18} /></a>
              <a href="https://twitter.com" className="footer__social-link" aria-label="Twitter" target="_blank" rel="noopener noreferrer"><Twitter size={18} /></a>
              <a href="https://linkedin.com" className="footer__social-link" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><Linkedin size={18} /></a>
              <a href="mailto:hello@lifefundies.com" className="footer__social-link" aria-label="Email"><Mail size={18} /></a>
            </div>
          </div>

          {/* Platform */}
          <div className="footer__col">
            <h4 className="footer__heading">Platform</h4>
            <nav aria-label="Platform links">
              <Link to="/mentors" className="footer__link">Find Mentors</Link>
              <Link to="/community" className="footer__link">Community Forum</Link>
              <Link to="/register" className="footer__link">Become a Mentor</Link>
              <Link to="/#pricing" className="footer__link">Pricing</Link>
              <Link to="/#how-it-works" className="footer__link">How It Works</Link>
            </nav>
          </div>

          {/* Domains */}
          <div className="footer__col">
            <h4 className="footer__heading">Life Domains</h4>
            <nav aria-label="Domain links">
              {LIFE_DOMAINS.slice(0, 6).map(domain => (
                <Link key={domain.id} to={`/mentors?domain=${domain.id}`} className="footer__link">
                  <span>{domain.icon}</span> {domain.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="footer__col">
            <h4 className="footer__heading">Contact</h4>
            <div className="footer__contact">
              <a href="mailto:hello@lifefundies.com" className="footer__contact-item">
                <Mail size={16} /> hello@lifefundies.com
              </a>
              <a href="tel:+911234567890" className="footer__contact-item">
                <Phone size={16} /> +91 12345 67890
              </a>
              <div className="footer__contact-item">
                <MapPin size={16} /> Noida, Uttar Pradesh, India
              </div>
            </div>
            <div className="footer__legal">
              <p className="body-sm text-muted">
                <em>Registered as LifeFundies Private Limited (Proposed)</em>
              </p>
              <p className="body-sm text-muted" style={{ marginTop: '0.5rem' }}>
                Founder: Asmit Sharma, B.Tech CSE, Sharda University
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <p className="body-sm text-muted">
            © 2025 LifeFundies Private Limited. Made with <Heart size={12} style={{ display: 'inline', color: 'var(--clr-accent)' }} /> for India's youth.
          </p>
          <div className="footer__bottom-links">
            <Link to="/privacy" className="footer__bottom-link">Privacy Policy</Link>
            <Link to="/terms" className="footer__bottom-link">Terms of Service</Link>
            <Link to="/refund" className="footer__bottom-link">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
