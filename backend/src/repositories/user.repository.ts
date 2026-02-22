import { UserModel, type UserDoc } from "../models/user.model";

export async function findUserByEmail(email: string) {
  return UserModel.findOne({ email }).exec();
}

export async function findUserById(id: string) {
  return UserModel.findById(id).exec();
}

export async function createUser(input: {
  email: string;
  passwordHash: string;
  role?: "admin" | "manager" | "user";
}) {
  const user = await UserModel.create({
    email: input.email,
    passwordHash: input.passwordHash,
    role: input.role ?? "user",
  });
  return user;
}

export async function setRefreshTokenHash(
  userId: string,
  refreshTokenHash: string | null,
) {
  await UserModel.updateOne(
    { _id: userId },
    { $set: { refreshTokenHash } },
  ).exec();
}
