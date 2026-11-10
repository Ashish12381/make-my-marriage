import { notFound } from 'next/navigation';
import type { Wedding } from '@make-my-marriage/contracts';
import { WeddingDashboard } from '@/components/weddings/wedding-dashboard';

const wedding: Wedding = {
  id: '000000000000000000000000',
  role: 'WEDDING_ADMIN',
  status: 'ACTIVE',
  title: 'Rahul & Priya’s Wedding',
  brideName: 'Priya Patel',
  groomName: 'Rahul Sharma',
  weddingDate: '2027-11-14',
  timezone: 'Asia/Kolkata',
  slug: 'rahul-priya-preview',
  defaultVenue: { name: 'The Oberoi Rajvilas, Jaipur' },
};

export default function DashboardPreviewPage() {
  if (process.env.NODE_ENV !== 'development') notFound();

  return (
    <WeddingDashboard
      wedding={wedding}
      preview
      team={
        <ul className="wedding-dashboard-list">
          <li>
            <strong>Rahul Sharma</strong>
            <p>Wedding Admin</p>
          </li>
          <li>
            <strong>Priya Patel</strong>
            <p>Wedding Admin</p>
          </li>
          <li>
            <strong>Divya Patel</strong>
            <p>Organizer · Events and Tasks</p>
          </li>
          <li>
            <strong>Vikram Sharma</strong>
            <p>Organizer · Logistics</p>
          </li>
        </ul>
      }
    />
  );
}
