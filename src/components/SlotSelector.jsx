'use client';

import { useMemo } from 'react';

export default function SlotSelector({ slots, selectedSlotId, onSelect }) {
  const grouped = useMemo(() => {
    return slots.reduce((acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = [];
      }
      acc[slot.date].push(slot);
      return acc;
    }, {});
  }, [slots]);

  if (!slots.length) {
    return <p className="text-sm text-gray-500">No available slots for the next 7 days.</p>;
  }

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([date, daySlots]) => (
        <div key={date}>
          <p className="font-semibold mb-2">{date}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {daySlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => onSelect(slot)}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  selectedSlotId === slot.id
                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
