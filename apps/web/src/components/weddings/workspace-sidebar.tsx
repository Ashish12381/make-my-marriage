'use client';
import Link from 'next/link';
import { useId, useRef, useState } from 'react';
import { SignOutButton } from '../auth/sign-out-button';
import { UserIdentity } from '../auth/user-identity';

const icons = {
  home: 'M3 12 12 4l9 8M5 10v10h14V10M9 20v-6h6v6',
  calendar: 'M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2ZM7 3v4m10-4v4M3 10h18',
  tasks: 'M8 5H5v16h14V5h-3M8 3h8v4H8zM8 13l2 2 5-5',
  money: 'M3 5h15v4M3 5v10h4m0-6h14v11H7zM12 14h4m-2-2v4',
  vendors: 'M5 21V3h14v18M3 21h18M9 7h1m4 0h1m-6 4h1m4 0h1m-5 10v-5h4v5',
  people:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2h14Zm0-6a4 4 0 0 1 6 4v2h-3M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-8a4 4 0 0 1 0 8',
  mail: 'M3 5h18v14H3zM3 6l9 7 9-7',
  activity: 'M3 12h4l3-6 4 12 3-6h4',
  photo: 'M3 4h18v16H3zM3 17l5-5 4 4 4-5 5 6M8 8h.01',
  globe:
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM2 12h20M12 2a16 16 0 0 1 0 20 16 16 0 0 1 0-20Z',
  settings:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM10 3h4l1 3 3 1 3 4v2l-3 4-3 1-1 3h-4l-1-3-3-1-3-4v-2l3-4 3-1z',
} as const;

export type IconName = keyof typeof icons;

export function DashboardIcon({ name }: { name: IconName }) {
  return (
    <svg
      aria-hidden="true"
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={icons[name]} />
    </svg>
  );
}

export type WorkspaceNavGroup = {
  label: string;
  items: { label: string; icon: IconName; href?: string | undefined; badge?: string | undefined }[];
};

export function WorkspaceSidebar({
  groups,
  active,
  editDetails,
}: {
  groups: WorkspaceNavGroup[];
  active: 'Overview' | 'Events' | 'Tasks';
  editDetails?: (() => void) | undefined;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navId = useId();
  return (
    <aside
      className="wedding-dashboard-sidebar"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && menuOpen && menuButton.current?.getClientRects().length) {
          event.preventDefault();
          setMenuOpen(false);
          menuButton.current.focus();
        }
      }}
    >
      <div className="wedding-dashboard-brand">
        <Link href="/weddings">
          <span aria-hidden="true">♥</span>
          <strong>
            Make My Marriage<small>Workspace</small>
          </strong>
        </Link>
        <button
          ref={menuButton}
          type="button"
          className="wedding-dashboard-navigation"
          aria-expanded={menuOpen}
          aria-controls={navId}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          Menu <span aria-hidden="true">⌄</span>
        </button>
      </div>
      <nav
        id={navId}
        aria-label="Wedding workspace"
        className="wedding-dashboard-nav"
        data-open={menuOpen}
      >
        <Link href="/weddings" className="wedding-dashboard-switch">
          <span aria-hidden="true">←</span>
          My Weddings
        </Link>
        {groups.map(({ label, items }) => (
          <div key={label} className="wedding-dashboard-nav-group">
            <p>{label}</p>
            <ul>
              {items.map(({ label: item, icon, href, badge }) => {
                const content = (
                  <>
                    <DashboardIcon name={icon} />
                    <span>{item}</span>
                    {badge && <small>{badge}</small>}
                  </>
                );
                return (
                  <li key={item}>
                    {href ? (
                      <Link
                        href={href}
                        aria-current={item === active ? 'page' : undefined}
                        onClick={() => setMenuOpen(false)}
                      >
                        {content}
                      </Link>
                    ) : item === 'Wedding Settings' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          editDetails?.();
                        }}
                      >
                        {content}
                      </button>
                    ) : (
                      <span>{content}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <div className="wedding-dashboard-account">
          <UserIdentity />
          <SignOutButton className="wedding-text-button" />
        </div>
      </nav>
    </aside>
  );
}
