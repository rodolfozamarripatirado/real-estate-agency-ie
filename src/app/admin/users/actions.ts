"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getAdminUser, hashPassword } from "@/lib/auth";
import { getI18n } from "@/lib/i18n-server";

export type UserActionState =
  | { ok?: boolean; error?: string; message?: string }
  | null;

const MIN_PASSWORD = 8;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const str = (formData: FormData, key: string, max = 200) =>
  String(formData.get(key) ?? "").trim().slice(0, max);

function readRole(value: string): Role | null {
  return value === "ADMIN" || value === "AGENT" ? value : null;
}

export async function createUser(
  _previous: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const admin = await getAdminUser();
  const { t } = await getI18n();
  if (!admin) return { error: t.admin.users.forbidden };

  const name = str(formData, "name", 120);
  const email = str(formData, "email", 200).toLowerCase();
  const password = String(formData.get("password") ?? "").slice(0, 200);
  const role = readRole(str(formData, "role", 10)) ?? "AGENT";

  if (!name) return { error: t.admin.errors.required };
  if (!EMAIL.test(email)) return { error: t.admin.users.invalidEmail };
  if (password.length < MIN_PASSWORD) {
    return { error: t.admin.users.emptyPassword };
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) return { error: t.admin.users.emailTaken };

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        role,
        passwordHash: await hashPassword(password),
      },
    });
  } catch {
    return { error: t.admin.errors.saveFailed };
  }

  revalidatePath("/admin/users");
  return { ok: true, message: t.admin.users.created };
}

export async function updateUser(
  _previous: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const admin = await getAdminUser();
  const { t } = await getI18n();
  if (!admin) return { error: t.admin.users.forbidden };

  const id = str(formData, "id", 40);
  const name = str(formData, "name", 120);
  const email = str(formData, "email", 200).toLowerCase();
  const role = readRole(str(formData, "role", 10));
  const password = String(formData.get("password") ?? "").slice(0, 200);

  if (!name) return { error: t.admin.errors.required };
  if (!EMAIL.test(email)) return { error: t.admin.users.invalidEmail };
  if (!role) return { error: t.admin.errors.required };
  if (password && password.length < MIN_PASSWORD) {
    return { error: t.admin.users.emptyPassword };
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });
  if (!target) return { error: t.admin.users.notFound };

  if (target.id === admin.sub && role !== target.role) {
    return { error: t.admin.users.cannotChangeOwnRole };
  }

  if (target.role === "ADMIN" && role !== "ADMIN") {
    const admins = await prisma.user.count({ where: { role: "ADMIN" } });
    if (admins <= 1) return { error: t.admin.users.lastAdmin };
  }

  const duplicate = await prisma.user.findFirst({
    where: { email, id: { not: id } },
    select: { id: true },
  });
  if (duplicate) return { error: t.admin.users.emailTaken };

  try {
    await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
      },
    });
  } catch {
    return { error: t.admin.errors.saveFailed };
  }

  revalidatePath("/admin/users");
  return { ok: true, message: t.admin.users.saved };
}

export async function deleteUser(formData: FormData) {
  const id = str(formData, "id", 40);
  const admin = await getAdminUser();
  if (!admin) redirect("/login");

  if (id === admin.sub) redirect("/admin/users?status=self");

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });
  if (!target) redirect("/admin/users?status=notFound");

  if (target.role === "ADMIN") {
    const admins = await prisma.user.count({ where: { role: "ADMIN" } });
    if (admins <= 1) redirect("/admin/users?status=lastAdmin");
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
  redirect("/admin/users?status=deleted");
}
