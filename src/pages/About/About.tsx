import { Link } from 'react-router-dom'

const JOURNEY_STEPS = [
  { year: '2023', title: 'Idea Conceived', description: '100+ real youth conversations' },
  { year: '2024', title: 'Mini MVPs', description: 'Market validation through guidance' },
  { year: '2025', title: 'Beta Launch', description: 'Real users, real impact' },
  { year: 'Next', title: 'Scale Up', description: 'Colleges & peer circles' },
]

const VALUES = ['Anonymity', 'Authenticity', 'Affordability', 'Always Human']

export default function AboutPage() {
  return (
    <div className="page-wrapper animate-fadeIn">
      <section className="about-hero"style={{ backgroundImage: "url('./About Us.jpeg')" }}>
        <div className="about-hero__overlay" />
        <div className="container about-hero__content" >
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>About Us</span>
          </nav>
          <h1 className="display-2 about-hero__title">Our Approach to Life Guidance</h1>
          <p className="body-lg about-hero__subtitle">
            We don’t preach. We don’t judge. We walk with you — through confusion, overthinking, and self-doubt.
          </p>
          <div className="about-hero__actions">
            <Link to="/get-started" className="btn btn-primary btn-xl">Start Your Journey</Link>
            <a href="mailto:support@lifefundies.in" className="btn btn-outline">Book a Free Session</a>
          </div>
        </div>
      </section>

      <section className="section about-approach">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Clarity-first guidance</span>
            <h2 className="heading-1">A process built for the young mind.</h2>
          </div>

          <div className="about-card-grid">
            <article className="about-card">
              <h3 className="heading-3">Clarity Check-ins</h3>
              <p className="body-sm text-muted">We start by understanding what’s really happening — emotionally and mentally.</p>
            </article>
            <article className="about-card">
              <h3 className="heading-3">Tailored Frameworks</h3>
              <p className="body-sm text-muted">No generic advice. Every path is designed for your situation.</p>
            </article>
            <article className="about-card">
              <h3 className="heading-3">Mindset Tools</h3>
              <p className="body-sm text-muted">Practical tools for emotional strength and better thinking.</p>
            </article>
            <article className="about-card">
              <h3 className="heading-3">Progress Logs</h3>
              <p className="body-sm text-muted">Growth you can track — intentional, measurable, real.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section about-story">
        <div className="container about-story__grid">
          <div>
            <span className="section-eyebrow">From Confusion to Clarity</span>
            <h2 className="heading-1">Schools teach equations, not emotions. Careers teach survival, not self-understanding.</h2>
            <p className="body-lg text-muted" style={{ marginTop: 'var(--sp-4)' }}>
              LifeFundies was born from listening — to students, professionals, and people silently struggling.
            </p>
            <div className="about-story__quote-box">
              <p className="body-lg">
                “You don’t need therapy bills to feel better. You need someone real to talk to.”
              </p>
            </div>
          </div>

          <div className="about-story__image-wrapper">
            <img
              src="https://lifefundies-d66e9.web.app/logo.jpeg"
              alt="LifeFundies Journey"
              className="about-story__image"
            />
          </div>
        </div>
      </section>

      <section className="section about-journey">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Our Journey</span>
            <h2 className="heading-1">We’ve moved from idea to impact in just a few years.</h2>
          </div>

          <div className="about-timeline">
            {JOURNEY_STEPS.map((step) => (
              <article key={step.year} className="about-timeline__item">
                <p className="about-timeline__year">{step.year}</p>
                <h3 className="heading-3">{step.title}</h3>
                <p className="body-sm text-muted">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-founder">
        <div className="container about-founder__grid">
          <div>
            <span className="section-eyebrow">Founder</span>
            <h2 className="heading-1">I’m Asmit Sharma</h2>
            <p className="body-lg text-muted" style={{ marginTop: 'var(--sp-4)' }}>
              The mind behind LifeFundies. I’m not a therapist or guru. Just someone who’s been through confusion, reflected deeply, and choose to build something India desperately needs.
            </p>
          </div>

          <div className="about-founder__card card">
            <img
              src="https://lifefundies-d66e9.web.app/founder.jpeg"
              alt="Founder"
              className="about-founder__image"
            />
            <div className="about-founder__content">
              <h3 className="heading-3">What We Believe In</h3>
              <div className="about-values-grid">
                {VALUES.map((value) => (
                  <div key={value} className="about-value-pill">{value}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section about-cta">
        <div className="container about-cta__grid">
          <div>
            <h2 className="heading-1">LifeFundies is for you.</h2>
            <p className="body-lg text-muted" style={{ marginTop: 'var(--sp-4)' }}>
              Feeling stuck? Confused about what to do next? Don’t worry. We’re building a new generation of youth who speak freely, grow wisely, and lead fearlessly.
            </p>
            <div className="about-cta__actions">
              <Link to="/get-started" className="btn btn-primary btn-xl">Begin Your Free Session</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
