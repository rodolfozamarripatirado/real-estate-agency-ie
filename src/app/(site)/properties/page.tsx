import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma, COUNTIES, PROPERTY_TYPES } from "@/lib/db";
import { getI18n } from "@/lib/i18n-server";
import { formatNumber } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n";
import { PropertyCard } from "@/components/property-card";
import { ArrowRight, Search, Sliders, X } from "@/components/icons";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.meta.propertiesTitle,
    description: t.meta.propertiesDescription,
  };
}

type Filters = {
  q: string;
  county: string;
  type: string;
  listing: string;
  min: string;
  max: string;
  beds: string;
  sort: string;
};

function readFilters(params: Record<string, string | string[] | undefined>): Filters {
  const read = (key: string) => {
    const value = params[key];
    return typeof value === "string" ? value.trim() : "";
  };

  const county = read("county");
  const type = read("type");
  const listing = read("listing");
  const sort = read("sort");

  return {
    q: read("q").slice(0, 120),
    county: (COUNTIES as readonly string[]).includes(county) ? county : "",
    type: (PROPERTY_TYPES as readonly string[]).includes(type) ? type : "",
    listing: listing === "SALE" || listing === "RENT" ? listing : "",
    min: read("min").replace(/[^\d]/g, "").slice(0, 9),
    max: read("max").replace(/[^\d]/g, "").slice(0, 9),
    beds: ["1", "2", "3", "4", "5"].includes(read("beds")) ? read("beds") : "",
    sort: ["newest", "price-asc", "price-desc"].includes(sort) ? sort : "newest",
  };
}

