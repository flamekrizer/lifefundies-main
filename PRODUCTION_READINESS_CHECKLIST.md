# LifeFundies Production Readiness Checklist

This checklist tracks the full LifeFundies MVP until the complete anonymous session cycle works end to end:

`User -> Problem -> Domain -> Guide Match -> Booking -> Cashfree Payment -> Room -> Session -> Feedback -> Follow-up -> Retention`

## 0. Current Status

- [x] LFID format standardized as `LFID-######`
- [x] Booking creates LFID-linked booking records
- [x] Cashfree checkout path added in frontend
- [x] Payment success creates booking/session/room/payment/notification records
- [x] User dashboard uses real booking data
- [x] Guide dashboard uses real booking data, with demo-only empty state
- [x] `/guide/dashboard` route added
- [x] `/session/:roomId` route added
- [x] Jitsi removed from active video room
- [x] WebRTC camera/mic preview added
- [ ] Full LiveKit two-party session connected
- [ ] Real Cashfree backend order creation and webhook verification
- [ ] Feedback and guide notes stored end to end
- [ ] Follow-up and retention flow connected

## 1. Identity And Privacy

- [ ] Generate LFID for every account type
- [ ] Anonymous account can chat, browse guides, and book instant sessions
- [ ] Verified anonymous account can schedule, reschedule, receive notifications, and view history
- [ ] Store real email/name/phone only in private user profile
- [ ] Never write name/email/phone into guide-facing booking/session records
- [ ] Guide dashboard displays only:
  - [ ] LFID
  - [ ] domain
  - [ ] query summary
  - [ ] session history count
  - [ ] feedback/rating
- [ ] Firestore rules prevent guides from reading private user profile fields
- [ ] Add automated privacy test: guide query cannot return email/name/phone

## 2. Public Website Pages

- [ ] Home
- [ ] About Us
- [ ] Explore Domains
- [ ] Guides Directory
- [ ] Book Session
- [ ] Resources
- [ ] Blog
- [ ] Contact
- [ ] Login
- [ ] Register
- [ ] Pricing / Upgrade
- [ ] Privacy Policy
- [ ] Terms & Conditions

Production requirements:

- [ ] Remove public-page mock data or clearly source it from Firestore/CMS
- [ ] All CTAs route to real flows
- [ ] Responsive mobile layouts verified
- [ ] SEO title/meta added
- [ ] Legal pages published

## 3. User Dashboard Pages

- [x] `/dashboard`
- [x] `/dashboard/chat`
- [x] `/dashboard/guides`
- [x] `/dashboard/sessions`
- [x] `/dashboard/upcoming`
- [x] `/dashboard/history`
- [x] `/dashboard/messages`
- [x] `/dashboard/notifications`
- [x] `/dashboard/resources`
- [x] `/dashboard/community`
- [x] `/dashboard/profile`
- [x] `/dashboard/settings`

Production requirements:

- [ ] No fake sessions
- [ ] Empty states explain next action
- [ ] User can see LFID
- [ ] User can see upcoming session
- [ ] User can join room only for valid booking/time window
- [ ] User can submit feedback after completed session
- [ ] User can see previous sessions if verified

## 4. Guide Dashboard Pages

- [x] `/guide/dashboard`
- [x] `/guide/sessions`
- [x] `/guide/upcoming`
- [x] `/guide/completed`
- [x] `/guide/availability`
- [x] `/guide/earnings`
- [x] `/guide/reviews`
- [x] `/guide/resources`
- [x] `/guide/notifications`
- [x] `/guide/profile`
- [x] `/guide/settings`

Production requirements:

- [ ] Guide sees assigned sessions from Firestore
- [ ] Guide receives notification after paid booking
- [ ] Guide can join only valid assigned room
- [ ] Guide can add private notes after session
- [ ] Guide can manage availability
- [ ] Guide can see earnings from verified Cashfree payments
- [ ] Guide cannot see user name/email/phone

## 5. Admin Dashboard Pages

- [ ] `/admin/dashboard`
- [ ] `/admin/users`
- [ ] `/admin/guides`
- [ ] `/admin/bookings`
- [ ] `/admin/payments`
- [ ] `/admin/domains`
- [ ] `/admin/resources`
- [ ] `/admin/reviews`
- [ ] `/admin/analytics`
- [ ] `/admin/notifications`
- [ ] `/admin/settings`

Production requirements:

- [ ] Admin can verify guides
- [ ] Admin can inspect bookings and payments
- [ ] Admin can manage domains/resources/blogs
- [ ] Admin can see analytics
- [ ] Admin actions are protected by role-based rules

## 6. Chatbot Route

- [ ] AI collects:
  - [ ] domain
  - [ ] problem
  - [ ] urgency
  - [ ] preferred language
  - [ ] session type
- [ ] After 5-6 messages, AI recommends guides
- [ ] Recommendations use real guide availability and domains
- [ ] User selects guide
- [ ] Booking modal opens with prefilled domain/query/session type
- [ ] Chat transcript is linked to LFID, not real name
- [ ] Crisis/high-urgency safety fallback added

## 7. Direct Booking Route

- [x] `/book-session` page or modal exists
- [ ] Query form fields:
  - [ ] domain
  - [ ] issue summary
  - [ ] session type
  - [ ] preferred time
  - [ ] language
- [ ] System identifies domain if user skips domain
- [ ] System recommends guide
- [ ] User selects guide/date/time
- [ ] Booking draft is created
- [ ] Cashfree payment starts

## 8. Cashfree Payment

- [x] Frontend Cashfree helper exists
- [ ] Backend create-order endpoint exists
- [ ] Backend verify-payment endpoint exists
- [ ] Cashfree webhook endpoint exists
- [ ] Store:
  - [ ] cashfree order id
  - [ ] payment id
  - [ ] payment status
  - [ ] signature/webhook verification status
  - [ ] guide share
  - [ ] platform share
