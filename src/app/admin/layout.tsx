import Link from "next/link";
import type { Metadata } from "next";
import { requireActiveUser } from "@/lib/auth";
import { getCompany } from "@/lib/company";
import { getI18n } from "@/lib/i18n-server";
import { LanguageToggle } from "@/components/language-toggle";
import { ArrowUpRight, Shield } from "@/components/icons";
import { AdminNav } from "./admin-nav";
import { logoutAction } from "./actions";

export const metadata: Metadata = {
  title: "Staff portal",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireActiveUser();
  const { t } = await getI18n();
  const company = await getCompany();

  return (
    <div className="min-h-screen bg-[#f2eee4]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-pine-deep px-5 py-7 text-cream lg:flex">
        <Link href="/admin" className="flex items-center gap-3 px-1">
          <span className="grid size-10 place-items-center rounded-full border border-cream/25 font-display text-lg">
            H
          </span>
          <span>
            <span className="block font-display text-base leading-none">
              {company.name}
            </span>
            <span className="mt-1.5 block text-[8px] font-semibold uppercase tracking-[0.28em] text-cream/45">
              Staff portal
            </span>
          </span>
        </Link>

        <AdminNav role={user.role} />

        <div className="mt-auto space-y-4 border-t border-cream/10 pt-5">
          <div className="flex items-center gap-3 px-1">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cream/10 font-display text-sm">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-cream">
                {user.name}
              </p>
              <p className="truncate text-[10px] text-cream/45">{user.email}</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-1 text-[11px] text-cream/60 transition hover:text-cream"
          >
            <ArrowUpRight className="text-sm" />
            {t.admin.viewSite}
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full rounded-lg border border-cream/15 px-3 py-2 text-left text-[11px] text-cream/60 transition hover:bg-cream/10 hover:text-cream"
            >
              {t.auth.logout}
            </button>
          </form>
          <p className="flex items-center gap-1.5 px-1 text-[9px] text-cream/30">
            <Shield className="text-xs" />
            PSRA {company.psra}
          </p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-line/80 bg-cream/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-5 lg:px-8">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-2 lg:hidden">
                <span className="grid size-8 place-items-center rounded-full bg-pine font-display text-sm text-cream">
                  H
                </span>
                <span className="font-display text-base text-pine">
                  {company.name}
                </span>
              </Link>
              <p className="hidden text-[11px] uppercase tracking-[0.18em] text-muted lg:block">
                {t.admin.dashboard}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <LanguageToggle />
              <Link
                href="/"
                className="hidden items-center gap-1 text-[11px] font-medium text-muted transition hover:text-pine sm:inline-flex"
              >
                {t.admin.viewSite}
                <ArrowUpRight className="text-sm" />
              </Link>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/60 py-1 pl-1 pr-3">
                <span className="grid size-7 place-items-center rounded-full bg-pine font-display text-xs text-cream">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden text-[11px] font-medium text-ink/80 sm:block">
                  {user.name}
                </span>
              </span>
              <form action={logoutAction} className="hidden sm:block">
                <button
                  type="submit"
                  className="text-[11px] text-muted transition hover:text-pine"
                >
                  {t.auth.logout}
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-line/60 px-3 py-2 lg:hidden">
            <AdminNav mobile role={user.role} />
          </div>
        </header>

        <div className="px-5 py-8 lg:px-8 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
