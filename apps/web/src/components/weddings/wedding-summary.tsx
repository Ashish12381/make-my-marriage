import type { CreateWeddingInput } from '@make-my-marriage/contracts';
import { formatWeddingDate } from '@/lib/weddings';
export function WeddingSummary({ wedding }: { wedding: CreateWeddingInput }) {
  return (
    <dl className="wedding-summary">
      <div>
        <dt>Wedding title</dt>
        <dd>{wedding.title}</dd>
      </div>
      <div>
        <dt>Couple</dt>
        <dd>
          {wedding.brideName} &amp; {wedding.groomName}
        </dd>
      </div>
      <div>
        <dt>Date &amp; timezone</dt>
        <dd>
          {formatWeddingDate(wedding.weddingDate)}
          <small>{wedding.timezone}</small>
        </dd>
      </div>
      <div>
        <dt>Venue &amp; location</dt>
        <dd>
          {wedding.defaultVenue?.name || 'Not added yet'}
          <small>{wedding.defaultVenue?.address}</small>
        </dd>
      </div>
    </dl>
  );
}
