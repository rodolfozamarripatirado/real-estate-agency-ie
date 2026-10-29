import Image from "next/image";
import Link from "next/link";
import type { ListingType, PropertyStatus, PropertyType } from "@prisma/client";
import { formatPrice, localisedValue } from "@/lib/format";
import type { Dictionary, Locale } from "@/lib/i18n";
import { Bed, Bath, Pin, Ruler, ArrowUpRight } from "./icons";

export type PropertyCardData = {
  id: string;
  slug: string;
  titleEn: string;
  titleEs: string;
  town: string;
  county: string;
  price: number;
  listingType: ListingType;
  propertyType: PropertyType;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  floorArea: number;
  berRating: string;
  images: { url: string; altEn: string; altEs: string; isCover: boolean }[];
};

function StatusNote({
  status,
  t,
}: {
  status: PropertyStatus;
  t: Dictionary;
}) {
  if (status === "SALE_AGREED")
    return (
      <span className="rounded-full bg-gold/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-pine-deep">
        {t.status.SALE_AGREED}
      </span>
    );
  if (status === "SOLD")
    return (
      <span className="rounded-full bg-ink/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cream">
        {t.status.SOLD}
      </span>
    );
  if (status === "LET_AGREED")
    return (
      <span className="rounded-full bg-gold/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-pine-deep">
        {t.status.LET_AGREED}
      </span>
    );
  return null;
}

export function PropertyCard({
  property,
  lang,
  t,
  priority = false,
}: {
  property: PropertyCardData;
  lang: Locale;
  t: Dictionary;
  priority?: boolean;
}) {
  const cover =
    property.images.find((image) => image.isCover) ?? property.images[0];
  const title = localisedValue(property.titleEn, property.titleEs, lang);
  const alt = cover ? localisedValue(cover.altEn, cover.altEs, lang) : title;

  return (
    <article className="group">
      <Link href={`/properties/${property.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sage">
          {cover ? (
            <Image
              src={cover.url}
              alt={alt || title}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted">
              {title}
            </div>
          )}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3.5">
            <div className="flex flex-col items-start gap-2">
              <span className="rounded-full bg-cream/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-pine">
                {property.listingType === "SALE"
                  ? t.common.forSale
                  : t.common.forRent}
              </span>
              <StatusNote status={property.status} t={t} />
            </div>
            {property.berRating ? (
              <span className="rounded-md bg-cream/95 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-pine">
                BER {property.berRating}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-[22px] leading-tight text-ink">
              {formatPrice(property.price, lang, property.listingType)}
            </p>
            <h3 className="mt-1.5 text-[15px] font-semibold leading-snug text-ink/90 transition group-hover:text-pine">
              {title}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
              <Pin className="text-[13px]" />
              {property.town}, Co. {property.county}
            </p>
          </div>
          <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full border border-line text-pine transition group-hover:border-pine group-hover:bg-pine group-hover:text-cream">
            <ArrowUpRight className="text-sm" />
          </span>
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line/80 pt-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Bed className="text-sm" />
            {property.bedrooms} {t.common.beds}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Bath className="text-sm" />
            {property.bathrooms} {t.common.baths}
          </span>
          {property.floorArea > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <Ruler className="text-sm" />
              {property.floorArea} {t.common.sqm}
            </span>
          ) : null}
          <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.12em] text-muted/70">
            {t.type[property.propertyType]}
          </span>
        </div>
      </Link>
    </article>
  );
}
