import type {
  CreateWeddingInput,
  UpdateWeddingInput,
  Wedding,
  WeddingRole,
} from '@make-my-marriage/contracts';
import { AppError } from '../../common/errors/app-error.js';
import { env } from '../../config/env.js';
import {
  createInitialWeddingAdmin,
  initializeMemberships,
  listActiveWeddingMemberships,
  requireWeddingMembership,
} from '../memberships/index.js';
import { createUnpublishedWebsite, initializeWebsiteSettings } from '../website/index.js';
import { recordWeddingChange } from '../audit/index.js';
import { weddingsRepository } from './weddings.repository.js';
import { defaultGuestExpiry } from './wedding-dates.js';
let ready: Promise<void> | undefined;
export async function initializeWeddings() {
  ready ??= Promise.all([
    weddingsRepository.initialize(),
    initializeMemberships(),
    initializeWebsiteSettings(),
  ])
    .then(() => {})
    .catch((error: unknown) => {
      ready = undefined;
      throw error;
    });
  try {
    await ready;
  } catch {
    throw new AppError(
      503,
      'WEDDINGS_UNAVAILABLE',
      'Wedding services are temporarily unavailable. Please try again.',
    );
  }
}
type StoredWedding = NonNullable<Awaited<ReturnType<typeof weddingsRepository.find>>>;
function publicWedding(wedding: StoredWedding, role: WeddingRole): Wedding {
  const v = wedding.defaultVenue;
  return {
    id: wedding._id.toString(),
    title: wedding.title,
    brideName: wedding.brideName,
    groomName: wedding.groomName,
    weddingDate: wedding.weddingDate,
    timezone: wedding.timezone,
    slug: wedding.slug,
    role,
    status: 'ACTIVE',
    ...(v
      ? {
          defaultVenue: {
            ...(v.name ? { name: v.name } : {}),
            ...(v.address ? { address: v.address } : {}),
            ...(v.location?.coordinates?.length === 2
              ? { longitude: v.location.coordinates[0]!, latitude: v.location.coordinates[1]! }
              : {}),
          },
        }
      : {}),
  };
}
function missing(): never {
  throw new AppError(
    404,
    'WEDDING_NOT_FOUND',
    'This wedding is unavailable or you do not have access.',
  );
}
function duplicate(error: unknown): never {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000 &&
    'keyPattern' in error &&
    typeof error.keyPattern === 'object' &&
    error.keyPattern !== null &&
    'coupleKey' in error.keyPattern
  )
    duplicateCouple();
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000)
    throw new AppError(409, 'SLUG_TAKEN', 'This website address is already taken. Try another.', [
      {
        path: 'body.slug',
        message: 'Choose another website address, such as adding your wedding year.',
      },
    ]);
  throw error;
}
function duplicateCouple(): never {
  throw new AppError(
    409,
    'DUPLICATE_WEDDING',
    'You already created a wedding for this couple. Open it from My Weddings instead.',
    [
      {
        path: 'body.brideName',
        message: 'A wedding for this couple already exists in your account.',
      },
    ],
  );
}
export const weddingsService = {
  async create(userId: string, input: CreateWeddingInput) {
    try {
      return await weddingsRepository.transaction(async (session) => {
        if (
          await weddingsRepository.coupleExists(userId, input.brideName, input.groomName, session)
        )
          duplicateCouple();
        const wedding = await weddingsRepository.create(
          input,
          userId,
          defaultGuestExpiry(input.weddingDate, input.timezone),
          env.WEDDING_STORAGE_QUOTA_BYTES ?? 0,
          session,
        );
        const id = wedding._id.toString();
        await createInitialWeddingAdmin(id, userId, session);
        await createUnpublishedWebsite(id, session);
        await recordWeddingChange(id, userId, 'WEDDING_CREATED', session);
        return publicWedding(wedding.toObject(), 'WEDDING_ADMIN');
      });
    } catch (error) {
      return duplicate(error);
    }
  },
  async list(userId: string) {
    const memberships = await listActiveWeddingMemberships(userId);
    const roles = new Map(memberships.map((m) => [m.weddingId.toString(), m.role as WeddingRole]));
    const weddings = await weddingsRepository.list([...roles.keys()]);
    return weddings.map((w) => publicWedding(w, roles.get(w._id.toString())!));
  },
  async get(userId: string, id: string) {
    const membership = await requireWeddingMembership(id, userId);
    const wedding = await weddingsRepository.find(id);
    if (!wedding) return missing();
    return publicWedding(wedding, membership.role as WeddingRole);
  },
  async update(userId: string, id: string, input: UpdateWeddingInput) {
    const membership = await requireWeddingMembership(id, userId);
    if (membership.role !== 'WEDDING_ADMIN')
      throw new AppError(403, 'FORBIDDEN', 'Only Wedding Admins can edit these details.');
    return weddingsRepository
      .transaction(async (session) => {
        const before = await weddingsRepository.find(id, session);
        if (!before) return missing();
        if (
          await weddingsRepository.coupleExists(
            before.createdBy.toString(),
            input.brideName,
            input.groomName,
            session,
            id,
          )
        )
          duplicateCouple();
        // Events are not mounted yet. Integrate final-event expiry via events' public interface when implemented.
        const expiry =
          before.guestAccessExpiryMode === 'DEFAULT'
            ? defaultGuestExpiry(input.weddingDate, input.timezone)
            : before.guestAccessExpiresAt;
        const wedding = await weddingsRepository.update(id, input, expiry, session);
        if (!wedding) return missing();
        await recordWeddingChange(id, userId, 'WEDDING_UPDATED', session);
        return publicWedding(wedding, 'WEDDING_ADMIN');
      })
      .catch(duplicate);
  },
  async available(slug: string) {
    return !(await weddingsRepository.slugExists(slug));
  },
};
