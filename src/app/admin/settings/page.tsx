import { getCompany } from "@/lib/company";
import { requireAdmin } from "@/lib/auth";
import { getI18n } from "@/lib/i18n-server";
import { Sliders } from "@/components/icons";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const { t } = await getI18n();
  const company = await getCompany();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-start gap-3">
        <span className="mt-1 grid size-10 shrink-0 place-items-center rounded-full bg-pine/5 text-lg text-pine">
          <Sliders />
        </span>
        <div>
          <p className="eyebrow">{t.admin.dashboard}</p>
          <h1 className="mt-1 font-display text-3xl text-ink">
            {t.admin.settings}
          </h1>
          <p className="mt-1 text-sm text-muted">{t.admin.contactDetails}</p>
        </div>
      </div>

      <SettingsForm
        values={{
          name: company.name,
          taglineEn: company.taglineEn,
          taglineEs: company.taglineEs,
          aboutEn: company.aboutEn,
          aboutEs: company.aboutEs,
          phone: company.phone,
          email: company.email,
          address: company.address,
          psra: company.psra,
          openingHours: company.openingHours,
          heroImageUrl: company.heroImageUrl,
        }}
      />
    </div>
  );
}
