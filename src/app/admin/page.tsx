import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { requireActiveUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n-server";
import { formatCompactPrice, formatDate, localisedValue } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import {
  ArrowRight,
  ArrowUpRight,
  Building,
  Calendar,
  Check,
  Mail,
  Pencil,
  Plus,
} from "@/components/icons";

export default async function AdminDashboard() {
  const user = await requireActiveUser();
  const { lang, t } = await getI18n();

  const [total, published, drafts, newEnquiries, saleAggregate, recentProperties, recentEnquiries] =
    await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { publishedAt: { not: null } } }),
      prisma.property.count({ where: { publishedAt: null } }),
      prisma.enquiry.count({ where: { status: "NEW" } }),
      prisma.property.aggregate({
        where: { listingType: "SALE", publishedAt: { not: null } },
        _sum: { price: true },
      }),
      prisma.property.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      }),
      prisma.enquiry.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { property: { select: { titleEn: true, titleEs: true, slug: true } } },
      }),
    ]);

  const stats = [
    { href: "/admin/properties", icon: Building, value: total, label: t.admin.totalProperties },
    { href: "/admin/properties?status=PUBLISHED", icon: Check, value: published, label: t.admin.published },
    { href: "/admin/properties?status=DRAFT", icon: Pencil, value: drafts, label: t.admin.drafts },
    { href: "/admin/enquiries?status=NEW", icon: Mail, value: newEnquiries, label: t.admin.newEnquiries },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{t.admin.dashboard}</p>
          <h1 className="mt-2 font-display text-3xl text-ink">
            {t.admin.welcome}, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1.5 text-sm text-muted">{t.admin.overview}</p>
        </div>
        <Link href="/admin/properties/new" className="btn-primary">
          <Plus className="text-base" />
          {t.admin.addProperty}
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-2xl border border-line/80 bg-white/70 p-5 transition hover:border-pine/30 hover:bg-white"
          >
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-full bg-pine/5 text-lg text-pine">
                <stat.icon />
              </span>
              <ArrowUpRight className="text-base text-muted/40 transition group-hover:text-pine" />
            </div>
            <p className="mt-5 font-display text-3xl text-ink">{stat.value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-muted">
              {stat.label}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="rounded-2xl border border-line/80 bg-pine p-6 text-cream">
          <p className="text-[11px] uppercase tracking-[0.18em] text-cream/50">
            {t.admin.portfolioValue}
          </p>
          <p className="mt-3 font-display text-4xl">
            {formatCompactPrice(saleAggregate._sum.price ?? 0, lang)}
          </p>
          <p className="mt-2 max-w-sm text-xs leading-relaxed text-cream/60">
            {t.admin.published}: {published} · {t.admin.drafts}: {drafts}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/enquiries"
              className="inline-flex items-center gap-2 rounded-full bg-cream/10 px-4 py-2 text-xs font-medium transition hover:bg-cream/20"
            >
              <Calendar className="text-sm" />
              {t.admin.enquiries}
            </Link>
            {user.role === "ADMIN" ? (
              <Link
                href="/admin/settings"
                className="inline-flex items-center gap-2 rounded-full bg-cream/10 px-4 py-2 text-xs font-medium transition hover:bg-cream/20"
              >
                {t.admin.settings}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-line/80 bg-white/70 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">
              {t.admin.recentEnquiries}
            </h2>
            <Link
              href="/admin/enquiries"
              className="text-[11px] font-semibold text-pine"
            >
              {t.admin.manage}
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <p className="mt-5 text-sm text-muted">{t.admin.noEnquiries}</p>
          ) : (
            <ul className="mt-4 divide-y divide-line/70">
              {recentEnquiries.map((enquiry) => (
                <li key={enquiry.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {enquiry.name}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted">
                      {enquiry.property
                        ? localisedValue(
                            enquiry.property.titleEn,
                            enquiry.property.titleEs,
                            lang,
                          )
                        : enquiry.email}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${
                        enquiry.status === "NEW" ? "text-gold" : "text-muted/60"
                      }`}
                    >
                      {t.enquiryStatus[enquiry.status]}
                    </span>
                    <p className="mt-0.5 text-[10px] text-muted/70">
                      {formatDate(enquiry.createdAt, lang)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-line/80 bg-white/70 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-ink">
            {t.admin.recentProperties}
          </h2>
          <Link
            href="/admin/properties"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-pine"
          >
            {t.common.viewAll}
            <ArrowRight className="text-sm" />
          </Link>
        </div>

        {recentProperties.length === 0 ? (
          <p className="mt-5 text-sm text-muted">{t.admin.noProperties}</p>
        ) : (
          <ul className="mt-4 divide-y divide-line/70">
            {recentProperties.map((property) => {
              const cover = property.images[0];
              return (
                <li key={property.id}>
                  <Link
                    href={`/admin/properties/${property.id}`}
                    className="group flex items-center gap-4 py-3"
                  >
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-sage">
                      {cover ? (
                        <Image
                          src={cover.url}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink group-hover:text-pine">
                        {localisedValue(property.titleEn, property.titleEs, lang)}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted">
                        {property.reference} · Co. {property.county} ·{" "}
                        {formatDate(property.updatedAt, lang)}
                      </span>
                    </span>
                    <StatusBadge status={property.status} t={t} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
