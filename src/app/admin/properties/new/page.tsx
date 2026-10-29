import Link from "next/link";
import { getI18n } from "@/lib/i18n-server";
import { ArrowRight, Plus } from "@/components/icons";
import { PropertyForm } from "../../property-form";
import { emptyPropertyForm } from "../../property-form-types";

export default async function NewPropertyPage() {
  const { t } = await getI18n();

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/properties"
        className="inline-flex items-center gap-2 text-[11px] font-medium text-muted transition hover:text-pine"
      >
        <ArrowRight className="rotate-180 text-sm" />
        {t.admin.backToProperties}
      </Link>

      <div className="mt-4 flex items-start gap-3">
        <span className="mt-1 grid size-10 shrink-0 place-items-center rounded-full bg-pine/5 text-lg text-pine">
          <Plus />
        </span>
        <div>
          <p className="eyebrow">{t.admin.properties}</p>
          <h1 className="mt-1 font-display text-3xl text-ink">
            {t.admin.newProperty}
          </h1>
          <p className="mt-1 text-sm text-muted">{t.admin.publicHelp}</p>
        </div>
      </div>

      <PropertyForm values={emptyPropertyForm} />
    </div>
  );
}
