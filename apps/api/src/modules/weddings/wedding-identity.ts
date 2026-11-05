import { createHash } from 'node:crypto';

// Full names, not display titles, identify a couple within one creator's weddings.
export function weddingCoupleKey(brideName: string, groomName: string): string {
  const names = [brideName, groomName].map((name) =>
    name.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase(),
  );
  return createHash('sha256').update(JSON.stringify(names.sort())).digest('hex');
}
