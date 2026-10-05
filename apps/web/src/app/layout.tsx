import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@fontsource-variable/inter';
import '@fontsource-variable/manrope';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Make My Marriage',
  description: 'Collaborative wedding planning',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="p-8">{children}</main>
      </body>
    </html>
  );
}
