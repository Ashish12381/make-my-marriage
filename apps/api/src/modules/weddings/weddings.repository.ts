import mongoose, { type ClientSession } from 'mongoose';
import type { CreateWeddingInput, UpdateWeddingInput } from '@make-my-marriage/contracts';
import { WeddingModel } from './models/wedding.model.js';
import { weddingCoupleKey } from './wedding-identity.js';
function venue(input: CreateWeddingInput['defaultVenue']) {
  if (!input) return undefined;
  return {
    name: input.name,
    address: input.address,
    ...(input.latitude !== undefined && input.longitude !== undefined
      ? { location: { type: 'Point', coordinates: [input.longitude, input.latitude] } }
      : {}),
  };
}
export const weddingsRepository = {
  async initialize() {
    await WeddingModel.createCollection();
    await WeddingModel.createIndexes();
  },
  async transaction<T>(operation: (session: ClientSession) => Promise<T>) {
    return mongoose.connection.transaction(operation);
  },
  async create(
    input: CreateWeddingInput,
    userId: string,
    expiresAt: Date,
    storageQuotaBytes: number,
    session: ClientSession,
  ) {
    const wedding = new WeddingModel({
      ...input,
      defaultVenue: venue(input.defaultVenue),
      createdBy: userId,
      coupleKey: weddingCoupleKey(input.brideName, input.groomName),
      guestAccessExpiresAt: expiresAt,
      storageQuotaBytes,
    });
    return wedding.save({ session });
  },
  async slugExists(slug: string) {
    return Boolean(await WeddingModel.exists({ slug }));
  },
  async coupleExists(
    userId: string,
    brideName: string,
    groomName: string,
    session: ClientSession,
    excludeId?: string,
  ) {
    const key = weddingCoupleKey(brideName, groomName);
    const scope = {
      createdBy: userId,
      deletedAt: null,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    };
    if (await WeddingModel.exists({ ...scope, coupleKey: key }).session(session)) return true;
    // Records created before this rule have no key. Check them without changing user data.
    const legacy = await WeddingModel.find({ ...scope, coupleKey: { $exists: false } })
      .select('brideName groomName')
      .session(session)
      .lean()
      .exec();
    return legacy.some((wedding) => weddingCoupleKey(wedding.brideName, wedding.groomName) === key);
  },
  async list(ids: string[]) {
    return WeddingModel.find({ _id: { $in: ids }, status: 'ACTIVE', deletedAt: null })
      .sort({ createdAt: -1, _id: -1 })
      .lean()
      .exec();
  },
  async find(id: string, session?: ClientSession) {
    return WeddingModel.findOne({ _id: id, status: 'ACTIVE', deletedAt: null })
      .session(session ?? null)
      .lean()
      .exec();
  },
  async update(id: string, input: UpdateWeddingInput, expiresAt: Date, session: ClientSession) {
    return WeddingModel.findOneAndUpdate(
      { _id: id, status: 'ACTIVE', deletedAt: null },
      {
        $set: {
          ...input,
          coupleKey: weddingCoupleKey(input.brideName, input.groomName),
          defaultVenue: venue(input.defaultVenue) ?? {},
          guestAccessExpiresAt: expiresAt,
        },
      },
      { returnDocument: 'after', runValidators: true, session },
    )
      .lean()
      .exec();
  },
};
