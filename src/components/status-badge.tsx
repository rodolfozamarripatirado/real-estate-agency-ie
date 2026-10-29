import type { PropertyStatus } from "@prisma/client";
import type { Dictionary } from "@/lib/i18n";

const styles: Record<PropertyStatus, string> = {
  DRAFT: "border-line bg-parchment text-muted",
  PUBLISHED: "border-pine/20 bg-pine/10 text-pine",
  SALE_AGREED: "border-gold/40 bg-gold/15 text-[#8a6524]",
  SOLD: "border-ink/15 bg-ink/10 text-ink/70",
  LET_AGREED: "border-gold/40 bg-gold/15 text-[#8a6524]",
};

export function StatusBadge({
  status,
  t,
}: {
  status: PropertyStatus;
  t: Dictionary;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${styles[status]}`}
    >
      {t.status[status]}
    </span>
  );
}
