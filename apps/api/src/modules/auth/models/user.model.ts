import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    displayName: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, maxlength: 254 },
    emailNormalized: { type: String, required: true, maxlength: 254 },
    passwordHash: { type: String, required: true, select: false },
    phone: String,
    profileImageKey: String,
    platformRole: { type: String, enum: ['USER', 'SUPER_ADMIN'], default: 'USER', required: true },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE', required: true },
    lastLoginAt: Date,
  },
  { collection: 'users', timestamps: true, strict: 'throw' },
);
userSchema.index({ emailNormalized: 1 }, { unique: true });
export const User = model('User', userSchema);
