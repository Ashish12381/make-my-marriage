import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createWeddingSchema } from '@make-my-marriage/contracts';
import {
  weddingCountdown,
  suggestWeddingSlug,
  suggestWeddingTitles,
  formatWeddingDate,
} from '../src/lib/weddings';
import { WeddingForm } from '../src/components/weddings/wedding-form';
import { WeddingShell } from '../src/components/weddings/wedding-shell';
import { WeddingSummary } from '../src/components/weddings/wedding-summary';
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }));
const wedding = {
  id: 'a'.repeat(24),
  role: 'WEDDING_ADMIN' as const,
  status: 'ACTIVE' as const,
  title: 'Our wedding',
  brideName: 'Priya',
  groomName: 'Rahul',
  weddingDate: '2027-02-14',
  timezone: 'Asia/Kolkata',
  slug: 'priya-rahul',
};
describe('wedding presentation', () => {
  it('offers personal titles using first names while preserving accents and non-Latin names', () => {
    expect(suggestWeddingTitles('  Priya  Patel ', ' Rahul\tSharma ')).toContain(
      'Priya & Rahul’s Wedding',
    );
    expect(suggestWeddingTitles('Zoë', 'André')).toContain('Celebrating Zoë & André');
    expect(suggestWeddingTitles('प्रिया', 'राहुल')).toContain('प्रिया & राहुल’s Wedding');
  });
  it('waits for both names and keeps every suggestion within the title limit', () => {
    expect(suggestWeddingTitles('Priya', '  ')).toEqual([]);
    expect(suggestWeddingTitles('', 'Rahul')).toEqual([]);
    const suggestions = suggestWeddingTitles('A'.repeat(100), 'B'.repeat(100));
    expect(suggestions.length).toBeGreaterThan(0);
    for (const title of suggestions) {
      expect(createWeddingSchema.shape.title.safeParse(title).success).toBe(true);
    }
  });
  it('offers explicit non-submitting choices without replacing an existing title', () => {
    const html = renderToStaticMarkup(<WeddingForm initial={wedding} />);
    expect(html).toContain('value="Our wedding"');
    expect(html).toContain('aria-label="Suggested wedding titles"');
    expect(html).toContain('type="button" aria-pressed="false">Priya &amp; Rahul’s Wedding');
    expect(renderToStaticMarkup(<WeddingForm />)).toContain('Enter both names below');
  });
  it('computes countdowns using the wedding timezone across local day boundaries', () => {
    expect(weddingCountdown('2027-02-14', 'Asia/Kolkata', new Date('2027-02-13T20:00:00Z'))).toBe(
      'It’s your wedding day!',
    );
    expect(
      weddingCountdown('2027-02-14', 'America/New_York', new Date('2027-02-13T20:00:00Z')),
    ).toBe('1 day to go');
    expect(weddingCountdown('2027-02-14', 'UTC', new Date('2027-02-16T00:00:00Z'))).toBe(
      'Celebrated 2 days ago',
    );
  });
  it('generates editable URL-safe suggestions and formats civil dates without shifting', () => {
    expect(suggestWeddingSlug('Priya Patel', 'Rahul Sharma')).toBe('priya-rahul');
    expect(suggestWeddingSlug('Zoë', 'André')).toBe('zoe-andre');
    expect(formatWeddingDate('2027-02-14')).toBe('14 February 2027');
  });
  it('shows a real creation form without demo controls or budget fields', () => {
    const html = renderToStaticMarkup(<WeddingForm />);
    expect(html).toContain('Let’s make it your wedding');
    expect(html).toContain('wedding-brideName');
    expect(html).toContain('Continue to Step 2');
    expect(html).not.toContain('Simulate');
    expect(html).not.toContain('budget');
  });
  it('keeps slug read-only during editing and venue fields optional', () => {
    const html = renderToStaticMarkup(<WeddingForm initial={wedding} />);
    expect(html.toLowerCase()).toContain('readonly=""');
    expect(html).toContain('Save Changes');
    expect(html).toContain('(optional)');
    expect(html).not.toContain('never be changed');
  });
  it('renders mobile and desktop workspace navigation', () => {
    const html = renderToStaticMarkup(
      <WeddingShell>
        <p>Content</p>
      </WeddingShell>,
    );
    expect(html).toContain('Mobile workspace navigation');
    expect(html).toContain('Sign Out');
    expect(html).toContain('href="/weddings"');
  });
  it('does not fabricate venue data when none was saved', () => {
    expect(createWeddingSchema.safeParse(wedding).success).toBe(false); // DTO fields are never accepted as creation input.
    const html = renderToStaticMarkup(<WeddingSummary wedding={wedding} />);
    expect(html).toContain('Not added yet');
    expect(html).not.toContain('Rajvilas');
  });
});
