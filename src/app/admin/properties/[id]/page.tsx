import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getI18n } from "@/lib/i18n-server";
import { formatDateInput, localisedValue } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { ArrowRight, Eye, Lock, Trash } from "@/components/icons";
import { PropertyForm } from "../../property-form";
import type { PropertyFormValues } from "../../property-form-types";
import { ConfirmButton } from "../../confirm-button";
import { deleteProperty } from "../../actions";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { lang, t } = await getI18n();

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      tours: { orderBy: { sortOrder: "asc" } },
      private: true,
    },
  });

  if (!property) notFound();

  const values: PropertyFormValues = {
    id: property.id,
    reference: property.reference,
    slug: property.slug,
    status: property.status,
    listingType: property.listingType,
    propertyType: property.propertyType,
    titleEn: property.titleEn,
    titleEs: property.titleEs,
    summaryEn: property.summaryEn,
    summaryEs: property.summaryEs,
    descriptionEn: property.descriptionEn,
    descriptionEs: property.descriptionEs,
    addressLine: property.addressLine,
    town: property.town,
    county: property.county,
    eircode: property.eircode,
    price: property.price,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    floorArea: property.floorArea,
    berRating: property.berRating,
    berNumber: property.berNumber,
    yearBuilt: property.yearBuilt,
    heating: property.heating,
    furnished: property.furnished,
    featuresEn: property.featuresEn,
    featuresEs: property.featuresEs,
    featured: property.featured,
    images: property.images.map((image) => ({
      url: image.url,
      altEn: image.altEn,
      altEs: image.altEs,
      isCover: image.isCover,
    })),
    tours: property.tours.map((tour) => ({
      type: tour.type,
      titleEn: tour.titleEn,
      titleEs: tour.titleEs,
      url: tour.url,
    })),
    private: property.private
      ? {
          vendorName: property.private.vendorName,
          vendorPhone: property.private.vendorPhone,
          vendorEmail: property.private.vendorEmail,
          guidePrice: property.private.guidePrice,
          commissionRate: property.private.commissionRate,
          exclusiveUntil: formatDateInput(property.private.exclusiveUntil),
          keysLocation: property.private.keysLocation,
          alarmCode: property.private.alarmCode,
          accessNotes: property.private.accessNotes,
          solicitor: property.private.solicitor,
          legalStatus: property.private.legalStatus,
          internalNotes: property.private.internalNotes,
        }
      : null,
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/properties"
        className="inline-flex items-center gap-2 text-[11px] font-medium text-muted transition hover:text-pine"
      >
        <ArrowRight className="rotate-180 text-sm" />
        {t.admin.backToProperties}
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">{t.admin.editProperty}</p>
          <h1 className="mt-1 truncate font-display text-3xl text-ink">
            {localisedValue(property.titleEn, property.titleEs, lang)}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <StatusBadge status={property.status} t={t} />
            <span className="text-[11px] text-muted">
              {property.reference} · Co. {property.county}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-gold">
              <Lock className="text-xs" />
              {t.admin.privateTab}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {property.publishedAt ? (
            <Link
              href={`/properties/${property.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/60 px-3.5 py-2 text-[11px] font-medium text-muted transition hover:text-pine"
            >
              <Eye className="text-sm" />
              {t.common.view}
            </Link>
          ) : null}
          <form action={deleteProperty}>
            <input type="hidden" name="id" value={property.id} />
            <ConfirmButton
              message={t.admin.deleteConfirm}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#a61b1b]/25 px-3.5 py-2 text-[11px] font-medium text-[#a61b1b] transition hover:bg-[#a61b1b]/5"
            >
              <Trash className="text-sm" />
              {t.common.delete}
            </ConfirmButton>
          </form>
        </div>
      </div>

      <PropertyForm values={values} />
    </div>
  );
}
