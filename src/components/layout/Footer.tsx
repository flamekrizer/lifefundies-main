import { Link } from 'react-router-dom'
import { Heart, Instagram, Twitter, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react'
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
              <img src="/logo.png" alt="LifeFundies Logo" style={{ height: '40px', objectFit: 'contain', display: 'block' }} />
            </div>
            <p className="footer__tagline body-sm text-muted">
              India's most trusted holistic life-guidance platform. Empowering individuals across 18 life domains with clarity, confidence, and direction.
            </p>
            <div className="footer__social">
              <a href="https://www.instagram.com/lifefundies/" className="footer__social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><Instagram size={18} /></a>
              <a href="https://x.com/lifefundies" className="footer__social-link" aria-label="Twitter/X" target="_blank" rel="noopener noreferrer"><Twitter size={18} /></a>
              <a href="https://www.linkedin.com/company/lifefundies/" className="footer__social-link" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><Linkedin size={18} /></a>
              <a href="https://www.youtube.com/@LifeFundies" className="footer__social-link" aria-label="YouTube" target="_blank" rel="noopener noreferrer"><Youtube size={18} /></a>
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
              <Link to="/faq" className="footer__link">FAQs</Link>
              <Link to="/contact" className="footer__link">Contact Us</Link>
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
              <a href="mailto:support@lifefundies.in" className="footer__contact-item">
                <Mail size={16} /> support@lifefundies.in
              </a>
              <a href="tel:+917055984498" className="footer__contact-item">
                <Phone size={16} /> +91-7055984498
              </a>
              <div className="footer__contact-item">
                <MapPin size={16} /> Online Services
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
