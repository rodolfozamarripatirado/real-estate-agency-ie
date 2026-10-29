"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

export type LoginState = { error: string } | null;

export async function loginAction(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const lang = await getLang();
  const t = getDictionary(lang);

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 200);
  const password = String(formData.get("password") ?? "").slice(0, 200);

  if (!email || !password) {
    return { error: t.auth.invalid };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: t.auth.invalid };
  }

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  redirect("/admin");
}
