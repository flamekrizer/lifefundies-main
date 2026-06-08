# Cashfree Payment Gateway Integration

## Overview
LifeFundies now uses **Cashfree** as the primary payment gateway for secure INR payment processing in test mode.

## Configuration

### Environment Variables (`.env`)
```env
# Cashfree Payment Gateway
VITE_CASHFREE_MERCHANT_ID=your_sandbox_merchant_id
VITE_CASHFREE_API_KEY=your_sandbox_api_key
VITE_CASHFREE_API_URL=https://sandbox.cashfree.com
```

### Merchant Details
- **Mode**: Sandbox (Testing)
- **Merchant ID**: `your_sandbox_merchant_id`
- **API Key**: `your_sandbox_api_key`
- **API Endpoint**: `https://sandbox.cashfree.com`

## Payment Flow

### 1. Session Booking
User initiates session booking through `BookingModal.tsx`:
- Selects domain, category, duration, and time slot
- Payment details are calculated

### 2. Booking Creation
`createBooking()` creates a booking record with status `payment_pending`:
- Slot is locked to prevent double-booking
- User receives a booking ID

### 3. Payment Initiation
`initiateCashfreePayment()` opens Cashfree checkout:
```typescript
await initiateCashfreePayment({
  amount,           // Session price in INR
  bookingId,        // Unique booking reference
  mentorName,       // Display name for payment note
  userDetails,      // Customer info (email, phone, name)
  onSuccess,        // Callback on successful payment
  onFailure,        // Callback on failed payment
});
```

### 4. Checkout Experience
- Cashfree payment window opens in a popup
- User selects payment method (Credit/Debit/UPI/Netbanking/Wallet)
- Payment is processed securely

### 5. Payment Confirmation
On successful payment:
- `confirmPayment()` updates booking status to `pending` (waiting for guide approval)
- Session is NOT created yet (created when guide accepts)
- Seeker receives notification
- Guide receives booking request notification

### 6. Payment Failure Handling
If payment fails:
- `cancelPendingBooking()` marks booking as `payment_failed`
- Slot is released and becomes available again
- User can retry booking

## Integration Files

### Frontend
- **[src/lib/cashfree.ts](src/lib/cashfree.ts)** - Cashfree SDK integration & payment handler
- **[src/components/BookingModal.tsx](src/components/BookingModal.tsx)** - Payment UI trigger

### Database
- **[src/lib/bookingRepository.ts](src/lib/bookingRepository.ts)** - Booking & payment CRUD operations
  - `createBooking()` - Lock slot and create booking
  - `confirmPayment()` - Mark payment complete & create session
  - `cancelPendingBooking()` - Cleanup on payment failure

## Testing

### Verify Configuration
Run this in browser console:
```javascript
import { verifyCashfreeConfig } from './src/lib/cashfree.ts';
verifyCashfreeConfig();
```

### Test Payment Flow
1. Navigate to Mentors page
2. Select a mentor and click "Book Session"
3. Follow the booking flow:
   - Select domain and category
   - Choose a time slot
   - Review booking summary
   - Click "Pay Now" (requires popup permission)
4. Payment window opens - complete payment
5. On success, booking confirmed and session created

### Test Credentials (Sandbox)
- Merchant ID: `your_sandbox_merchant_id`
- Use any test payment method available in Cashfree sandbox

## Production Setup

### Before Going Live:
1. **Get Production Credentials**
   - Register on Cashfree dashboard (https://dashboard.cashfree.com)
   - Get production Merchant ID and API Key
   - Update `.env` with production credentials

2. **Backend Integration** (Required)
   - Create endpoint: `POST /api/cashfree/create-order`
   - Create endpoint: `POST /api/cashfree/verify-payment`
   - Implement webhook handler: `POST /api/payment-webhook`
   - Call verification before marking payment complete

3. **Return URL Handling**
   - Create success page: `/payment-success`
   - Implement error handling for failed payments
   - Store payment verification on backend only

4. **Update Environment**
   ```env
   VITE_CASHFREE_MERCHANT_ID=your_production_merchant_id
   VITE_CASHFREE_API_KEY=your_production_api_key
   VITE_CASHFREE_API_URL=https://api.cashfree.com
   ```

5. **Security Checklist**
   - ✓ API Key never exposed in frontend code
   - ✓ Payment verification on backend only
   - ✓ Webhook signature validation implemented
   - ✓ Return URL validates booking ownership
   - ✓ HTTPS enabled on all payment pages

## Error Handling

### Common Issues

**"Payment window blocked"**
- Solution: Allow popups in browser settings
- Check browser console for popup warnings

**"Failed to load Cashfree SDK"**
- Solution: Check internet connection
- Verify environment variables are set
- Check browser console for network errors

**"Cashfree merchant ID not configured"**
- Solution: Ensure `VITE_CASHFREE_MERCHANT_ID` is in `.env`
- Restart dev server after updating `.env`

### Debugging
Enable verbose logging:
```typescript
// In browser console
localStorage.setItem('DEBUG_CASHFREE', 'true');
```

## Webhook Integration (Future)

For production, implement webhook handler:
```
POST /api/payment-webhook
Headers: {
  "Authorization": "Bearer <your_webhook_secret>"
}
Body: {
  "event": "payment.success|payment.failed",
  "data": {
    "orderId": "LF_...",
    "paymentId": "pay_...",
    "status": "SUCCESS|FAILED"
  }
}
```

## References
- [Cashfree Documentation](https://docs.cashfree.com)
- [Sandbox Testing Guide](https://docs.cashfree.com/docs/testing)
- [Payment Integration Guide](https://docs.cashfree.com/docs/payment-gateway)

## Support
For issues or questions about the integration:
1. Check browser console for detailed error logs
2. Review Cashfree dashboard for transaction details
3. Contact Cashfree support: support@cashfree.com
