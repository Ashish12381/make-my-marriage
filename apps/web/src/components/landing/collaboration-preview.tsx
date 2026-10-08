'use client';

import { useState } from 'react';
import { LandingIcon } from './landing-icon';

const celebrations = [
  {
    label: 'Haldi',
    title: 'Haldi Ceremony',
    details: 'Nov 12 · Courtyard Poolside · 10:00 AM',
    leads: 'Mother Anita & Uncle Amit',
    tasks: [
      'Confirm turmeric and flower trays',
      'Arrange seating for both families',
      'Coordinate ceremony arrival times',
    ],
  },
  {
    label: 'Mehendi',
    title: 'Mehendi & Sundowner',
    details: 'Nov 12 · Shahi Bagh Lawns · 4:00 PM',
    leads: 'Cousins Neha & Pooja',
    tasks: [
      'Confirm mehendi artist arrival',
      'Arrange shaded seating and refreshments',
      'Share the evening music playlist',
    ],
  },
  {
    label: 'Sangeet Night',
    title: 'Sangeet Extravaganza',
    details: 'Nov 13 · Crystal Ballroom · 7:00 PM',
    leads: 'Sister Riya & Karan',
    tasks: [
      'Choreographer track final audio cut',
      'Dhol troupe arrival & room allotment',
      'Stage LED backdrop lighting dry run',
    ],
  },
  {
    label: 'Wedding',
    title: 'Wedding & Sacred Pheras',
    details: 'Nov 14 · Mandap Pavilion · 10:30 AM',
    leads: 'Father Raj & Aunt Meera',
    tasks: [
      'Confirm ceremony essentials with the priest',
      'Coordinate family transport to the venue',
      'Check mandap seating and floral setup',
    ],
  },
  {
    label: 'Reception',
    title: 'Reception Gala',
    details: 'Nov 15 · Grand Ballroom · 7:00 PM',
    leads: 'Brother Arjun & Cousin Kavya',
    tasks: [
      'Finalize welcome signage',
      'Confirm catering service timings',
      'Coordinate family photo schedule',
    ],
  },
] as const;

const statuses = [
  {
    label: 'Done',
    icon: 'check_circle',
    color: 'text-sage',
    badge: 'bg-sage/15 text-sage border-sage/30',
  },
  {
    label: 'In Progress',
    icon: 'radio_button_unchecked',
    color: 'text-amber-ink',
    badge: 'bg-amber-warm/15 text-amber-ink border-amber-warm/30',
  },
  {
    label: 'Pending',
    icon: 'radio_button_unchecked',
    color: 'text-secondary',
    badge: 'bg-sand-alt text-secondary border-outline',
  },
] as const;

export function CollaborationPreview() {
  const [selectedIndex, setSelectedIndex] = useState(2);
  const celebration = celebrations[selectedIndex] ?? celebrations[2];

  return (
    <div className="rounded-2xl border border-outline bg-surface p-space-md shadow-xl lg:p-space-lg">
      <p className="mb-3 text-label-md text-secondary">
        Explore sample tasks by selecting an event.
      </p>
      <div
        role="group"
        aria-label="Sample wedding events"
        className="flex flex-wrap items-center gap-2 border-b border-outline/60 pb-space-md"
      >
        {celebrations.map((event, index) => (
          <button
            key={event.label}
            type="button"
            aria-pressed={selectedIndex === index}
            aria-controls="collaboration-preview"
            onClick={() => setSelectedIndex(index)}
            className={`min-h-11 cursor-pointer rounded-lg border px-3 py-2 font-label-md text-label-md font-semibold transition-colors ${selectedIndex === index ? 'border-primary-hover bg-primary-hover text-white shadow-xs' : 'border-outline/70 bg-surface-container-low text-secondary hover:bg-sand-alt hover:text-espresso'}`}
          >
            {event.label}
          </button>
        ))}
      </div>
      <div
        id="collaboration-preview"
        aria-live="polite"
        aria-atomic="true"
        className="mt-space-md rounded-xl border border-outline/70 bg-surface-container-low p-space-md"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-espresso">
              {celebration.title}
            </h3>
            <p className="text-body-sm text-secondary">{celebration.details}</p>
          </div>
          <span className="rounded-full border border-outline bg-surface px-3 py-1 text-label-sm font-semibold text-espresso shadow-xs">
            Host Leads: {celebration.leads}
          </span>
        </div>
        <ul className="mt-space-md space-y-2">
          {celebration.tasks.map((task, index) => {
            const status = statuses[index] ?? statuses[2];
            return (
              <li
                key={task}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-outline/60 bg-surface p-3 shadow-xs"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <LandingIcon name={status.icon} className={`${status.color} text-[20px]`} />
                  <span
                    className={`text-label-md text-espresso ${index === 0 ? 'line-through' : ''}`}
                  >
                    {task}
                  </span>
                </div>
                <span
                  className={`shrink-0 rounded border px-2 py-0.5 text-label-sm font-bold ${status.badge}`}
                >
                  {status.label}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-space-md flex items-center gap-2 text-label-sm text-secondary">
          <LandingIcon name="shield" className="text-[16px] text-primary" />
          <span>Permission Level: Wedding Admins & Assigned Organizers</span>
        </div>
        <p className="mt-3 text-label-md text-secondary">
          Sample tasks only · Editing belongs in your wedding workspace.
        </p>
      </div>
    </div>
  );
}
