// Firebase Firestore Collections Structure for LifeFundies

/*
🗂️ COLLECTION: users
Path: users/{userId}

Purpose: User profile and settings
*/

const userDocument = {
  userId: "u_abc123",
  displayName: "User123", // Anonymous
  ageRange: "18-24",
  role: "student",
  gender: "prefer-not-to-say",
  city: "Delhi",
  domains: ["career", "relationships", "stress"],
  joinedAt: "2026-03-01T10:30:00Z",
  sessionCount: 0,
  privacy: {
    emailMasked: true,
    phoneHidden: true
  }
};

/*
🗂️ COLLECTION: guides
Path: guides/{guideId}

Purpose: Guide profiles and settings
*/

const guideDocument = {
  guideId: "g_xyz789",
  displayName: "Guide Asmit",
  bio: "Career guidance expert with 5 years experience",
  expertise: ["career", "academic", "motivation"],
  languages: ["English", "Hindi"],
  experience: 5,
  rating: 4.8,
  totalSessions: 120,
  pricePerSession: 499,
  availability: {
    monday: ["18:00", "19:00", "20:00"],
    tuesday: ["18:00", "19:00"],
    // ... other days
  },
  isActive: true,
  joinedAt: "2025-01-15T10:00:00Z"
};

/*
🗂️ SUBCOLLECTION: guide slots
Path: guides/{guideId}/slots/{slotId}

Purpose: Available time slots for booking
*/

const slotDocument = {
  slotId: "slot_20260305_1800",
  date: "2026-03-05",
  time: "18:00",
  duration: 60, // minutes
  price: 499,
  isBooked: false,
  isBlocked: false, // guide can block slots
  createdAt: "2026-03-01T10:00:00Z"
};

/*
🗂️ COLLECTION: bookings
Path: bookings/{bookingId}

Purpose: All booking records
*/

const bookingDocument = {
  bookingId: "book_abc123xyz",
  userId: "u_abc123",
  guideId: "g_xyz789",
  slotId: "slot_20260305_1800",
  
  // Session details
  domain: "career",
  selectedIssue: "Career confusion",
  userNotes: "Want to discuss job change options",
  
  // Pricing
  price: 499,
  discount: 0,
  finalAmount: 499,
  
  // Payment
  paymentId: "pay_razorpay123",
  paymentStatus: "completed", // pending | completed | failed
  paidAt: "2026-03-02T14:30:00Z",
  
  // Status
  status: "confirmed", // pending | confirmed | cancelled | completed
  
  // Session timing
  sessionDate: "2026-03-05",
  sessionTime: "18:00",
  sessionDuration: 60,
  
  // Timestamps
  createdAt: "2026-03-02T14:28:00Z",
  updatedAt: "2026-03-02T14:30:00Z",
  
  // Session creation
  sessionCreated: true,
  sessionId: "sess_abc123"
};

/*
🗂️ COLLECTION: sessions
Path: sessions/{sessionId}

Purpose: Active/completed sessions (created after payment)
*/

const sessionDocument = {
  sessionId: "sess_abc123",
  bookingId: "book_abc123xyz",
  
  // Participants (masked)
  userId: "u_abc123",
  userDisplayName: "User123",
  guideId: "g_xyz789",
  guideDisplayName: "Guide Asmit",
  
  // Domain
  domain: "career",
  
  // Timing
  scheduledAt: "2026-03-05T18:00:00Z",
  duration: 60,
  startedAt: null, // when user joins
  endedAt: null,
  
  // Status
  status: "upcoming", // upcoming | live | completed | cancelled
  
  // Video room
  videoRoomId: "lf_room_abc123",
  videoRoomToken: null, // generated when joining
  
  // Chat enabled
  chatEnabled: true,
  
  // Post-session
  userRating: null,
  userFeedback: null,
  guideNotes: null,
  
  createdAt: "2026-03-02T14:30:00Z"
};

/*
🗂️ SUBCOLLECTION: session messages
Path: sessions/{sessionId}/messages/{messageId}

Purpose: Private chat between user and guide
*/

const messageDocument = {
  messageId: "msg_abc123",
  senderId: "u_abc123", // or guideId
  senderType: "user", // user | guide
  text: "Hello, looking forward to our session",
  type: "text", // text | image | file
  timestamp: "2026-03-03T10:00:00Z",
  read: false
};

/*
🗂️ COLLECTION: payments
Path: payments/{paymentId}

Purpose: Payment records and tracking
*/

const paymentDocument = {
  paymentId: "pay_abc123",
  bookingId: "book_abc123xyz",
  userId: "u_abc123",
  
  amount: 499,
  currency: "INR",
  
  // Razorpay
  razorpayOrderId: "order_abc123",
  razorpayPaymentId: "pay_xyz789",
  razorpaySignature: "signature_hash",
  
  status: "completed", // pending | completed | failed | refunded
  
  createdAt: "2026-03-02T14:28:00Z",
  completedAt: "2026-03-02T14:30:00Z"
};

/*
🗂️ COLLECTION: notifications
Path: notifications/{notificationId}

Purpose: User and guide notifications
*/

const notificationDocument = {
  notificationId: "notif_abc123",
  userId: "u_abc123", // or guideId
  type: "booking_confirmed", // booking_confirmed | session_reminder | message_received
  title: "Booking Confirmed!",
  body: "Your session is confirmed for March 5 at 6:00 PM",
  read: false,
  actionUrl: "/dashboard",
  createdAt: "2026-03-02T14:30:00Z"
};

// Export for reference
export const firestoreSchema = {
  users: userDocument,
  guides: guideDocument,
  slots: slotDocument,
  bookings: bookingDocument,
  sessions: sessionDocument,
  messages: messageDocument,
  payments: paymentDocument,
  notifications: notificationDocument
};
