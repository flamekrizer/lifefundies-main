export const LIFEFUNDIES_WHATSAPP = '917055984498'; // <-- apna WhatsApp number yaha daal

export function buildWhatsAppBookingMessage({
  guide,
  user,
  selectedDomain,
  selectedDate,
  selectedTime,
  concern,
}) {
  return `Hi LifeFundies, I want to book a session.

Guide: ${guide.name}
Price: ₹${guide.price}
Domains: ${guide.domainIds?.join(', ') || 'Not specified'}

LF User ID: ${user?.uid || 'Guest'}
Name: ${user?.displayName || 'Not provided'}

Selected Topic: ${selectedDomain || 'Not selected'}
Preferred Date: ${selectedDate || 'Not selected'}
Preferred Time: ${selectedTime || 'Not selected'}

My Concern:
${concern || ''}`;
}

export function openWhatsAppBooking(payload) {
  const message = buildWhatsAppBookingMessage(payload);
  const url = `https://wa.me/${LIFEFUNDIES_WHATSAPP}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}