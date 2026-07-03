import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { ProfileCard } from '../../components/ui/profile-card'

type TeamMember = {
  name: string
  role: string
  group?: string
  image?: string
  bio?: string
}

const FOUNDER: TeamMember = {
  name: 'Asmit Sharma',
  role: 'Founder, CEO & Co-founder',
  group: 'Founder',
  image: 'https://lifefundies-d66e9.web.app/founder.jpeg',
}

const COO: TeamMember = {
  name: 'Shreya',
  role: 'COO',
  group: 'Operations',
  image: '/team/shreya.jpg',
}

const LEADERSHIP: TeamMember[] = [
  {
    name: 'Saquib Shamshi',
    role: 'CTO',
    group: 'Technology',
    image: '/team/saquib-shamshi.jpg',
    bio: 'Saquib leads the technology team at LifeFundies, building and shipping the platform that connects seekers with the right guide, end to end.',
  },
]

const PRODUCT_MANAGERS: TeamMember[] = [
  {
    name: 'Avani Sharma',
    role: 'Product & Design Manager',
    group: 'Product',
    image: '/team/avani-sharma.jpg',
    bio: 'Avani shapes the product and design direction at LifeFundies, making sure the experience stays simple, human, and easy to trust.',
  },
]

const CORE_TEAM: TeamMember[] = [
  {
    name: 'Pushkar Singh',
    role: 'Co Head of Tech',
    group: 'Technology',
    image: '/team/pushkar-singh.jpg',
    bio: 'Pushkar co-leads engineering at LifeFundies, working across the stack to keep the platform reliable as the community grows.',
  },

  {
    name: 'Deepak',
    role: 'Web Developer',
    group: 'Engineering',
    image: '/team/deepak.jpg',
    bio: 'Deepak builds and maintains the LifeFundies web experience, focused on making every session booking simple and fast.',
  },
  {
    name: 'Aishwarya Srivastava',
    role: 'Content Head',
    group: 'Content',
    image: '/team/aishwarya-srivastava.jpg',
    bio: 'Aishwarya leads content at LifeFundies, shaping the words and stories that help seekers understand what guidance can do for them.',
  },
  {
    name: 'Astitva',
    role: 'Video Editor & Marketing Head',
    group: 'Marketing',
    image: '/team/astitva-tripathi.jpg',
    bio: 'Astitva leads marketing and video storytelling at LifeFundies, helping more people discover what guidance can do for them.',
  },
  {
    name: 'Sameer Omair',
    role: 'Social Media Manager',
    group: 'Marketing',
    image: '/team/sameer-omair.jpg',
    bio: "Sameer runs LifeFundies' social media presence, building community and spreading the word about accessible life guidance.",
  },
  {
    name: 'Harshit Kumar',
    role: 'Intern',
    group: 'Internship',
    image: '/team/harshit.jpg',
    bio: 'Harshit is part of the LifeFundies team as an intern, contributing across projects while learning the ropes of building a guidance platform.',
  },
]

const SPOTLIGHT_MEMBERS: TeamMember[] = [...LEADERSHIP, ...PRODUCT_MANAGERS, ...CORE_TEAM].filter(
  member => Boolean(member.bio)
)

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
      <section className="team-hero" style={{ backgroundImage: "url('./Our team.jpeg')" }}>
        <div className="team-hero__overlay" />
        <div className="container team-hero__content">
          <h1 className="team-hero__title">Team</h1>
          <p className="team-hero__subtitle">We are not counsellors. We are companions in clarity.</p>
        </div>
      </section>

      <section className="section about-intro">
        <div className="container about-intro__inner">
          <p className="body-lg text-muted">
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
              <ProfileCard
                name={FOUNDER.name}
                title={FOUNDER.role}
                description="The mind behind LifeFundies. I'm not a therapist or guru. Just someone who's been through confusion, reflected deeply, and chose to build something India desperately needs."
                imageUrl={FOUNDER.image}
                linkedinUrl="https://www.linkedin.com/company/lifefundies/"
                instagramUrl="https://www.instagram.com/lifefundies/"
                youtubeUrl="https://www.youtube.com/@LifeFundies"
              />
              <ProfileCard
                name={COO.name}
                title={COO.role}
                description="Shreya leads Operations at LifeFundies, making sure every guidance session runs smoothly and every seeker feels heard and supported end to end."
                imageUrl={COO.image}
                linkedinUrl="https://www.linkedin.com/company/lifefundies/"
                instagramUrl="https://www.instagram.com/lifefundies/"
              />
            </div>

            <div className="team-org__connector" aria-hidden="true" />

            <div className="team-org__spotlight-grid">
              {SPOTLIGHT_MEMBERS.map(member => (
                <ProfileCard
                  key={member.name}
                  name={member.name}
                  title={member.role}
                  description={member.bio}
                  imageUrl={member.image}
                  compact
                  className="max-w-none px-0"
                />
              ))}
            </div>

            <div className="team-org__connector" aria-hidden="true" />

            <div className="team-org__level team-org__level--leadership">
              {LEADERSHIP.filter(member => !member.bio).map(member => (
                <TeamCard key={member.name} member={member} />
              ))}
            </div>

            <div className="team-org__team-grid">
              {[...PRODUCT_MANAGERS, ...CORE_TEAM].filter(member => !member.bio).map(member => (
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
