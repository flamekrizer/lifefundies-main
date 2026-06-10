import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'

type TeamMember = {
  name: string
  role: string
  group?: string
  image?: string
}

const FOUNDER: TeamMember = {
  name: 'Asmit Sharma',
  role: 'Founder, CEO & Co-founder',
  group: 'Founder',
  image: 'https://lifefundies-d66e9.web.app/founder.jpeg',
}

const LEADERSHIP: TeamMember[] = [
  {
    name: 'Saquib Shamshi',
    role: 'CTO',
    group: 'Technology',
    image: '/team/saquib-shamshi.jpg',
  },
  {
    name: 'Shreya',
    role: 'COO',
    group: 'Operations',
    image: '/team/shreya.jpg',
  },
  {
    name: 'Mrs. Pratibha Sharma',
    role: 'Co-Founder & Advisor',
    group: 'Advisory',
    image: '/team/pratibha-sharma.jpg',
  },
]

const PRODUCT_MANAGERS: TeamMember[] = [
  {
    name: 'Avani Sharma',
    role: 'Product & Design Manager',
    group: 'Product',
    image: '/team/avani-sharma.jpg',
  },
]

const CORE_TEAM: TeamMember[] = [
  {
    name: 'Pushkar Singh',
    role: 'Co Head of Tech',
    group: 'Technology',
    image: '/team/pushkar-singh.jpg',
  },

  {
    name: 'Deepak',
    role: 'Web Developer',
    group: 'Engineering',
    image: '/team/deepak.jpg',
  },
  {
    name: 'Aarjav',
    role: 'Finance & Operations',
    group: 'Operations',
    image: '/team/aarjav.jpg',
  },
  {
    name: 'Aishwarya Srivastava',
    role: 'Content Head',
    group: 'Content',
    image: '/team/aishwarya-srivastava.jpg',
  },
  {
    name: 'Yogita',
    role: 'Communication & Content',
    group: 'Communication',
    image: '/team/yogita.jpg',
  },
  {
    name: 'Riddhi Thakur',
    role: 'Content Creation & Customer Support',
    group: 'Support',
    image: '/team/riddhi-thakur.jpg',
  },
  {
    name: 'Astitva',
    role: 'Video Editor & Marketing Head',
    group: 'Marketing',
    image: '/team/astitva.jpg',
  },
  {
    name: 'Sameer Omair',
    role: 'Social Media Manager',
    group: 'Marketing',
    image: '/team/sameer-omair.jpg',
  },
  {
    name: 'Devesh Kumar',
    role: 'Guide & Advisor',
    group: 'Guidance',
    image: '/team/devesh-kumar.jpg',
  },
  {
    name: 'Gaurav Mudgal',
    role: 'Guide',
    group: 'Guidance',
    image: '/team/gaurav-mudgal.jpg',
  },
  {
    name: 'Harshit Kumar',
    role: 'Intern',
    group: 'Internship',
    image: '/team/harshit.jpg',
  },
  {
    name: 'Krishna Sharma',
    role: 'Intern',
    group: 'Internship',
    image: '/team/krishna-sharma.jpg',
  },
]

const ADVISORS = [
  {
    name: 'Keith Sherringham',
    role: 'Global Advisor - AI Governance & Business Transformation',
    href: 'https://lifefundies-d66e9.web.app/team/keith-sherringham',
  },
  {
    name: 'Terry J. Sackett',
    role: 'Global Advisor - MRI Safety & Research Compliance',
    href: 'https://lifefundies-d66e9.web.app/team/terry-sackett',
  },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function TeamCard({ member, featured = false }: { member: TeamMember; featured?: boolean }) {
  return (
    <article className={`team-card team-card--profile ${featured ? 'team-card--featured' : ''}`}>
      <div className="team-card__media" style={{ '--member-seed': member.name.length * 37 } as CSSProperties}>
        {member.image ? (
          <img src={member.image} alt={member.name} className="team-card__image" />
        ) : (
          <span className="team-card__initials">{getInitials(member.name)}</span>
        )}
      </div>
      <div className="team-card__body">
        {member.group && <span className="team-card__group">{member.group}</span>}
        <h3 className="heading-3">{member.name}</h3>
        <p className="body-sm text-muted">{member.role}</p>
      </div>
    </article>
  )
}

export default function TeamPage() {
  return (
    <div className="page-wrapper animate-fadeIn">
      <section className="team-hero"style={{ backgroundImage: "url('./Our team.jpeg')" }}>
        <div className="team-hero__overlay" />
        <div className="container team-hero__content">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Team</span>
          </nav>
          <h1 className="display-2 team-hero__title">
            We are not counsellors. We are companions in clarity.
          </h1>
          <p className="body-lg team-hero__subtitle">
            Real people solving real-life problems - honestly, privately, and humanly.
          </p>
          <div className="team-hero__actions">
            <Link to="/get-started" className="btn btn-primary btn-xl">Book a Guidance Session</Link>
            <a href="mailto:support@lifefundies.in" className="btn btn-outline">Contact Support</a>
          </div>
        </div>
      </section>

      <section className="section team-core">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Team Hierarchy</span>
            <h2 className="heading-1">Founder-led, team-powered.</h2>
          </div>

          <div className="team-org">
            <div className="team-org__level team-org__level--founder">
              <TeamCard member={FOUNDER} featured />
            </div>

            <div className="team-org__connector" aria-hidden="true" />

            <div className="team-org__level team-org__level--leadership">
              {LEADERSHIP.map(member => (
                <TeamCard key={member.name} member={member} />
              ))}
            </div>

            <div className="team-org__connector" aria-hidden="true" />

            <div className="team-org__level team-org__level--product">
              {PRODUCT_MANAGERS.map(member => (
                <TeamCard key={member.name} member={member} featured />
              ))}
            </div>

            <div className="team-org__connector" aria-hidden="true" />

            <div className="team-org__team-grid">
              {CORE_TEAM.map(member => (
                <TeamCard key={member.name} member={member} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section team-advisors">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Global Advisors</span>
            <h2 className="heading-1">Guidance built with global trust and responsible thinking.</h2>
          </div>

          <div className="advisor-grid">
            {ADVISORS.map(advisor => (
              <article key={advisor.name} className="advisor-card card">
                <div>
                  <h3 className="heading-3">{advisor.name}</h3>
                  <p className="body-sm text-muted">{advisor.role}</p>
                </div>
                <a href={advisor.href} target="_blank" rel="noreferrer" className="advisor-link">
                  View full profile →
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section team-cta">
        <div className="container team-cta__grid">
          <div>
            <h2 className="heading-1">Feeling stuck? Confused about what to do next?</h2>
            <p className="body-lg text-muted" style={{ marginTop: 'var(--sp-4)' }}>
              Do not worry. We are building a new generation of youth who speak freely, grow wisely, and lead fearlessly.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
