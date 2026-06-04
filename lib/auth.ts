import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { COOKIE_NAME } from "@/lib/constants";

type JwtPayload = {
  userId: string;
  email: string;
};

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in environment variables");
}

export const createToken = (payload: JwtPayload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const getCurrentUserId = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token);

    if (!mongoose.Types.ObjectId.isValid(payload.userId)) {
      return null;
    }

    return payload.userId;
  } catch {
    return null;
  }
};
