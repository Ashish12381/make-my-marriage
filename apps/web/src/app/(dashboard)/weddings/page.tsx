import type { Metadata } from 'next';
import { WeddingsHub } from '@/components/weddings/weddings-hub';
export const metadata: Metadata = { title: 'My Weddings | Make My Marriage' };
export default function MyWeddingsPage() {
  return <WeddingsHub />;
}
