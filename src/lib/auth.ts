import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const COOKIE_NAME = "ho_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secretKey() {
  const secret =
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "production"
      ? ""
      : "dev-only-insecure-secret-change-me");

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

export type SessionUser = {
  sub: string;
  name: string;
  email: string;
  role: "ADMIN" | "AGENT";
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "AGENT";
}) {
  const token = await new SignJWT({
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
    });
    if (!payload.sub || typeof payload.email !== "string") return null;

    return {
      sub: payload.sub,
      name: typeof payload.name === "string" ? payload.name : "Staff",
      email: payload.email,
      role: payload.role === "ADMIN" ? "ADMIN" : "AGENT",
    };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** The session owner as currently stored in the database, or null. */
export async function getStaffUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) return null;

  return {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

/** Confirm the session still belongs to an active staff account. */
export async function requireActiveUser(): Promise<SessionUser> {
  const user = await getStaffUser();
  if (!user) redirect("/login");
  return user;
}

/** Administrator-only pages; signed-in agents are sent back to the dashboard. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireActiveUser();
  if (user.role !== "ADMIN") redirect("/admin");
  return user;
}

/** Administrator check for server actions (no redirect), using the DB role. */
export async function getAdminUser(): Promise<SessionUser | null> {
  const user = await getStaffUser();
  return user?.role === "ADMIN" ? user : null;
}
