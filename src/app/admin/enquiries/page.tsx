import Link from "next/link";
import type { EnquiryStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getI18n } from "@/lib/i18n-server";
import { formatDate } from "@/lib/format";
import { Mail } from "@/components/icons";
import { EnquiryCard, type EnquiryItem } from "./enquiry-card";

const STATUSES: EnquiryStatus[] = ["NEW", "CONTACTED", "CLOSED"];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { lang, t } = await getI18n();
  const params = await searchParams;
  const statusParam = typeof params.status === "string" ? params.status : "";
  const status = (STATUSES as string[]).includes(statusParam)
    ? (statusParam as EnquiryStatus)
    : null;

  const where: Prisma.EnquiryWhereInput = status ? { status } : {};

  const [enquiries, counts] = await Promise.all([
    prisma.enquiry.findMany({
      where,
      include: {
        property: { select: { titleEn: true, titleEs: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.enquiry.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const total = counts.reduce((sum, row) => sum + row._count._all, 0);
  const countFor = (value: EnquiryStatus | null) =>
    value === null
      ? total
      : counts.find((row) => row.status === value)?._count._all ?? 0;

  const tabs: { value: EnquiryStatus | null; label: string }[] = [
    { value: null, label: t.common.all },
    { value: "NEW", label: t.enquiryStatus.NEW },
    { value: "CONTACTED", label: t.enquiryStatus.CONTACTED },
    { value: "CLOSED", label: t.enquiryStatus.CLOSED },
  ];

  const items: EnquiryItem[] = enquiries.map((enquiry) => ({
    id: enquiry.id,
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone,
    message: enquiry.message,
    status: enquiry.status,
    internalNote: enquiry.internalNote,
    createdAtLabel: formatDate(enquiry.createdAt, lang),
    locale: enquiry.locale,
    property: enquiry.property,
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <p className="eyebrow">{t.admin.dashboard}</p>
        <h1 className="mt-2 font-display text-3xl text-ink">
          {t.admin.enquiries}
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {t.admin.newEnquiries}: {countFor("NEW")}
        </p>
      </div>

      <div className="mt-6 flex gap-1.5">
        {tabs.map((tab) => {
          const active = status === tab.value;
          return (
            <Link
              key={tab.label}
              href={
                tab.value
                  ? `/admin/enquiries?status=${tab.value}`
                  : "/admin/enquiries"
              }
              className={`rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition ${
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

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white/40 px-6 py-16 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-pine/5 text-xl text-pine">
            <Mail />
          </span>
          <p className="mt-4 text-sm text-muted">{t.admin.noEnquiries}</p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {items.map((enquiry) => (
            <EnquiryCard key={enquiry.id} enquiry={enquiry} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
