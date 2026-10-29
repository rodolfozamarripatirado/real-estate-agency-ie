"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EnquiryStatus, Prisma } from "@prisma/client";
import { prisma, COUNTIES, PROPERTY_TYPES, BER_RATINGS } from "@/lib/db";
import { destroySession, getAdminUser, getSession } from "@/lib/auth";
import { getI18n } from "@/lib/i18n-server";

export type ActionState = { ok?: boolean; error?: string; message?: string } | null;

const str = (formData: FormData, key: string, max = 600) =>
  String(formData.get(key) ?? "").trim().slice(0, max);

const int = (formData: FormData, key: string) => {
  const value = Number.parseInt(str(formData, key, 20).replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(value) ? value : 0;
};

const intOrNull = (formData: FormData, key: string) => {
  const raw = str(formData, key, 20);
  if (!raw) return null;
  const value = Number.parseInt(raw.replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(value) ? value : null;
};

const floatOrNull = (formData: FormData, key: string) => {
  const raw = str(formData, key, 20);
  if (!raw) return null;
  const value = Number.parseFloat(raw.replace(",", "."));
  return Number.isFinite(value) ? value : null;
};

const dateOrNull = (formData: FormData, key: string) => {
  const raw = str(formData, key, 20);
  if (!raw) return null;
  const date = new Date(`${raw}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const lines = (formData: FormData, key: string) =>
  str(formData, key, 4000)
    .split(/\r?\n|,/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 40);

const isUrl = (value: string) =>
  /^https?:\/\/[^\s]+$/i.test(value) || /^\/[^\s]*$/.test(value);

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

type ImageInput = { url: string; altEn: string; altEs: string; isCover: boolean };
type TourInput = { type: "PANORAMA" | "MATTERPORT" | "VIDEO"; titleEn: string; titleEs: string; url: string };

function parseImages(formData: FormData): ImageInput[] {
  try {
    const raw = JSON.parse(str(formData, "imagesJson", 30000) || "[]");
    if (!Array.isArray(raw)) return [];
    const seen = new Set<string>();
    const images = raw
      .map((item) => ({
        url: String(item?.url ?? "").trim().slice(0, 2000),
        altEn: String(item?.altEn ?? "").trim().slice(0, 200),
        altEs: String(item?.altEs ?? "").trim().slice(0, 200),
        isCover: Boolean(item?.isCover),
      }))
      .filter((image) => isUrl(image.url) && !seen.has(image.url) && seen.add(image.url))
      .slice(0, 20);

    let coverFound = false;
    return images.map((image) => {
      if (!image.isCover) return image;
      if (coverFound) return { ...image, isCover: false };
      coverFound = true;
      return image;
    });
  } catch {
    return [];
  }
}

function parseTours(formData: FormData): TourInput[] {
  try {
    const raw = JSON.parse(str(formData, "toursJson", 30000) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) => ({
        type: (["PANORAMA", "MATTERPORT", "VIDEO"] as const).includes(item?.type)
          ? (item.type as TourInput["type"])
          : "PANORAMA",
        titleEn: String(item?.titleEn ?? "").trim().slice(0, 200),
        titleEs: String(item?.titleEs ?? "").trim().slice(0, 200),
        url: String(item?.url ?? "").trim().slice(0, 2000),
      }))
      .filter((tour) => isUrl(tour.url))
      .slice(0, 10);
  } catch {
    return [];
  }
}

function revalidateProperty(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/properties");
  if (slug) revalidatePath(`/properties/${slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/properties");
}

export async function saveProperty(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Please sign in again." };

  const { t } = await getI18n();

  const id = str(formData, "id", 40);
  const reference = str(formData, "reference", 40).toUpperCase();
  const titleEn = str(formData, "titleEn", 200);
  const addressLine = str(formData, "addressLine", 300);
  const town = str(formData, "town", 120);
  const countyInput = str(formData, "county", 60);
  const price = int(formData, "price");
  const listingType = str(formData, "listingType", 10) === "RENT" ? "RENT" : "SALE";
  const propertyType = (PROPERTY_TYPES as readonly string[]).includes(
    str(formData, "propertyType", 20),
  )
    ? (str(formData, "propertyType", 20) as (typeof PROPERTY_TYPES)[number])
    : "HOUSE";

  if (!reference || !titleEn || !addressLine || !town || !countyInput) {
    return { error: t.admin.errors.required };
  }
  if (!(COUNTIES as readonly string[]).includes(countyInput)) {
    return { error: t.admin.errors.required };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { error: t.admin.errors.invalidPrice };
  }

  const existing = id
    ? await prisma.property.findUnique({ where: { id }, select: { id: true, publishedAt: true } })
    : null;
  if (id && !existing) return { error: t.admin.errors.saveFailed };

  const duplicate = await prisma.property.findFirst({
    where: { reference, ...(id ? { id: { not: id } } : {}) },
    select: { id: true },
  });
  if (duplicate) return { error: t.admin.errors.duplicateReference };

  const baseSlug = slugify(str(formData, "slug", 120) || titleEn) || slugify(reference);
  let slug = baseSlug;
  let attempt = 1;
  while (
    await prisma.property.findFirst({
      where: { slug, ...(id ? { id: { not: id } } : {}) },
      select: { id: true },
    })
  ) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const statusInput = str(formData, "status", 20);
  const status = (["DRAFT", "PUBLISHED", "SALE_AGREED", "SOLD", "LET_AGREED"] as const).includes(
    statusInput as "DRAFT",
  )
    ? (statusInput as "DRAFT" | "PUBLISHED" | "SALE_AGREED" | "SOLD" | "LET_AGREED")
    : "DRAFT";

  const berInput = str(formData, "berRating", 4).toUpperCase();
  const berRating = (BER_RATINGS as readonly string[]).includes(berInput) ? berInput : "";
  const yearBuilt = intOrNull(formData, "yearBuilt");

  const images = parseImages(formData);
  if (images.length > 0 && !images.some((image) => image.isCover)) {
    images[0].isCover = true;
  }
  const tours = parseTours(formData);

  const data = {
    reference,
    slug,
    status,
    listingType,
    propertyType,
    titleEn,
    titleEs: str(formData, "titleEs", 200),
    summaryEn: str(formData, "summaryEn", 400),
    summaryEs: str(formData, "summaryEs", 400),
    descriptionEn: str(formData, "descriptionEn", 8000),
    descriptionEs: str(formData, "descriptionEs", 8000),
    addressLine,
    town,
    county: countyInput,
    eircode: str(formData, "eircode", 20).toUpperCase(),
    price,
    bedrooms: Math.max(0, int(formData, "bedrooms")),
    bathrooms: Math.max(0, int(formData, "bathrooms")),
    floorArea: Math.max(0, int(formData, "floorArea")),
    berRating,
    berNumber: str(formData, "berNumber", 40),
    yearBuilt:
      yearBuilt && yearBuilt >= 1700 && yearBuilt <= new Date().getFullYear() + 5
        ? yearBuilt
        : null,
    heating: str(formData, "heating", 120),
    furnished: formData.get("furnished") === "on",
    featuresEn: lines(formData, "featuresEn"),
    featuresEs: lines(formData, "featuresEs"),
    featured: formData.get("featured") === "on",
    publishedAt:
      status === "DRAFT" ? null : existing?.publishedAt ?? new Date(),
    images: {
      deleteMany: {},
      create: images.map((image, index) => ({
        url: image.url,
        altEn: image.altEn,
        altEs: image.altEs,
        sortOrder: index,
        isCover: image.isCover,
      })),
    },
    tours: {
      deleteMany: {},
      create: tours.map((tour, index) => ({
        type: tour.type,
        titleEn: tour.titleEn,
        titleEs: tour.titleEs,
        url: tour.url,
        sortOrder: index,
      })),
    },
    private: {
      upsert: {
        create: {
          vendorName: str(formData, "vendorName", 200),
          vendorPhone: str(formData, "vendorPhone", 60),
          vendorEmail: str(formData, "vendorEmail", 200),
          guidePrice: intOrNull(formData, "guidePrice"),
          commissionRate: floatOrNull(formData, "commissionRate"),
          exclusiveUntil: dateOrNull(formData, "exclusiveUntil"),
          keysLocation: str(formData, "keysLocation", 300),
          alarmCode: str(formData, "alarmCode", 60),
          accessNotes: str(formData, "accessNotes", 1000),
          solicitor: str(formData, "solicitor", 300),
          legalStatus: str(formData, "legalStatus", 200),
          internalNotes: str(formData, "internalNotes", 4000),
        },
        update: {
          vendorName: str(formData, "vendorName", 200),
          vendorPhone: str(formData, "vendorPhone", 60),
          vendorEmail: str(formData, "vendorEmail", 200),
          guidePrice: intOrNull(formData, "guidePrice"),
          commissionRate: floatOrNull(formData, "commissionRate"),
          exclusiveUntil: dateOrNull(formData, "exclusiveUntil"),
          keysLocation: str(formData, "keysLocation", 300),
          alarmCode: str(formData, "alarmCode", 60),
          accessNotes: str(formData, "accessNotes", 1000),
          solicitor: str(formData, "solicitor", 300),
          legalStatus: str(formData, "legalStatus", 200),
          internalNotes: str(formData, "internalNotes", 4000),
        },
      },
    },
  } satisfies Prisma.PropertyUpdateInput;

  try {
    if (id && existing) {
      await prisma.property.update({ where: { id }, data });
    } else {
      const { private: privateData, images: imageData, tours: tourData, ...scalars } = data;
      await prisma.property.create({
        data: {
          ...scalars,
          images: { create: imageData.create },
          tours: { create: tourData.create },
          private: { create: privateData.upsert.create },
        },
      });
    }
  } catch {
    return { error: t.admin.errors.saveFailed };
  }

  revalidateProperty(slug);
  redirect("/admin/properties?saved=1");
}

export async function togglePublished(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const id = str(formData, "id", 40);
  const property = await prisma.property.findUnique({
    where: { id },
    select: { id: true, slug: true, status: true, publishedAt: true },
  });
  if (!property) return;

  const isPublic = property.publishedAt !== null;
  await prisma.property.update({
    where: { id },
    data: isPublic
      ? { publishedAt: null }
      : {
          publishedAt: new Date(),
          status: property.status === "DRAFT" ? "PUBLISHED" : property.status,
        },
  });

  revalidateProperty(property.slug);
}

export async function deleteProperty(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const id = str(formData, "id", 40);
  const property = await prisma.property.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });
  if (!property) return;

  await prisma.property.delete({ where: { id } });
  revalidateProperty(property.slug);
  redirect("/admin/properties");
}

export async function updateEnquiry(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Please sign in again." };

  const { t } = await getI18n();
  const id = str(formData, "id", 40);
  const statusInput = str(formData, "status", 20);
  const status = (["NEW", "CONTACTED", "CLOSED"] as const).includes(
    statusInput as EnquiryStatus,
  )
    ? (statusInput as EnquiryStatus)
    : "NEW";
  const internalNote = str(formData, "internalNote", 3000);

  try {
    await prisma.enquiry.update({
      where: { id },
      data: { status, internalNote },
    });
  } catch {
    return { error: t.admin.errors.saveFailed };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/enquiries");
  return { ok: true, message: t.admin.enquirySaved };
}

export async function saveSettings(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Your session has expired. Please sign in again." };

  const { t } = await getI18n();
  const name = str(formData, "name", 160);
  if (!name) return { error: t.admin.errors.required };

  const data = {
    name,
    taglineEn: str(formData, "taglineEn", 300),
    taglineEs: str(formData, "taglineEs", 300),
    aboutEn: str(formData, "aboutEn", 2000),
    aboutEs: str(formData, "aboutEs", 2000),
    phone: str(formData, "phone", 60),
    email: str(formData, "email", 200),
    address: str(formData, "address", 300),
    psra: str(formData, "psra", 40),
    openingHours: str(formData, "openingHours", 200),
    heroImageUrl: isUrl(str(formData, "heroImageUrl", 2000))
      ? str(formData, "heroImageUrl", 2000)
      : "",
  };

  try {
    await prisma.companySettings.upsert({
      where: { id: 1 },
      create: { id: 1, ...data },
      update: data,
    });
  } catch {
    return { error: t.admin.errors.saveFailed };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { ok: true, message: t.admin.settingsSaved };
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
