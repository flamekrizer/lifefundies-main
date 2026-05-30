import { useState, useEffect } from 'react';
import { Calendar, Clock, IndianRupee, Check } from 'lucide-react';
// @ts-ignore
import { getGuideSlots } from '@/lib/bookingService';

interface Slot {
  id: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  isBooked: boolean;
  isBlocked?: boolean;
  isActive?: boolean;
}

interface SlotSelectionProps {
  guideId: string;
  guidePrice: number;
  onSlotSelect: (slot: Slot) => void;
}

/**
 * 📅 Slot Selection Component (TypeScript)
 * Displays and groups available slots for a guide from Firestore
 */
export default function SlotSelection({ guideId, guidePrice, onSlotSelect }: SlotSelectionProps) {
  const [slots, setSlots] = useState<Record<string, Slot[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  useEffect(() => {
    const loadSlots = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        
        let availableSlots: Slot[] = await getGuideSlots(guideId, today, nextWeek);
        
        if (!availableSlots || availableSlots.length === 0) {
          console.log('No slots found in database, generating mock fallback slots.');
          const fallbackSlots: Slot[] = [];
          const times = ['10:00 AM', '02:00 PM', '04:00 PM'];
          
          for (let i = 1; i <= 3; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const dateString = d.toISOString().split('T')[0];
            
            times.forEach((time, index) => {
              fallbackSlots.push({
                id: `mock-slot-${dateString}-${index}`,
                date: dateString,
                time: time,
                duration: 60,
                price: guidePrice,
                isBooked: false
              });
            });
          }
          availableSlots = fallbackSlots;
        }
        
        // Group by date
        const groupedSlots: Record<string, Slot[]> = {};
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

  const handleSlotClick = (slot: Slot) => {
    setSelectedSlot(slot);
    onSlotSelect(slot);
  };

  const formatDate = (dateStr: string) => {
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
      <div className="slot-selection__loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (Object.keys(slots).length === 0) {
    return (
      <div className="slot-selection__empty">
        <Calendar className="slot-selection__empty-icon" size={40} />
        <p>No slots available. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="slot-selection">
      <h3 className="heading-3 slot-selection__title">Select a Time Slot</h3>

      <div className="slot-selection__dates">
        {Object.entries(slots).map(([date, timeSlots]) => (
          <div key={date} className="slot-selection__group">
            {/* Date Header */}
            <div className="slot-selection__date-header">
              <Calendar size={14} />
              <span className="slot-selection__date-label">{formatDate(date)}</span>
              <span className="slot-selection__date-day">
                ({new Date(date).toLocaleDateString('en-IN', { weekday: 'long' })})
              </span>
            </div>

            {/* Time Slots Grid */}
            <div className="slot-selection__grid">
              {timeSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleSlotClick(slot)}
                  type="button"
                  className={`slot-selection__btn ${
                    selectedSlot?.id === slot.id ? 'slot-selection__btn--active' : ''
                  }`}
                >
                  <Clock size={12} className="slot-selection__btn-icon" />
                  <span className="slot-selection__btn-time">{slot.time}</span>
                  <span className="slot-selection__btn-duration">{slot.duration}m</span>
                  
                  {selectedSlot?.id === slot.id && (
                    <span className="slot-selection__btn-check">
                      <Check size={12} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Slot Summary Card */}
      {selectedSlot && (
        <div className="slot-selection__summary">
          <div className="slot-selection__summary-left">
            <p className="slot-selection__summary-label">Selected Slot</p>
            <p className="slot-selection__summary-time">
              {formatDate(selectedSlot.date)} at {selectedSlot.time}
            </p>
            <p className="slot-selection__summary-desc">
              Duration: {selectedSlot.duration} minutes
            </p>
          </div>
          <div className="slot-selection__summary-right">
            <p className="slot-selection__summary-label">Fee</p>
            <p className="slot-selection__summary-price">
              <IndianRupee size={16} style={{ display: 'inline', marginRight: '2px' }} />
              {selectedSlot.price || guidePrice}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