- [ ] Booking is confirmed only after verified payment success
- [ ] Failed/cancelled payments release slots
- [ ] Duplicate webhook events are idempotent

## 9. Booking And Slot Locking

- [x] Booking transaction locks slot
- [ ] Instant session availability check
- [ ] Future scheduling only for verified anonymous users
- [ ] Prevent double booking
- [ ] Prevent user booking unavailable guide
- [ ] Create booking code `BOOK-####`
- [ ] Create room id `ROOM-######`
- [ ] Create session code `SES-####`
- [ ] Link booking, room, session, payment, notifications

## 10. Notification System

- [x] User/guide notification records created after payment
- [ ] Dashboard notification UI reads Firestore notifications
- [ ] Browser push notification setup
- [ ] Email notifications for verified users
- [ ] Reminder jobs:
  - [ ] 24 hours before
  - [ ] 1 hour before
  - [ ] 15 minutes before
- [ ] Guide gets new booking notification
- [ ] Anonymous user gets website/dashboard notification
- [ ] Notification read/unread status works

## 11. Session Room

- [x] `/session/:roomId` route exists
- [x] Jitsi removed
- [x] WebRTC local media preview exists
- [ ] LiveKit client installed and configured
- [ ] Backend generates LiveKit access token
- [ ] User and guide join same LiveKit room
- [ ] Room activates 10-15 minutes before session
- [ ] Room blocks access outside allowed time
- [ ] Room verifies:
  - [ ] booking id
  - [ ] payment status
  - [ ] room id
  - [ ] LFID
  - [ ] guide id
  - [ ] session time
- [ ] Session timer works
- [ ] Chat inside room works
- [ ] Screen share works
- [ ] Recording is optional and consent-based
- [ ] Leave/end session updates session status

## 12. Post Session

- [x] `/feedback/:sessionId` route exists
- [ ] User can rate guide
- [ ] Guide can rate session
- [ ] User feedback stored
- [ ] Guide private notes stored
- [ ] Session duration stored
- [ ] Session status becomes `completed`
- [ ] Notes are linked to LFID, not name
- [ ] Completed session appears in both dashboards

## 13. Follow-Up And Retention

- [ ] 24-hour follow-up notification
- [ ] AI asks “How are you feeling now?”
- [ ] Follow-up response stored by LFID
- [ ] AI recommends:
  - [ ] book again
  - [ ] read resource
  - [ ] join community
- [ ] Repeat-session guide matching uses LFID history
- [ ] Verified users can reschedule/rebook

## 14. Database Collections

- [ ] `users`
- [ ] `guides`
- [ ] `guide_availability`
- [ ] `bookings`
- [ ] `payments`
- [ ] `rooms`
- [ ] `sessions`
- [ ] `session_notes`
- [ ] `feedback`
- [ ] `notifications`
- [ ] `resources`
- [ ] `blogs`
- [ ] `analytics`

Schema requirements:

- [ ] `users` includes `user_id`, `lfid`, `email optional`, `is_verified`, `role`
- [ ] `bookings` includes `booking_id`, `lfid`, `guide_id`, `room_id`, `payment_id`
- [ ] `sessions` includes `session_id`, `booking_id`, `room_id`, `status`
- [ ] `payments` includes provider `cashfree`
- [ ] `feedback` links to `session_id` and `lfid`

## 15. Security Rules

- [ ] User can read only own profile/bookings/sessions
- [ ] Guide can read only assigned booking/session records
- [ ] Guide cannot read user private profile
- [ ] Admin can read/manage all
- [ ] Payment updates only from trusted backend/webhook
- [ ] Session notes are private to guide/admin
- [ ] Feedback visibility rules defined

## 16. Production Config

- [ ] Firebase environment variables checked
- [ ] Cashfree environment variables checked
- [ ] LiveKit environment variables checked
- [ ] Email provider configured
- [ ] Push notification VAPID key configured
- [ ] Remove dev-only test login before deploy or guard it strictly by `import.meta.env.DEV`
- [ ] Error boundaries added
- [ ] Loading states added
- [ ] Empty states added

## 17. Acceptance Test: Full Session Cycle

Run this before saying MVP is production-ready:

- [ ] User arrives on website
- [ ] User chooses chatbot route
- [ ] AI identifies domain/problem/urgency/language
- [ ] AI recommends real available guides
- [ ] User selects guide
- [ ] User selects date/time
- [ ] Cashfree payment succeeds
- [ ] Booking status becomes `confirmed`
- [ ] Room is created
- [ ] Session is created
- [ ] User notification is created
- [ ] Guide notification is created
- [ ] User dashboard shows upcoming session
- [ ] Guide dashboard shows LFID-only assigned session
- [ ] 15-minute reminder appears
- [ ] User joins `/session/:roomId`
- [ ] Guide joins same room
- [ ] LiveKit/WebRTC connects both users
- [ ] Session timer starts
- [ ] Session ends
- [ ] User submits rating/feedback
- [ ] Guide adds private note
- [ ] Session status becomes `completed`
- [ ] User dashboard history updates
- [ ] Guide dashboard completed sessions updates
- [ ] 24-hour follow-up notification is created
- [ ] AI follow-up recommends next action

## 18. Recommended Build Order

1. Firestore schema and rules
2. Cashfree backend order + webhook verification
3. Real guide directory and guide profiles
4. Direct booking page
5. Chatbot-to-booking prefill
6. LiveKit token backend and frontend room
7. Notifications and reminders
8. Post-session feedback and guide notes
9. Follow-up AI and resources
10. Admin dashboard and analytics
11. Final QA, mobile, legal, deploy
