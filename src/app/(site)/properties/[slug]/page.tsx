import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma, BER_RATINGS } from "@/lib/db";
import { getCompany } from "@/lib/company";
import { getI18n } from "@/lib/i18n-server";
import {
  berClass,
  formatNumber,
  formatPrice,
  localisedValue,
  propertyDescription,
  propertyTitle,
} from "@/lib/format";
import { PropertyCard } from "@/components/property-card";
import { PropertyGallery } from "@/components/property-gallery";
import { EnquiryForm } from "@/components/enquiry-form";
import { TourSection } from "@/components/tour-section";
import {
  ArrowRight,
  Bath,
  Bed,
  Check,
  Compass,
  House,
  Mail,
  Phone,
  Pin,
  Ruler,
  Shield,
} from "@/components/icons";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await prisma.property.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  if (!property || !property.publishedAt) {
    return { title: "Property not found" };
  }

  const title = propertyTitle(property, "en");
  const description =
    property.summaryEn || property.descriptionEn.slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: property.images[0]?.url ? [property.images[0].url] : undefined,
    },
  };
}

export default async function PropertyPage({ params }: PageProps) {
  const { slug } = await params;
  const { lang, t } = await getI18n();
  const company = await getCompany();

  const property = await prisma.property.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      tours: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!property || !property.publishedAt) notFound();

  const title = propertyTitle(property, lang);
  const summary = localisedValue(property.summaryEn, property.summaryEs, lang);
  const description = propertyDescription(property, lang);
  const features = lang === "es" && property.featuresEs.length > 0
    ? property.featuresEs
    : property.featuresEn;

  const similar = await prisma.property.findMany({
    where: {
      publishedAt: { not: null },
      county: property.county,
      id: { not: property.id },
    },
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: 3,
  });

  const statusNote =
    property.status === "SALE_AGREED"
      ? t.property.saleAgreedNote
      : property.status === "SOLD"
        ? t.property.soldNote
        : property.status === "LET_AGREED"
          ? t.property.letAgreedNote
          : null;

  const address = `${property.addressLine}, ${property.town}, Co. ${property.county}${
    property.eircode ? `, ${property.eircode}` : ""
  }`;

  return (
    <>
      <div className="border-b border-line/80 bg-parchment/40">
        <div className="wrap py-7 sm:py-9">
          <nav className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
            <Link href="/properties" className="hover:text-pine">
              {t.nav.properties}
            </Link>
            <span className="text-line">/</span>
            <Link
              href={`/properties?county=${encodeURIComponent(property.county)}`}
              className="hover:text-pine"
            >
              Co. {property.county}
            </Link>
            <span className="text-line">/</span>
            <span className="truncate text-ink/60">{title}</span>
          </nav>

          <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-pine px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cream">
                  {property.listingType === "SALE"
                    ? t.common.forSale
                    : t.common.forRent}
                </span>
                <span className="rounded-full border border-line bg-cream px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {t.type[property.propertyType]}
                </span>
                {property.featured ? (
                  <span className="rounded-full bg-gold/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">
                    {t.common.featured}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-3 max-w-3xl font-display text-3xl leading-[1.1] text-ink sm:text-4xl lg:text-[2.75rem]">
                {title}
              </h1>
              <p className="mt-3 flex items-start gap-2 text-sm text-muted">
                <Pin className="mt-0.5 shrink-0 text-base text-gold" />
                {address}
              </p>
            </div>

            <div className="shrink-0 md:text-right">
              <p className="font-display text-3xl text-pine sm:text-4xl">
                {formatPrice(property.price, lang, property.listingType)}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted">
                {t.property.reference} {property.reference}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap py-8 sm:py-10">
        <PropertyGallery
          images={property.images}
          hint={t.property.galleryHint}
        />

        {statusNote ? (
          <p className="mt-5 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-pine">
            {statusNote}
          </p>
        ) : null}

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-14">
          <div className="min-w-0 space-y-10">
            {/* Key facts */}
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line/80 bg-line/70 sm:grid-cols-4">
              {[
                { icon: Bed, value: property.bedrooms, label: t.common.beds },
                { icon: Bath, value: property.bathrooms, label: t.common.baths },
                {
                  icon: Ruler,
                  value: property.floorArea ? `${property.floorArea}` : "—",
                  label: `${t.property.floorArea} (${t.common.sqm})`,
                },
                {
                  icon: House,
                  value: t.type[property.propertyType],
                  label: t.listing.type,
                },
              ].map((fact) => (
                <div key={fact.label} className="bg-cream px-4 py-5 text-center">
                  <fact.icon className="mx-auto text-xl text-gold" />
                  <p className="mt-2 font-display text-lg text-ink">{fact.value}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-muted">
                    {fact.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Description */}
            <section>
              <h2 className="font-display text-2xl text-ink">
                {t.property.description}
              </h2>
              {summary ? (
                <p className="mt-4 border-l-2 border-gold/60 pl-4 font-display text-xl leading-relaxed text-ink/85">
                  {summary}
                </p>
              ) : null}
              <div className="mt-5 whitespace-pre-line text-sm leading-[1.85] text-muted">
                {description}
              </div>
            </section>

            {/* Features */}
            {features.length > 0 ? (
              <section>
                <h2 className="font-display text-2xl text-ink">
                  {t.property.features}
                </h2>
                <ul className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                  {features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-muted"
                    >
                      <Check className="mt-0.5 shrink-0 text-base text-pine" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* BER + details */}
            <section className="grid gap-6 md:grid-cols-2">
              {property.berRating ? (
                <div className="rounded-2xl border border-line/80 bg-white/60 p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl text-ink">
                      {t.property.energy}
                    </h2>
                    <span
                      className={`rounded-md px-3 py-1.5 text-sm font-bold uppercase tracking-wide ${berClass(property.berRating)}`}
                    >
                      {property.berRating}
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-8 gap-1">
                    {BER_RATINGS.map((rating) => (
                      <div
                        key={rating}
                        className={`rounded-sm py-1.5 text-center text-[8px] font-bold ${
                          rating === property.berRating
                            ? `${berClass(rating)} ring-2 ring-ink/40 ring-offset-1`
                            : "bg-sage/70 text-muted/60"
                        }`}
                      >
                        {rating}
                      </div>
                    ))}
                  </div>
                  {property.berNumber ? (
                    <p className="mt-4 text-[11px] text-muted">
                      {t.property.berNumber}: {property.berNumber}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="rounded-2xl border border-line/80 bg-white/60 p-6">
                <h2 className="font-display text-xl text-ink">
                  {t.property.details}
                </h2>
                <dl className="mt-4 space-y-2.5 text-sm">
                  {[
                    { label: t.listing.type, value: t.type[property.propertyType] },
                    {
                      label: t.property.floorArea,
                      value: property.floorArea
                        ? `${formatNumber(property.floorArea, lang)} ${t.common.sqm}`
                        : "—",
                    },
                    {
                      label: t.property.yearBuilt,
                      value: property.yearBuilt ? String(property.yearBuilt) : "—",
                    },
                    {
                      label: t.property.heating,
                      value: property.heating || "—",
                    },
                    {
                      label: t.property.furnished,
                      value: property.furnished ? t.common.yes : t.common.no,
                    },
                    {
                      label: t.property.berNumber,
                      value: property.berNumber || "—",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-baseline justify-between gap-4 border-b border-line/60 pb-2 last:border-0 last:pb-0"
                    >
                      <dt className="text-xs text-muted">{row.label}</dt>
                      <dd className="text-right font-medium text-ink/85">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            {/* Tours */}
            <TourSection tours={property.tours} />

            {/* Location */}
            <section>
              <h2 className="flex items-center gap-2 font-display text-2xl text-ink">
                <Compass className="text-gold" />
                {t.property.address}
              </h2>
              <div className="relative mt-4 h-64 overflow-hidden rounded-2xl border border-line/80 bg-sage">
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    `${property.addressLine}, ${property.town}, Co. ${property.county}, Ireland`,
                  )}&z=14&output=embed`}
                  title={`${title} map`}
                  className="absolute inset-0 h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside>
            <div className="rounded-2xl border border-line/80 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(10,42,30,0.35)] lg:sticky lg:top-28">
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                <Shield className="text-sm" />
                {company.name}
              </p>
              <h2 className="mt-2 font-display text-2xl leading-tight text-ink">
                {t.property.enquiryTitle}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {t.property.enquiryIntro}
              </p>

              <div className="mt-5">
                <EnquiryForm propertyId={property.id} compact />
              </div>

              <div className="mt-6 space-y-3 border-t border-line/80 pt-5 text-sm">
                <a
                  href={`tel:${company.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 text-ink/80 transition hover:text-pine"
                >
                  <span className="grid size-9 place-items-center rounded-full bg-pine/5 text-pine">
                    <Phone className="text-base" />
                  </span>
                  {company.phone}
                </a>
                <a
                  href={`mailto:${company.email}`}
                  className="flex items-center gap-3 text-ink/80 transition hover:text-pine"
                >
                  <span className="grid size-9 place-items-center rounded-full bg-pine/5 text-pine">
                    <Mail className="text-base" />
                  </span>
                  {company.email}
                </a>
              </div>

              <p className="mt-4 text-[10px] leading-relaxed text-muted/70">
                PSRA {company.psra} · {company.openingHours}
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-line/80 pt-6">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-pine"
          >
            <ArrowRight className="rotate-180 text-sm" />
            {t.property.backToProperties}
          </Link>
          <p className="text-[11px] text-muted">
            {t.property.reference} {property.reference}
          </p>
        </div>
      </div>

      {similar.length > 0 ? (
        <section className="border-t border-line/80 bg-parchment/40">
          <div className="wrap py-16">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">{t.nav.properties}</p>
                <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
                  {t.property.similar}
                </h2>
              </div>
              <Link
                href={`/properties?county=${encodeURIComponent(property.county)}`}
                className="inline-flex items-center gap-2 text-xs font-semibold text-pine"
              >
                {t.common.viewAll}
                <ArrowRight className="text-sm" />
              </Link>
            </div>
            <div className="mt-8 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((item) => (
                <PropertyCard
                  key={item.id}
                  property={item}
                  lang={lang}
                  t={t}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
