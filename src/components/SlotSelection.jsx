'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, IndianRupee, Check } from 'lucide-react';
import { getGuideSlots } from '@/lib/bookingService';

/**
 * 📅 Slot Selection Component
 * Shows available slots for a guide
 */
export default function SlotSelection({ guideId, guidePrice, onSlotSelect }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const loadSlots = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        
        const availableSlots = await getGuideSlots(guideId, today, nextWeek);
        setSlots(availableSlots);
        
        // Group by date
        const groupedSlots = {};
        availableSlots.forEach(slot => {
          if (!groupedSlots[slot.date]) {
            groupedSlots[slot.date] = [];
          }
          groupedSlots[slot.date].push(slot);
        });
        
        setSlots(groupedSlots);
      } catch (error) {
        console.error('Error loading slots:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSlots();
  }, [guideId]);

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    onSlotSelect(slot);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    return date.toLocaleDateString('en-IN', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (Object.keys(slots).length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          No slots available. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Select a Time Slot
      </h3>

      {Object.entries(slots).map(([date, timeSlots]) => (
        <div key={date} className="space-y-3">
          {/* Date Header */}
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{formatDate(date)}</span>
            <span className="text-sm text-gray-500">
              ({new Date(date).toLocaleDateString('en-IN', { weekday: 'long' })})
            </span>
          </div>

          {/* Time Slots */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => handleSlotClick(slot)}
                className={`
                  relative p-3 rounded-lg border-2 transition-all
                  ${selectedSlot?.id === slot.id
                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-400'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {slot.time}
                  </span>
                  <span className="text-xs text-gray-500">
                    {slot.duration}min
                  </span>
                </div>
                
                {selectedSlot?.id === slot.id && (
                  <div className="absolute top-1 right-1">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Selected Slot Info */}
      {selectedSlot && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Selected Slot</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatDate(selectedSlot.date)} at {selectedSlot.time}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Duration: {selectedSlot.duration} minutes
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
              <p className="text-2xl font-bold text-green-600 flex items-center gap-1">
                <IndianRupee className="w-5 h-5" />
                {selectedSlot.price}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
