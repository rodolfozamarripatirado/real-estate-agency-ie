"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getI18n } from "@/lib/i18n-server";

export type EnquiryState = { ok: boolean; error?: string } | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function createEnquiry(
  _previous: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const { lang, t } = await getI18n();

  // Honeypot — bots fill this hidden field, humans never see it.
  if (String(formData.get("website") ?? "").trim()) {
    return { ok: true };
  }

  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const phone = String(formData.get("phone") ?? "").trim().slice(0, 60);
  const rawMessage = String(formData.get("message") ?? "").trim().slice(0, 3000);
  const rawPropertyId = String(formData.get("propertyId") ?? "").trim();

  if (!name || !EMAIL_RE.test(email)) {
    return { ok: false, error: t.admin.errors.invalidEmail };
  }

  let propertyId: string | null = rawPropertyId || null;
  if (propertyId) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });
    propertyId = property?.id ?? null;
  }

  const message =
    rawMessage ||
    (lang === "es" ? "Solicitud de información" : "Request for further information");

  try {
    await prisma.enquiry.create({
      data: {
        propertyId,
        name,
        email,
        phone,
        message,
        locale: lang,
      },
    });
  } catch {
    return { ok: false, error: t.common.error };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/enquiries");

  return { ok: true };
}