function FilterForm({
  filters,
  t,
  compact = false,
}: {
  filters: Filters;
  t: Dictionary;
  compact?: boolean;
}) {
  return (
    <form action="/properties" className="space-y-4">
      <div>
        <label htmlFor={compact ? "q-mobile" : "q"} className="label">
          {t.listing.keyword}
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-muted/60" />
          <input
            id={compact ? "q-mobile" : "q"}
            name="q"
            defaultValue={filters.q}
            placeholder={t.listing.keywordPlaceholder}
            className="field pl-9"
          />
        </div>
      </div>

      <div>
        <label htmlFor={compact ? "listing-mobile" : "listing"} className="label">
          {t.listing.listing}
        </label>
        <select
          id={compact ? "listing-mobile" : "listing"}
          name="listing"
          defaultValue={filters.listing}
          className="field"
        >
          <option value="">{t.listing.allListings}</option>
          <option value="SALE">{t.common.forSale}</option>
          <option value="RENT">{t.common.forRent}</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={compact ? "county-mobile" : "county"} className="label">
            {t.listing.county}
          </label>
          <select
            id={compact ? "county-mobile" : "county"}
            name="county"
            defaultValue={filters.county}
            className="field"
          >
            <option value="">{t.listing.allCounties}</option>
            {COUNTIES.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={compact ? "type-mobile" : "type"} className="label">
            {t.listing.type}
          </label>
          <select
            id={compact ? "type-mobile" : "type"}
            name="type"
            defaultValue={filters.type}
            className="field"
          >
            <option value="">{t.listing.allTypes}</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {t.type[type]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={compact ? "min-mobile" : "min"} className="label">
            {t.listing.minPrice}
          </label>
          <input
            id={compact ? "min-mobile" : "min"}
            name="min"
            inputMode="numeric"
            defaultValue={filters.min}
            placeholder="0"
            className="field"
          />
        </div>
        <div>
          <label htmlFor={compact ? "max-mobile" : "max"} className="label">
            {t.listing.maxPrice}
          </label>
          <input
            id={compact ? "max-mobile" : "max"}
            name="max"
            inputMode="numeric"
            defaultValue={filters.max}
            placeholder="1,000,000"
            className="field"
          />
        </div>
      </div>

      <div>
        <label htmlFor={compact ? "beds-mobile" : "beds"} className="label">
          {t.listing.bedrooms}
        </label>
        <select
          id={compact ? "beds-mobile" : "beds"}
          name="beds"
          defaultValue={filters.beds}
          className="field"
        >
          <option value="">{t.listing.anyBeds}</option>
          {["1", "2", "3", "4", "5"].map((value) => (
            <option key={value} value={value}>
              {value}+
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={compact ? "sort-mobile" : "sort"} className="label">
          {t.common.sort}
        </label>
        <select
          id={compact ? "sort-mobile" : "sort"}
          name="sort"
          defaultValue={filters.sort}
          className="field"
        >
          <option value="newest">{t.common.newest}</option>
          <option value="price-asc">{t.common.priceAsc}</option>
          <option value="price-desc">{t.common.priceHigh}</option>
        </select>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button type="submit" className="btn-primary flex-1 px-4 py-2.5 text-xs">
          {t.common.apply}
        </button>
        <Link
          href="/properties"
          className="inline-flex items-center gap-1 rounded-full px-3 py-2.5 text-xs font-medium text-muted transition hover:text-pine"
        >
          <X className="text-sm" />
          {t.common.clear}
        </Link>
      </div>
    </form>
  );
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { lang, t } = await getI18n();
  const filters = readFilters(await searchParams);

  const priceFilter: Prisma.IntFilter = {};
  if (filters.min) priceFilter.gte = Number(filters.min);
  if (filters.max) priceFilter.lte = Number(filters.max);

  const where: Prisma.PropertyWhereInput = {
    publishedAt: { not: null },
    ...(filters.listing ? { listingType: filters.listing as "SALE" | "RENT" } : {}),
    ...(filters.county ? { county: filters.county } : {}),
    ...(filters.type
      ? { propertyType: filters.type as (typeof PROPERTY_TYPES)[number] }
      : {}),
    ...(filters.min || filters.max ? { price: priceFilter } : {}),
    ...(filters.beds ? { bedrooms: { gte: Number(filters.beds) } } : {}),
    ...(filters.q
      ? {
          OR: [
            { titleEn: { contains: filters.q, mode: "insensitive" } },
            { titleEs: { contains: filters.q, mode: "insensitive" } },
            { town: { contains: filters.q, mode: "insensitive" } },
            { county: { contains: filters.q, mode: "insensitive" } },
            { addressLine: { contains: filters.q, mode: "insensitive" } },
            { reference: { contains: filters.q, mode: "insensitive" } },
            { eircode: { contains: filters.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.PropertyOrderByWithRelationInput[] =
    filters.sort === "price-asc"
      ? [{ price: "asc" }]
      : filters.sort === "price-desc"
        ? [{ price: "desc" }]
        : [{ featured: "desc" }, { publishedAt: "desc" }];

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: { images: { orderBy: { sortOrder: "asc" } } },
      orderBy,
      take: 48,
    }),
    prisma.property.count({ where }),
  ]);

  return (
    <>
      <section className="border-b border-line/80 bg-parchment/50">
        <div className="wrap py-12 sm:py-16">
          <p className="eyebrow">{t.nav.properties}</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
                {t.listing.title}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
                {t.listing.intro}
              </p>
            </div>
            <p className="text-sm text-muted">
              {formatNumber(total, lang)} {t.listing.properties}
            </p>
          </div>
        </div>
      </section>

      <div className="wrap grid gap-10 py-10 lg:grid-cols-[280px_1fr] lg:py-14">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="card sticky top-28 p-5">
            <div className="mb-4 flex items-center gap-2 border-b border-line/80 pb-3">
              <Sliders className="text-base text-gold" />
              <h2 className="text-sm font-semibold text-ink">{t.common.filters}</h2>
            </div>
            <FilterForm filters={filters} t={t} />
          </div>
        </aside>

        <div>
          {/* Mobile filters */}
          <details className="mb-6 rounded-2xl border border-line bg-white/60 p-4 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink marker:content-none">
              <span className="inline-flex items-center gap-2">
                <Sliders className="text-base text-gold" />
                {t.common.filters}
              </span>
              <span className="text-xs font-normal text-muted">
                {formatNumber(total, lang)} {t.listing.properties}
              </span>
            </summary>
            <div className="mt-5">
              <FilterForm filters={filters} t={t} compact />
            </div>
          </details>

          <div className="mb-6 hidden items-center justify-between lg:flex">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">
              {t.listing.showing} {formatNumber(properties.length, lang)}{" "}
              {t.listing.properties}
            </p>
            <Link
              href="/properties"
              className="text-xs font-medium text-pine underline-offset-4 hover:underline"
            >
              {t.common.clear}
            </Link>
          </div>

          {properties.length > 0 ? (
            <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
              {properties.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  lang={lang}
                  t={t}
                  priority={index === 0}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-white/40 px-6 py-20 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-pine/5 text-2xl text-pine">
                <Search />
              </span>
              <h2 className="mt-5 font-display text-2xl text-ink">
                {t.listing.noResults}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                {t.listing.noResultsHint}
              </p>
              <Link href="/properties" className="btn-outline mt-7">
                {t.common.clear}
                <ArrowRight className="text-sm" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
