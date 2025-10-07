import { Schema, model, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: string };

export const User = model('User', userSchema);


