import { useState } from 'react';

interface Booking {
  startDate: string;
  endDate: string;
}

interface Props {
  bookings: Booking[];
}

function isBetween(date: Date, start: Date, end: Date) {
  return date >= start && date <= end;
}

export default function AvailabilityCalendar({ bookings }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const blockedRanges = bookings.map((b) => ({
    start: new Date(b.startDate),
    end: new Date(b.endDate),
  }));

  function isBlocked(date: Date) {
    return blockedRanges.some((r) => isBetween(date, r.start, r.end));
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <button onClick={prevMonth} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">‹</button>
        <span className="font-semibold text-ocean">{monthName} {year}</span>
        <button onClick={nextMonth} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">›</button>
      </div>

      {/* Day labels */}
      <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-slate-400">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-0.5 text-center text-sm">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const date = new Date(year, month, day);
          const past = date < today;
          const blocked = isBlocked(date);

          return (
            <div
              key={i}
              className={`flex h-8 w-full items-center justify-center rounded-lg text-xs font-medium
                ${past ? 'text-slate-200' : blocked ? 'bg-red-100 text-red-500' : 'text-slate-700 hover:bg-seafoam-50'}`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-slate-100" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-red-100" /> Booked
        </span>
      </div>
    </div>
  );
}
