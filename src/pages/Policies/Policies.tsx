import { Link } from 'react-router-dom'
import { MENTOR_CATEGORIES } from '../../types'

const updatedAt = 'August 5, 2025'

function PolicyShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="page-wrapper animate-fadeIn">
      <section className="policy-hero">
        <div className="container">
          <nav className="policy-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>{title}</span>
          </nav>
          <h1 className="display-2">{title}</h1>
          <p className="body-lg text-muted">{subtitle}</p>
          <p className="body-sm text-muted">Last updated: {updatedAt}</p>
        </div>
      </section>
      <section className="section policy-section">
        <div className="container policy-layout">
          {children}
        </div>
      </section>
    </div>
  )
}

function PolicyBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="policy-block">
      <h2 className="heading-2">{title}</h2>
      <div className="policy-copy">{children}</div>
    </article>
  )
}

export function ServicesPage() {
  return (
    <PolicyShell
      title="Products & Services"
      subtitle="LifeFundies offers online life-guidance sessions across 18 life domains with transparent INR pricing."
    >
      <PolicyBlock title="Services Offered">
        <p>LifeFundies provides non-clinical, peer-based and guide-led guidance sessions for career clarity, education, mental well-being, family responsibilities, relationships, personal growth, digital life, finance basics, purpose, and related life domains.</p>
        <p>Sessions are delivered online through chat, audio, or video depending on guide availability and booking flow. LifeFundies is not a medical, therapy, psychiatric, or emergency-support service.</p>
      </PolicyBlock>

      <PolicyBlock title="Pricing in INR">
        <div className="policy-price-grid">
          {MENTOR_CATEGORIES.map(category => (
            <article key={category.id} className="policy-price-card">
              <h3 className="heading-3">{category.label}</h3>
              <ul>
                {category.prices.map(price => (
                  <li key={price.duration}>
                    <span>{price.duration}-minute online session</span>
                    <strong>INR ₹{price.price}</strong>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p>Prices shown are inclusive of platform access for the booked session. Any change in pricing will be shown before payment confirmation.</p>
      </PolicyBlock>

      <PolicyBlock title="How Booking Works">
        <p>Users select a guide, topic, session category, duration, and available time slot. Payment is collected through Cashfree. A booking is confirmed only after successful payment verification.</p>
        <p>For support before or after payment, contact <a href="mailto:support@lifefundies.in">support@lifefundies.in</a> or call <a href="tel:+917055984498">+91-7055984498</a>.</p>
      </PolicyBlock>
    </PolicyShell>
  )
}

export function TermsPage() {
  return (
    <PolicyShell
      title="Terms & Conditions"
      subtitle="These terms govern access to LifeFundies sessions, platform features, payments, and user conduct."
    >
      <PolicyBlock title="Acceptance of Terms">
        <p>Welcome to LifeFundies. By accessing our website, creating an account, booking a session, making a payment, or participating in any LifeFundies session, you agree to these Terms & Conditions and all policies linked on this website.</p>
        <p>By using LifeFundies, you confirm that you are 13 years or older, that the information you provide is accurate, and that you will use the platform respectfully without harassment, impersonation, spam, fraudulent activity, or misuse of offers.</p>
      </PolicyBlock>

      <PolicyBlock title="Nature of Service - Judgment-Free Guidance">
        <p>LifeFundies is a life-readiness and clarity platform for people seeking emotional clarity, career guidance, non-clinical life support conversations, personal development chats, and peer guidance with privacy and empathy.</p>
        <p>We provide structured, judgment-free guidance conversations. LifeFundies is not a therapy, medical counseling, psychiatric, diagnosis, or emergency crisis intervention service.</p>
        <p>If you are in immediate danger or need urgent mental health support, please contact local emergency services, a trusted person, or a qualified professional immediately.</p>
      </PolicyBlock>

      <PolicyBlock title="Peer-Based Guide Model">
        <p>LifeFundies operates through Peer Buddies, Young Guides, and Senior Advisors. Guides are trained under LifeFundies frameworks for active listening, session privacy, emotional neutrality, and structured responses.</p>
        <p>No guide offers medical, psychiatric, legal, financial, or therapeutic advice. Guidance is based on lived experience, structured conversation, and non-clinical support.</p>
      </PolicyBlock>

      <PolicyBlock title="Session Access, Payments, and Confirmation">
        <p>Sessions are booked directly through the LifeFundies website by selecting a guide, life domain, session category, duration, available time slot, and issue summary. The total fee is shown in INR before payment.</p>
        <p>Payments are processed through Cashfree. A booking is treated as confirmed only after successful payment verification. LF-ID is used as your semi-anonymous identity for session handling and progress tracking.</p>
        <p>We may cancel or reschedule bookings if a guide becomes unavailable, if payment verification fails, or if platform abuse is detected.</p>
      </PolicyBlock>

      <PolicyBlock title="Session Flow and Confidentiality">
        <p>Sessions may be conducted through website video room, Google Meet, Zoom, WhatsApp, chat, or another suitable online mode depending on the booking flow and guide availability.</p>
        <p>Your real name, phone number, email, and full form details are not shared with the guide unless required for support or unless you choose to share them. Guides generally receive only your LF-ID, chosen topic, session date/time, and session link.</p>
        <p>Users and guides must not record, screenshot, publish, or share session content without written permission.</p>
      </PolicyBlock>

      <PolicyBlock title="Refunds and Cancellations">
        <p>No refunds are issued after a completed session. Refunds may be considered for duplicate payments, accidental payments, technical payment errors, or cases where LifeFundies cannot provide or reschedule a paid session.</p>
        <p>Refund or support requests must be raised within 48 hours at <a href="mailto:support@lifefundies.in">support@lifefundies.in</a>. Rescheduling is allowed up to 12 hours before the session, subject to guide availability.</p>
      </PolicyBlock>

      <PolicyBlock title="Misuse and Bans">
        <p>Submitting false information, falsely claiming free or first-time offers, misleading the platform, harassing guides, trolling, or misusing LifeFundies may result in a 3-month ban. Serious or repeated violations may lead to permanent suspension after internal review.</p>
      </PolicyBlock>

      <PolicyBlock title="Intellectual Property">
        <p>All platform content, session formats, training material, LF-ID systems, designs, software flows, and brand names are LifeFundies property. Do not copy, replicate, record, screenshot, or reuse them without written permission.</p>
      </PolicyBlock>

      <PolicyBlock title="Modifications to Terms">
        <p>These Terms may be updated periodically. Continued use of LifeFundies after updates are posted on lifefundies.in means you accept the revised terms.</p>
      </PolicyBlock>

      <PolicyBlock title="Contact">
        <p>For questions about these terms, contact <a href="mailto:support@lifefundies.in">support@lifefundies.in</a> or WhatsApp/call <a href="tel:+917055984498">+91-7055984498</a>.</p>
      </PolicyBlock>
    </PolicyShell>
  )
}

export function RefundPage() {
  return (
    <PolicyShell
      title="Refunds & Cancellations"
      subtitle="Our refund and cancellation rules for LifeFundies online guidance sessions."
    >
      <PolicyBlock title="Cancellations and Rescheduling">
        <p>You may request rescheduling up to 12 hours before the scheduled session time, subject to guide availability. Missed sessions may be rescheduled once at LifeFundies’ discretion.</p>
        <p>To request help, email <a href="mailto:support@lifefundies.in">support@lifefundies.in</a> with your booking ID, registered email, and session time.</p>
      </PolicyBlock>

      <PolicyBlock title="Refund Eligibility">
        <p>Refunds are generally not issued after a session is completed. Refunds may be considered for duplicate payments, accidental payments, technical payment errors, or cases where LifeFundies cannot provide or reschedule the paid session.</p>
        <p>Refund requests should be raised within 48 hours of payment or the scheduled session time, whichever applies first.</p>
      </PolicyBlock>

      <PolicyBlock title="Refund Timeline">
        <p>Approved refunds are initiated to the original payment method through Cashfree/payment partner rails. Bank and payment partner timelines may vary, but most refunds reflect within 5-7 working days after approval.</p>
      </PolicyBlock>

      <PolicyBlock title="Non-Refundable Cases">
        <p>Refunds may be declined for no-shows, incorrect user details, late cancellation requests, misuse of offers, violation of platform rules, or completed sessions.</p>
      </PolicyBlock>
    </PolicyShell>
  )
}

export function PrivacyPage() {
  return (
    <PolicyShell
      title="Privacy Policy"
      subtitle="Your privacy is not just a policy - it is a promise."
    >
      <PolicyBlock title="Our Privacy Promise">
        <p>LifeFundies is committed to protecting your personal data, session details, and mental wellness journey with transparency and care. We collect only the minimum information required to provide a safe, personalized guidance experience.</p>
      </PolicyBlock>

      <PolicyBlock title="What Information We Collect">
        <p>When you create an account, complete onboarding, book a session, contact us, or use the website, we may collect your alias or preferred name, age group, email, phone number, preferred contact method, selected life domains, primary concern area, session preferences, chosen guide category, time slot, payment status, issue summary, optional personal notes, and basic usage data.</p>
        <p>You may use an alias or preferred name. We do not require you to reveal more personal details than needed for account, booking, payment, and session support.</p>
      </PolicyBlock>

      <PolicyBlock title="What Is LF-ID?">
        <p>To protect your identity, LifeFundies uses a semi-anonymous LF-ID for session handling and progress tracking. This code helps us internally match you with a guide, track continuity confidentially, and communicate without exposing unnecessary personal information.</p>
      </PolicyBlock>

      <PolicyBlock title="What Guides See">
        <p>LifeFundies guides are trained under internal confidentiality protocols. When a session is assigned, guides generally receive only your LF-ID, session date and time, session link, chosen life domain or concern topic, and any limited issue summary needed to prepare for the session.</p>
        <p>Guides do not receive your phone number, email, full profile, or private account details unless operationally required or voluntarily shared by you. Past session continuity is handled through LF-ID and consent-based internal records.</p>
      </PolicyBlock>

      <PolicyBlock title="How We Use Information">
        <p>We use your data to create and secure your account, generate or manage LF-ID, process bookings, verify Cashfree payments, match you with suitable guides, deliver communication through email/WhatsApp/call where needed, provide session support, improve platform quality, prevent misuse, and maintain anonymized internal analytics.</p>
        <p>We never sell, rent, or trade your personal data.</p>
      </PolicyBlock>

      <PolicyBlock title="Storage and Security">
        <p>Data may be stored in secure systems used by LifeFundies, including Firebase, website databases, Google Workspace tools, approved automation tools, WhatsApp Business communication systems, and Cashfree payment systems.</p>
        <p>Internal access is role-based. Admins handling logistics do not need access to session content, and guides do not need access to your private contact information. We use reasonable technical and organizational safeguards to protect your data.</p>
      </PolicyBlock>

      <PolicyBlock title="Payments and Third-Party Integrations">
        <p>Payments are processed through Cashfree. LifeFundies does not store full card, UPI, or bank credentials. Payment status and transaction references may be stored for booking confirmation and support.</p>
        <p>We may use third-party services such as Cashfree, WhatsApp, Zoom, Google Meet, Jitsi/video rooms, email providers, hosting services, and analytics or automation tools. These platforms have their own privacy terms, and we transfer only the minimum data needed for the service.</p>
      </PolicyBlock>

      <PolicyBlock title="Misuse and Bans">
        <p>If a user attempts to falsely claim free sessions, enter misleading details, harass a guide, troll, or misuse the platform, LifeFundies may ban the user for 3 months and may flag the account for permanent suspension after internal review.</p>
      </PolicyBlock>

      <PolicyBlock title="WhatsApp Disclaimer">
        <p>When you book or request support, you may be contacted through WhatsApp for confirmation or coordination. This is an intentional support step, not spam. WhatsApp messages are handled according to WhatsApp's own encryption and privacy policies.</p>
      </PolicyBlock>

      <PolicyBlock title="Data Retention">
        <p>LF-IDs and booking records may be retained for continuity, safety, payment verification, and progress tracking. Emails and phone numbers are retained only as long as needed for account, booking, compliance, and support purposes. Anonymous feedback and analytics may be retained to improve LifeFundies.</p>
      </PolicyBlock>

      <PolicyBlock title="Your Rights">
        <p>You can request deletion of session data, correction of contact information, or an audit of what is stored under your LF-ID, subject to legal, safety, fraud-prevention, payment, and operational requirements.</p>
      </PolicyBlock>

      <PolicyBlock title="Contact for Privacy Requests">
        <p>For privacy questions or data requests, contact <a href="mailto:support@lifefundies.in">support@lifefundies.in</a> or WhatsApp/call <a href="tel:+917055984498">+91-7055984498</a>.</p>
      </PolicyBlock>

      <PolicyBlock title="Your Consent">
        <p>By using LifeFundies services, creating an account, booking a session, or submitting any website form, you consent to this Privacy Policy.</p>
      </PolicyBlock>
    </PolicyShell>
  )
}
