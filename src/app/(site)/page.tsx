import Image from "next/image";
import Link from "next/link";
import { prisma, COUNTIES, PROPERTY_TYPES } from "@/lib/db";
import { getCompany } from "@/lib/company";
import { getI18n } from "@/lib/i18n-server";
import { formatNumber } from "@/lib/format";
import { PropertyCard } from "@/components/property-card";
import {
  ArrowRight,
  ArrowUpRight,
  Building,
  Compass,
  Key,
  Pin,
  Shield,
  Sparkle,
} from "@/components/icons";

export default async function HomePage() {
  const { lang, t } = await getI18n();
  const company = await getCompany();

  const [properties, countyCounts] = await Promise.all([
    prisma.property.findMany({
      where: { publishedAt: { not: null } },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take: 3,
    }),
    prisma.property.groupBy({
      by: ["county"],
      where: { publishedAt: { not: null } },
      _count: { _all: true },
    }),
  ]);

  countyCounts.sort((a, b) => b._count._all - a._count._all);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-pine-deep">
        <Image
          src={company.heroImageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-pine-deep/90 via-pine-deep/55 to-pine-deep/10" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-pine-deep/70 to-transparent" />

        <div className="wrap relative flex min-h-[600px] flex-col justify-end pb-10 pt-24 sm:min-h-[660px]">
          <p className="eyebrow text-gold-light">{t.home.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl font-display text-[2.9rem] leading-[0.98] text-cream sm:text-6xl lg:text-7xl">
            {t.home.title1}
            <br />
            <em className="font-normal italic text-gold-light">
              {t.home.title2}
            </em>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/80 sm:text-base">
            {t.home.intro}
          </p>

          <form
            action="/properties"
            className="mt-10 grid gap-3 rounded-2xl border border-white/25 bg-cream/95 p-3 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.55)] backdrop-blur sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]"
          >
            <label className="block px-2 py-1">
              <span className="label">{t.home.searchListing}</span>
              <select
                name="listing"
                className="w-full appearance-none border-0 bg-transparent py-1 text-sm font-medium text-ink outline-none"
                defaultValue=""
              >
                <option value="">{t.listing.allListings}</option>
                <option value="SALE">{t.common.forSale}</option>
                <option value="RENT">{t.common.forRent}</option>
              </select>
            </label>
            <label className="block border-t border-line px-2 py-1 sm:border-l sm:border-t-0">
              <span className="label">{t.home.searchCounty}</span>
              <select
                name="county"
                className="w-full appearance-none border-0 bg-transparent py-1 text-sm font-medium text-ink outline-none"
                defaultValue=""
              >
                <option value="">{t.listing.allCounties}</option>
                {COUNTIES.map((county) => (
                  <option key={county} value={county}>
                    Co. {county}
                  </option>
                ))}
              </select>
            </label>
            <label className="block border-t border-line px-2 py-1 lg:border-l lg:border-t-0">
              <span className="label">{t.home.searchType}</span>
              <select
                name="type"
                className="w-full appearance-none border-0 bg-transparent py-1 text-sm font-medium text-ink outline-none"
                defaultValue=""
              >
                <option value="">{t.listing.allTypes}</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t.type[type]}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="btn-primary h-full min-h-12 rounded-xl px-6"
            >
              {t.home.searchButton}
              <ArrowRight className="text-base" />
            </button>
          </form>
        </div>
      </section>

      {/* Intro + stats */}
      <section className="border-b border-line/80 bg-cream">
        <div className="wrap grid gap-10 py-14 md:grid-cols-[1.05fr_1fr] md:items-center md:py-16">
          <p className="max-w-md font-display text-2xl leading-snug text-ink/90 sm:text-[28px]">
            {t.about.story1.split(". ")[0]}.
          </p>
          <div className="grid grid-cols-3 gap-4 border-t border-line pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0">
            {[
              { value: t.home.statsYears, label: t.home.statsYearsLabel },
              { value: t.home.statsHomes, label: t.home.statsHomesLabel },
              { value: t.home.statsCounties, label: t.home.statsCountiesLabel },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-3xl text-pine sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured properties */}
      <section className="wrap py-20">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">{t.home.featuredEyebrow}</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl leading-tight text-ink sm:text-4xl">
              {t.home.featuredTitle}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              {t.home.featuredIntro}
            </p>
          </div>
          <Link
            href="/properties"
            className="inline-flex shrink-0 items-center gap-2 border-b border-pine/30 pb-1 text-sm font-semibold text-pine transition hover:border-pine"
          >
            {t.home.browseAll}
            <ArrowRight className="text-sm" />
          </Link>
        </div>

        {properties.length > 0 ? (
          <div className="mt-10 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
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
          <p className="mt-10 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
            {t.common.noResults}
          </p>
        )}
      </section>

      {/* Services */}
      <section className="grain border-y border-line/80 bg-parchment/60">
        <div className="wrap py-20">
          <div className="max-w-2xl">
            <p className="eyebrow">{t.home.servicesEyebrow}</p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-ink sm:text-4xl">
              {t.home.servicesTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {t.home.servicesIntro}
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Building,
                title: t.home.service1Title,
                text: t.home.service1Text,
                number: "01",
              },
              {
                icon: Key,
                title: t.home.service2Title,
                text: t.home.service2Text,
                number: "02",
              },
              {
                icon: Compass,
                title: t.home.service3Title,
                text: t.home.service3Text,
                number: "03",
              },
            ].map((service) => (
              <article
                key={service.number}
                className="group relative rounded-2xl border border-line/70 bg-cream/80 p-7 transition hover:border-pine/30 hover:bg-cream"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-full bg-pine/5 text-xl text-pine">
                    <service.icon />
                  </span>
                  <span className="font-display text-sm text-muted/50">
                    {service.number}
                  </span>
                </div>
                <h3 className="mt-7 font-display text-2xl text-ink">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {service.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="wrap py-20">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="relative">
            <div className="absolute -left-3 -top-3 hidden h-full w-full rounded-2xl border border-gold/50 sm:block" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80"
                alt={t.about.storyTitle}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-2 hidden rounded-2xl border border-line bg-cream px-6 py-5 shadow-lg sm:block">
              <p className="flex items-center gap-2 font-display text-lg text-pine">
                <Shield className="text-gold" />
                PSRA {company.psra}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted">
                Licensed &amp; regulated
              </p>
            </div>
          </div>

          <div>
            <p className="eyebrow">{t.home.aboutEyebrow}</p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-ink sm:text-4xl">
              {t.home.aboutTitle}
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              {t.home.aboutText1}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {t.home.aboutText2}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <Link href="/about" className="btn-outline">
                {t.home.aboutCta}
                <ArrowRight className="text-sm" />
              </Link>
              <span className="inline-flex items-center gap-2 text-xs text-muted">
                <Sparkle className="text-gold" />
                {t.footer.tagline.split(",")[0]}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Counties */}
      {countyCounts.length > 0 ? (
        <section className="border-y border-line/80 bg-parchment/40">
          <div className="wrap py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">{t.home.countiesTitle}</p>
                <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
                  {t.home.countiesIntro}
                </h2>
              </div>
              <Link
                href="/properties"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-pine"
              >
                {t.common.viewAll}
                <ArrowUpRight className="text-sm" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {countyCounts.map((row) => (
                <Link
                  key={row.county}
                  href={`/properties?county=${encodeURIComponent(row.county)}`}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-cream px-4 py-2 text-xs font-medium text-ink/80 transition hover:border-pine/40 hover:text-pine"
                >
                  <Pin className="text-sm text-gold" />
                  Co. {row.county}
                  <span className="text-muted/70">
                    {formatNumber(row._count._all, lang)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="wrap py-20">
        <div className="relative overflow-hidden rounded-3xl bg-pine px-7 py-14 text-cream sm:px-14">
          <div className="absolute -right-16 -top-20 size-72 rounded-full border border-cream/10" />
          <div className="absolute -bottom-28 right-10 size-80 rounded-full border border-cream/10" />
          <div className="relative grid gap-8 md:grid-cols-[1.4fr_auto] md:items-center">
            <div>
              <p className="eyebrow text-gold-light">{t.home.ctaEyebrow}</p>
              <h2 className="mt-3 max-w-xl font-display text-3xl leading-tight sm:text-4xl">
                {t.home.ctaTitle}
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream/70">
                {t.home.ctaText}
              </p>
            </div>
            <Link href="/contact" className="btn-gold">
              {t.home.ctaButton}
              <ArrowRight className="text-sm" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
