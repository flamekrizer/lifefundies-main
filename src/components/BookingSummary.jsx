export default function BookingSummary({ guide, slot, payload }) {
  return (
    <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-2">
      <h2 className="text-xl font-semibold">Booking Summary</h2>
      <p><span className="text-gray-500">Guide:</span> {guide?.name}</p>
      <p><span className="text-gray-500">Domain:</span> {payload.domain}</p>
      <p><span className="text-gray-500">Session Type:</span> {payload.sessionType}</p>
      <p><span className="text-gray-500">Slot:</span> {slot ? `${slot.date} ${slot.time}` : 'Not selected'}</p>
      <p><span className="text-gray-500">Amount:</span> INR {payload.amount}</p>
      <p><span className="text-gray-500">Issue:</span> {payload.issueSummary || 'Not provided'}</p>
    </section>
  );
}
