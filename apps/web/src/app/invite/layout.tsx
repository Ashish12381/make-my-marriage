import type { ReactNode } from 'react';

export default function InviteLayout({ children }: { children: ReactNode }) {
  return <main className="p-8">{children}</main>;
}
