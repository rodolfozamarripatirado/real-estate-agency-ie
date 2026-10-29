import Image from "next/image";
import Link from "next/link";
import type { Prisma, PropertyStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getI18n } from "@/lib/i18n-server";
import { formatDate, formatPrice, localisedValue } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import {
  ArrowRight,
  ArrowUpRight,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash,
} from "@/components/icons";
import { ConfirmButton } from "../confirm-button";
import { deleteProperty, togglePublished } from "../actions";

const STATUS_OPTIONS: PropertyStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "SALE_AGREED",
  "SOLD",
  "LET_AGREED",
];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { lang, t } = await getI18n();
  const params = await searchParams;

  const statusParam = typeof params.status === "string" ? params.status : "";
  const status = (STATUS_OPTIONS as string[]).includes(statusParam)
    ? (statusParam as PropertyStatus)
    : null;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const saved = params.saved === "1";

  const where: Prisma.PropertyWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { titleEn: { contains: q, mode: "insensitive" } },
            { titleEs: { contains: q, mode: "insensitive" } },
            { reference: { contains: q, mode: "insensitive" } },
            { town: { contains: q, mode: "insensitive" } },
            { county: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [properties, statusCounts] = await Promise.all([
    prisma.property.findMany({
      where,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    prisma.property.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countFor = (value: PropertyStatus | null) =>
    value === null
      ? statusCounts.reduce((sum, row) => sum + row._count._all, 0)
      : statusCounts.find((row) => row.status === value)?._count._all ?? 0;

  const tabs: { value: PropertyStatus | null; label: string }[] = [
    { value: null, label: t.common.all },
    { value: "PUBLISHED", label: t.admin.published },
    { value: "DRAFT", label: t.admin.drafts },
    { value: "SALE_AGREED", label: t.status.SALE_AGREED },
    { value: "SOLD", label: t.status.SOLD },
    { value: "LET_AGREED", label: t.status.LET_AGREED },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{t.admin.dashboard}</p>
          <h1 className="mt-2 font-display text-3xl text-ink">
            {t.admin.properties}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {t.admin.totalProperties}: {countFor(null)}
          </p>
        </div>
        <Link href="/admin/properties/new" className="btn-primary">
          <Plus className="text-base" />
          {t.admin.addProperty}
        </Link>
      </div>

      {saved ? (
        <p className="mt-5 rounded-xl border border-pine/20 bg-pine/5 px-4 py-3 text-sm text-pine">
          {t.admin.propertySaved}
        </p>
      ) : null}

      <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="hide-scrollbar flex gap-1.5 overflow-x-auto">
          {tabs.map((tab) => {
            const active = status === tab.value;
            const query = new URLSearchParams();
            if (tab.value) query.set("status", tab.value);
            if (q) query.set("q", q);
            return (
              <Link
                key={tab.label}
                href={`/admin/properties${query.toString() ? `?${query}` : ""}`}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition ${
                  active
                    ? "border-pine bg-pine text-cream"
                    : "border-line bg-white/60 text-muted hover:border-pine/30 hover:text-pine"
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 ${active ? "text-cream/60" : "text-muted/60"}`}>
                  {countFor(tab.value)}
                </span>
              </Link>
            );
          })}
        </div>

        <form action="/admin/properties" className="relative w-full lg:w-64">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted/60" />
          <input
            name="q"
            defaultValue={q}
            placeholder={t.listing.keywordPlaceholder}
            className="field py-2 pl-9 text-xs"
          />
        </form>
      </div>

      {properties.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white/40 p-12 text-center">
          <p className="text-sm text-muted">{t.admin.noProperties}</p>
          <Link href="/admin/properties/new" className="btn-outline mt-5">
            <Plus className="text-sm" />
            {t.admin.addProperty}
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden overflow-hidden rounded-2xl border border-line/80 bg-white/70 md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line/80 bg-parchment/60 text-[10px] uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">{t.admin.properties}</th>
                  <th className="px-3 py-3 font-semibold">{t.admin.county}</th>
                  <th className="px-3 py-3 font-semibold">{t.admin.price}</th>
                  <th className="px-3 py-3 font-semibold">{t.admin.status}</th>
                  <th className="px-3 py-3 font-semibold">{t.admin.updated}</th>
                  <th className="px-5 py-3 text-right font-semibold">
                    {t.admin.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {properties.map((property) => {
                  const cover = property.images[0];
                  return (
                    <tr key={property.id} className="align-middle">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-sage">
                            {cover ? (
                              <Image
                                src={cover.url}
                                alt=""
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            ) : null}
                          </span>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/properties/${property.id}`}
                              className="block max-w-[280px] truncate font-medium text-ink hover:text-pine"
                            >
                              {localisedValue(
                                property.titleEn,
                                property.titleEs,
                                lang,
                              )}
                            </Link>
                            <p className="mt-0.5 text-[11px] text-muted">
                              {property.reference} · {property.town}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted">
                        {property.county}
                      </td>
                      <td className="px-3 py-3 text-xs font-medium text-ink/80">
                        {formatPrice(property.price, lang, property.listingType)}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={property.status} t={t} />
                      </td>
                      <td className="px-3 py-3 text-xs text-muted">
                        {formatDate(property.updatedAt, lang)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {property.publishedAt ? (
                            <Link
                              href={`/properties/${property.slug}`}
                              target="_blank"
                              title={t.common.view}
                              className="grid size-8 place-items-center rounded-lg border border-line text-muted transition hover:text-pine"
                            >
                              <Eye className="text-sm" />
                            </Link>
                          ) : null}
                          <Link
                            href={`/admin/properties/${property.id}`}
                            title={t.common.edit}
                            className="grid size-8 place-items-center rounded-lg border border-line text-muted transition hover:text-pine"
                          >
                            <Pencil className="text-sm" />
                          </Link>
                          <form action={togglePublished}>
                            <input type="hidden" name="id" value={property.id} />
                            <button
                              type="submit"
                              className="rounded-lg border border-line px-2 py-1.5 text-[10px] font-medium text-muted transition hover:border-pine/40 hover:text-pine"
                            >
                              {property.publishedAt
                                ? t.admin.unpublish
                                : t.admin.publish}
                            </button>
                          </form>
                          <form action={deleteProperty}>
                            <input type="hidden" name="id" value={property.id} />
                            <ConfirmButton
                              message={t.admin.deleteConfirm}
                              className="grid size-8 place-items-center rounded-lg border border-line text-muted transition hover:border-[#a61b1b]/40 hover:text-[#a61b1b]"
                            >
                              <Trash className="text-sm" />
                            </ConfirmButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mt-6 space-y-3 md:hidden">
            {properties.map((property) => {
              const cover = property.images[0];
              return (
                <article
                  key={property.id}
                  className="rounded-2xl border border-line/80 bg-white/70 p-3.5"
                >
                  <div className="flex gap-3">
                    <span className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-sage">
                      {cover ? (
                        <Image
                          src={cover.url}
                          alt=""
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/properties/${property.id}`}
                        className="line-clamp-2 text-sm font-medium text-ink"
                      >
                        {localisedValue(property.titleEn, property.titleEs, lang)}
                      </Link>
                      <p className="mt-1 text-[11px] text-muted">
                        {property.reference} · Co. {property.county}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <StatusBadge status={property.status} t={t} />
                        <span className="text-xs font-medium text-ink/80">
                          {formatPrice(property.price, lang, property.listingType)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-3">
                    <span className="text-[10px] text-muted">
                      {formatDate(property.updatedAt, lang)}
                    </span>
                    <div className="flex items-center gap-2">
                      <form action={togglePublished}>
                        <input type="hidden" name="id" value={property.id} />
                        <button
                          type="submit"
                          className="text-[11px] font-medium text-pine"
                        >
                          {property.publishedAt
                            ? t.admin.unpublish
                            : t.admin.publish}
                        </button>
                      </form>
                      <Link
                        href={`/admin/properties/${property.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-pine"
                      >
                        {t.common.edit}
                        <ArrowUpRight className="text-sm" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      <p className="mt-6 flex items-center gap-2 text-[11px] text-muted">
        <ArrowRight className="text-sm" />
        {t.admin.privateHelp}
      </p>
    </div>
  );
}
