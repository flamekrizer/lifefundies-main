'use client';

import { useState } from 'react';
import { X, Phone, Video, MessageCircle, IndianRupee, Loader2 } from 'lucide-react';
import SlotSelection from './SlotSelection';
import { createBooking, confirmPayment } from '@/lib/bookingService';
import { initiateCashfreePayment } from '@/lib/cashfree';
import useAuth from '@/lib/useAuth';

/**
 * 🎫 Complete Booking Modal
 * Handles: Domain Selection → Slot Selection → Payment → Confirmation
 */
export default function BookingModal({ guide, isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Domain, 2: Slot, 3: Payment
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedMode, setSelectedMode] = useState('video'); // video, audio, chat
  const [issue, setIssue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const modes = [
    { id: 'video', name: 'Video Call', icon: Video, price: guide.price },
    { id: 'audio', name: 'Audio Call', icon: Phone, price: Math.round(guide.price * 0.8) },
    { id: 'chat', name: 'Chat Only', icon: MessageCircle, price: Math.round(guide.price * 0.6) },
  ];

  const handleDomainSelect = (domain) => {
    setSelectedDomain(domain);
    setStep(2);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handlePayment = async () => {
    if (!user) {
      setError('Please login to book a session');
      return;
    }

    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const sessionPrice = modes.find(m => m.id === selectedMode).price;

      // Step 1: Create booking in Firestore
      const { bookingId } = await createBooking({
        userId: user.uid,
        guideId: guide.id,
        slotId: selectedSlot.id,
        domain: selectedDomain.name,
        price: sessionPrice,
        mode: selectedMode,
        issue: issue || 'Not specified',
      });

      // Step 2: Initialize Cashfree payment
      await initiateCashfreePayment({
        amount: sessionPrice,
        bookingId,
        guideName: guide.name,
        userDetails: {
          id: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
        },
        onSuccess: async (paymentData) => {
          try {
            // Confirm payment and create session
            await confirmPayment({
              bookingId,
              paymentId: paymentData.paymentId,
              orderId: paymentData.orderId,
              signature: paymentData.paymentStatus,
            });
            
            onSuccess?.(bookingId);
            onClose();
          } catch (err) {
            console.error('Payment confirmation failed:', err);
            setError('Payment confirmation failed. Please contact support with booking ID: ' + bookingId);
          }
        },
        onFailure: (error) => {
          setLoading(false);
          setError(error.message || 'Payment failed');
        },
      });

      setLoading(false);
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to create booking');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Book a Session
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                with {guide.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  ${step >= s ? 'bg-green-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600'}
                `}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-1 ${step > s ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Step 1: Select Domain & Mode */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Select Topic</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {guide.domains?.map((domain) => (
                      <button
                        key={domain.id}
                        onClick={() => handleDomainSelect(domain)}
                        className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-600 transition text-left"
                      >
                        <p className="font-semibold text-gray-900 dark:text-white">{domain.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{domain.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Session Mode</h3>
                  <div className="space-y-2">
                    {modes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setSelectedMode(mode.id)}
                        className={`
                          w-full p-4 border-2 rounded-lg transition flex items-center justify-between
                          ${selectedMode === mode.id 
                            ? 'border-green-600 bg-green-50 dark:bg-green-900/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-green-400'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <mode.icon className="w-5 h-5" />
                          <span className="font-medium">{mode.name}</span>
                        </div>
                        <span className="flex items-center gap-1 text-lg font-bold text-green-600">
                          <IndianRupee className="w-4 h-4" />
                          {mode.price}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    What would you like to discuss? (Optional)
                  </label>
                  <textarea
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="Share a brief description to help your guide prepare..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Select Slot */}
            {step === 2 && (
              <div>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                >
                  ← Back to Topic Selection
                </button>
                <SlotSelection
                  guideId={guide.id}
                  guidePrice={modes.find(m => m.id === selectedMode).price}
                  onSlotSelect={handleSlotSelect}
                />
              </div>
            )}

            {/* Step 3: Confirm & Pay */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Guide</span>
                    <span className="font-medium">{guide.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Topic</span>
                    <span className="font-medium">{selectedDomain?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Mode</span>
                    <span className="font-medium">{modes.find(m => m.id === selectedMode)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Time</span>
                    <span className="font-medium">
                      {selectedSlot?.date} at {selectedSlot?.time}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-300 dark:border-gray-700">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-green-600 flex items-center gap-1">
                      <IndianRupee className="w-5 h-5" />
                      {modes.find(m => m.id === selectedMode)?.price}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            
            {step === 2 && (
              <button
                onClick={() => setStep(3)}
                disabled={!selectedSlot}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Continue to Payment
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <IndianRupee className="w-4 h-4" />
                    Pay Now
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
