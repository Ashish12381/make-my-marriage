import type { Metadata } from 'next';
import { WeddingForm } from '@/components/weddings/wedding-form';
export const metadata: Metadata = { title: 'Create Wedding | Make My Marriage' };
export default function NewWeddingPage() {
  return (
    <div className="wedding-container wedding-form-container">
      <WeddingForm />
    </div>
  );
}
