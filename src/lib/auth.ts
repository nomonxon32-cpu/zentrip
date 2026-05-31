import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE } from "@/lib/constants";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/http";

type SessionPayload = {
  userId: string;
  role: Role;
  email: string;
};

function getJwtSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function readSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export async function verifySessionToken(token: string) {
  try {
    const verified = await jwtVerify<SessionPayload>(token, getJwtSecret());
    return verified.payload;
  } catch {
    return null;
  }
}

export async function setAuthSession(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const token = await readSessionToken();
  if (!token) {
    return null;
  }

  const payload = await verifySessionToken(token);
  if (!payload?.userId) {
    return null;
  }

  return db.user.findUnique({
    where: { id: payload.userId },
  });
}

export function getRoleHomePath(role: Role) {
  if (role === Role.ADMIN) return "/admin";
  if (role === Role.OWNER) return "/dashboard/owner";
  return "/dashboard/renter";
}

export function hasRequiredRole(userRole: Role, requiredRole: Role) {
  return userRole === requiredRole;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.isSuspended) {
    redirect("/suspended");
  }

  return user;
}

export async function requireMarketplaceUser() {
  const user = await requireUser();
  if (user.role === Role.ADMIN) {
    redirect("/admin");
  }

  return user;
}

export async function requireRole(requiredRole: Role) {
  const user = await requireUser();

  if (user.role !== requiredRole) {
    if (requiredRole === Role.ADMIN) {
      redirect("/forbidden");
    }

    redirect(getRoleHomePath(user.role));
  }

  return user;
}

export async function requireApiUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new ApiError(401, "Authentication required.");
  }

  if (user.isSuspended) {
    throw new ApiError(403, "Suspended accounts cannot access this action.");
  }

  return user;
}

export async function requireApiRole(requiredRole: Role) {
  const user = await requireApiUser();

  if (user.role !== requiredRole) {
    throw new ApiError(403, requiredRole === Role.ADMIN ? "Admin access required." : "Forbidden.");
  }

  return user;
}
