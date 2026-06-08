# Cashfree Integration - Quick Start Guide

## Status
✅ **Frontend integration complete** - Ready for testing

All Cashfree payment integration code is ready. The booking flow is fully connected to Cashfree checkout.

## What's Working
- ✅ Booking modal with payment flow
- ✅ Slot locking during payment
- ✅ Cashfree checkout URL generation
- ✅ Payment success/failure handling
- ✅ Automatic slot release on payment failure
- ✅ Configuration verification

## How to Test

### 1. Start Dev Server
```bash
cd /Users/asmitsharma/Desktop/a/lf2
npm run dev
```
This starts the Vite dev server at http://localhost:5173

### 2. Verify Cashfree Configuration
Open browser console and run:
```javascript
import { verifyCashfreeConfig } from './src/lib/cashfree.ts';
const config = verifyCashfreeConfig();
console.log(config);
```

You should see:
```
✓ Merchant ID configured: true
✓ API Key configured: true
✓ API URL configured: true
```

### 3. Test Booking Flow
1. Navigate to "Find Mentors" page
2. Click any mentor's "Book Session" button
3. Fill booking details:
   - Domain & Category
   - Duration
   - Time slot
   - Message
4. Click "Book & Pay"
5. **Cashfree popup should open** with test checkout

### 4. Complete Test Payment
In Cashfree sandbox:
- Use any test payment method (UPI, Card, etc.)
- Complete payment successfully
- Browser should redirect back to app
- Booking should be marked as "pending" (awaiting guide approval)

## Payment Test Scenarios

### Successful Payment
- Booking created with status `payment_pending`
- Slot locked
- User proceeds to payment modal
- Payment window opens
- User completes payment
- Booking updated to `pending` status
- Session NOT created yet (guide must accept first)

### Failed Payment
- Booking created with status `payment_pending`
- Slot locked
- Payment fails or window closes
- `cancelPendingBooking()` is called
- Booking marked as `payment_failed`
- Slot released automatically
- User can retry booking

## Key Files
- **Frontend**: [src/lib/cashfree.ts](src/lib/cashfree.ts)
- **UI Component**: [src/components/BookingModal.tsx](src/components/BookingModal.tsx)
- **Database Layer**: [src/lib/bookingRepository.ts](src/lib/bookingRepository.ts)
- **Documentation**: [CASHFREE_INTEGRATION.md](CASHFREE_INTEGRATION.md)

## Environment Setup
Check that `.env` has these variables:
```env
VITE_CASHFREE_MERCHANT_ID=your_sandbox_merchant_id
VITE_CASHFREE_API_KEY=your_sandbox_api_key
VITE_CASHFREE_API_URL=https://sandbox.cashfree.com
```

If `.env` was updated, **restart the dev server** for changes to take effect.

## Troubleshooting

### "Merchant ID not configured"
- Check `.env` file has `VITE_CASHFREE_MERCHANT_ID`
- Restart dev server (`npm run dev`)

### Checkout popup doesn't open
- Check browser popup blocker
- Check browser console for errors
- Verify Cashfree URL is accessible: https://checkout.cashfree.com

### Session doesn't appear after payment
- Payment completed but guide hasn't accepted booking yet
- Guides see booking requests on their Dashboard
- Guide clicks "Accept" to create the session

## Next Steps (Backend/Advanced)

### To Complete Production Setup:
1. **Implement Order Creation Backend** (Security)
   - Endpoint: `POST /api/cashfree/create-order`
   - Should validate booking details server-side
   - Return order_id to frontend

2. **Implement Payment Verification** (Security)
   - Endpoint: `POST /api/cashfree/verify-payment`
   - Verify payment with Cashfree backend
   - Only confirm payment if verified

3. **Add Webhook Handler** (Security)
   - Endpoint: `POST /api/payment-webhook`
   - Listen for Cashfree payment status updates
   - Update booking status server-side

4. **Create Payment Success Page**
   - Route: `/payment-success`
   - Display booking confirmation
   - Redirect to dashboard

## Support
For issues:
1. Check browser console for error messages
2. Review [CASHFREE_INTEGRATION.md](CASHFREE_INTEGRATION.md) documentation
3. Contact Cashfree support: support@cashfree.com

---

**Last Updated**: Integration complete, ready for testing
