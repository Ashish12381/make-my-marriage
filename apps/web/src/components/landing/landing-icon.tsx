const paths: Record<string, string> = {
  arrow_forward: 'M4 12h16m-6-6 6 6-6 6',
  arrow_outward: 'M5 19 19 5M5 5h14v14',
  play_circle: 'M10 8l6 4-6 4z',
  play_arrow: 'M8 5l11 7-11 7z',
  person: 'M5 21v-2a7 7 0 0 1 14 0v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
  diversity_1:
    'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6m8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6M2 20v-2a5 5 0 0 1 10 0v2m0 0v-2a5 5 0 0 1 10 0v2',
  payments: 'M3 5h18v14H3zM7 9h2m6 6h2M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  account_balance_wallet: 'M3 6h17v14H3zM3 6V3h14m0 8h4v5h-4z',
  mark_email_read: 'M3 5h18v14H3zM3 5l9 7 9-7m-5 12 2 2 4-4',
  mail: 'M3 5h18v14H3zM3 5l9 7 9-7',
  photo_camera: 'M3 7h4l2-3h6l2 3h4v13H3zM12 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
  admin_panel_settings: 'M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7zM8 12l3 3 5-6',
  assignment_ind: 'M5 4h14v17H5zM9 2h6v4H9zM9 17h6m-3-9a2 2 0 1 0 0 4 2 2 0 0 0 0-4',
  check_circle: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M7 12l3 3 7-7',
  radio_button_unchecked: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20',
  shield: 'M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7z',
  verified: 'M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7zM8 12l3 3 5-6',
  verified_user: 'M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7zM8 12l3 3 5-6',
  auto_awesome: 'M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z',
  timer: 'M9 2h6m-3 5v6l4 2M12 5a8 8 0 1 0 0 16 8 8 0 0 0 0-16',
  link: 'M10 14l4-4M9 16l-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 0 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0',
  visibility: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  event_available: 'M4 5h16v16H4zM8 2v6m8-6v6M4 10h16m-12 5 3 3 5-5',
  videocam: 'M3 6h12v12H3zM15 10l6-4v12l-6-4',
  smart_display: 'M2 4h20v16H2zM10 8l6 4-6 4z',
  map: 'M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2zM9 3v16m6-14v16',
  location_on: 'M12 22s8-8 8-13a8 8 0 0 0-16 0c0 5 8 13 8 13M12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  lock: 'M5 10h14v11H5zM8 10V6a4 4 0 0 1 8 0v4',
  lock_open: 'M5 10h14v11H5zM8 10V6a4 4 0 0 1 8 0',
  qr_code_scanner: 'M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h3v3h3v3h-6z',
  star: 'M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',
};

export function LandingIcon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`landing-icon ${className}`}
    >
      <path d={paths[name] ?? paths.auto_awesome} />
    </svg>
  );
}
