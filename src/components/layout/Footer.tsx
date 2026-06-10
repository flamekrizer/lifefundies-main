import { Link } from 'react-router-dom'
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
              <img className="brand-logo footer__brand-logo" src="/logo.png" alt="LifeFundies Logo" style={{ height: '40px', objectFit: 'contain', display: 'block' }} />
            </div>
            <p className="footer__tagline body-sm text-muted">
              India's most trusted holistic life-guidance platform. Empowering individuals across 18 life domains with clarity, confidence, and direction.
            </p>
            <div className="footer__badges" aria-label="Platform highlights">
              <span>18 life domains</span>
              <span>Sessions from ₹129</span>
              <span>Cashfree secured</span>
            </div>
            <div className="footer__social" aria-label="Social links">
              <a href="https://www.instagram.com/lifefundies/" className="footer__social-link" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://x.com/lifefundies" className="footer__social-link" target="_blank" rel="noopener noreferrer">X</a>
              <a href="https://www.linkedin.com/company/lifefundies/" className="footer__social-link" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="https://www.youtube.com/@LifeFundies" className="footer__social-link" target="_blank" rel="noopener noreferrer">YouTube</a>
            </div>
          </div>

          {/* Platform */}
          <div className="footer__col">
            <h4 className="footer__heading">Platform</h4>
            <nav aria-label="Platform links">
              <Link to="/mentors" className="footer__link">Find Guides</Link>
              <Link to="/services" className="footer__link">Products & Services</Link>
              <Link to="/community" className="footer__link">Community Forum</Link>
              <Link to="/mentor-register" className="footer__link">Become a Guide</Link>
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
                  {domain.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="footer__col">
            <h4 className="footer__heading">Contact</h4>
            <div className="footer__contact">
              <a href="mailto:support@lifefundies.in" className="footer__contact-item">
                <span>Email</span>
                <strong>support@lifefundies.in</strong>
              </a>
              <a href="tel:+917055984498" className="footer__contact-item">
                <span>Phone</span>
                <strong>+91-7055984498</strong>
              </a>
              <div className="footer__contact-item">
                <span>Mode</span>
                <strong>Online Services</strong>
              </div>
            </div>
            <div className="footer__legal">
              <p className="body-sm text-muted">
                <em>Registered as LifeFundies Private Limited</em>
              </p>
              <p className="body-sm text-muted">
                Online guidance services across India.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <p className="body-sm text-muted">
            © 2025 LifeFundies Private Limited. Built for India's youth.
          </p>
          <div className="footer__bottom-links">
            <Link to="/privacy" className="footer__bottom-link">Privacy Policy</Link>
            <Link to="/terms" className="footer__bottom-link">Terms & Conditions</Link>
            <Link to="/refund" className="footer__bottom-link">Refunds & Cancellations</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
