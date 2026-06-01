import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { useAuthStore, useAppStore } from '../../stores'
import { getInitials } from '../../utils'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'Find Mentors', href: '/mentors' },
  { label: 'Community', href: '/community' },
  { label: '18 Domains', href: '/#domains' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'FAQs', href: '/faq' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const { notificationsList, markAllNotificationsRead, markNotificationRead } = useAppStore()
  const unreadCount = notificationsList.filter(n => !n.isRead).length
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setProfileOpen(false)
    setShowNotifications(false)
  }, [location])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" aria-label="LifeFundies Home">
          <img src="/logo.png" alt="LifeFundies Logo" style={{ height: '40px', objectFit: 'contain', display: 'block' }} />
        </Link>

        {/* Desktop Nav */}
        <div className="navbar__links hide-mobile">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={`navbar__link ${location.pathname === link.href ? 'navbar__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="navbar__actions">
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-ghost btn-sm hide-mobile">Dashboard</Link>
              <div className="navbar__notif-container" style={{ position: 'relative' }}>
                <button 
                  className="navbar__notif" 
                  aria-label="Notifications"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="navbar__notif-badge">{unreadCount}</span>
                  )}
                </button>
                {showNotifications && (
                  <div className="navbar__notifications-dropdown animate-fadeIn">
                    <div className="navbar__dropdown-header-notif">
                      <span className="body-sm font-semibold text-muted">Notifications</span>
                      {unreadCount > 0 && (
                        <button className="btn btn-ghost btn-sm" style={{ padding: 0, fontSize: '0.75rem', height: 'auto' }} onClick={markAllNotificationsRead}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="navbar__notifications-list">
                      {notificationsList.length > 0 ? (
                        notificationsList.map(n => (
                          <div 
                            key={n.id} 
                            className={`navbar__notification-item ${!n.isRead ? 'navbar__notification-item--unread' : ''}`}
                            onClick={() => markNotificationRead(n.id)}
                          >
                            {n.text}
                          </div>
                        ))
                      ) : (
                        <div className="navbar__notification-item text-center text-muted" style={{ padding: '1rem' }}>
                          No notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="navbar__profile">
                <button
                  className="navbar__profile-btn"
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-expanded={profileOpen}
                  aria-label="Profile menu"
                >
                  <div className="avatar avatar-sm">{getInitials(user.displayName)}</div>
                  <ChevronDown size={14} className={profileOpen ? 'rotate-180' : ''} />
                </button>
                {profileOpen && (
                  <div className="navbar__dropdown">
                    <div className="navbar__dropdown-header">
                      <div className="avatar avatar-md">{getInitials(user.displayName)}</div>
                      <div>
                        <p className="navbar__dropdown-name">{user.displayName}</p>
                        <p className="navbar__dropdown-role body-sm text-muted">{user.role}</p>
                      </div>
                    </div>
                    <div className="divider" style={{ margin: '0.5rem 0' }} />
                    <Link to="/dashboard" className="navbar__dropdown-item"><User size={15} /> Dashboard</Link>
                    <Link to="/settings" className="navbar__dropdown-item"><Settings size={15} /> Settings</Link>
                    <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout}>
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm hide-mobile">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="navbar__mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile-menu">
          {NAV_LINKS.map(link => (
            <Link key={link.href} to={link.href} className="navbar__mobile-link">{link.label}</Link>
          ))}
          <div className="navbar__mobile-actions">
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-outline" style={{ flex: 1 }}>Dashboard</Link>
                <button className="btn btn-ghost" onClick={handleLogout} style={{ flex: 1 }}>Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline" style={{ flex: 1 }}>Sign In</Link>
                <Link to="/register" className="btn btn-primary" style={{ flex: 1 }}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
